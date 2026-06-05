import { NextResponse } from 'next/server';
import { getCatalog } from '@/lib/catalog';

// Always read live prices/stock from the DB (admin can edit them at any time).
export const dynamic = 'force-dynamic';

export async function GET() {
  const products = await getCatalog();
  return NextResponse.json(products);
}
