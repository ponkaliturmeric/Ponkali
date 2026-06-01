import { NextRequest, NextResponse } from 'next/server';
import { verifyWebhookSignature } from '@/lib/razorpay';

/**
 * Razorpay webhook receiver. This is the reliable source of payment truth —
 * the browser handler can be missed (tab closed, network drop), but the webhook
 * always fires. Configure it in the Razorpay dashboard pointing at
 * /api/razorpay/webhook with events like `payment.captured` and `payment.failed`,
 * and set RAZORPAY_WEBHOOK_SECRET.
 */
export async function POST(request: NextRequest) {
  const signature = request.headers.get('x-razorpay-signature') ?? '';

  // Raw body is required for an exact HMAC match — do not JSON.parse first.
  const rawBody = await request.text();

  if (!verifyWebhookSignature(rawBody, signature)) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  try {
    const event = JSON.parse(rawBody);
    const paymentId = event?.payload?.payment?.entity?.id ?? null;

    // No DB yet — log the verified event. Persist order status here once a DB is wired.
    console.log('[RAZORPAY WEBHOOK]', JSON.stringify({
      event: event?.event,
      paymentId,
      orderId: event?.payload?.payment?.entity?.order_id ?? null,
      at: new Date().toISOString(),
    }));

    return NextResponse.json({ received: true });
  } catch {
    return NextResponse.json({ error: 'Malformed payload' }, { status: 400 });
  }
}
