import { NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/auth';

export async function GET() {
  const isAdmin = await getAdminSession();
  if (!isAdmin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // No database configured — return empty analytics
  const emptyDaily = Array.from({ length: 30 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (29 - i));
    return { date: d.toISOString().slice(0, 10), orders: 0, revenue: 0 };
  });

  return NextResponse.json({
    daily: emptyDaily,
    byStatus: [],
    byPayment: [],
    topProducts: [],
    monthly: [],
    totals: { total_orders: 0, total_revenue: 0, avg_order_value: 0, pending: 0, delivered: 0, today_orders: 0, today_revenue: 0 },
  });
}
