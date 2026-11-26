'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Box, Typography, Button, Stack, TextField, Divider, CircularProgress, Alert,
} from '@mui/material';
import PrintOutlinedIcon from '@mui/icons-material/PrintOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import RadioButtonUncheckedRoundedIcon from '@mui/icons-material/RadioButtonUncheckedRounded';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import ReceiptLongOutlinedIcon from '@mui/icons-material/ReceiptLongOutlined';
import LocalShippingOutlinedIcon from '@mui/icons-material/LocalShippingOutlined';
import AdminLayout from '@/components/AdminLayout';
import PageHeader from '@/components/admin/PageHeader';
import MainCard from '@/components/admin/MainCard';
import StatusChip from '@/components/admin/StatusChip';
import CopyText from '@/components/admin/CopyText';
import { Order } from '@/lib/types';
import { ORDER_SOURCES, PAYMENT_METHODS, SUPPLIER_PAID_STATUSES, labelFor } from '@/lib/crm';

interface OrderWithHistory extends Order {
  history?: { status: string; changed_at: string; notes?: string }[];
}

const STATUS_OPTIONS = ['Pending', 'Confirmed', 'Packed', 'Shipped', 'Delivered'];

export default function AdminOrderDetailPage({ params }: { params: { id: string } }) {
  const [order, setOrder] = useState<OrderWithHistory | null>(null);
  const [loading, setLoading] = useState(true);
  const [notes, setNotes] = useState('');
  const [tracking, setTracking] = useState('');
  const [savingTracking, setSavingTracking] = useState(false);
  const [trackingError, setTrackingError] = useState('');
  const [savingSupplier, setSavingSupplier] = useState(false);
  const [saving, setSaving] = useState(false);
  const router = useRouter();

  useEffect(() => {
    fetch(`/api/orders/${params.id}`)
      .then(r => { if (r.status === 401) { router.push('/admin/login'); return null; } return r.json(); })
      .then(data => {
        if (data) { setOrder(data); setNotes(data.notes || ''); setTracking(data.tracking_number || ''); }
        setLoading(false);
      });
  }, [params.id, router]);

  const updateStatus = async (status: string) => {
    setSaving(true);
    const res = await fetch(`/api/orders/${params.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status }) });
    setOrder(await res.json());
    setSaving(false);
  };

  const saveTracking = async () => {
    setSavingTracking(true);
    setTrackingError('');
    try {
      const res = await fetch(`/api/orders/${params.id}`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ tracking_number: tracking }),
      });
      const data = await res.json().catch(() => null);
      // res.ok matters here beyond the error message: an error body is
      // { error: '...' }, and feeding that to setOrder replaced the whole order
      // with an object that has no order_id, blanking the page.
      if (!res.ok) {
        setTrackingError((data && data.error) || 'Could not save the tracking number.');
        return;
      }
      if (data) { setOrder(data); setTracking(data.tracking_number || ''); }
    } catch {
      setTrackingError('Could not reach the server. Please try again.');
    } finally {
      setSavingTracking(false);
    }
  };

  const setSupplierPaid = async (value: string) => {
    setSavingSupplier(true);
    try {
      const res = await fetch(`/api/orders/${params.id}`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ supplier_paid: value }),
      });
      const data = await res.json().catch(() => null);
      if (res.ok && data) setOrder(data);
    } finally {
      setSavingSupplier(false);
    }
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

  // Normalise the phone for a wa.me link — 10-digit Indian numbers get the 91 code.
  const digits = String(order.phone || '').replace(/\D/g, '');
  const waPhone = digits.length === 10 ? `91${digits}` : digits;
  const balance = Math.max(0, Math.round((Number(order.total) || 0) - (Number(order.amount_paid) || 0)));

  return (
    <AdminLayout>
      <PageHeader
        title={order.order_id}
        subtitle={new Date(order.created_at).toLocaleString('en-IN')}
        breadcrumbs={[{ label: 'Orders', href: '/admin/orders' }, { label: order.order_id }]}
        action={
          <Stack direction="row" spacing={1.5}>
            <Button variant="outlined" color="inherit" startIcon={<PrintOutlinedIcon />} onClick={() => window.print()} sx={{ color: 'text.secondary' }}>Print Slip</Button>
            <Button component={Link} href={`/admin/orders/${order.order_id}/edit`} variant="contained" startIcon={<EditOutlinedIcon />}>Edit order</Button>
          </Stack>
        }
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
                ['Payment', labelFor(PAYMENT_METHODS, order.payment_method)],
                ['Came from', labelFor(ORDER_SOURCES, order.source || 'website')],
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
            <Divider sx={{ my: 2 }} />
            <Stack direction="row" spacing={1.5} flexWrap="wrap" useFlexGap>
              <Button
                size="small" variant="outlined" color="inherit" startIcon={<WhatsAppIcon sx={{ fontSize: 16 }} />}
                href={`https://wa.me/${waPhone}`} target="_blank" rel="noopener noreferrer"
                sx={{ color: 'text.secondary' }}
              >
                WhatsApp
              </Button>
              <Button
                component={Link} size="small" variant="outlined" color="inherit" startIcon={<ReceiptLongOutlinedIcon sx={{ fontSize: 16 }} />}
                href={`/admin/orders?search=${encodeURIComponent(order.phone)}`}
                sx={{ color: 'text.secondary' }}
              >
                All orders from this customer
              </Button>
            </Stack>
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
              {!!order.discount && order.discount > 0 && <Stack direction="row" justifyContent="space-between"><Typography variant="body1" color="text.secondary">Discount</Typography><Typography variant="body1">−₹{order.discount}</Typography></Stack>}
              <Divider />
              <Stack direction="row" justifyContent="space-between"><Typography variant="h5">Total</Typography><Typography variant="h5">₹{order.total}</Typography></Stack>

              {/* What has actually been collected — the part that matters for a
                  WhatsApp order, where money arrives separately from the order. */}
              <Divider />
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Typography variant="body1" color="text.secondary">Payment</Typography>
                <StatusChip status={order.payment_status || 'Unpaid'} />
              </Stack>
              <Stack direction="row" justifyContent="space-between">
                <Typography variant="body1" color="text.secondary">Received</Typography>
                <Typography variant="body1">₹{order.amount_paid ?? 0}</Typography>
              </Stack>
              {balance > 0 && (
                <Stack direction="row" justifyContent="space-between">
                  <Typography variant="body1" fontWeight={700} color="warning.dark">Balance due</Typography>
                  <Typography variant="body1" fontWeight={700} color="warning.dark">₹{balance}</Typography>
                </Stack>
              )}
              {order.payment_ref && (
                <Stack direction="row" justifyContent="space-between">
                  <Typography variant="body1" color="text.secondary">Reference</Typography>
                  <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>{order.payment_ref}</Typography>
                </Stack>
              )}
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

          <MainCard title="Supplier Payment">
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2, lineHeight: 1.7 }}>
              Whether you have paid your supplier for this order&apos;s stock. Nothing to do with
              the customer&apos;s payment above.
            </Typography>
            <Box sx={{ mb: 2 }}>
              <StatusChip status={order.supplier_paid || 'Not Paid'} size="medium" />
            </Box>
            <Stack spacing={1}>
              {SUPPLIER_PAID_STATUSES.map(s => {
                const current = (order.supplier_paid || 'Not Paid') === s;
                return (
                  <Button
                    key={s} onClick={() => setSupplierPaid(s)} disabled={current || savingSupplier}
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

          <MainCard title="Shipping & Tracking">
            {order.tracking_number ? (
              <Box sx={{ mb: 2 }}>
                <Typography variant="caption" color="text.secondary" fontWeight={600} display="block">
                  Current tracking number
                </Typography>
                <CopyText value={order.tracking_number} label="Copy tracking number" />
              </Box>
            ) : (
              <Typography variant="body2" color="text.disabled" sx={{ mb: 2 }}>
                No tracking number yet.
              </Typography>
            )}
            <TextField
              fullWidth size="small" label="Tracking / consignment number"
              value={tracking}
              onChange={e => setTracking(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); saveTracking(); } }}
              placeholder="e.g. EE123456789IN"
              inputProps={{ maxLength: 64, style: { fontFamily: 'monospace' } }}
            />
            <Button
              variant="contained" onClick={saveTracking} disabled={savingTracking}
              startIcon={<LocalShippingOutlinedIcon fontSize="small" />}
              sx={{ mt: 2 }}
            >
              {savingTracking ? 'Saving…' : order.tracking_number ? 'Update tracking' : 'Save tracking'}
            </Button>
            {trackingError && <Alert severity="error" sx={{ mt: 2 }}>{trackingError}</Alert>}
            <Typography variant="caption" color="text.disabled" display="block" sx={{ mt: 1.5 }}>
              Clear the field and save to remove it. Changes are recorded in the timeline.
            </Typography>
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
                      {h.notes && (
                        <Typography variant="caption" color="text.secondary" display="block">{h.notes}</Typography>
                      )}
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
