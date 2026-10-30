'use client';

import AdminLayout from '@/components/AdminLayout';
import PageHeader from '@/components/admin/PageHeader';
import OrderForm from '@/components/admin/OrderForm';

export default function NewManualOrderPage() {
  return (
    <AdminLayout>
      <PageHeader
        title="New order"
        subtitle="Type in an order taken over WhatsApp, on the phone or in person"
        breadcrumbs={[{ label: 'Orders', href: '/admin/orders' }, { label: 'New order' }]}
      />
      <OrderForm mode="create" />
    </AdminLayout>
  );
}
