import { NextRequest, NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/auth';
import { PRODUCTS } from '@/lib/products';

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  const isAdmin = await getAdminSession();
  if (!isAdmin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const product = PRODUCTS.find(p => p.id === parseInt(params.id));
  if (!product) {
    return NextResponse.json({ error: 'Product not found' }, { status: 404 });
  }

  const body = await request.json();
  // Return the product with the requested changes applied (in-memory only — no database)
  return NextResponse.json({ ...product, ...body });
}
