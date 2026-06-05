import { getDb } from './db';
import type { PricedCart } from './pricing';

/**
 * Order persistence — shared by the Cash-on-Delivery route (/api/orders) and the
 * Razorpay verification route (/api/razorpay/verify) so both write identical rows.
 */

export interface CustomerDetails {
  customer_name: string;
  phone: string;
  email?: string;
  address_line1: string;
  address_line2?: string;
  city: string;
  state: string;
  pincode: string;
  landmark?: string;
  upi_id?: string;
}

const REQUIRED_FIELDS: (keyof CustomerDetails)[] = [
  'customer_name', 'phone', 'address_line1', 'city', 'state', 'pincode',
];

/** Returns the first missing required customer field, or null if all present. */
export function missingCustomerField(c: Partial<CustomerDetails>): string | null {
  for (const f of REQUIRED_FIELDS) {
    if (!String(c[f] ?? '').trim()) return f;
  }
  return null;
}

export function generateOrderId(): string {
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `PKL-${date}-${rand}`;
}

export async function createOrder(input: {
  customer: CustomerDetails;
  cart: PricedCart;
  payment_method: 'cod' | 'online';
  status: string;
  order_id?: string;
  notes?: string;
}): Promise<string> {
  const db = await getDb();
  const { customer: c, cart, payment_method, status } = input;
  const order_id = input.order_id ?? generateOrderId();

  await db.execute({
    sql: `INSERT INTO orders (
            order_id, customer_name, phone, email,
            address_line1, address_line2, city, state, pincode, landmark,
            payment_method, upi_id, subtotal, shipping, cod_charge, total, status, notes
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    args: [
      order_id,
      c.customer_name,
      c.phone,
      c.email ?? null,
      c.address_line1,
      c.address_line2 ?? null,
      c.city,
      c.state,
      c.pincode,
      c.landmark ?? null,
      payment_method,
      c.upi_id ?? null,
      cart.subtotal,
      cart.shipping,
      cart.codCharge,
      cart.total,
      status,
      input.notes ?? null,
    ],
  });

  const stmts = cart.lines.map((l) => ({
    sql: 'INSERT INTO order_items (order_id, product_name, weight, quantity, price) VALUES (?, ?, ?, ?, ?)',
    args: [order_id, l.name, l.weight, l.quantity, l.price] as (string | number)[],
  }));
  stmts.push({
    sql: 'INSERT INTO order_status_history (order_id, status, notes) VALUES (?, ?, ?)',
    args: [order_id, status, 'Order placed'],
  });
  await db.batch(stmts, 'write');

  return order_id;
}
