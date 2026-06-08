import { getCatalog } from './catalog';

/**
 * Server-authoritative cart pricing. The client may send slugs + quantities,
 * but prices, shipping and totals are ALWAYS recomputed here from the trusted
 * product catalogue (the database) — never taken from the request body.
 *
 * Shipping is always free — we never add a delivery charge.
 */
export const COD_CHARGE = 30;

const MAX_QTY_PER_LINE = 50;

export interface CartLineInput {
  slug: string;
  quantity: number;
}

export interface PricedLine {
  slug: string;
  name: string;
  weight: string;
  price: number;
  quantity: number;
}

export interface PricedCart {
  lines: PricedLine[];
  subtotal: number;
  shipping: number;
  codCharge: number;
  total: number;
}

/**
 * Validates and prices a cart. Returns null if the cart is empty or contains
 * an unknown / out-of-stock product, so callers can reject the request.
 */
export async function priceCart(
  items: unknown,
  opts: { cod?: boolean } = {},
): Promise<PricedCart | null> {
  if (!Array.isArray(items) || items.length === 0) return null;

  const catalog = await getCatalog();
  const lines: PricedLine[] = [];
  let subtotal = 0;

  for (const item of items) {
    const slug = String((item as CartLineInput)?.slug ?? '');
    const quantity = Math.floor(Number((item as CartLineInput)?.quantity));

    if (!Number.isFinite(quantity) || quantity < 1 || quantity > MAX_QTY_PER_LINE) {
      return null;
    }

    const product = catalog.find((p) => p.slug === slug);
    if (!product || !product.in_stock) return null;

    subtotal += product.price * quantity;
    lines.push({
      slug: product.slug,
      name: product.name,
      weight: product.weight,
      price: product.price,
      quantity,
    });
  }

  const shipping = 0; // Free shipping on every order.
  const codCharge = opts.cod ? COD_CHARGE : 0;
  const total = subtotal + shipping + codCharge;

  return { lines, subtotal, shipping, codCharge, total };
}

/** Razorpay expects the smallest currency unit (paise for INR). */
export function toPaise(rupees: number): number {
  return Math.round(rupees * 100);
}
