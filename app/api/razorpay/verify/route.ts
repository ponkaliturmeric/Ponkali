import { NextRequest, NextResponse } from 'next/server';
import { verifyPaymentSignature } from '@/lib/razorpay';
import { finalizeRazorpayPayment } from '@/lib/payments';

/**
 * Browser-side completion of an online payment. Confirms the Razorpay
 * signature, then creates the order from the cart saved at checkout start.
 * Idempotent with the webhook — whichever arrives first creates the order, the
 * other gets the same order id back.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, customer } = body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return NextResponse.json({ error: 'Missing payment details.' }, { status: 400 });
    }

    // Cryptographically confirm the payment really came from Razorpay for this order.
    const valid = verifyPaymentSignature(razorpay_order_id, razorpay_payment_id, razorpay_signature);
    if (!valid) {
      return NextResponse.json({ error: 'Payment verification failed.' }, { status: 400 });
    }

    const result = await finalizeRazorpayPayment({
      razorpay_order_id,
      razorpay_payment_id,
      source: 'verify',
      fallback: customer ? { customer } : undefined,
    });

    if (result.status === 'unknown') {
      // Payment is real but we have nothing to build the order from. Log loudly;
      // the reconciliation script picks these up from Razorpay.
      console.error('[razorpay verify] captured payment with no pending record', { razorpay_order_id, razorpay_payment_id });
      return NextResponse.json(
        { error: 'Payment received but the order could not be recorded. Please WhatsApp us with your payment id ' + razorpay_payment_id + '.' },
        { status: 500 },
      );
    }

    return NextResponse.json({ success: true, order_id: result.order_id });
  } catch (error) {
    console.error('Razorpay verify error:', error);
    return NextResponse.json({ error: 'Could not verify payment. Please contact us.' }, { status: 500 });
  }
}
