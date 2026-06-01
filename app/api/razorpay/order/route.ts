import { NextRequest, NextResponse } from 'next/server';
import { priceCart, toPaise } from '@/lib/pricing';
import { createRazorpayOrder, getRazorpayKeys, isRazorpayConfigured } from '@/lib/razorpay';

function generateReceipt(): string {
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `PKL-${date}-${rand}`;
}

export async function POST(request: NextRequest) {
  try {
    if (!isRazorpayConfigured()) {
      return NextResponse.json(
        { error: 'Online payment is not available right now. Please choose Cash on Delivery.' },
        { status: 503 },
      );
    }

    const body = await request.json();

    // Amounts are computed server-side from the catalogue — client totals are ignored.
    const cart = priceCart(body.items, { cod: false });
    if (!cart) {
      return NextResponse.json({ error: 'Your cart is empty or contains an unavailable item.' }, { status: 400 });
    }

    const receipt = generateReceipt();
    const order = await createRazorpayOrder({
      amountPaise: toPaise(cart.total),
      receipt,
      notes: { receipt },
    });

    const { keyId } = getRazorpayKeys();
    return NextResponse.json({
      keyId,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      receipt,
      // Echo the authoritative breakdown so the UI can reconcile if needed.
      breakdown: { subtotal: cart.subtotal, shipping: cart.shipping, total: cart.total },
    });
  } catch (error) {
    console.error('Razorpay order error:', error);
    return NextResponse.json({ error: 'Could not start payment. Please try again.' }, { status: 500 });
  }
}
