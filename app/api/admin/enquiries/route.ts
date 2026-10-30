import { NextRequest, NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/auth';
import { getDb } from '@/lib/db';
import { OPEN_ENQUIRY_STATUSES } from '@/lib/crm';
import { validateEnquiry } from '@/lib/enquiries';

/**
 * Bulk / wholesale enquiry pipeline. Entered and worked entirely by hand from
 * WhatsApp conversations, so this is a plain CRUD list with a KPI strip rather
 * than anything derived from orders.
 */

const PAGE_SIZE = 20;

const SORTS: Record<string, string> = {
  recent: 'created_at DESC, id DESC',
  oldest: 'created_at ASC, id ASC',
  // Overdue and upcoming follow-ups first; enquiries with no date set sink.
  followup: 'follow_up_on ASC NULLS LAST, created_at DESC',
  value: 'COALESCE(quoted_price, target_price, 0) DESC, created_at DESC',
  name: 'customer_name ASC',
};

/**
 * The "still being worked" set, as a SQL literal list built from the single
 * definition in lib/crm.ts so the KPIs and the UI can't drift apart. The values
 * are code constants (never user input); the guard below keeps it that way.
 */
const OPEN_SQL = OPEN_ENQUIRY_STATUSES.map((s) => {
  if (!/^[A-Za-z ]+$/.test(s)) throw new Error(`Unsafe enquiry status constant: ${s}`);
  return `'${s}'`;
}).join(', ');

export async function GET(request: NextRequest) {
  if (!(await getAdminSession())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
  const search = (searchParams.get('search') || '').trim();
  const status = (searchParams.get('status') || '').trim();
  const sort = searchParams.get('sort') || 'recent';
  const orderBy = SORTS[sort] || SORTS.recent;
  const offset = (page - 1) * PAGE_SIZE;

  const where: string[] = [];
  const args: (string | number)[] = [];
  if (status === 'open') {
    where.push(`status IN (${OPEN_SQL})`);
  } else if (status && status !== 'All') {
    where.push('status = ?');
    args.push(status);
  }
  if (search) {
    where.push('(customer_name ILIKE ? OR phone ILIKE ? OR company ILIKE ? OR product ILIKE ? OR email ILIKE ?)');
    args.push(`%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`);
  }
  const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';

  try {
    const db = await getDb();
    // Page rows + the global KPI strip in ONE round-trip (same shape as the
    // messages and customers endpoints). Filter args first, then LIMIT/OFFSET;
    // the summary subquery takes none, so it must come last in the text.
    const { rows } = await db.execute({
      sql: `
        SELECT
          (SELECT COALESCE(json_agg(r), '[]'::json) FROM (
            SELECT *, COUNT(*) OVER() AS total_count
            FROM bulk_enquiries
            ${whereSql}
            ORDER BY ${orderBy}
            LIMIT ? OFFSET ?
          ) r) AS rows,
          (SELECT json_build_object(
            'total',          COUNT(*),
            'open',           COUNT(*) FILTER (WHERE status IN (${OPEN_SQL})),
            'won',            COUNT(*) FILTER (WHERE status = 'Won'),
            'lost',           COUNT(*) FILTER (WHERE status = 'Lost'),
            'pipeline_value', COALESCE(SUM(COALESCE(quoted_price, target_price, 0)) FILTER (WHERE status IN (${OPEN_SQL})), 0),
            'won_value',      COALESCE(SUM(COALESCE(quoted_price, target_price, 0)) FILTER (WHERE status = 'Won'), 0),
            'due',            COUNT(*) FILTER (WHERE follow_up_on IS NOT NULL AND follow_up_on <= CURRENT_DATE AND status NOT IN ('Won', 'Lost'))
          ) FROM bulk_enquiries) AS summary
      `,
      args: [...args, PAGE_SIZE, offset],
    });

    const row = rows[0] as {
      rows: Array<Record<string, unknown>> | null;
      summary: Record<string, number>;
    };
    const list = row.rows ?? [];
    const total = list.length ? Number(list[0].total_count) : 0;

    return NextResponse.json({
      enquiries: list.map((r) => {
        // total_count rides along on every row from the window function; it is
        // reported once as `total` rather than repeated on each enquiry.
        const row = { ...r };
        delete row.total_count;
        return row;
      }),
      total,
      page,
      pageSize: PAGE_SIZE,
      summary: {
        total: Number(row.summary.total),
        open: Number(row.summary.open),
        won: Number(row.summary.won),
        lost: Number(row.summary.lost),
        pipeline_value: Number(row.summary.pipeline_value),
        won_value: Number(row.summary.won_value),
        due: Number(row.summary.due),
      },
    });
  } catch (error) {
    console.error('Enquiries list error:', error);
    return NextResponse.json({ error: 'Failed to load enquiries' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  if (!(await getAdminSession())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const result = validateEnquiry(await request.json(), { partial: false });
    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    // Column names come from the whitelist in lib/enquiries.ts, never from the
    // request, so this stays parameterised.
    const cols = Object.keys(result.values);
    const db = await getDb();
    const { rows } = await db.execute({
      sql: `INSERT INTO bulk_enquiries (${cols.join(', ')})
            VALUES (${cols.map(() => '?').join(', ')})
            RETURNING *`,
      args: cols.map((c) => result.values[c as keyof typeof result.values] ?? null),
    });

    return NextResponse.json({ success: true, enquiry: rows[0] }, { status: 201 });
  } catch (error) {
    console.error('Enquiry create error:', error);
    return NextResponse.json({ error: 'Could not save the enquiry. Please try again.' }, { status: 500 });
  }
}
