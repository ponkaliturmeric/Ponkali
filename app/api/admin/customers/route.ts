import { NextRequest, NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/auth';
import { getDb } from '@/lib/db';

/**
 * Customers list for the admin — there is no separate customers table, so a
 * "customer" is derived by grouping orders on `phone` (the most reliable key for
 * this store; email is optional at checkout). Each customer carries their order
 * count, lifetime spend and first/last order dates so the admin can spot repeat
 * and high-value buyers. Page rows + global KPI summary return in one round-trip.
 */

const PAGE_SIZE = 20;

const SORTS: Record<string, string> = {
  spent: 'total_spent DESC, order_count DESC',
  orders: 'order_count DESC, total_spent DESC',
  recent: 'last_order DESC',
  name: 'customer_name ASC',
};

export async function GET(request: NextRequest) {
  const isAdmin = await getAdminSession();
  if (!isAdmin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
  const search = (searchParams.get('search') || '').trim();
  const sort = searchParams.get('sort') || 'spent';
  const orderBy = SORTS[sort] || SORTS.spent;
  const offset = (page - 1) * PAGE_SIZE;

  // Search filters the pre-aggregated order rows (so name/email from ANY of the
  // customer's orders can match). Args order: search×3 (inside the page subquery
  // WHERE), then LIMIT, OFFSET. The summary subquery has no args.
  const pageWhere = search
    ? 'WHERE customer_name ILIKE ? OR phone ILIKE ? OR email ILIKE ?'
    : '';
  const args: (string | number)[] = [];
  if (search) args.push(`%${search}%`, `%${search}%`, `%${search}%`);
  args.push(PAGE_SIZE, offset);

  try {
    const db = await getDb();
    const { rows } = await db.execute({
      sql: `
        WITH cust AS (
          SELECT
            phone,
            (array_agg(customer_name ORDER BY created_at DESC))[1] AS customer_name,
            (array_agg(email        ORDER BY created_at DESC))[1] AS email,
            (array_agg(city         ORDER BY created_at DESC))[1] AS city,
            (array_agg(state        ORDER BY created_at DESC))[1] AS state,
            COUNT(*)                       AS order_count,
            COALESCE(SUM(total), 0)        AS total_spent,
            MIN(created_at)                AS first_order,
            MAX(created_at)                AS last_order
          FROM orders
          GROUP BY phone
        )
        SELECT
          (SELECT COALESCE(json_agg(p), '[]'::json) FROM (
            SELECT *, COUNT(*) OVER() AS total_count
            FROM cust
            ${pageWhere}
            ORDER BY ${orderBy}
            LIMIT ? OFFSET ?
          ) p) AS rows,
          (SELECT json_build_object(
            'total_customers', COUNT(*),
            'repeat_customers', COALESCE(SUM(CASE WHEN order_count >= 2 THEN 1 ELSE 0 END), 0),
            'total_spent',      COALESCE(SUM(total_spent), 0),
            'avg_ltv',          COALESCE(AVG(total_spent), 0)
          ) FROM cust) AS summary
      `,
      args,
    });

    const row = rows[0] as {
      rows: Array<Record<string, unknown>>;
      summary: { total_customers: number; repeat_customers: number; total_spent: number; avg_ltv: number };
    };
    const list = (row.rows || []).map((r) => ({
      phone: String(r.phone),
      customer_name: String(r.customer_name ?? ''),
      email: r.email != null ? String(r.email) : null,
      city: r.city != null ? String(r.city) : null,
      state: r.state != null ? String(r.state) : null,
      order_count: Number(r.order_count),
      total_spent: Number(r.total_spent),
      first_order: r.first_order,
      last_order: r.last_order,
    }));
    const total = row.rows?.length ? Number(row.rows[0].total_count) : 0;

    return NextResponse.json({
      customers: list,
      total,
      page,
      pageSize: PAGE_SIZE,
      summary: {
        total_customers: Number(row.summary.total_customers),
        repeat_customers: Number(row.summary.repeat_customers),
        total_spent: Number(row.summary.total_spent),
        avg_ltv: Math.round(Number(row.summary.avg_ltv)),
      },
    });
  } catch (error) {
    console.error('Customers list error:', error);
    return NextResponse.json({ error: 'Failed to load customers' }, { status: 500 });
  }
}
