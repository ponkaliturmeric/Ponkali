import { getCatalog } from './catalog';
import { calculateShipping } from './shipping';
import { normalizePhone } from './customer-auth';
import { ORDER_SOURCES, PAYMENT_METHODS, PAYMENT_STATUSES, ORDER_STATUSES, isOption, isOneOf } from './crm';
import type { PricedCart, PricedLine } from './pricing';
import type { CustomerDetails } from './orders';

/**
 * Validation and pricing for an order an admin types in by hand — the WhatsApp
 * / phone / walk-in orders that never go through checkout.
 *
 * This is deliberately NOT lib/pricing.ts. That module exists to stop a
 * customer's browser from dictating prices, so it only ever trusts the
 * catalogue. Here the operator IS the authority: they may have agreed a
 * different price on WhatsApp, be selling a pack size that isn't a retail SKU,
 * or be waiving delivery. So prices are accepted from the request — but every
 * number is still bounds-checked, and the totals are always recomputed here
 * rather than taken from the client, so a typo can't produce an order whose
 * line items and total disagree.
 *
 * Shared by POST /api/admin/orders (create) and PATCH /api/admin/orders/[id]
 * (edit), so a created and an edited order are validated identically.
 */

/** A line as the admin form sends it. Either a catalogue slug or a custom item. */
export interface ManualLineInput {
  slug?: string;
  product_name?: string;
  weight?: string;
  price?: number | string;
  quantity?: number | string;
}

export interface BuiltManualOrder {
  customer: CustomerDetails;
  cart: PricedCart;
  discount: number;
  payment_method: string;
  payment_status: string;
  amount_paid: number;
  payment_ref: string | null;
  status: string;
  source: string;
  notes: string | null;
  notify: boolean;
}

export type BuildResult =
  | { ok: true; order: BuiltManualOrder }
  | { ok: false; error: string };

/** Generous ceilings — a bulk WhatsApp order is legitimately much bigger than a web one. */
const MAX_QTY_PER_LINE = 9999;
const MAX_LINES = 40;
const MAX_MONEY = 10_000_000;

function num(value: unknown, fallback = 0): number {
  if (value === '' || value === null || value === undefined) return fallback;
  const n = Number(value);
  return Number.isFinite(n) ? n : NaN;
}

function str(value: unknown): string {
  return String(value ?? '').trim();
}

function money(value: unknown, fallback = 0): number {
  const n = num(value, fallback);
  if (!Number.isFinite(n) || n < 0 || n > MAX_MONEY) return NaN;
  // Rupees, to the paisa — avoids 0.30000000000000004 creeping into a total.
  return Math.round(n * 100) / 100;
}

