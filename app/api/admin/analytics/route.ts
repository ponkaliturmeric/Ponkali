import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { getAdminSession } from '@/lib/auth';

export async function GET() {
  const isAdmin = await getAdminSession();
  if (!isAdmin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Last 30 days daily revenue + order count
  const dailyStats = db.prepare(`
    SELECT
      date(created_at) as date,
      COUNT(*) as orders,
      ROUND(SUM(total), 2) as revenue
    FROM orders
    WHERE created_at >= date('now', '-29 days')
    GROUP BY date(created_at)
    ORDER BY date ASC
  `).all() as { date: string; orders: number; revenue: number }[];

  // Fill in missing days with 0
  const filledDaily: { date: string; orders: number; revenue: number }[] = [];
  for (let i = 29; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().slice(0, 10);
    const found = dailyStats.find(r => r.date === dateStr);
    filledDaily.push(found ?? { date: dateStr, orders: 0, revenue: 0 });
  }

  // Orders by status
  const byStatus = db.prepare(`
    SELECT status, COUNT(*) as count
    FROM orders
    GROUP BY status
    ORDER BY count DESC
  `).all() as { status: string; count: number }[];

  // Payment method breakdown
  const byPayment = db.prepare(`
    SELECT payment_method, COUNT(*) as count, ROUND(SUM(total), 2) as revenue
    FROM orders
    GROUP BY payment_method
  `).all() as { payment_method: string; count: number; revenue: number }[];

  // Top products by quantity sold
  const topProducts = db.prepare(`
    SELECT product_name, weight,
           SUM(quantity) as qty_sold,
           ROUND(SUM(quantity * price), 2) as revenue
    FROM order_items
    GROUP BY product_name, weight
    ORDER BY qty_sold DESC
    LIMIT 6
  `).all() as { product_name: string; weight: string; qty_sold: number; revenue: number }[];

  // Monthly summary (last 6 months)
  const monthlyStats = db.prepare(`
    SELECT
      strftime('%Y-%m', created_at) as month,
      COUNT(*) as orders,
      ROUND(SUM(total), 2) as revenue
    FROM orders
    WHERE created_at >= date('now', '-6 months')
    GROUP BY strftime('%Y-%m', created_at)
    ORDER BY month ASC
  `).all() as { month: string; orders: number; revenue: number }[];

  // Overall totals
  const totals = db.prepare(`
    SELECT
      COUNT(*) as total_orders,
      ROUND(SUM(total), 2) as total_revenue,
      ROUND(AVG(total), 2) as avg_order_value,
      COUNT(CASE WHEN status = 'Pending' THEN 1 END) as pending,
      COUNT(CASE WHEN status = 'Delivered' THEN 1 END) as delivered,
      COUNT(CASE WHEN date(created_at) = date('now') THEN 1 END) as today_orders,
      ROUND(SUM(CASE WHEN date(created_at) = date('now') THEN total ELSE 0 END), 2) as today_revenue
    FROM orders
  `).get() as {
    total_orders: number;
    total_revenue: number;
    avg_order_value: number;
    pending: number;
    delivered: number;
    today_orders: number;
    today_revenue: number;
  };

  return NextResponse.json({
    daily: filledDaily,
    byStatus,
    byPayment,
    topProducts,
    monthly: monthlyStats,
    totals,
  });
}
