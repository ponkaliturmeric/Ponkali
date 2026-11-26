'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Box, Typography, Button, Stack, TextField, Chip, Table, TableHead,
  TableBody, TableRow, TableCell, TableContainer, Select, MenuItem,
  InputAdornment, Pagination, CircularProgress, Divider, IconButton,
  Tooltip, Dialog, DialogTitle, DialogContent, DialogActions, Alert,
} from '@mui/material';
import FileDownloadOutlinedIcon from '@mui/icons-material/FileDownloadOutlined';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import SearchIcon from '@mui/icons-material/Search';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import LocalShippingOutlinedIcon from '@mui/icons-material/LocalShippingOutlined';
import AdminLayout from '@/components/AdminLayout';
import PageHeader from '@/components/admin/PageHeader';
import MainCard from '@/components/admin/MainCard';
import StatusChip from '@/components/admin/StatusChip';
import CopyText from '@/components/admin/CopyText';
import { Order } from '@/lib/types';
import { ORDER_SOURCES, labelFor } from '@/lib/crm';

const STATUS_OPTIONS = ['All', 'Pending', 'Confirmed', 'Packed', 'Shipped', 'Delivered'];

const PAYMENT_OPTIONS = [
  { value: 'all', label: 'All payments' },
  { value: 'online', label: 'Online (Razorpay)' },
  { value: 'cod', label: 'Cash on Delivery' },
  { value: 'upi', label: 'UPI' },
  { value: 'cash', label: 'Cash' },
  { value: 'bank', label: 'Bank transfer' },
];

/** Website orders vs the ones typed in by hand (WhatsApp, phone, walk-in…). */
const SOURCE_OPTIONS = [{ value: 'all', label: 'All sources' }, ...ORDER_SOURCES];

const DATE_OPTIONS = [
  { value: 'all', label: 'All time' },
  { value: 'today', label: 'Today' },
  { value: '7d', label: 'Last 7 days' },
  { value: '30d', label: 'Last 30 days' },
  { value: 'month', label: 'This month' },
];

const SORT_OPTIONS = [
  { value: 'recent', label: 'Newest first' },
  { value: 'oldest', label: 'Oldest first' },
  { value: 'amount_high', label: 'Amount: high → low' },
  { value: 'amount_low', label: 'Amount: low → high' },
];

const fmt = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

function dateRange(preset: string): { from?: string; to?: string } {
  const today = new Date();
  if (preset === 'today') return { from: fmt(today), to: fmt(today) };
  if (preset === '7d') { const d = new Date(today); d.setDate(d.getDate() - 6); return { from: fmt(d), to: fmt(today) }; }
  if (preset === '30d') { const d = new Date(today); d.setDate(d.getDate() - 29); return { from: fmt(d), to: fmt(today) }; }
  if (preset === 'month') { const d = new Date(today.getFullYear(), today.getMonth(), 1); return { from: fmt(d), to: fmt(today) }; }
  return {};
}

const formatINR = (v: number) => `₹${(v || 0).toLocaleString('en-IN')}`;

/** What is still owed on an order — surfaced for part-paid WhatsApp orders. */
const balanceDue = (o: Order) =>
  Math.max(0, Math.round((Number(o.total) || 0) - (Number(o.amount_paid) || 0)));

