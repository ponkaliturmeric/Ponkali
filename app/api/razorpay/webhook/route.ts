import { NextRequest, NextResponse } from 'next/server';
import { verifyWebhookSignature } from '@/lib/razorpay';
import { finalizeRazorpayPayment } from '@/lib/payments';

/**
 * Razorpay webhook receiver — the reliable source of payment truth. The
 * browser handler is routinely missed on mobile (the tab is killed while the
 * customer is in their UPI app), but this always fires server-to-server.
 *
 * Setup: Razorpay Dashboard → Settings → Webhooks → add
 *   https://<your-domain>/api/razorpay/webhook
 * with the event `payment.captured` (order.paid also handled) and the same
 * secret as RAZORPAY_WEBHOOK_SECRET.
 */
export async function POST(request: NextRequest) {
  const signature = request.headers.get('x-razorpay-signature') ?? '';

  // Raw body is required for an exact HMAC match — do not JSON.parse first.
  const rawBody = await request.text();

  if (!verifyWebhookSignature(rawBody, signature)) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  let event: { event?: string; payload?: { payment?: { entity?: { id?: string; order_id?: string; status?: string } } } };
  try {
    event = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: 'Malformed payload' }, { status: 400 });
  }

  const payment = event?.payload?.payment?.entity;
  const eventName = event?.event ?? '';
  const paymentId = payment?.id;
  const razorpayOrderId = payment?.order_id;

  // Only a captured payment creates an order. Everything else is acknowledged
  // (200) so Razorpay does not keep retrying.
  const isCapture = eventName === 'payment.captured' || eventName === 'order.paid';
  if (!isCapture || !paymentId || !razorpayOrderId) {
    return NextResponse.json({ received: true, ignored: eventName });
  }

  try {
    const result = await finalizeRazorpayPayment({
      razorpay_order_id: razorpayOrderId,
      razorpay_payment_id: paymentId,
      source: 'webhook',
    });
    console.log('[RAZORPAY WEBHOOK]', JSON.stringify({ event: eventName, paymentId, razorpayOrderId, ...result }));
    return NextResponse.json({ received: true, ...result });
  } catch (error) {
    // 500 makes Razorpay retry, which is what we want for a transient DB error.
    console.error('[RAZORPAY WEBHOOK] finalize failed:', error);
    return NextResponse.json({ error: 'Failed to record order' }, { status: 500 });
  }
}
