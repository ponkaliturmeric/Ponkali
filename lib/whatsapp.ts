/**
 * Transactional WhatsApp via the Meta WhatsApp Cloud API
 * (https://developers.facebook.com/docs/whatsapp/cloud-api), called over its
 * Graph HTTP API with `fetch` — no SDK, runs in any runtime. Chosen over the
 * Indian BSPs (AiSensy/Interakt/WATI) because the Cloud API has NO monthly
 * platform fee: you only pay Meta's small per-message charge, and "utility"
 * messages such as order confirmations have a free allowance.
 *
 * Configuration (see .env.example):
 *   WHATSAPP_ACCESS_TOKEN     — permanent token of a System User with
 *                               whatsapp_business_messaging permission.
 *   WHATSAPP_PHONE_NUMBER_ID  — the "Phone number ID" of your WhatsApp sender
 *                               (WhatsApp Manager → API Setup), NOT the number.
 *   WHATSAPP_TEMPLATE_NAME    — name of your APPROVED order-confirmation template.
 *   WHATSAPP_TEMPLATE_LANG    — template language code (default "en").
 *   WHATSAPP_GRAPH_VERSION    — Graph API version (default "v21.0").
 *
 * Business-initiated messages MUST use a pre-approved template (you cannot send
 * free-form text outside a 24h customer-initiated window). Submit a "Utility"
 * template in WhatsApp Manager whose BODY has exactly these 4 variables, in this
 * order, e.g.:
 *
 *   Hi {{1}}, your Ponkali order {{2}} is confirmed ✅
 *   Total: {{3}}. Status: {{4}}.
 *   We'll dispatch within 1–2 business days. Thank you!
 *
 * If WHATSAPP_ACCESS_TOKEN / WHATSAPP_PHONE_NUMBER_ID / WHATSAPP_TEMPLATE_NAME
 * are not all set, sending is a logged no-op so order creation keeps working.
 */

const GRAPH_VERSION = process.env.WHATSAPP_GRAPH_VERSION ?? 'v21.0';

/**
 * Normalise an Indian phone to the E.164 digits WhatsApp expects, e.g.
 * "+91 98765 43210" → "919876543210". Strips non-digits, drops a leading 0
 * trunk prefix, and prepends the 91 country code when a bare 10-digit number is
 * given. Returns '' when the result isn't a plausible number, so callers skip.
 */
export function toWhatsAppNumber(raw: string): string {
  let d = String(raw ?? '').replace(/\D/g, '');
  if (d.length === 11 && d.startsWith('0')) d = d.slice(1);
  if (d.length === 10) d = '91' + d;
  // 12-digit "91XXXXXXXXXX" is already correct.
  return d.length === 12 && d.startsWith('91') ? d : '';
}

const inr = (n: number) => `₹${Number(n).toLocaleString('en-IN')}`;

interface OrderWhatsAppData {
  order_id: string;
  customer_name: string;
  phone: string;
  total: number;
  status: string;
}

/**
 * Sends the order-confirmation WhatsApp template to the customer. Always
 * resolves; any failure is logged, never thrown, so it can't break an order.
 * Returns true only when Meta accepted the message.
 */
export async function sendOrderWhatsApp(o: OrderWhatsAppData): Promise<boolean> {
  const token = process.env.WHATSAPP_ACCESS_TOKEN;
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  const template = process.env.WHATSAPP_TEMPLATE_NAME;
  const lang = process.env.WHATSAPP_TEMPLATE_LANG ?? 'en';

  if (!token || !phoneNumberId || !template) {
    console.warn(
      `[whatsapp] not configured (need WHATSAPP_ACCESS_TOKEN, WHATSAPP_PHONE_NUMBER_ID, WHATSAPP_TEMPLATE_NAME) — skipping for order ${o.order_id}`,
    );
    return false;
  }

  const to = toWhatsAppNumber(o.phone);
  if (!to) {
    console.warn(`[whatsapp] order ${o.order_id} has no valid phone — skipping`);
    return false;
  }

  // BODY variables {{1}}..{{4}} → name, order id, total, status (see template above).
  const params = [
    o.customer_name.split(' ')[0] || 'there',
    o.order_id,
    inr(o.total),
    o.status,
  ].map((text) => ({ type: 'text', text: String(text) }));

  try {
    const res = await fetch(
      `https://graph.facebook.com/${GRAPH_VERSION}/${phoneNumberId}/messages`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          to,
          type: 'template',
          template: {
            name: template,
            language: { code: lang },
            components: [{ type: 'body', parameters: params }],
          },
        }),
      },
    );
    if (!res.ok) {
      const detail = await res.text().catch(() => '');
      console.error(`[whatsapp] send failed (${res.status}) for order ${o.order_id}:`, detail);
      return false;
    }
    return true;
  } catch (err) {
    console.error(`[whatsapp] send error for order ${o.order_id}:`, err);
    return false;
  }
}
