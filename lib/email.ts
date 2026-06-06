/**
 * Transactional email via Resend (https://resend.com), called over its HTTP API
 * with `fetch` so there's no extra dependency and it runs in any runtime.
 *
 * Configuration (see .env.example):
 *   RESEND_API_KEY  — required to actually send. If unset, sending is a logged
 *                     no-op so the contact/order flows keep working before email
 *                     is configured (and never break because of email).
 *   EMAIL_FROM      — the "From" address. Until you verify your own domain in
 *                     Resend, leave it on the onboarding sender; afterwards set
 *                     e.g. "Ponkali Masalas <orders@ponkali.in>".
 *   BUSINESS_EMAIL  — where new-order + contact notifications are delivered.
 */

const RESEND_ENDPOINT = 'https://api.resend.com/emails';

const DEFAULT_FROM = 'Ponkali Masalas <onboarding@resend.dev>';

/**
 * Resend requires the "from" as either `email@domain` or `Name <email@domain>`.
 * A bare `<email@domain>` (a common misconfiguration) is rejected, which makes
 * every send fail silently. Normalise the env value so those cases still work.
 */
function normalizeFrom(raw?: string): string {
  const v = (raw ?? '').trim();
  if (!v) return DEFAULT_FROM;
  // Just an email, or an email wrapped in stray angle brackets -> add a name.
  const bare = v.match(/^<?\s*([^<>\s]+@[^<>\s]+?)\s*>?$/);
  if (bare) return `Ponkali Masalas <${bare[1]}>`;
  return v;
}

const FROM = normalizeFrom(process.env.EMAIL_FROM);
export const BUSINESS_EMAIL = process.env.BUSINESS_EMAIL ?? 'ponkaliturmeric@gmail.com';

interface SendInput {
  to: string | string[];
  subject: string;
  html: string;
  replyTo?: string;
}

/** Low-level send. Returns true on success, false (logged) on any failure. */
export async function sendEmail({ to, subject, html, replyTo }: SendInput): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.warn(`[email] RESEND_API_KEY not set — skipping email: "${subject}"`);
    return false;
  }
  try {
    const res = await fetch(RESEND_ENDPOINT, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: FROM,
        to: Array.isArray(to) ? to : [to],
        subject,
        html,
        ...(replyTo ? { reply_to: replyTo } : {}),
      }),
    });
    if (!res.ok) {
      const detail = await res.text().catch(() => '');
      console.error(`[email] Resend send failed (${res.status}):`, detail);
      return false;
    }
    return true;
  } catch (err) {
    console.error('[email] Resend send error:', err);
    return false;
  }
}

/* ───────────────────────────  Shared styling  ─────────────────────────── */

const BRAND = '#2C1000';
const GOLD = '#D4960A';
const CREAM = '#FBF6EC';

