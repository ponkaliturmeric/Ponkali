import { NextRequest, NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/auth';
import { getDb } from '@/lib/db';

/**
 * Customers list for the admin. A "customer" is the union of two sources:
 *   1. Registered accounts (the `users` table) — including those who signed up
 *      but have NOT placed an order yet.
 *   2. Order history (the `orders` table) — guests who checked out, grouped by
 *      phone (the most reliable key; email is optional at checkout).
 * The two are merged on the phone number (normalised to its 10-digit form), so
 * a registered customer who has also ordered shows as a single row carrying
 * their order count, lifetime spend and first/last order dates. Page rows +
 * global KPI summary return in one round-trip.
 */

const PAGE_SIZE = 20;

const SORTS: Record<string, string> = {
  spent: 'total_spent DESC, order_count DESC, customer_name ASC',
  orders: 'order_count DESC, total_spent DESC, customer_name ASC',
  // Newest activity first; accounts that never ordered (NULL last_order) sink to the bottom.
  recent: 'last_activity DESC NULLS LAST, customer_name ASC',
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
        WITH order_cust AS (
          SELECT
            right(regexp_replace(phone, '[^0-9]', '', 'g'), 10) AS phone_key,
            (array_agg(phone               ORDER BY created_at DESC))[1] AS phone,
            (array_agg(customer_name       ORDER BY created_at DESC))[1] AS customer_name,
            (array_agg(NULLIF(email, '')   ORDER BY created_at DESC))[1] AS email,
            (array_agg(city                ORDER BY created_at DESC))[1] AS city,
            (array_agg(state               ORDER BY created_at DESC))[1] AS state,
            COUNT(*)                       AS order_count,
            COALESCE(SUM(total), 0)        AS total_spent,
            MIN(created_at)                AS first_order,
            MAX(created_at)                AS last_order
          FROM orders
          GROUP BY right(regexp_replace(phone, '[^0-9]', '', 'g'), 10)
        ),
        acct AS (
          SELECT
            NULLIF(phone, '')       AS phone_key,
            NULLIF(phone, '')       AS phone,
            lower(NULLIF(email, ''))AS email,
            name                    AS customer_name,
            created_at              AS registered_at
          FROM users
        ),
        cust AS (
          SELECT
            COALESCE(o.phone, a.phone)                   AS phone,
            COALESCE(o.customer_name, a.customer_name)   AS customer_name,
            COALESCE(o.email, a.email)                   AS email,
            o.city,
            o.state,
            COALESCE(o.order_count, 0)                   AS order_count,
            COALESCE(o.total_spent, 0)                   AS total_spent,
            o.first_order,
            o.last_order,
            COALESCE(o.last_order, a.registered_at)      AS last_activity,
            (a.phone_key IS NOT NULL OR a.email IS NOT NULL) AS has_account
          FROM order_cust o
          FULL OUTER JOIN acct a ON o.phone_key = a.phone_key
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
            'avg_ltv',          COALESCE(AVG(total_spent) FILTER (WHERE order_count > 0), 0)
          ) FROM cust) AS summary
      `,
      args,
    });

    const row = rows[0] as {
      rows: Array<Record<string, unknown>>;
      summary: { total_customers: number; repeat_customers: number; total_spent: number; avg_ltv: number };
    };
    const list = (row.rows || []).map((r) => ({
      phone: r.phone != null ? String(r.phone) : null,
      customer_name: String(r.customer_name ?? ''),
      email: r.email != null ? String(r.email) : null,
      city: r.city != null ? String(r.city) : null,
      state: r.state != null ? String(r.state) : null,
      order_count: Number(r.order_count),
      total_spent: Number(r.total_spent),
      first_order: r.first_order,
      last_order: r.last_order,
      has_account: Boolean(r.has_account),
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

/**
 * Delete a customer.
 *
 * There is no customers table — a "customer" is an aggregate of order rows
 * (grouped by the last 10 digits of the phone) and optionally a `users`
 * account. So deleting one is not a single row delete, and it is NOT a
 * cosmetic hide: it erases every order that customer ever placed, which
 * permanently lowers the revenue, AOV and repeat-rate figures on the dashboard.
 *
 * That is the honest meaning of "delete this customer", and it is what a
 * data-erasure request requires, so the endpoint does exactly that — but the UI
 * states the order count and lifetime value in the confirmation first, because
 * nobody should learn this by watching their revenue drop.
 *
 * Identified by ?phone= (preferred) and/or ?email=. Account-only customers who
 * never ordered have no phone key, hence the email path.
 *
 * Ordering matters: order_items has an FK to orders(order_id) with no cascade,
 * so children are removed via a subquery while the parent rows still exist, and
 * all of it lands in one transaction.
 */
export async function DELETE(request: NextRequest) {
  const isAdmin = await getAdminSession();
  if (!isAdmin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const rawPhone = (searchParams.get('phone') || '').trim();
  const email = (searchParams.get('email') || '').trim().toLowerCase();

  // The same key the list query groups on. Anything that is not a full 10-digit
  // number is rejected rather than normalised: a partial key could match the
  // wrong customer, and right('', 10) would match every row with a non-numeric
  // phone at once.
  const phoneKey = rawPhone.replace(/\D/g, '').slice(-10);
  const hasPhone = phoneKey.length === 10;

  if (!hasPhone && !email) {
    return NextResponse.json(
      { error: 'A 10-digit phone number or an email address is required.' },
      { status: 400 },
    );
  }

  const PHONE_KEY_SQL = "right(regexp_replace(phone, '[^0-9]', '', 'g'), 10)";

  try {
    const db = await getDb();

    // Count first, so the response can report exactly what went.
    let orderCount = 0;
    let revenue = 0;
    if (hasPhone) {
      const { rows } = await db.execute({
        sql: `SELECT COUNT(*) AS n, COALESCE(SUM(total), 0) AS revenue
              FROM orders WHERE ${PHONE_KEY_SQL} = ?`,
        args: [phoneKey],
      });
      orderCount = Number(rows[0]?.n ?? 0);
      revenue = Number(rows[0]?.revenue ?? 0);
    }

    const stmts: { sql: string; args: (string | number | null)[] }[] = [];

    if (hasPhone) {
      stmts.push(
        {
          sql: `DELETE FROM order_items
                WHERE order_id IN (SELECT order_id FROM orders WHERE ${PHONE_KEY_SQL} = ?)`,
          args: [phoneKey],
        },
        {
          sql: `DELETE FROM order_status_history
                WHERE order_id IN (SELECT order_id FROM orders WHERE ${PHONE_KEY_SQL} = ?)`,
          args: [phoneKey],
        },
        { sql: `DELETE FROM orders WHERE ${PHONE_KEY_SQL} = ?`, args: [phoneKey] },
      );
    }

    // The registered account. With a phone in hand we match on that, and fall
    // back to the email ONLY for an account that has no phone — otherwise an
    // address shared with an unrelated account would take that account down
    // with it.
    if (hasPhone && email) {
      stmts.push({
        sql: `DELETE FROM users
              WHERE right(regexp_replace(COALESCE(phone, ''), '[^0-9]', '', 'g'), 10) = ?
                 OR (COALESCE(phone, '') = '' AND lower(email) = ?)`,
        args: [phoneKey, email],
      });
    } else if (hasPhone) {
      stmts.push({
        sql: "DELETE FROM users WHERE right(regexp_replace(COALESCE(phone, ''), '[^0-9]', '', 'g'), 10) = ?",
        args: [phoneKey],
      });
    } else {
      stmts.push({ sql: 'DELETE FROM users WHERE lower(email) = ?', args: [email] });
    }

    await db.batch(stmts, 'write');

    return NextResponse.json({
      success: true,
      deleted: { orders: orderCount, revenue_removed: Math.round(revenue) },
    });
  } catch (error) {
    console.error('Customer delete error:', error);
    return NextResponse.json({ error: 'Could not delete the customer. Please try again.' }, { status: 500 });
  }
}
