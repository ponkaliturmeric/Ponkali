import { NextRequest, NextResponse } from 'next/server';
import { verifyPaymentSignature } from '@/lib/razorpay';
import { priceCart } from '@/lib/pricing';
import { createOrder, missingCustomerField, type CustomerDetails } from '@/lib/orders';

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

    const missing = missingCustomerField(customer ?? {});
    if (missing) {
      return NextResponse.json({ error: `Missing required field: ${missing}` }, { status: 400 });
    }

    // Recompute the order total server-side for the record of truth.
    const cart = await priceCart(customer?.items, { cod: false });
    if (!cart) {
      return NextResponse.json({ error: 'Cart could not be priced.' }, { status: 400 });
    }

    const order_id = await createOrder({
      customer: customer as CustomerDetails,
      cart,
      payment_method: 'online',
      status: 'Paid',
      notes: `Razorpay payment ${razorpay_payment_id} (order ${razorpay_order_id})`,
    });

    return NextResponse.json({ success: true, order_id });
  } catch (error) {
    console.error('Razorpay verify error:', error);
    return NextResponse.json({ error: 'Could not verify payment. Please contact us.' }, { status: 500 });
  }
}
