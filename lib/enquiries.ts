import { ENQUIRY_SOURCES, ENQUIRY_STATUSES, isOption, isOneOf } from './crm';
import { isValidPhone, normalizePhone } from './customer-auth';

/**
 * Validation for bulk / wholesale enquiries.
 *
 * Deliberately more forgiving than checkout validation: a wholesale enquiry
 * arrives half-formed ("hi, price for 50kg?") and the operator should be able
 * to save that and fill the rest in later. So only the name plus ONE way of
 * contacting them is required, a landline is accepted where checkout insists on
 * a mobile, and every commercial field is optional.
 */

/** Columns an admin may write, and how each is cleaned. Nothing else is ever written. */
const TEXT_FIELDS = [
  'customer_name', 'phone', 'email', 'company', 'city', 'state',
  'product', 'quantity', 'requirement', 'notes',
] as const;

const NUMBER_FIELDS = ['quantity_kg', 'target_price', 'quoted_price'] as const;

export type EnquiryColumn =
  | (typeof TEXT_FIELDS)[number]
  | (typeof NUMBER_FIELDS)[number]
  | 'source' | 'status' | 'follow_up_on';

export type EnquiryValues = Partial<Record<EnquiryColumn, string | number | null>>;

export type EnquiryResult =
  | { ok: true; values: EnquiryValues }
  | { ok: false; error: string };

const MAX_TEXT = 4000;
const MAX_MONEY = 10_000_000;

function str(value: unknown): string {
  return String(value ?? '').trim();
}

/**
 * @param body    the request payload
 * @param partial true for PATCH — only the keys actually present are returned,
 *                so an inline status change doesn't blank out the rest of the row
 */
export function validateEnquiry(body: unknown, { partial }: { partial: boolean }): EnquiryResult {
  const b = (body ?? {}) as Record<string, unknown>;
  const values: EnquiryValues = {};
  const given = (key: string) => Object.prototype.hasOwnProperty.call(b, key);

  for (const key of TEXT_FIELDS) {
    if (partial && !given(key)) continue;
    const v = str(b[key]);
    if (v.length > MAX_TEXT) {
      return { ok: false, error: `${key.replace(/_/g, ' ')} is too long.` };
    }
    // A mobile is normalised to 10 digits so it matches orders.phone and the
    // wa.me links work. Anything else — a landline, an international number —
    // is kept exactly as typed rather than being forced into 10 digits.
    if (key === 'phone') {
      values.phone = isValidPhone(v) ? normalizePhone(v) : v;
    } else {
      values[key] = v || null;
    }
  }

  for (const key of NUMBER_FIELDS) {
    if (partial && !given(key)) continue;
    const raw = b[key];
    if (raw === '' || raw === null || raw === undefined) {
      values[key] = null;
      continue;
    }
    const n = Number(raw);
    if (!Number.isFinite(n) || n < 0 || n > MAX_MONEY) {
      return { ok: false, error: `${key.replace(/_/g, ' ')} must be a positive number.` };
    }
    values[key] = Math.round(n * 100) / 100;
  }

  if (!partial || given('source')) {
    const source = str(b.source) || 'whatsapp';
    if (!isOption(ENQUIRY_SOURCES, source)) {
      return { ok: false, error: 'Choose a valid enquiry source.' };
    }
    values.source = source;
  }

  if (!partial || given('status')) {
    const status = str(b.status) || 'New';
    if (!isOneOf(ENQUIRY_STATUSES, status)) {
      return { ok: false, error: 'Choose a valid enquiry status.' };
    }
    values.status = status;
  }

  if (!partial || given('follow_up_on')) {
    const date = str(b.follow_up_on);
    if (date && !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return { ok: false, error: 'Follow-up date must be a valid date.' };
    }
    values.follow_up_on = date || null;
  }

  // On create, and on any edit that touches the contact fields, make sure we
  // can still reach this person.
  const touchesContact = !partial || given('customer_name') || given('phone') || given('email');
  if (touchesContact) {
    const name = partial && !given('customer_name') ? null : str(b.customer_name);
    if (name !== null && name.length < 2) {
      return { ok: false, error: 'Customer name is required.' };
    }
    if (!partial && !str(b.phone) && !str(b.email)) {
      return { ok: false, error: 'Add a phone number or an email — at least one way to reach them.' };
    }
  }

  if (Object.keys(values).length === 0) {
    return { ok: false, error: 'Nothing to update.' };
  }

  return { ok: true, values };
}
