import { getDb } from './db';
import type { PricedCart } from './pricing';
import { sendOrderEmails } from './email';
import { sendOrderWhatsApp } from './whatsapp';
import { normalizePhone } from './customer-auth';

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

/**
 * Format checks on the fields couriers and WhatsApp depend on. Phone must be a
 * 10-digit Indian mobile (6–9 first digit, +91 / 0 prefix tolerated and
 * stripped); PIN must be 6 digits not starting with 0. Returns a customer-facing
 * message, or null when valid. Mutates `c` to the normalised phone.
 */
export function invalidCustomerField(c: Partial<CustomerDetails>): string | null {
  const phone = normalizePhone(String(c.phone ?? ''));
  if (!/^[6-9]\d{9}$/.test(phone)) return 'Please enter a valid 10-digit mobile number.';
  c.phone = phone;
  const pin = String(c.pincode ?? '').trim();
  if (!/^[1-9]\d{5}$/.test(pin)) return 'Please enter a valid 6-digit PIN code.';
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
  /** Account id of the signed-in customer, if any — links the order to their history. */
  user_id?: number | null;
  /** Razorpay ids for online orders — unique in the DB so a payment can only ever create one order. */
  razorpay_order_id?: string | null;
  razorpay_payment_id?: string | null;
}): Promise<string> {
  const db = await getDb();
  const { customer: c, cart, payment_method, status } = input;
  const order_id = input.order_id ?? generateOrderId();

  // Order row + line items + first history entry go in ONE transaction, so a
  // failure part-way can never leave an order with no items behind.
  const stmts: { sql: string; args: (string | number | null)[] }[] = [
    {
      sql: `INSERT INTO orders (
              order_id, customer_name, phone, email,
              address_line1, address_line2, city, state, pincode, landmark,
              payment_method, upi_id, subtotal, shipping, cod_charge, total, status, notes, user_id,
              razorpay_order_id, razorpay_payment_id
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
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
        input.user_id ?? null,
        input.razorpay_order_id ?? null,
        input.razorpay_payment_id ?? null,
      ],
    },
    ...cart.lines.map((l) => ({
      sql: 'INSERT INTO order_items (order_id, product_name, weight, quantity, price) VALUES (?, ?, ?, ?, ?)',
      args: [order_id, l.name, l.weight, l.quantity, l.price] as (string | number | null)[],
    })),
    {
      sql: 'INSERT INTO order_status_history (order_id, status, notes) VALUES (?, ?, ?)',
      args: [order_id, status, 'Order placed'],
    },
  ];
  await db.batch(stmts, 'write');

  // Fire the customer/business notifications. Awaited so they actually run on
  // serverless, but each is isolated so a failure (or one channel being
  // unconfigured) never fails the order or blocks the other channel.
  //  • Email  — confirmation to the customer (if they gave one) + business alert.
  //  • WhatsApp — confirmation to the customer's phone (the required, reliable
  //    channel). No-op until the WhatsApp Cloud API env vars are set.
  await Promise.allSettled([
    sendOrderEmails({
      order_id,
      customer_name: c.customer_name,
      email: c.email ?? null,
      phone: c.phone,
      payment_method,
      status,
      lines: cart.lines,
      subtotal: cart.subtotal,
      shipping: cart.shipping,
      codCharge: cart.codCharge,
      total: cart.total,
    }).catch((err) => console.error('[orders] sendOrderEmails failed (order still created):', err)),
    sendOrderWhatsApp({
      order_id,
      customer_name: c.customer_name,
      phone: c.phone,
      total: cart.total,
      status,
    }).catch((err) => console.error('[orders] sendOrderWhatsApp failed (order still created):', err)),
  ]);

  return order_id;
}
