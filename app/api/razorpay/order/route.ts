import { NextRequest, NextResponse } from 'next/server';
import { getRazorpayKeys, isRazorpayConfigured } from '@/lib/razorpay';
import { getCustomerSession } from '@/lib/customer-auth';
import { startRazorpayCheckout } from '@/lib/payments';

/**
 * Step 1 of online checkout. Prices the cart on the server, creates the
 * Razorpay order, and SAVES the cart + delivery details (pending_payments)
 * before the customer pays — so the webhook can create the order on its own
 * if the browser never returns from the UPI app. See lib/payments.ts.
 */
export async function POST(request: NextRequest) {
  try {
    if (!isRazorpayConfigured()) {
      return NextResponse.json(
        { error: 'Online payment is not available right now. Please choose Cash on Delivery.' },
        { status: 503 },
      );
    }

    const body = await request.json();
    const session = getCustomerSession();

    const started = await startRazorpayCheckout({
      items: body.items,
      customer: body,
      user_id: session?.uid ?? null,
    });
    if (!started.ok) {
      return NextResponse.json({ error: started.error }, { status: 400 });
    }

    const { keyId } = getRazorpayKeys();
    const r = started.result;
    return NextResponse.json({
      keyId,
      orderId: r.razorpayOrderId,
      amount: r.amountPaise,
      currency: r.currency,
      receipt: r.receipt,
      // Echo the authoritative breakdown so the UI can reconcile if needed.
      breakdown: { subtotal: r.cart.subtotal, shipping: r.cart.shipping, total: r.cart.total },
    });
  } catch (error) {
    console.error('Razorpay order error:', error);
    return NextResponse.json({ error: 'Could not start payment. Please try again.' }, { status: 500 });
  }
}
