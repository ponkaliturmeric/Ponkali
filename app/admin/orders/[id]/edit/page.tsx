'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button, Stack, Typography, CircularProgress } from '@mui/material';
import AdminLayout from '@/components/AdminLayout';
import PageHeader from '@/components/admin/PageHeader';
import OrderForm, { EMPTY_ORDER, type OrderFormValues } from '@/components/admin/OrderForm';
import type { Order, OrderItem, Product } from '@/lib/types';

/** '' | 0 → '0' so a deliberate zero charge shows as zero rather than blank. */
const str = (v: unknown) => (v === null || v === undefined ? '' : String(v));

export default function EditOrderPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [initial, setInitial] = useState<OrderFormValues | null>(null);
  const [missing, setMissing] = useState(false);

  useEffect(() => {
    let active = true;
    Promise.all([
      fetch(`/api/orders/${params.id}`).then((r) => {
        if (r.status === 401) { router.push('/admin/login'); return null; }
        if (!r.ok) return null;
        return r.json() as Promise<Order & { items?: OrderItem[] }>;
      }),
      fetch('/api/products').then((r) => r.json()).catch(() => [] as Product[]),
    ])
      .then(([order, catalog]: [(Order & { items?: OrderItem[] }) | null, Product[]]) => {
        if (!active) return;
        if (!order) { setMissing(true); return; }

        // order_items stores the name and weight, not the slug. Re-attach the
        // slug where the line still matches a catalogue SKU exactly, so the
        // product dropdown shows it; anything else becomes a custom line.
        const list = Array.isArray(catalog) ? catalog : [];
        const items = (order.items ?? []).map((it) => {
          const match = list.find((p) => p.name === it.product_name && p.weight === it.weight);
          return {
            slug: match?.slug ?? '',
            product_name: it.product_name,
            weight: it.weight,
            price: str(it.price),
            quantity: str(it.quantity),
          };
        });

        setInitial({
          ...EMPTY_ORDER,
          source: order.source || 'whatsapp',
          status: order.status || 'Confirmed',
          customer_name: str(order.customer_name),
          phone: str(order.phone),
          email: str(order.email),
          address_line1: str(order.address_line1),
          address_line2: str(order.address_line2),
          city: str(order.city),
          state: str(order.state),
          pincode: str(order.pincode),
          landmark: str(order.landmark),
          items: items.length ? items : EMPTY_ORDER.items,
          shipping: str(order.shipping),
          cod_charge: str(order.cod_charge),
          discount: str(order.discount ?? 0),
          payment_method: order.payment_method || 'upi',
          payment_status: order.payment_status || 'Unpaid',
          amount_paid: str(order.amount_paid ?? 0),
          payment_ref: str(order.payment_ref),
          notes: str(order.notes),
          notify: false,
        });
      })
      .catch(() => { if (active) setMissing(true); });
    return () => { active = false; };
  }, [params.id, router]);

  if (missing) {
    return (
      <AdminLayout>
        <Stack alignItems="center" spacing={2} sx={{ py: 8 }}>
          <Typography color="text.secondary">Order not found.</Typography>
          <Button component={Link} href="/admin/orders" variant="contained">Back to Orders</Button>
        </Stack>
      </AdminLayout>
    );
  }

  if (!initial) {
    return <AdminLayout><Stack alignItems="center" sx={{ py: 8 }}><CircularProgress /></Stack></AdminLayout>;
  }

  return (
    <AdminLayout>
      <PageHeader
        title={`Edit ${params.id}`}
        subtitle="Change the customer, items, charges or payment on this order"
        breadcrumbs={[
          { label: 'Orders', href: '/admin/orders' },
          { label: params.id, href: `/admin/orders/${params.id}` },
          { label: 'Edit' },
        ]}
      />
      <OrderForm mode="edit" orderId={params.id} initial={initial} />
    </AdminLayout>
  );
}
