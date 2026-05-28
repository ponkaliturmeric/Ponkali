import { NextRequest, NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/auth';

function generateOrderId(): string {
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `PKL-${date}-${rand}`;
}

export async function GET(request: NextRequest) {
  const isAdmin = await getAdminSession();
  if (!isAdmin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  // No database configured — return empty list
  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get('page') || '1');
  return NextResponse.json({ orders: [], total: 0, page, pageSize: 20 });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { customer_name, phone, address_line1, city, state, pincode, payment_method } = body;

    if (!customer_name || !phone || !address_line1 || !city || !state || !pincode || !payment_method) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const order_id = generateOrderId();

    // Log order to Vercel function logs (visible in Vercel dashboard)
    console.log('[ORDER]', JSON.stringify({ order_id, ...body, created_at: new Date().toISOString() }));

    return NextResponse.json({ order_id, success: true }, { status: 201 });
  } catch (error) {
    console.error('Order error:', error);
    return NextResponse.json({ error: 'Failed to create order' }, { status: 500 });
  }
}
