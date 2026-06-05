import { NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/auth';
import { getDb } from '@/lib/db';

export async function GET() {
  const isAdmin = await getAdminSession();
  if (!isAdmin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const db = await getDb();

  // Run sequentially (NOT Promise.all): Supabase's transaction-mode pooler can
  // deadlock on the pipelined concurrent queries postgres.js would otherwise send.
  const totalsRes = await db.execute(`
      SELECT
        COUNT(*) AS total_orders,
        COALESCE(SUM(total), 0) AS total_revenue,
        COALESCE(AVG(total), 0) AS avg_order_value,
        COALESCE(SUM(CASE WHEN status = 'Pending' THEN 1 ELSE 0 END), 0) AS pending,
        COALESCE(SUM(CASE WHEN status = 'Delivered' THEN 1 ELSE 0 END), 0) AS delivered,
        COALESCE(SUM(CASE WHEN created_at::date = CURRENT_DATE THEN 1 ELSE 0 END), 0) AS today_orders,
        COALESCE(SUM(CASE WHEN created_at::date = CURRENT_DATE THEN total ELSE 0 END), 0) AS today_revenue
      FROM orders
    `);
  const dailyRes = await db.execute(`
      SELECT to_char(created_at, 'YYYY-MM-DD') AS date, COUNT(*) AS orders, COALESCE(SUM(total), 0) AS revenue
      FROM orders
      WHERE created_at::date >= CURRENT_DATE - INTERVAL '29 days'
      GROUP BY to_char(created_at, 'YYYY-MM-DD')
    `);
  const statusRes = await db.execute(`SELECT status, COUNT(*) AS count FROM orders GROUP BY status`);
  const paymentRes = await db.execute(`
      SELECT payment_method, COUNT(*) AS count, COALESCE(SUM(total), 0) AS revenue
      FROM orders GROUP BY payment_method
    `);
  const topRes = await db.execute(`
      SELECT product_name, weight,
             COALESCE(SUM(quantity), 0) AS qty_sold,
             COALESCE(SUM(price * quantity), 0) AS revenue
      FROM order_items
      GROUP BY product_name, weight
      ORDER BY qty_sold DESC
      LIMIT 5
    `);
  const monthlyRes = await db.execute(`
      SELECT to_char(created_at, 'YYYY-MM') AS month, COUNT(*) AS orders, COALESCE(SUM(total), 0) AS revenue
      FROM orders
      WHERE created_at::date >= CURRENT_DATE - INTERVAL '6 months'
      GROUP BY to_char(created_at, 'YYYY-MM')
      ORDER BY month
    `);

  // Build a complete 30-day skeleton so the chart never has gaps.
  const dailyMap = new Map<string, { orders: number; revenue: number }>();
  for (const r of dailyRes.rows) {
    dailyMap.set(String(r.date), { orders: Number(r.orders), revenue: Number(r.revenue) });
  }
  const daily = Array.from({ length: 30 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (29 - i));
    const key = d.toISOString().slice(0, 10);
    const hit = dailyMap.get(key);
    return { date: key, orders: hit?.orders ?? 0, revenue: hit?.revenue ?? 0 };
  });

  const t = totalsRes.rows[0];

  return NextResponse.json({
    daily,
    byStatus: statusRes.rows.map((r) => ({ status: String(r.status), count: Number(r.count) })),
    byPayment: paymentRes.rows.map((r) => ({
      payment_method: String(r.payment_method),
      count: Number(r.count),
      revenue: Number(r.revenue),
    })),
    topProducts: topRes.rows.map((r) => ({
      product_name: String(r.product_name),
      weight: String(r.weight),
      qty_sold: Number(r.qty_sold),
      revenue: Number(r.revenue),
    })),
    monthly: monthlyRes.rows.map((r) => ({
      month: String(r.month),
      orders: Number(r.orders),
      revenue: Number(r.revenue),
    })),
    totals: {
      total_orders: Number(t.total_orders),
      total_revenue: Number(t.total_revenue),
      avg_order_value: Number(t.avg_order_value),
      pending: Number(t.pending),
      delivered: Number(t.delivered),
      today_orders: Number(t.today_orders),
      today_revenue: Number(t.today_revenue),
    },
  });
}
