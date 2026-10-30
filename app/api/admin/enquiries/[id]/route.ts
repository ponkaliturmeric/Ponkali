import { NextRequest, NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/auth';
import { getDb } from '@/lib/db';
import { validateEnquiry } from '@/lib/enquiries';

/** Update (any subset of fields) or delete one bulk enquiry. Admin-only. */

function enquiryId(params: { id: string }): number | null {
  const id = Number(params.id);
  return Number.isInteger(id) && id > 0 ? id : null;
}

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  if (!(await getAdminSession())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const id = enquiryId(params);
  if (id === null) {
    return NextResponse.json({ error: 'Invalid enquiry id' }, { status: 400 });
  }

  try {
    // partial: true — an inline status change from the table sends only
    // { status }, and must not blank out the rest of the row.
    const result = validateEnquiry(await request.json(), { partial: true });
    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    const cols = Object.keys(result.values);
    const db = await getDb();
    const { rows } = await db.execute({
      sql: `UPDATE bulk_enquiries
            SET ${cols.map((c) => `${c} = ?`).join(', ')}, updated_at = now()
            WHERE id = ?
            RETURNING *`,
      args: [...cols.map((c) => result.values[c as keyof typeof result.values] ?? null), id],
    });

    if (rows.length === 0) {
      return NextResponse.json({ error: 'Enquiry not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, enquiry: rows[0] });
  } catch (error) {
    console.error('Enquiry update error:', error);
    return NextResponse.json({ error: 'Could not save the changes. Please try again.' }, { status: 500 });
  }
}

export async function DELETE(_request: NextRequest, { params }: { params: { id: string } }) {
  if (!(await getAdminSession())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const id = enquiryId(params);
  if (id === null) {
    return NextResponse.json({ error: 'Invalid enquiry id' }, { status: 400 });
  }

  try {
    const db = await getDb();
    const { rows } = await db.execute({
      sql: 'DELETE FROM bulk_enquiries WHERE id = ? RETURNING id',
      args: [id],
    });
    if (rows.length === 0) {
      return NextResponse.json({ error: 'Enquiry not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Enquiry delete error:', error);
    return NextResponse.json({ error: 'Could not delete the enquiry.' }, { status: 500 });
  }
}
