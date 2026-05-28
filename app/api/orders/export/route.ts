import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { getAdminSession } from '@/lib/auth';

export async function GET(request: NextRequest) {
  const isAdmin = await getAdminSession();
  if (!isAdmin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const format = searchParams.get('format') || 'csv';

  try {
    const orders = db.prepare('SELECT * FROM orders ORDER BY created_at DESC').all() as Record<string, unknown>[];
    const items = db.prepare('SELECT * FROM order_items').all() as Record<string, unknown>[];

    const itemsByOrder: Record<string, Record<string, unknown>[]> = {};
    for (const item of items) {
      const oid = item.order_id as string;
      if (!itemsByOrder[oid]) itemsByOrder[oid] = [];
      itemsByOrder[oid].push(item);
    }

    if (format === 'xlsx') {
      const ExcelJS = (await import('exceljs')).default;
      const workbook = new ExcelJS.Workbook();
      const sheet = workbook.addWorksheet('Orders');

      sheet.columns = [
        { header: 'Order ID', key: 'order_id', width: 20 },
        { header: 'Date', key: 'created_at', width: 20 },
        { header: 'Customer Name', key: 'customer_name', width: 20 },
        { header: 'Phone', key: 'phone', width: 15 },
        { header: 'Email', key: 'email', width: 25 },
        { header: 'Address', key: 'address_line1', width: 30 },
        { header: 'City', key: 'city', width: 15 },
        { header: 'State', key: 'state', width: 15 },
        { header: 'Pincode', key: 'pincode', width: 10 },
        { header: 'Items', key: 'items', width: 40 },
        { header: 'Subtotal', key: 'subtotal', width: 12 },
        { header: 'Shipping', key: 'shipping', width: 10 },
        { header: 'COD Charge', key: 'cod_charge', width: 12 },
        { header: 'Total', key: 'total', width: 12 },
        { header: 'Payment Method', key: 'payment_method', width: 15 },
        { header: 'UPI ID', key: 'upi_id', width: 20 },
        { header: 'Status', key: 'status', width: 12 },
      ];

      for (const order of orders) {
        const orderItems = itemsByOrder[order.order_id as string] || [];
        const itemsStr = orderItems.map((i) => `${i.product_name} (${i.weight}) x${i.quantity} @ ₹${i.price}`).join('; ');
        sheet.addRow({ ...order, items: itemsStr });
      }

      sheet.getRow(1).font = { bold: true };
      sheet.getRow(1).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFD4960A' },
      };

      const buffer = await workbook.xlsx.writeBuffer();
      return new NextResponse(buffer, {
        headers: {
          'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'Content-Disposition': `attachment; filename="ponkali-orders-${new Date().toISOString().slice(0, 10)}.xlsx"`,
        },
      });
    }

    // CSV format
    const headers = [
      'Order ID', 'Date', 'Customer Name', 'Phone', 'Email',
      'Address', 'City', 'State', 'Pincode', 'Landmark',
      'Items', 'Subtotal', 'Shipping', 'COD Charge', 'Total',
      'Payment Method', 'UPI ID', 'Status',
    ];

    const rows = orders.map((order) => {
      const orderItems = itemsByOrder[order.order_id as string] || [];
      const itemsStr = orderItems.map((i) => `${i.product_name} (${i.weight}) x${i.quantity} @ Rs.${i.price}`).join(' | ');
      return [
        order.order_id, order.created_at, order.customer_name, order.phone, order.email || '',
        `${order.address_line1}${order.address_line2 ? ', ' + order.address_line2 : ''}`,
        order.city, order.state, order.pincode, order.landmark || '',
        itemsStr, order.subtotal, order.shipping, order.cod_charge, order.total,
        order.payment_method, order.upi_id || '', order.status,
      ].map(v => `"${String(v ?? '').replace(/"/g, '""')}"`).join(',');
    });

    const csv = [headers.map(h => `"${h}"`).join(','), ...rows].join('\n');

    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="ponkali-orders-${new Date().toISOString().slice(0, 10)}.csv"`,
      },
    });
  } catch (error) {
    console.error('Export error:', error);
    return NextResponse.json({ error: 'Failed to export orders' }, { status: 500 });
  }
}