const esc = (s: string) =>
  String(s).replace(/[&<>"']/g, (c) =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c] as string),
  );

const inr = (n: number) => `₹${Number(n).toLocaleString('en-IN')}`;

function shell(title: string, body: string): string {
  return `<!doctype html><html><body style="margin:0;padding:0;background:${CREAM};font-family:Helvetica,Arial,sans-serif;color:${BRAND};">
    <div style="max-width:560px;margin:0 auto;padding:32px 20px;">
      <div style="text-align:center;margin-bottom:24px;">
        <p style="font-size:22px;font-weight:800;letter-spacing:3px;margin:0;color:${BRAND};">PONKALI</p>
        <p style="font-size:11px;letter-spacing:2px;text-transform:uppercase;color:${GOLD};margin:4px 0 0;">Pure Erode Turmeric</p>
      </div>
      <div style="background:#ffffff;border:1px solid rgba(0,0,0,0.08);border-radius:16px;padding:28px;">
        <h1 style="font-size:20px;margin:0 0 16px;color:${BRAND};">${title}</h1>
        ${body}
      </div>
      <p style="text-align:center;font-size:12px;color:#9b9b9b;margin-top:24px;line-height:1.6;">
        Ponkali Masalas · Perundurai, Erode, Tamil Nadu<br/>
        Questions? Reply to this email or WhatsApp +91 99440 33696
      </p>
    </div>
  </body></html>`;
}

/* ───────────────────────────  Order emails  ─────────────────────────── */

export interface OrderEmailData {
  order_id: string;
  customer_name: string;
  email?: string | null;
  phone: string;
  payment_method: 'cod' | 'online';
  status: string;
  lines: { name: string; weight: string; quantity: number; price: number }[];
  subtotal: number;
  shipping: number;
  codCharge: number;
  total: number;
}

function orderRows(o: OrderEmailData): string {
  return o.lines
    .map(
      (l) => `<tr>
        <td style="padding:8px 0;font-size:14px;color:${BRAND};">${esc(l.name)} <span style="color:#9b9b9b;">${esc(l.weight)} × ${l.quantity}</span></td>
        <td style="padding:8px 0;font-size:14px;color:${BRAND};text-align:right;white-space:nowrap;">${inr(l.price * l.quantity)}</td>
      </tr>`,
    )
    .join('');
}

function orderTotals(o: OrderEmailData): string {
  const row = (label: string, value: string, bold = false) =>
    `<tr>
      <td style="padding:4px 0;font-size:${bold ? 16 : 13}px;color:${bold ? BRAND : '#6b6b6b'};${bold ? 'font-weight:800;' : ''}">${label}</td>
      <td style="padding:4px 0;font-size:${bold ? 18 : 13}px;color:${BRAND};text-align:right;${bold ? 'font-weight:800;' : ''}">${value}</td>
    </tr>`;
  return (
    row('Subtotal', inr(o.subtotal)) +
    row('Shipping', o.shipping === 0 ? 'Free' : inr(o.shipping)) +
    (o.codCharge > 0 ? row('COD charge', inr(o.codCharge)) : '') +
    row('Total', inr(o.total), true)
  );
}

/**
 * Emails the customer their order confirmation (if they gave an email) and
 * notifies the business of the new order. Always resolves; failures are logged,
 * never thrown, so they can't break order creation.
 */
export async function sendOrderEmails(o: OrderEmailData): Promise<void> {
  const isCOD = o.payment_method === 'cod';
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://ponkali.in';

  const itemsTable = `
    <table style="width:100%;border-collapse:collapse;margin:8px 0 4px;">${orderRows(o)}</table>
    <table style="width:100%;border-collapse:collapse;border-top:1px solid rgba(0,0,0,0.08);margin-top:12px;padding-top:8px;">${orderTotals(o)}</table>`;

  const tasks: Promise<unknown>[] = [];

  // 1) Customer confirmation
  if (o.email) {
    const firstName = esc(o.customer_name.split(' ')[0] || 'there');
    const body = `
      <p style="font-size:15px;line-height:1.7;margin:0 0 16px;color:#444;">
        Hi ${firstName}, thank you for your order. We've received it and will dispatch within 1 to 2 business days.
      </p>
      <p style="font-size:13px;color:#6b6b6b;margin:0 0 4px;">Order ID</p>
      <p style="font-size:17px;font-weight:700;letter-spacing:1px;margin:0 0 16px;color:${BRAND};">${esc(o.order_id)}</p>
      ${itemsTable}
      <div style="background:${isCOD ? '#FFF7E6' : '#EAF4FF'};border-radius:12px;padding:14px;margin-top:18px;font-size:13px;line-height:1.6;color:${BRAND};">
        ${isCOD
          ? `<strong>Cash on Delivery.</strong> Please keep ${inr(o.total)} ready at delivery.`
          : `<strong>Payment received.</strong> Your order is confirmed.`}
      </div>
      <div style="text-align:center;margin-top:22px;">
        <a href="${siteUrl}/order-confirmation/${encodeURIComponent(o.order_id)}"
           style="display:inline-block;background:${BRAND};color:${CREAM};text-decoration:none;font-weight:700;font-size:14px;padding:12px 28px;border-radius:999px;">
          Track your order
        </a>
      </div>`;
    tasks.push(
      sendEmail({
        to: o.email,
        subject: `Order confirmed: ${o.order_id}`,
        html: shell('Order Confirmed', body),
        replyTo: BUSINESS_EMAIL,
      }),
    );
  }

  // 2) Business notification
  const bizBody = `
    <p style="font-size:14px;line-height:1.7;margin:0 0 14px;color:#444;">
      New ${isCOD ? 'COD' : 'paid online'} order from <strong>${esc(o.customer_name)}</strong> (${esc(o.phone)}${o.email ? ` · ${esc(o.email)}` : ''}).
    </p>
    <p style="font-size:13px;color:#6b6b6b;margin:0 0 4px;">Order ID</p>
    <p style="font-size:17px;font-weight:700;letter-spacing:1px;margin:0 0 16px;color:${BRAND};">${esc(o.order_id)}</p>
    ${itemsTable}
    <div style="text-align:center;margin-top:22px;">
      <a href="${siteUrl}/admin/orders/${encodeURIComponent(o.order_id)}"
         style="display:inline-block;background:${GOLD};color:${BRAND};text-decoration:none;font-weight:700;font-size:14px;padding:12px 28px;border-radius:999px;">
        Open in admin
      </a>
    </div>`;
  tasks.push(
    sendEmail({
      to: BUSINESS_EMAIL,
      subject: `New order ${o.order_id}: ${inr(o.total)}${isCOD ? ' (COD)' : ''}`,
      html: shell('New Order', bizBody),
      replyTo: o.email || undefined,
    }),
  );

  await Promise.allSettled(tasks);
}

/* ───────────────────────────  Contact email  ─────────────────────────── */

export async function sendContactNotification(input: {
  name: string;
  email?: string | null;
  message: string;
}): Promise<void> {
  const body = `
    <p style="font-size:13px;color:#6b6b6b;margin:0 0 4px;">From</p>
    <p style="font-size:15px;font-weight:600;margin:0 0 14px;color:${BRAND};">${esc(input.name)}${input.email ? ` · ${esc(input.email)}` : ''}</p>
    <p style="font-size:13px;color:#6b6b6b;margin:0 0 4px;">Message</p>
    <p style="font-size:15px;line-height:1.7;margin:0;color:#444;white-space:pre-wrap;">${esc(input.message)}</p>`;
  await sendEmail({
    to: BUSINESS_EMAIL,
    subject: `New contact message from ${input.name}`,
    html: shell('New Contact Message', body),
    replyTo: input.email || undefined,
  });
}
