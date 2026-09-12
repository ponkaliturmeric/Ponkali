/**
 * Delivery charges — zone (by destination state) × weight (500 g slabs).
 *
 * This is the ONE file to edit when your courier's rate card changes. It has no
 * server-only imports, so the cart, mini-cart and checkout use the same
 * function for the on-screen estimate that lib/pricing.ts uses for the real,
 * server-authoritative charge. The two can never disagree.
 *
 * Shipments leave from Erode, Tamil Nadu (PIN 638xxx). Zones are the usual
 * courier bands measured from there. The rates below are TYPICAL SURFACE RATES
 * (Delhivery / DTDC / Shiprocket, 2026) — replace them with your courier's
 * actual numbers.
 */

export type Zone = 'A' | 'B' | 'C' | 'D' | 'E';

export interface ZoneRate {
  label: string;
  /** Charge for the first 500 g slab. */
  base: number;
  /** Charge for each additional 500 g slab. */
  perExtraSlab: number;
}

/* ─────────────────────────  EDIT THESE  ───────────────────────── */

export const ZONE_RATES: Record<Zone, ZoneRate> = {
  A: { label: 'Tamil Nadu',            base: 40,  perExtraSlab: 20 },
  B: { label: 'South India',           base: 55,  perExtraSlab: 25 },
  C: { label: 'Metro cities',          base: 65,  perExtraSlab: 30 },
  D: { label: 'Rest of India',         base: 80,  perExtraSlab: 35 },
  E: { label: 'North East & islands',  base: 120, perExtraSlab: 50 },
};

/**
 * Set to a rupee amount (e.g. 499) to make orders at or above that subtotal
 * ship free; null charges every order. Flip it here and every page — cart
 * banner, checkout, emails, shipping policy — follows.
 */
export const FREE_SHIPPING_ABOVE: number | null = null;

/** Shipped weight per pack, in grams, INCLUDING the pouch + outer packaging. */
export const PACK_WEIGHT_G: Record<string, number> = {
  'turmeric-100g': 150,
  'turmeric-250g': 310,
  'turmeric-500g': 580,
  'turmeric-1kg':  1120,
};
/** Used for a slug not in the table above (new SKU not yet added). */
const DEFAULT_PACK_WEIGHT_G = 600;

const SLAB_G = 500;

/* ─────────────────────────  Zone map  ───────────────────────── */

export const STATE_ZONES: Record<string, Zone> = {
  // A — home state
  'Tamil Nadu': 'A',
  'Puducherry': 'A',
  // B — neighbouring South
  'Kerala': 'B',
  'Karnataka': 'B',
  'Andhra Pradesh': 'B',
  'Telangana': 'B',
  // C — metro-heavy states (Delhi, Mumbai/Pune, Kolkata, Ahmedabad)
  'Delhi': 'C',
  'Maharashtra': 'C',
  'Gujarat': 'C',
  'West Bengal': 'C',
  // D — rest of India
  'Goa': 'D',
  'Madhya Pradesh': 'D',
  'Chhattisgarh': 'D',
  'Odisha': 'D',
  'Rajasthan': 'D',
  'Uttar Pradesh': 'D',
  'Uttarakhand': 'D',
  'Haryana': 'D',
  'Punjab': 'D',
  'Himachal Pradesh': 'D',
  'Chandigarh': 'D',
  'Bihar': 'D',
  'Jharkhand': 'D',
  'Dadra and Nagar Haveli and Daman and Diu': 'D',
  // E — special / remote
  'Assam': 'E',
  'Arunachal Pradesh': 'E',
  'Manipur': 'E',
  'Meghalaya': 'E',
  'Mizoram': 'E',
  'Nagaland': 'E',
  'Sikkim': 'E',
  'Tripura': 'E',
  'Jammu and Kashmir': 'E',
  'Ladakh': 'E',
  'Andaman and Nicobar Islands': 'E',
  'Lakshadweep': 'E',
};

/** Every state we ship to, for the dropdowns. Derived from the map so they can't drift. */
export const INDIAN_STATES: string[] = Object.keys(STATE_ZONES).sort();

export const DEFAULT_STATE = 'Tamil Nadu';

/* ─────────────────────────  Calculation  ───────────────────────── */

export interface ShippingLine {
  slug: string;
  quantity: number;
}

export interface ShippingQuote {
  zone: Zone;
  zoneLabel: string;
  weightG: number;
  slabs: number;
  /** Final charge in rupees (0 when free). */
  charge: number;
  /** True when FREE_SHIPPING_ABOVE applied. */
  free: boolean;
}

export function zoneForState(state: string | undefined | null): Zone {
  // Unknown / blank state falls into the most expensive mainland band rather
  // than under-charging.
  return STATE_ZONES[String(state ?? '').trim()] ?? 'D';
}

export function cartWeightG(lines: ShippingLine[]): number {
  return lines.reduce(
    (g, l) => g + (PACK_WEIGHT_G[l.slug] ?? DEFAULT_PACK_WEIGHT_G) * Math.max(0, l.quantity),
    0,
  );
}

export function calculateShipping(input: {
  state: string | undefined | null;
  lines: ShippingLine[];
  subtotal: number;
}): ShippingQuote {
  const zone = zoneForState(input.state);
  const rate = ZONE_RATES[zone];
  const weightG = cartWeightG(input.lines);
  const slabs = Math.max(1, Math.ceil(weightG / SLAB_G));
  const free = FREE_SHIPPING_ABOVE != null && input.subtotal >= FREE_SHIPPING_ABOVE;
  const charge = free || input.lines.length === 0 ? 0 : rate.base + (slabs - 1) * rate.perExtraSlab;
  return { zone, zoneLabel: rate.label, weightG, slabs, charge, free };
}

/** Cheapest possible charge — for "delivery from ₹40" marketing lines. */
export const MIN_SHIPPING = Math.min(...Object.values(ZONE_RATES).map((r) => r.base));