export async function buildManualOrder(body: unknown): Promise<BuildResult> {
  const b = (body ?? {}) as Record<string, unknown>;

  /* ── Customer ── */
  const customer_name = str(b.customer_name);
  if (customer_name.length < 2) {
    return { ok: false, error: 'Customer name is required.' };
  }

  const phone = normalizePhone(str(b.phone));
  if (!/^[6-9]\d{9}$/.test(phone)) {
    return { ok: false, error: 'Enter a valid 10-digit Indian mobile number — it is how this order is matched to the customer.' };
  }

  // Address is optional: a WhatsApp order is often taken before the address is.
  // Empty strings (not NULL) keep the existing NOT NULL columns happy and keep
  // exports free of the word "null".
  const customer: CustomerDetails = {
    customer_name,
    phone,
    email: str(b.email) || undefined,
    address_line1: str(b.address_line1),
    address_line2: str(b.address_line2) || undefined,
    city: str(b.city),
    state: str(b.state),
    pincode: str(b.pincode),
    landmark: str(b.landmark) || undefined,
  };

  const pin = customer.pincode;
  if (pin && !/^[1-9]\d{5}$/.test(pin)) {
    return { ok: false, error: 'PIN code must be 6 digits (or left blank).' };
  }

  /* ── Items ── */
  const rawItems = Array.isArray(b.items) ? (b.items as ManualLineInput[]) : [];
  if (rawItems.length === 0) {
    return { ok: false, error: 'Add at least one item to the order.' };
  }
  if (rawItems.length > MAX_LINES) {
    return { ok: false, error: `An order can have at most ${MAX_LINES} line items.` };
  }

  const catalog = await getCatalog();
  const lines: PricedLine[] = [];

  for (let i = 0; i < rawItems.length; i++) {
    const raw = rawItems[i];
    const where = `Item ${i + 1}`;
    const slug = str(raw?.slug);
    const fromCatalog = slug ? catalog.find((p) => p.slug === slug) : undefined;

    if (slug && !fromCatalog) {
      return { ok: false, error: `${where}: unknown product "${slug}".` };
    }

    // A catalogue item fills in its own name, weight and price; all three can
    // still be overridden, which is what makes a negotiated price possible.
    const product_name = str(raw?.product_name) || fromCatalog?.name || '';
    if (!product_name) {
      return { ok: false, error: `${where}: pick a product or type a name for the custom item.` };
    }
    const weight = str(raw?.weight) || fromCatalog?.weight || '';

    const price = money(raw?.price, fromCatalog?.price ?? NaN);
    if (!Number.isFinite(price)) {
      return { ok: false, error: `${where}: enter a valid unit price (0 or more).` };
    }

    const quantity = Math.floor(num(raw?.quantity, NaN));
    if (!Number.isFinite(quantity) || quantity < 1 || quantity > MAX_QTY_PER_LINE) {
      return { ok: false, error: `${where}: quantity must be a whole number between 1 and ${MAX_QTY_PER_LINE}.` };
    }

    lines.push({ slug: fromCatalog?.slug ?? 'custom', name: product_name, weight, price, quantity });
  }

  const subtotal = Math.round(lines.reduce((s, l) => s + l.price * l.quantity, 0) * 100) / 100;

  /* ── Charges ── */
  // `shipping` omitted (not 0) means "work it out for me": only possible when
  // every line is a real SKU with a known packed weight and we know the state.
  let shipping: number;
  if (b.shipping === undefined || b.shipping === null || b.shipping === '') {
    const quotable = customer.state && lines.every((l) => l.slug !== 'custom');
    shipping = quotable
      ? calculateShipping({
          state: customer.state,
          lines: lines.map((l) => ({ slug: l.slug, quantity: l.quantity })),
          subtotal,
        }).charge
      : 0;
  } else {
    shipping = money(b.shipping);
    if (!Number.isFinite(shipping)) return { ok: false, error: 'Delivery charge must be 0 or more.' };
  }

  const codCharge = money(b.cod_charge, 0);
  if (!Number.isFinite(codCharge)) return { ok: false, error: 'COD charge must be 0 or more.' };

  const discount = money(b.discount, 0);
  if (!Number.isFinite(discount)) return { ok: false, error: 'Discount must be 0 or more.' };
  if (discount > subtotal + shipping + codCharge) {
    return { ok: false, error: 'Discount cannot be more than the order value.' };
  }

  const total = Math.round((subtotal + shipping + codCharge - discount) * 100) / 100;

  /* ── Payment ── */
  const payment_method = str(b.payment_method) || 'upi';
  if (!isOption(PAYMENT_METHODS, payment_method)) {
    return { ok: false, error: 'Choose a valid payment method.' };
  }

  let amount_paid = money(b.amount_paid, NaN);
  let payment_status = str(b.payment_status);

  if (payment_status && !isOneOf(PAYMENT_STATUSES, payment_status)) {
    return { ok: false, error: 'Choose a valid payment status.' };
  }

  // The two fields keep each other honest: given one, derive the other.
  if (!Number.isFinite(amount_paid)) {
    amount_paid = payment_status === 'Paid' ? total : 0;
  }
  if (amount_paid > total) {
    return { ok: false, error: `Amount received (₹${amount_paid}) is more than the order total (₹${total}).` };
  }
  if (!payment_status) {
    payment_status = amount_paid <= 0 ? 'Unpaid' : amount_paid >= total ? 'Paid' : 'Partial';
  }

  /* ── Classification ── */
  const source = str(b.source) || 'whatsapp';
  if (!isOption(ORDER_SOURCES, source)) {
    return { ok: false, error: 'Choose a valid order source.' };
  }

  const status = str(b.status) || 'Confirmed';
  if (!isOneOf(ORDER_STATUSES, status)) {
    return { ok: false, error: 'Choose a valid order status.' };
  }

  return {
    ok: true,
    order: {
      customer,
      cart: { lines, subtotal, shipping, codCharge, total },
      discount,
      payment_method,
      payment_status,
      amount_paid,
      payment_ref: str(b.payment_ref) || null,
      status,
      source,
      notes: str(b.notes) || null,
      notify: b.notify === true,
    },
  };
}
