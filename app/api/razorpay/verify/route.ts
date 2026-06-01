import { NextRequest, NextResponse } from 'next/server';
import { verifyPaymentSignature } from '@/lib/razorpay';
import { priceCart } from '@/lib/pricing';

function generateOrderId(): string {
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `PKL-${date}-${rand}`;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, customer } = body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return NextResponse.json({ error: 'Missing payment details.' }, { status: 400 });
    }

    // Cryptographically confirm the payment really came from Razorpay for this order.
    const valid = verifyPaymentSignature(
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    );
    if (!valid) {
      return NextResponse.json({ error: 'Payment verification failed.' }, { status: 400 });
    }

    // Recompute the order total server-side for the record of truth.
    const cart = priceCart(customer?.items, { cod: false });
    const order_id = generateOrderId();

    // No DB in the request path yet — log a confirmed/paid order (visible in Vercel logs).
    console.log('[ORDER PAID]', JSON.stringify({
      order_id,
      razorpay_order_id,
      razorpay_payment_id,
      paid: true,
      total: cart?.total ?? null,
      customer_name: customer?.customer_name,
      phone: customer?.phone,
      email: customer?.email,
      created_at: new Date().toISOString(),
    }));

    return NextResponse.json({ success: true, order_id });
  } catch (error) {
    console.error('Razorpay verify error:', error);
    return NextResponse.json({ error: 'Could not verify payment. Please contact us.' }, { status: 500 });
  }
}
