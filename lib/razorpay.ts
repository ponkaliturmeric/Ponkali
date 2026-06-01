import crypto from 'crypto';

/**
 * Razorpay server helpers. We talk to the REST API directly (no SDK dependency)
 * and verify signatures with Node's built-in crypto.
 *
 * Required env:
 *   RAZORPAY_KEY_ID        – e.g. rzp_test_xxx / rzp_live_xxx
 *   RAZORPAY_KEY_SECRET    – API secret (server-only, never exposed to client)
 *   RAZORPAY_WEBHOOK_SECRET – (optional) for the /api/razorpay/webhook route
 *
 * The key_id is public (it ships to the browser to open Checkout); the secret
 * and webhook secret must stay server-side.
 */

const RAZORPAY_API = 'https://api.razorpay.com/v1';

export function getRazorpayKeys() {
  return {
    keyId: process.env.RAZORPAY_KEY_ID ?? '',
    keySecret: process.env.RAZORPAY_KEY_SECRET ?? '',
  };
}

export function isRazorpayConfigured(): boolean {
  const { keyId, keySecret } = getRazorpayKeys();
  return Boolean(keyId && keySecret);
}

export interface RazorpayOrder {
  id: string;
  amount: number;
  currency: string;
  receipt: string;
  status: string;
}

export async function createRazorpayOrder(params: {
  amountPaise: number;
  receipt: string;
  notes?: Record<string, string>;
}): Promise<RazorpayOrder> {
  const { keyId, keySecret } = getRazorpayKeys();
  if (!keyId || !keySecret) {
    throw new Error('Razorpay keys are not configured');
  }

  const auth = Buffer.from(`${keyId}:${keySecret}`).toString('base64');
  const res = await fetch(`${RAZORPAY_API}/orders`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Basic ${auth}`,
    },
    body: JSON.stringify({
      amount: params.amountPaise,
      currency: 'INR',
      receipt: params.receipt,
      notes: params.notes ?? {},
    }),
  });

  if (!res.ok) {
    const detail = await res.text();
    throw new Error(`Razorpay order creation failed (${res.status}): ${detail}`);
  }

  return res.json() as Promise<RazorpayOrder>;
}

/** Verifies the Checkout handler signature: HMAC_SHA256(order_id|payment_id, secret). */
export function verifyPaymentSignature(
  orderId: string,
  paymentId: string,
  signature: string,
): boolean {
  const { keySecret } = getRazorpayKeys();
  if (!keySecret || !orderId || !paymentId || !signature) return false;

  const expected = crypto
    .createHmac('sha256', keySecret)
    .update(`${orderId}|${paymentId}`)
    .digest('hex');

  return safeEqual(signature, expected);
}

/** Verifies a webhook payload signature: HMAC_SHA256(rawBody, webhookSecret). */
export function verifyWebhookSignature(rawBody: string, signature: string): boolean {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET ?? '';
  if (!secret || !signature) return false;

  const expected = crypto.createHmac('sha256', secret).update(rawBody).digest('hex');
  return safeEqual(signature, expected);
}

function safeEqual(a: string, b: string): boolean {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  return bufA.length === bufB.length && crypto.timingSafeEqual(bufA, bufB);
}
