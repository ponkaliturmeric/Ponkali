import { NextRequest, NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/auth';
import { getDb } from '@/lib/db';

interface OrderRow {
  order_id: string;
  created_at: string;
  customer_name: string;
  phone: string;
  email: string | null;
  address_line1: string;
  address_line2: string | null;
  city: string;
  state: string;
  pincode: string;
  landmark: string | null;
  payment_method: string;
  subtotal: number;
  shipping: number;
  cod_charge: number;
  total: number;
  status: string;
  items: string;
}

const COLUMNS: { header: string; key: keyof OrderRow; width: number }[] = [
  { header: 'Order ID', key: 'order_id', width: 20 },
  { header: 'Date', key: 'created_at', width: 20 },
  { header: 'Customer', key: 'customer_name', width: 22 },
  { header: 'Phone', key: 'phone', width: 14 },
  { header: 'Email', key: 'email', width: 24 },
  { header: 'Address', key: 'address_line1', width: 28 },
  { header: 'Area', key: 'address_line2', width: 20 },
  { header: 'City', key: 'city', width: 16 },
  { header: 'State', key: 'state', width: 16 },
  { header: 'PIN', key: 'pincode', width: 10 },
  { header: 'Landmark', key: 'landmark', width: 18 },
  { header: 'Items', key: 'items', width: 40 },
  { header: 'Payment', key: 'payment_method', width: 12 },
  { header: 'Subtotal', key: 'subtotal', width: 12 },
  { header: 'Shipping', key: 'shipping', width: 12 },
  { header: 'COD Charge', key: 'cod_charge', width: 12 },
  { header: 'Total', key: 'total', width: 12 },
  { header: 'Status', key: 'status', width: 14 },
];

/** Postgres returns timestamps as JS Date objects — format them readably (IST). */
function formatDate(value: unknown): string {
  const d = new Date(value as string | number | Date);
  if (Number.isNaN(d.getTime())) return value == null ? '' : String(value);
  return d.toLocaleString('en-IN', {
    timeZone: 'Asia/Kolkata',
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit',
  });
}

async function fetchOrders(): Promise<OrderRow[]> {
  const db = await getDb();
  const ordersRes = await db.execute('SELECT * FROM orders ORDER BY created_at DESC, id DESC');
  const itemsRes = await db.execute('SELECT order_id, product_name, weight, quantity FROM order_items');

  const itemsByOrder = new Map<string, string[]>();
  for (const it of itemsRes.rows) {
    const list = itemsByOrder.get(String(it.order_id)) ?? [];
    list.push(`${it.product_name} ${it.weight} x${it.quantity}`);
    itemsByOrder.set(String(it.order_id), list);
  }

  return ordersRes.rows.map((o) => ({
    order_id: String(o.order_id),
    created_at: formatDate(o.created_at),
    customer_name: String(o.customer_name),
    phone: String(o.phone),
    email: o.email != null ? String(o.email) : null,
    address_line1: String(o.address_line1),
    address_line2: o.address_line2 != null ? String(o.address_line2) : null,
    city: String(o.city),
    state: String(o.state),
    pincode: String(o.pincode),
    landmark: o.landmark != null ? String(o.landmark) : null,
    payment_method: String(o.payment_method),
    subtotal: Number(o.subtotal),
    shipping: Number(o.shipping),
    cod_charge: Number(o.cod_charge),
    total: Number(o.total),
    status: String(o.status),
    items: (itemsByOrder.get(String(o.order_id)) ?? []).join(', '),
  }));
}

function csvCell(value: unknown): string {
  const s = value == null ? '' : String(value);
  return `"${s.replace(/"/g, '""')}"`;
}

export async function GET(request: NextRequest) {
  const isAdmin = await getAdminSession();
  if (!isAdmin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const format = searchParams.get('format') || 'csv';
  const orders = await fetchOrders();
  const stamp = new Date().toISOString().slice(0, 10);

  if (format === 'xlsx') {
    const ExcelJS = (await import('exceljs')).default;
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Orders');
    sheet.columns = COLUMNS.map((c) => ({ header: c.header, key: c.key, width: c.width }));
    sheet.getRow(1).font = { bold: true };
    orders.forEach((o) => sheet.addRow(o));
    const buffer = await workbook.xlsx.writeBuffer();
    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="ponkali-orders-${stamp}.xlsx"`,
      },
    });
  }

  const header = COLUMNS.map((c) => csvCell(c.header)).join(',');
  const rows = orders.map((o) => COLUMNS.map((c) => csvCell(o[c.key])).join(','));
  const csv = [header, ...rows].join('\n');

  return new NextResponse(csv, {
    headers: {
      'Content-Type': 'text/csv',
      'Content-Disposition': `attachment; filename="ponkali-orders-${stamp}.csv"`,
    },
  });
}