interface Summary { count: number; revenue: number; avg_order_value: number }

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [total, setTotal] = useState(0);
  const [summary, setSummary] = useState<Summary>({ count: 0, revenue: 0, avg_order_value: 0 });
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('All');
  const [payment, setPayment] = useState('all');
  const [source, setSource] = useState('all');
  const [datePreset, setDatePreset] = useState('all');
  const [sort, setSort] = useState('recent');
  // `searchInput` updates on every keystroke; `search` is the debounced value
  // that actually drives the fetch, so we don't hit the API on every character.
  const [searchInput, setSearchInput] = useState(() =>
    typeof window === 'undefined' ? '' : new URLSearchParams(window.location.search).get('search') || '',
  );
  const [search, setSearch] = useState(searchInput);
  const [loading, setLoading] = useState(true);
  // Order pending deletion (confirmation dialog), and the tracking-number editor.
  const [confirmDelete, setConfirmDelete] = useState<Order | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');
  const [trackingFor, setTrackingFor] = useState<Order | null>(null);
  const [trackingValue, setTrackingValue] = useState('');
  const [savingTracking, setSavingTracking] = useState(false);
  const router = useRouter();
  const firstRun = useRef(true);

  // Debounce the search box.
  useEffect(() => {
    if (firstRun.current) { firstRun.current = false; return; }
    const t = setTimeout(() => { setSearch(searchInput.trim()); setPage(1); }, 350);
    return () => clearTimeout(t);
  }, [searchInput]);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), sort });
      if (statusFilter !== 'All') params.set('status', statusFilter);
      if (search) params.set('search', search);
      if (payment !== 'all') params.set('payment', payment);
      if (source !== 'all') params.set('source', source);
      const { from, to } = dateRange(datePreset);
      if (from) params.set('from', from);
      if (to) params.set('to', to);
      const res = await fetch(`/api/orders?${params}`);
      if (res.status === 401) { router.push('/admin/login'); return; }
      const data = await res.json().catch(() => ({}));
      setOrders(data.orders || []);
      setTotal(data.total || 0);
      setSummary(data.summary || { count: 0, revenue: 0, avg_order_value: 0 });
    } catch {
      setOrders([]);
      setTotal(0);
      setSummary({ count: 0, revenue: 0, avg_order_value: 0 });
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter, search, payment, source, datePreset, sort, router]);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  const updateStatus = async (orderId: string, status: string) => {
    await fetch(`/api/orders/${orderId}`, {
      method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status }),
    });
    fetchOrders();
  };

  const openTracking = (order: Order) => {
    setTrackingFor(order);
    setTrackingValue(order.tracking_number || '');
  };

  const saveTracking = async () => {
    if (!trackingFor) return;
    setSavingTracking(true);
    try {
      await fetch(`/api/orders/${trackingFor.order_id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tracking_number: trackingValue }),
      });
      setTrackingFor(null);
      fetchOrders();
    } finally {
      setSavingTracking(false);
    }
  };

  const doDelete = async () => {
    if (!confirmDelete) return;
    setDeleting(true);
    setDeleteError('');
    try {
      const res = await fetch(`/api/admin/orders/${confirmDelete.order_id}`, { method: 'DELETE' });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setDeleteError(data.error || 'Could not delete the order.');
        return;
      }
      setConfirmDelete(null);
      fetchOrders();
    } catch {
      setDeleteError('Could not reach the server. Please try again.');
    } finally {
      setDeleting(false);
    }
  };

  const totalPages = Math.ceil(total / 20);

  const hasFilters =
    statusFilter !== 'All' || payment !== 'all' || source !== 'all' || datePreset !== 'all' || search !== '';
  const clearAll = () => {
    setStatusFilter('All'); setPayment('all'); setSource('all'); setDatePreset('all');
    setSearchInput(''); setSearch(''); setPage(1);
  };

  const selectSx = { minWidth: 150, bgcolor: '#fff', '& .MuiSelect-select': { py: 1 } };

  return (
    <AdminLayout>
      <PageHeader
        title="Orders"
        subtitle="Search, filter and fulfil customer orders"
        breadcrumbs={[{ label: 'Orders' }]}
        action={
          <Stack direction="row" spacing={1.5}>
            <Button variant="outlined" color="inherit" startIcon={<FileDownloadOutlinedIcon />} href="/api/orders/export?format=csv" sx={{ color: 'text.secondary' }}>CSV</Button>
            <Button variant="outlined" color="inherit" startIcon={<FileDownloadOutlinedIcon />} href="/api/orders/export?format=xlsx" sx={{ color: 'text.secondary' }}>Excel</Button>
            <Button component={Link} href="/admin/orders/new" variant="contained" startIcon={<AddRoundedIcon />}>New order</Button>
          </Stack>
        }
      />

      {/* Filters */}
      <Box sx={{ mb: 2.5 }}>
        <MainCard contentSx={{ py: 2.5 }}>
          <Stack spacing={2}>
            <TextField
              fullWidth placeholder="Search by order ID, customer name, phone or city…"
              value={searchInput} onChange={e => setSearchInput(e.target.value)}
              InputProps={{
                startAdornment: <InputAdornment position="start"><SearchIcon fontSize="small" color="action" /></InputAdornment>,
                endAdornment: searchInput ? (
                  <InputAdornment position="end">
                    <CloseRoundedIcon fontSize="small" sx={{ cursor: 'pointer', color: 'text.disabled' }} onClick={() => setSearchInput('')} />
                  </InputAdornment>
                ) : null,
              }}
            />

            <Stack direction={{ xs: 'column', lg: 'row' }} spacing={2} justifyContent="space-between" alignItems={{ lg: 'center' }}>
              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                {STATUS_OPTIONS.map(s => (
                  <Chip
                    key={s} label={s}
                    onClick={() => { setStatusFilter(s); setPage(1); }}
                    color={statusFilter === s ? 'primary' : 'default'}
                    variant={statusFilter === s ? 'filled' : 'outlined'}
                  />
                ))}
              </Stack>

              <Stack direction="row" spacing={1.5} flexWrap="wrap" useFlexGap>
                <Select size="small" value={payment} onChange={e => { setPayment(e.target.value); setPage(1); }} sx={selectSx}>
                  {PAYMENT_OPTIONS.map(o => <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>)}
                </Select>
                <Select size="small" value={source} onChange={e => { setSource(e.target.value); setPage(1); }} sx={selectSx}>
                  {SOURCE_OPTIONS.map(o => <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>)}
                </Select>
                <Select size="small" value={datePreset} onChange={e => { setDatePreset(e.target.value); setPage(1); }} sx={selectSx}>
                  {DATE_OPTIONS.map(o => <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>)}
                </Select>
                <Select size="small" value={sort} onChange={e => { setSort(e.target.value); setPage(1); }} sx={selectSx}>
                  {SORT_OPTIONS.map(o => <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>)}
                </Select>
              </Stack>
            </Stack>

            {hasFilters && (
              <>
                <Divider />
                <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap>
                  <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>Active:</Typography>
                  {statusFilter !== 'All' && <Chip size="small" label={`Status: ${statusFilter}`} onDelete={() => setStatusFilter('All')} />}
                  {payment !== 'all' && <Chip size="small" label={PAYMENT_OPTIONS.find(o => o.value === payment)?.label} onDelete={() => setPayment('all')} />}
                  {source !== 'all' && <Chip size="small" label={`From: ${labelFor(ORDER_SOURCES, source)}`} onDelete={() => setSource('all')} />}
                  {datePreset !== 'all' && <Chip size="small" label={DATE_OPTIONS.find(o => o.value === datePreset)?.label} onDelete={() => setDatePreset('all')} />}
                  {search && <Chip size="small" label={`“${search}”`} onDelete={() => { setSearchInput(''); setSearch(''); }} />}
                  <Button size="small" onClick={clearAll} sx={{ color: 'text.secondary', minWidth: 0 }}>Clear all</Button>
                </Stack>
              </>
            )}
          </Stack>
        </MainCard>
      </Box>

      {/* Summary strip — reflects the current filters */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr 1fr', sm: 'repeat(3, 1fr)' }, gap: 2, mb: 2.5 }}>
        {[
          { label: hasFilters ? 'Matching orders' : 'Total orders', value: summary.count.toLocaleString('en-IN') },
          { label: hasFilters ? 'Matching revenue' : 'Total revenue', value: formatINR(summary.revenue) },
          { label: 'Avg order value', value: formatINR(summary.avg_order_value) },
        ].map(s => (
          <MainCard key={s.label} contentSx={{ py: 1.75 }}>
            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>{s.label}</Typography>
            <Typography variant="h4" sx={{ fontWeight: 700, mt: 0.25 }}>{s.value}</Typography>
          </MainCard>
        ))}
      </Box>

      {/* Table */}
      <MainCard noPadding>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                {['Order ID', 'Date', 'Source', 'Customer', 'Phone', 'City', 'Items', 'Amount', 'Payment', 'Status', 'Tracking', ''].map((h, i) => (
                  <TableCell key={i}>{h}</TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={12} align="center" sx={{ py: 6 }}><CircularProgress size={26} /></TableCell></TableRow>
              ) : orders.length === 0 ? (
                <TableRow><TableCell colSpan={12} align="center" sx={{ py: 6, color: 'text.disabled' }}>No orders match these filters.</TableCell></TableRow>
              ) : orders.map(order => (
                <TableRow key={order.order_id} hover>
                  <TableCell>
                    <CopyText value={order.order_id} label="Copy order ID" color="primary.main" />
                  </TableCell>
                  <TableCell sx={{ color: 'text.secondary' }}>{new Date(order.created_at).toLocaleDateString('en-IN')}</TableCell>
                  <TableCell><StatusChip status={order.source || 'website'} /></TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>{order.customer_name}</TableCell>
                  <TableCell sx={{ color: 'text.secondary' }}>{order.phone}</TableCell>
                  <TableCell sx={{ color: 'text.secondary' }}>{order.city}</TableCell>
                  <TableCell sx={{ color: 'text.secondary' }}>{order.item_count ?? '—'}</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>
                    ₹{order.total}
                    {balanceDue(order) > 0 && (
                      <Typography variant="caption" color="warning.dark" display="block" fontWeight={600}>
                        ₹{balanceDue(order)} due
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    <Stack spacing={0.5} alignItems="flex-start">
                      <StatusChip status={order.payment_method} />
                      {order.payment_status && order.payment_status !== 'Paid' && (
                        <StatusChip status={order.payment_status} />
                      )}
                    </Stack>
                  </TableCell>
                  <TableCell>
                    <Select
                      value={order.status}
                      onChange={e => updateStatus(order.order_id, e.target.value)}
                      size="small" variant="outlined"
                      sx={{ minWidth: 130, '& .MuiSelect-select': { py: 0.75 } }}
                      renderValue={v => <StatusChip status={v} />}
                    >
                      {STATUS_OPTIONS.slice(1).map(s => <MenuItem key={s} value={s}>{s}</MenuItem>)}
                    </Select>
                  </TableCell>
                  <TableCell>
                    {order.tracking_number ? (
                      <Stack direction="row" spacing={0.5} alignItems="center">
                        <CopyText value={order.tracking_number} label="Copy tracking number" bold={false} fontSize="0.8125rem" />
                        <Tooltip title="Edit tracking number">
                          <IconButton size="small" onClick={() => openTracking(order)} sx={{ p: 0.375, color: 'text.disabled' }}>
                            <LocalShippingOutlinedIcon sx={{ fontSize: 15 }} />
                          </IconButton>
                        </Tooltip>
                      </Stack>
                    ) : (
                      <Button
                        size="small" onClick={() => openTracking(order)}
                        startIcon={<LocalShippingOutlinedIcon sx={{ fontSize: 15 }} />}
                        sx={{ color: 'text.secondary', minWidth: 0, fontWeight: 500 }}
                      >
                        Add
                      </Button>
                    )}
                  </TableCell>
                  <TableCell>
                    <Stack direction="row" spacing={0.25} alignItems="center">
                      <Button component={Link} href={`/admin/orders/${order.order_id}`} size="small" startIcon={<VisibilityOutlinedIcon sx={{ fontSize: 16 }} />}>View</Button>
                      <Tooltip title="Delete order">
                        <IconButton size="small" onClick={() => { setConfirmDelete(order); setDeleteError(''); }} sx={{ color: 'text.disabled', '&:hover': { color: 'error.main' } }}>
                          <DeleteOutlineRoundedIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Stack>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        {totalPages > 1 && (
          <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ p: 2, borderTop: '1px solid', borderColor: 'divider' }}>
            <Typography variant="body1" color="text.secondary">Page {page} of {totalPages} · {total} orders</Typography>
            <Pagination count={totalPages} page={page} onChange={(_, p) => setPage(p)} shape="rounded" color="primary" />
          </Stack>
        )}
      </MainCard>

      {/* Tracking number editor */}
      <Dialog open={!!trackingFor} onClose={() => setTrackingFor(null)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>
          {trackingFor?.tracking_number ? 'Edit tracking number' : 'Add tracking number'}
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {trackingFor?.order_id} · {trackingFor?.customer_name}
          </Typography>
          <TextField
            autoFocus fullWidth label="Tracking / consignment number"
            value={trackingValue}
            onChange={e => setTrackingValue(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); saveTracking(); } }}
            placeholder="e.g. EE123456789IN"
            inputProps={{ maxLength: 64, style: { fontFamily: 'monospace' } }}
            helperText="Leave it empty to remove the tracking number."
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button color="inherit" onClick={() => setTrackingFor(null)} sx={{ color: 'text.secondary' }}>Cancel</Button>
          <Button variant="contained" onClick={saveTracking} disabled={savingTracking}>
            {savingTracking ? 'Saving…' : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete confirmation. Spells out the amount, because deleting an order
          removes it from every revenue figure in the admin. */}
      <Dialog open={!!confirmDelete} onClose={() => setConfirmDelete(null)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>Delete this order?</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary">
            <strong>{confirmDelete?.order_id}</strong> — {confirmDelete?.customer_name} ·{' '}
            {formatINR(Number(confirmDelete?.total) || 0)} will be deleted permanently, along with
            its items and status history. It will no longer count towards your revenue totals, and
            this cannot be undone.
          </Typography>
          {deleteError && <Alert severity="error" sx={{ mt: 2 }}>{deleteError}</Alert>}
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button color="inherit" onClick={() => setConfirmDelete(null)} sx={{ color: 'text.secondary' }}>Keep it</Button>
          <Button variant="contained" color="error" onClick={doDelete} disabled={deleting}>
            {deleting ? 'Deleting…' : 'Delete order'}
          </Button>
        </DialogActions>
      </Dialog>
    </AdminLayout>
  );
}
