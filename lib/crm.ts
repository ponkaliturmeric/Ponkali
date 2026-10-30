/**
 * CRM vocabulary — shared by the admin UI (client components) and the API
 * routes that validate what the UI sends. Like lib/shipping.ts this file has NO
 * server-only imports, so the dropdowns and the server-side whitelist can never
 * drift apart: add an option here and both sides accept it.
 */

export interface Option {
  value: string;
  label: string;
}

/** Where an order came from. 'website' is written by the storefront checkout. */
export const ORDER_SOURCES: Option[] = [
  { value: 'website', label: 'Website' },
  { value: 'whatsapp', label: 'WhatsApp' },
  { value: 'phone', label: 'Phone call' },
  { value: 'instagram', label: 'Instagram' },
  { value: 'walk-in', label: 'Walk-in' },
  { value: 'reference', label: 'Reference' },
  { value: 'other', label: 'Other' },
];

/** Sources offered when an admin types an order in by hand (website excluded). */
export const MANUAL_ORDER_SOURCES: Option[] = ORDER_SOURCES.filter((s) => s.value !== 'website');

/**
 * How the customer paid. 'cod' and 'online' are what the storefront writes;
 * the rest exist for orders taken over WhatsApp, where money usually arrives
 * by UPI, cash or a bank transfer.
 */
export const PAYMENT_METHODS: Option[] = [
  { value: 'upi', label: 'UPI' },
  { value: 'cash', label: 'Cash' },
  { value: 'bank', label: 'Bank transfer' },
  { value: 'cod', label: 'Cash on Delivery' },
  { value: 'online', label: 'Online (Razorpay)' },
  { value: 'other', label: 'Other' },
];

export const PAYMENT_STATUSES = ['Unpaid', 'Partial', 'Paid', 'Refunded'] as const;
export type PaymentStatus = (typeof PAYMENT_STATUSES)[number];

/** Fulfilment statuses. Mirrors VALID_STATUSES in app/api/orders/[id]/route.ts. */
export const ORDER_STATUSES = [
  'Pending', 'Confirmed', 'Packed', 'Shipped', 'Delivered', 'Cancelled', 'Paid',
] as const;

/* ─────────────────────────  Bulk enquiries  ───────────────────────── */

/** Pipeline stages for a bulk / wholesale enquiry, in order. */
export const ENQUIRY_STATUSES = [
  'New', 'Contacted', 'Quoted', 'Negotiating', 'Won', 'Lost',
] as const;
export type EnquiryStatus = (typeof ENQUIRY_STATUSES)[number];

/** Still being worked — drives the "open enquiries" KPI and the default filter. */
export const OPEN_ENQUIRY_STATUSES: readonly string[] = ['New', 'Contacted', 'Quoted', 'Negotiating'];

export const ENQUIRY_SOURCES: Option[] = [
  { value: 'whatsapp', label: 'WhatsApp' },
  { value: 'phone', label: 'Phone call' },
  { value: 'instagram', label: 'Instagram' },
  { value: 'email', label: 'Email' },
  { value: 'website', label: 'Website form' },
  { value: 'reference', label: 'Reference' },
  { value: 'exhibition', label: 'Exhibition / market' },
  { value: 'other', label: 'Other' },
];

/* ─────────────────────────  Validation helpers  ───────────────────────── */

/** True when `value` is one of the option values (server-side whitelist check). */
export function isOption(options: Option[], value: unknown): boolean {
  return options.some((o) => o.value === value);
}

export function isOneOf(allowed: readonly string[], value: unknown): boolean {
  return typeof value === 'string' && allowed.includes(value);
}

/** Label for a stored value, falling back to the raw value for legacy rows. */
export function labelFor(options: Option[], value: string | null | undefined): string {
  if (!value) return '—';
  return options.find((o) => o.value === value)?.label ?? value;
}
