import { NextRequest, NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/auth';

export async function GET(_request: NextRequest, { params }: { params: { id: string } }) {
  // No database — order details are read from localStorage on the client
  return NextResponse.json({ error: 'Order not found', id: params.id }, { status: 404 });
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  const isAdmin = await getAdminSession();
  if (!isAdmin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  // No database — acknowledge the update without persisting
  const body = await request.json();
  console.log('[ORDER UPDATE]', params.id, body);
  return NextResponse.json({ order_id: params.id, ...body });
}
