'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Box, Typography, Button, Stack, TextField, Divider, CircularProgress,
} from '@mui/material';
import PrintOutlinedIcon from '@mui/icons-material/PrintOutlined';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import RadioButtonUncheckedRoundedIcon from '@mui/icons-material/RadioButtonUncheckedRounded';
import AdminLayout from '@/components/AdminLayout';
import PageHeader from '@/components/admin/PageHeader';
import MainCard from '@/components/admin/MainCard';
import StatusChip from '@/components/admin/StatusChip';
import { Order } from '@/lib/types';

interface OrderWithHistory extends Order {
  history?: { status: string; changed_at: string; notes?: string }[];
}

const STATUS_OPTIONS = ['Pending', 'Confirmed', 'Packed', 'Shipped', 'Delivered'];

export default function AdminOrderDetailPage({ params }: { params: { id: string } }) {
  const [order, setOrder] = useState<OrderWithHistory | null>(null);
  const [loading, setLoading] = useState(true);
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const router = useRouter();

  useEffect(() => {
    fetch(`/api/orders/${params.id}`)
      .then(r => { if (r.status === 401) { router.push('/admin/login'); return null; } return r.json(); })
      .then(data => { if (data) { setOrder(data); setNotes(data.notes || ''); } setLoading(false); });
  }, [params.id, router]);

  const updateStatus = async (status: string) => {
    setSaving(true);
    const res = await fetch(`/api/orders/${params.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status }) });
    setOrder(await res.json());
    setSaving(false);
  };

  const saveNotes = async () => {
    setSaving(true);
    await fetch(`/api/orders/${params.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ notes }) });
    setSaving(false);
  };

  if (loading) return <AdminLayout><Stack alignItems="center" sx={{ py: 8 }}><CircularProgress /></Stack></AdminLayout>;

  if (!order) {
    return (
      <AdminLayout>
        <Stack alignItems="center" spacing={2} sx={{ py: 8 }}>
          <Typography color="text.secondary">Order not found.</Typography>
          <Button component={Link} href="/admin/orders" variant="contained">Back to Orders</Button>
        </Stack>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <PageHeader
        title={order.order_id}
        subtitle={new Date(order.created_at).toLocaleString('en-IN')}
        breadcrumbs={[{ label: 'Orders', href: '/admin/orders' }, { label: order.order_id }]}
        action={<Button variant="outlined" color="inherit" startIcon={<PrintOutlinedIcon />} onClick={() => window.print()} sx={{ color: 'text.secondary' }}>Print Slip</Button>}
      />

      <Box sx={{ display: 'grid', gridTemplateColumns: { md: '2fr 1fr' }, gap: 2.5 }}>
        {/* Left */}
        <Stack spacing={2.5}>
          <MainCard title="Customer Details">
            <Box sx={{ display: 'grid', gridTemplateColumns: { sm: '1fr 1fr' }, gap: 2 }}>
              {[
                ['Name', order.customer_name],
                ['Phone', order.phone],
                ['Email', order.email || '—'],
                ['City', `${order.city}, ${order.state}`],
                ['PIN', order.pincode],
                ['Payment', order.payment_method === 'cod' ? 'Cash on Delivery' : 'Online (Razorpay)'],
              ].map(([label, value]) => (
                <Box key={label}>
                  <Typography variant="caption" color="text.secondary" fontWeight={600}>{label}</Typography>
                  <Typography variant="body1" fontWeight={600}>{value}</Typography>
                </Box>
              ))}
              <Box sx={{ gridColumn: { sm: '1 / -1' } }}>
                <Typography variant="caption" color="text.secondary" fontWeight={600}>Delivery Address</Typography>
                <Typography variant="body1" fontWeight={600}>
                  {order.address_line1}
                  {order.address_line2 && `, ${order.address_line2}`}
                  {order.landmark && ` (Near ${order.landmark})`}
                </Typography>
              </Box>
            </Box>
          </MainCard>

          <MainCard title="Order Items">
            <Stack divider={<Divider />} spacing={1.5}>
              {(order.items || []).map((item, i) => (
                <Stack key={i} direction="row" justifyContent="space-between" alignItems="center">
                  <Box>
                    <Typography variant="body1" fontWeight={600}>{item.product_name} ({item.weight})</Typography>
                    <Typography variant="body2" color="text.secondary">Qty: {item.quantity} × ₹{item.price}</Typography>
                  </Box>
                  <Typography variant="body1" fontWeight={700}>₹{item.price * item.quantity}</Typography>
                </Stack>
              ))}
            </Stack>
            <Divider sx={{ my: 2 }} />
            <Stack spacing={1}>
              <Stack direction="row" justifyContent="space-between"><Typography variant="body1" color="text.secondary">Subtotal</Typography><Typography variant="body1">₹{order.subtotal}</Typography></Stack>
              <Stack direction="row" justifyContent="space-between"><Typography variant="body1" color="text.secondary">Shipping</Typography><Typography variant="body1">{order.shipping === 0 ? 'FREE' : `₹${order.shipping}`}</Typography></Stack>
              {order.cod_charge > 0 && <Stack direction="row" justifyContent="space-between"><Typography variant="body1" color="text.secondary">COD Charge</Typography><Typography variant="body1">₹{order.cod_charge}</Typography></Stack>}
              <Divider />
              <Stack direction="row" justifyContent="space-between"><Typography variant="h5">Total</Typography><Typography variant="h5">₹{order.total}</Typography></Stack>
            </Stack>
          </MainCard>

          <MainCard title="Internal Notes">
            <TextField fullWidth multiline minRows={3} value={notes} onChange={e => setNotes(e.target.value)} placeholder="Add internal notes about this order…" />
            <Button variant="contained" onClick={saveNotes} disabled={saving} sx={{ mt: 2 }}>{saving ? 'Saving…' : 'Save Notes'}</Button>
          </MainCard>
        </Stack>

        {/* Right */}
        <Stack spacing={2.5}>
          <MainCard title="Order Status">
            <Box sx={{ mb: 2 }}><StatusChip status={order.status} size="medium" /></Box>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>Update status:</Typography>
            <Stack spacing={1}>
              {STATUS_OPTIONS.map(s => {
                const current = s === order.status;
                return (
                  <Button
                    key={s} onClick={() => updateStatus(s)} disabled={current || saving}
                    variant={current ? 'contained' : 'outlined'}
                    color={current ? 'primary' : 'inherit'}
                    startIcon={current ? <CheckCircleRoundedIcon fontSize="small" /> : <RadioButtonUncheckedRoundedIcon fontSize="small" />}
                    sx={{ justifyContent: 'flex-start', color: current ? undefined : 'text.primary', '&.Mui-disabled': { opacity: current ? 1 : 0.5, color: current ? '#fff' : undefined } }}
                  >
                    {s}
                  </Button>
                );
              })}
            </Stack>
          </MainCard>

          {order.history && order.history.length > 0 && (
            <MainCard title="Timeline">
              <Stack>
                {order.history.map((h, i) => (
                  <Stack key={i} direction="row" spacing={1.5}>
                    <Stack alignItems="center">
                      <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: 'primary.main', mt: 0.5, flexShrink: 0 }} />
                      {i < order.history!.length - 1 && <Box sx={{ width: 2, flex: 1, bgcolor: 'divider', mt: 0.5 }} />}
                    </Stack>
                    <Box sx={{ pb: 2 }}>
                      <Typography variant="body1" fontWeight={600}>{h.status}</Typography>
                      <Typography variant="caption" color="text.disabled">{new Date(h.changed_at).toLocaleString('en-IN')}</Typography>
                    </Box>
                  </Stack>
                ))}
              </Stack>
            </MainCard>
          )}
        </Stack>
      </Box>
    </AdminLayout>
  );
}
