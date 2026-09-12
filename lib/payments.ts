import { getDb } from './db';
import { createOrder, generateOrderId, missingCustomerField, type CustomerDetails } from './orders';
import { priceCart, toPaise, type PricedCart } from './pricing';
import { createRazorpayOrder, fetchRazorpayOrder } from './razorpay';

/**
 * Online (Razorpay) checkout lifecycle.
 *
 * The order used to be written ONLY from the browser, after payment, by
 * /api/razorpay/verify. On mobile UPI the browser tab is routinely killed while
 * the customer is inside their UPI app, so that call never happened and the
 * payment was captured with no order behind it. Now:
 *
 *   1. startRazorpayCheckout()  — BEFORE the customer pays: price the cart on
 *      the server, create the Razorpay order, and save cart + delivery details
 *      in `pending_payments` keyed by the Razorpay order id.
 *   2. finalizeRazorpayPayment() — AFTER capture, from EITHER the browser
 *      (/verify) OR the Razorpay webhook (server-to-server, always fires):
 *      load the saved cart and create the real order. Idempotent: the unique
 *      index on orders.razorpay_order_id means whichever caller is second just
 *      gets the existing order back.
 *
 * Because the cart is locked at step 1, the amount the customer paid always
 * matches the order that gets recorded — the client can no longer send a
 * different cart to /verify than the one it paid for.
 */

export interface StartCheckoutResult {
  razorpayOrderId: string;
  amountPaise: number;
  currency: string;
  receipt: string;
  cart: PricedCart;
}

export async function startRazorpayCheckout(input: {
  items: unknown;
  customer: Partial<CustomerDetails>;
  user_id?: number | null;
}): Promise<{ ok: true; result: StartCheckoutResult } | { ok: false; error: string }> {
  const missing = missingCustomerField(input.customer);
  if (missing) return { ok: false, error: `Missing required field: ${missing}` };

  const cart = await priceCart(input.items, { cod: false });
  if (!cart) return { ok: false, error: 'Your cart is empty or contains an unavailable item.' };

  // The receipt becomes the PKL order id, so the Razorpay dashboard and the
  // admin orders list show the same reference.
  const receipt = generateOrderId();
  const amountPaise = toPaise(cart.total);

  const order = await createRazorpayOrder({
    amountPaise,
    receipt,
    // Items are echoed into the Razorpay order notes so an order can still be
    // reconstructed from the Razorpay dashboard alone if everything else fails.
    notes: {
      receipt,
      items: cart.lines.map((l) => `${l.weight} x${l.quantity}`).join(', '),
      phone: String(input.customer.phone ?? ''),
    },
  });

  const c = input.customer;
  const customer: CustomerDetails = {
    customer_name: String(c.customer_name ?? '').trim(),
    phone: String(c.phone ?? '').trim(),
    email: c.email ? String(c.email).trim() : undefined,
    address_line1: String(c.address_line1 ?? '').trim(),
    address_line2: c.address_line2 ? String(c.address_line2).trim() : undefined,
    city: String(c.city ?? '').trim(),
    state: String(c.state ?? '').trim(),
    pincode: String(c.pincode ?? '').trim(),
    landmark: c.landmark ? String(c.landmark).trim() : undefined,
  };

  const db = await getDb();
  await db.execute({
    sql: `INSERT INTO pending_payments (razorpay_order_id, receipt, amount_paise, cart, customer, user_id)
          VALUES (?, ?, ?, ?::jsonb, ?::jsonb, ?)`,
    args: [order.id, receipt, amountPaise, JSON.stringify(cart), JSON.stringify(customer), input.user_id ?? null],
  });

  return {
    ok: true,
    result: { razorpayOrderId: order.id, amountPaise, currency: order.currency, receipt, cart },
  };
}

/** The PKL order id already created for a Razorpay order, if any. */
export async function findOrderByRazorpayOrderId(razorpayOrderId: string): Promise<string | null> {
  const db = await getDb();
  const { rows } = await db.execute({
    sql: 'SELECT order_id FROM orders WHERE razorpay_order_id = ?',
    args: [razorpayOrderId],
  });
  return rows.length ? String(rows[0].order_id) : null;
}

export type FinalizeResult =
  | { status: 'created' | 'exists'; order_id: string }
  | { status: 'unknown' }; // no pending record and nothing to fall back on

export async function finalizeRazorpayPayment(input: {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  source: 'verify' | 'webhook';
  /**
   * Legacy fallback for a checkout that started before pending_payments
   * existed: the browser's own customer + items. Only used when there is no
   * pending record, and only after the amount is checked against Razorpay.
   */
  fallback?: { customer: Partial<CustomerDetails> & { items?: unknown } };
}): Promise<FinalizeResult> {
  const { razorpay_order_id, razorpay_payment_id, source } = input;

  const existing = await findOrderByRazorpayOrderId(razorpay_order_id);
  if (existing) return { status: 'exists', order_id: existing };

  const db = await getDb();
  const { rows } = await db.execute({
    sql: 'SELECT receipt, cart, customer, user_id FROM pending_payments WHERE razorpay_order_id = ?',
    args: [razorpay_order_id],
  });

  let order_id: string | undefined;
  let cart: PricedCart;
  let customer: CustomerDetails;
  let user_id: number | null = null;

  if (rows.length) {
    const p = rows[0] as { receipt: string; cart: PricedCart; customer: CustomerDetails; user_id: number | null };
    order_id = p.receipt;
    cart = typeof p.cart === 'string' ? JSON.parse(p.cart) : p.cart;
    customer = typeof p.customer === 'string' ? JSON.parse(p.customer) : p.customer;
    user_id = p.user_id != null ? Number(p.user_id) : null;
  } else {
    // No pending record — either a pre-deploy checkout or a webhook for an
    // order we did not start. Without the browser's details there is nothing to
    // build an order from; the reconciliation script surfaces these.
    const fb = input.fallback;
    if (!fb || missingCustomerField(fb.customer)) return { status: 'unknown' };
    const priced = await priceCart(fb.customer.items, { cod: false });
    if (!priced) return { status: 'unknown' };
    // Never trust the client's cart on its own: the amount must equal what
    // Razorpay actually charged for this order.
    const rzp = await fetchRazorpayOrder(razorpay_order_id);
    if (!rzp || rzp.amount !== toPaise(priced.total)) {
      console.error('[payments] fallback cart does not match Razorpay amount', {
        razorpay_order_id, expected: rzp?.amount, got: toPaise(priced.total),
      });
      return { status: 'unknown' };
    }
    cart = priced;
    customer = fb.customer as CustomerDetails;
  }

  try {
    const created = await createOrder({
      customer,
      cart,
      payment_method: 'online',
      status: 'Paid',
      order_id,
      notes: `Razorpay payment ${razorpay_payment_id} (order ${razorpay_order_id}) via ${source}`,
      user_id,
      razorpay_order_id,
      razorpay_payment_id,
    });
    return { status: 'created', order_id: created };
  } catch (err) {
    // Unique violation on razorpay_order_id / razorpay_payment_id: the other
    // caller (browser vs webhook) won the race. Return their order.
    const code = (err as { code?: string })?.code;
    if (code === '23505') {
      const winner = await findOrderByRazorpayOrderId(razorpay_order_id);
      if (winner) return { status: 'exists', order_id: winner };
    }
    throw err;
  }
}
