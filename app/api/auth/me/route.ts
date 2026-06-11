import { NextResponse } from 'next/server';
import { getCustomerSession } from '@/lib/customer-auth';

export async function GET() {
  const session = getCustomerSession();
  if (!session) {
    return NextResponse.json({ user: null }, { status: 200 });
  }
  return NextResponse.json({
    user: {
      id: session.uid,
      email: session.email ?? null,
      phone: session.phone ?? null,
      name: session.name ?? null,
    },
  });
}
