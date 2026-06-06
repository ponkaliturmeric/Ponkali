import { NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/auth';
import { getDb } from '@/lib/db';

export async function GET() {
  const isAdmin = await getAdminSession();
  if (!isAdmin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const db = await getDb();

  // All six aggregates are computed in a SINGLE round-trip. Each is an independent
  // sub-select returning a JSON value, so the whole dashboard is one statement —
  // no query pipelining (which is what deadlocks Supabase's transaction-mode
  // pooler), and no paying 6× the network latency by awaiting them back-to-back.
  const { rows } = await db.execute(`
    SELECT
      (SELECT json_build_object(
        'total_orders', COUNT(*),
        'total_revenue', COALESCE(SUM(total), 0),
        'avg_order_value', COALESCE(AVG(total), 0),
        'pending', COALESCE(SUM(CASE WHEN status = 'Pending' THEN 1 ELSE 0 END), 0),
        'delivered', COALESCE(SUM(CASE WHEN status = 'Delivered' THEN 1 ELSE 0 END), 0),
        'today_orders', COALESCE(SUM(CASE WHEN created_at::date = CURRENT_DATE THEN 1 ELSE 0 END), 0),
        'today_revenue', COALESCE(SUM(CASE WHEN created_at::date = CURRENT_DATE THEN total ELSE 0 END), 0)
      ) FROM orders) AS totals,

      (SELECT COALESCE(json_agg(d), '[]'::json) FROM (
        SELECT to_char(created_at, 'YYYY-MM-DD') AS date, COUNT(*) AS orders, COALESCE(SUM(total), 0) AS revenue
        FROM orders
        WHERE created_at::date >= CURRENT_DATE - INTERVAL '29 days'
        GROUP BY 1
      ) d) AS daily,

      (SELECT COALESCE(json_agg(s), '[]'::json) FROM (
        SELECT status, COUNT(*) AS count FROM orders GROUP BY status
      ) s) AS by_status,

      (SELECT COALESCE(json_agg(p), '[]'::json) FROM (
        SELECT payment_method, COUNT(*) AS count, COALESCE(SUM(total), 0) AS revenue
        FROM orders GROUP BY payment_method
      ) p) AS by_payment,

      (SELECT COALESCE(json_agg(t), '[]'::json) FROM (
        SELECT product_name, weight,
               COALESCE(SUM(quantity), 0) AS qty_sold,
               COALESCE(SUM(price * quantity), 0) AS revenue
        FROM order_items
        GROUP BY product_name, weight
        ORDER BY qty_sold DESC
        LIMIT 5
      ) t) AS top_products,

      (SELECT COALESCE(json_agg(m), '[]'::json) FROM (
        SELECT to_char(created_at, 'YYYY-MM') AS month, COUNT(*) AS orders, COALESCE(SUM(total), 0) AS revenue
        FROM orders
        WHERE created_at::date >= CURRENT_DATE - INTERVAL '6 months'
        GROUP BY 1
        ORDER BY month
      ) m) AS monthly
  `);

  const row = rows[0] as {
    totals: Record<string, number>;
    daily: { date: string; orders: number; revenue: number }[];
    by_status: { status: string; count: number }[];
    by_payment: { payment_method: string; count: number; revenue: number }[];
    top_products: { product_name: string; weight: string; qty_sold: number; revenue: number }[];
    monthly: { month: string; orders: number; revenue: number }[];
  };

  // Build a complete 30-day skeleton so the chart never has gaps.
  const dailyMap = new Map<string, { orders: number; revenue: number }>();
  for (const r of row.daily) {
    dailyMap.set(String(r.date), { orders: Number(r.orders), revenue: Number(r.revenue) });
  }
  const daily = Array.from({ length: 30 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (29 - i));
    const key = d.toISOString().slice(0, 10);
    const hit = dailyMap.get(key);
    return { date: key, orders: hit?.orders ?? 0, revenue: hit?.revenue ?? 0 };
  });

  const t = row.totals;

  return NextResponse.json({
    daily,
    byStatus: row.by_status.map((r) => ({ status: String(r.status), count: Number(r.count) })),
    byPayment: row.by_payment.map((r) => ({
      payment_method: String(r.payment_method),
      count: Number(r.count),
      revenue: Number(r.revenue),
    })),
    topProducts: row.top_products.map((r) => ({
      product_name: String(r.product_name),
      weight: String(r.weight),
      qty_sold: Number(r.qty_sold),
      revenue: Number(r.revenue),
    })),
    monthly: row.monthly.map((r) => ({
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
