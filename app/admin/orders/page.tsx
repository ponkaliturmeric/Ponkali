'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Box, Typography, Button, Stack, TextField, Chip, Table, TableHead,
  TableBody, TableRow, TableCell, TableContainer, Select, MenuItem,
  InputAdornment, Pagination, CircularProgress, Divider, IconButton,
  Tooltip, Dialog, DialogTitle, DialogContent, DialogActions, Alert, Checkbox,
  Snackbar, LinearProgress,
} from '@mui/material';
import FileDownloadOutlinedIcon from '@mui/icons-material/FileDownloadOutlined';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import SearchIcon from '@mui/icons-material/Search';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import LocalShippingOutlinedIcon from '@mui/icons-material/LocalShippingOutlined';
import HelpOutlineRoundedIcon from '@mui/icons-material/HelpOutlineRounded';
import AdminLayout from '@/components/AdminLayout';
import PageHeader from '@/components/admin/PageHeader';
import MainCard from '@/components/admin/MainCard';
import StatusChip from '@/components/admin/StatusChip';
import CopyText from '@/components/admin/CopyText';
import BulkBar from '@/components/admin/BulkBar';
import { Order } from '@/lib/types';
import { ORDER_SOURCES, SUPPLIER_PAID_STATUSES, labelFor } from '@/lib/crm';

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

/** Supplier settlement — money OUT, not the customer's payment. */
const SUPPLIER_OPTIONS = [
  { value: 'all', label: 'Supplier: all' },
  { value: 'Not Paid', label: 'Supplier: not paid' },
  { value: 'Paid', label: 'Supplier: paid' },
];

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

interface Summary { count: number; revenue: number; avg_order_value: number; supplier_unpaid: number }

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [total, setTotal] = useState(0);
  const [summary, setSummary] = useState<Summary>({ count: 0, revenue: 0, avg_order_value: 0, supplier_unpaid: 0 });
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('All');
  const [payment, setPayment] = useState('all');
  const [source, setSource] = useState('all');
  const [supplier, setSupplier] = useState('all');
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
  // Ticked rows, by order_id. Cleared whenever the visible rows change —
  // deleting something you can no longer see is the one outcome to rule out.
  const [selected, setSelected] = useState<string[]>([]);
  const [confirmBulk, setConfirmBulk] = useState(false);
  const [trackingFor, setTrackingFor] = useState<Order | null>(null);
  const [trackingValue, setTrackingValue] = useState('');
  const [savingTracking, setSavingTracking] = useState(false);
  const [trackingError, setTrackingError] = useState('');
  // Inline dropdown changes used to fail silently — the value simply snapped
  // back with no explanation. This says what went wrong.
  const [toast, setToast] = useState('');
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
      if (supplier !== 'all') params.set('supplier', supplier);
      const { from, to } = dateRange(datePreset);
      if (from) params.set('from', from);
      if (to) params.set('to', to);
      const res = await fetch(`/api/orders?${params}`);
      if (res.status === 401) { router.push('/admin/login'); return; }
      const data = await res.json().catch(() => ({}));
      const rows = data.orders || [];
      const count = data.total || 0;

      // Deleting every row on the last page strands you there: the list shows
      // "no orders match" over a non-empty result set, and because the total
      // rides on the first row's window function, an out-of-range page reports
      // total 0 — so the pagination control disappears too and there is no way
      // back except clearing the filters.
      //
      // Hence stepping back on an empty page rather than trusting the count.
      // It converges (page strictly decreases, floor of 1) and it self-heals
      // whatever emptied the page. On a genuinely empty filter it lands on
      // page 1, which is where that empty state belongs anyway.
      if (rows.length === 0 && page > 1) {
        setPage(p => Math.max(1, p - 1));
        return;
      }

      setOrders(rows);
      setTotal(count);
      setSummary(data.summary || { count: 0, revenue: 0, avg_order_value: 0, supplier_unpaid: 0 });
    } catch {
      setOrders([]);
      setTotal(0);
      setSummary({ count: 0, revenue: 0, avg_order_value: 0, supplier_unpaid: 0 });
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter, search, payment, source, supplier, datePreset, sort, router]);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  // fetchOrders' identity changes with every filter, page and sort change, so
  // this drops the selection exactly when the row set is about to change.
  useEffect(() => { setSelected([]); }, [fetchOrders]);

  /**
   * Shared by the two inline dropdowns: change one field on one row.
   *
   * Applied to local state FIRST, then saved in the background. The previous
   * version refetched the whole list on every change, which meant the table
   * blanked to a spinner and a second heavy aggregate query ran — it read as
   * the page reloading itself, and on a remote database it took seconds.
   *
   * On failure the snapshot goes back and a toast says why, so the dropdown
   * never shows a value the database does not hold.
   */
  const patchOrder = async (orderId: string, body: Record<string, string>, fallback: string) => {
    const snapshot = { orders, total, summary };

    const row = orders.find(o => o.order_id === orderId);
    if (!row) return;

    // If a filter is active and this change makes the row stop matching it,
    // take the row out instead of leaving a row on screen that contradicts the
    // filter above it. Marking orders off a filtered worklist then behaves the
    // way you would expect: they disappear as you go.
    const leavesStatusFilter = !!body.status && statusFilter !== 'All' && body.status !== statusFilter;
    const leavesSupplierFilter = !!body.supplier_paid && supplier !== 'all' && body.supplier_paid !== supplier;
    const drops = leavesStatusFilter || leavesSupplierFilter;

    // Keep the "Supplier not paid" card honest without asking the server again.
    let unpaidDelta = 0;
    if (body.supplier_paid) {
      const was = row.supplier_paid || 'Not Paid';
      if (was !== body.supplier_paid) unpaidDelta = body.supplier_paid === 'Paid' ? -1 : 1;
    }

    setOrders(list =>
      drops
        ? list.filter(o => o.order_id !== orderId)
        : list.map(o => (o.order_id === orderId ? { ...o, ...body } : o)),
    );
    if (drops) setTotal(n => Math.max(0, n - 1));
    setSummary(s => ({
      ...s,
      count: drops ? Math.max(0, s.count - 1) : s.count,
      supplier_unpaid: Math.max(0, s.supplier_unpaid + unpaidDelta),
    }));

    try {
      const res = await fetch(`/api/orders/${orderId}?brief=1`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setToast(data.error || fallback);
        setOrders(snapshot.orders);
        setTotal(snapshot.total);
        setSummary(snapshot.summary);
      }
    } catch {
      setToast('Could not reach the server. Your change was not saved.');
      setOrders(snapshot.orders);
      setTotal(snapshot.total);
      setSummary(snapshot.summary);
    }
  };

  const updateStatus = (orderId: string, status: string) =>
    patchOrder(orderId, { status }, 'Could not update the order status.');

  const openTracking = (order: Order) => {
    setTrackingFor(order);
    setTrackingValue(order.tracking_number || '');
    setTrackingError('');
  };

  const saveTracking = async () => {
    if (!trackingFor) return;
    setSavingTracking(true);
    setTrackingError('');
    try {
      const res = await fetch(`/api/orders/${trackingFor.order_id}?brief=1`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tracking_number: trackingValue }),
      });
      // Without this check the dialog closed on a 400 or 500 as if the number
      // had saved, and the operator only found out when the column stayed empty.
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setTrackingError(data.error || 'Could not save the tracking number.');
        return;
      }
      // Patch the one row rather than refetching the list. The server trims and
      // caps the value, so mirror that here or the cell would briefly show
      // something the database does not hold.
      const saved = trackingValue.trim().slice(0, 64);
      const id = trackingFor.order_id;
      setOrders(list => list.map(o => (o.order_id === id ? { ...o, tracking_number: saved } : o)));
      setTrackingFor(null);
    } catch {
      setTrackingError('Could not reach the server. Please try again.');
    } finally {
      setSavingTracking(false);
    }
  };

  const allOnPage = orders.map(o => o.order_id);
  const allSelected = allOnPage.length > 0 && allOnPage.every(id => selected.includes(id));
  const someSelected = selected.length > 0 && !allSelected;
  const toggleAll = () => setSelected(allSelected ? [] : allOnPage);
  const toggleOne = (id: string) =>
    setSelected(prev => (prev.includes(id) ? prev.filter(x => x !== id) : prev.concat(id)));

  /** Totals for the confirmation dialog, from the rows we already have. */
  const selectedOrders = orders.filter(o => selected.includes(o.order_id));
  const selectedValue = selectedOrders.reduce((sum, o) => sum + (Number(o.total) || 0), 0);

  const doBulkDelete = async () => {
    setDeleting(true);
    setDeleteError('');
    try {
      const res = await fetch('/api/admin/orders', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ order_ids: selected }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setDeleteError(data.error || 'Could not delete the selected orders.');
        return;
      }
      setConfirmBulk(false);
      setSelected([]);
      fetchOrders();
    } catch {
      setDeleteError('Could not reach the server. Please try again.');
    } finally {
      setDeleting(false);
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

  const updateSupplierPaid = (orderId: string, value: string) =>
    patchOrder(orderId, { supplier_paid: value }, 'Could not update the supplier payment.');

  const totalPages = Math.ceil(total / 20);

  const hasFilters =
    statusFilter !== 'All' || payment !== 'all' || source !== 'all' || supplier !== 'all' ||
    datePreset !== 'all' || search !== '';
  const clearAll = () => {
    setStatusFilter('All'); setPayment('all'); setSource('all'); setSupplier('all'); setDatePreset('all');
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
                <Select size="small" value={supplier} onChange={e => { setSupplier(e.target.value); setPage(1); }} sx={selectSx}>
                  {SUPPLIER_OPTIONS.map(o => <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>)}
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
                  {supplier !== 'all' && <Chip size="small" label={`Supplier: ${supplier}`} onDelete={() => setSupplier('all')} />}
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
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr 1fr', sm: 'repeat(4, 1fr)' }, gap: 2, mb: 2.5 }}>
        {[
          { label: hasFilters ? 'Matching orders' : 'Total orders', value: summary.count.toLocaleString('en-IN') },
          { label: hasFilters ? 'Matching revenue' : 'Total revenue', value: formatINR(summary.revenue) },
          { label: 'Avg order value', value: formatINR(summary.avg_order_value) },
          // A count, never a rupee figure: the order total is the customer's
          // price, not what the stock cost, so summing it would answer the
          // wrong question. Clicking it filters to exactly those orders.
          {
            label: 'Supplier not paid',
            value: summary.supplier_unpaid.toLocaleString('en-IN'),
            warn: summary.supplier_unpaid > 0,
            onClick: () => { setSupplier('Not Paid'); setPage(1); },
          },
        ].map(s => (
          <MainCard key={s.label} contentSx={{ py: 1.75 }}>
            <Box
              onClick={s.onClick}
              sx={s.onClick ? { cursor: 'pointer' } : undefined}
              role={s.onClick ? 'button' : undefined}
              tabIndex={s.onClick ? 0 : undefined}
              onKeyDown={s.onClick ? (e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); s.onClick!(); } }) : undefined}
            >
              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>{s.label}</Typography>
              <Typography variant="h4" sx={{ fontWeight: 700, mt: 0.25, color: s.warn ? 'warning.dark' : undefined }}>
                {s.value}
              </Typography>
            </Box>
          </MainCard>
        ))}
      </Box>

      <BulkBar
        count={selected.length} noun="order"
        onClear={() => setSelected([])}
        onDelete={() => { setConfirmBulk(true); setDeleteError(''); }}
        busy={deleting}
      />

      {/* Table */}
      <MainCard noPadding>
        {/* A refetch with rows already on screen shows this instead of
            replacing the table with a spinner — blanking the whole table was
            what made an update feel like a page reload. */}
        <Box sx={{ height: 3 }}>
          {loading && orders.length > 0 && <LinearProgress sx={{ height: 3 }} />}
        </Box>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell padding="checkbox">
                  <Checkbox
                    size="small"
                    checked={allSelected}
                    indeterminate={someSelected}
                    onChange={toggleAll}
                    disabled={orders.length === 0}
                    inputProps={{ 'aria-label': 'Select all orders on this page' }}
                  />
                </TableCell>
                {['Order ID', 'Date', 'Source', 'Customer', 'Phone', 'City', 'Items', 'Amount', 'Payment', 'Supplier paid', 'Status', 'Tracking', ''].map((h, i) => (
                  <TableCell key={i} sx={{ whiteSpace: 'nowrap' }}>
                    {h}
                    {h === 'Supplier paid' && (
                      <Tooltip title="Whether you have paid your supplier for this order's stock. Separate from the customer's payment.">
                        <HelpOutlineRoundedIcon sx={{ fontSize: 13, ml: 0.5, verticalAlign: 'middle', color: 'text.disabled' }} />
                      </Tooltip>
                    )}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {loading && orders.length === 0 ? (
                <TableRow><TableCell colSpan={14} align="center" sx={{ py: 6 }}><CircularProgress size={26} /></TableCell></TableRow>
              ) : orders.length === 0 ? (
                <TableRow><TableCell colSpan={14} align="center" sx={{ py: 6, color: 'text.disabled' }}>No orders match these filters.</TableCell></TableRow>
              ) : orders.map(order => (
                <TableRow key={order.order_id} hover selected={selected.includes(order.order_id)}>
                  <TableCell padding="checkbox">
                    <Checkbox
                      size="small"
                      checked={selected.includes(order.order_id)}
                      onChange={() => toggleOne(order.order_id)}
                      inputProps={{ 'aria-label': `Select order ${order.order_id}` }}
                    />
                  </TableCell>
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
                      value={order.supplier_paid || 'Not Paid'}
                      onChange={e => updateSupplierPaid(order.order_id, e.target.value)}
                      size="small" variant="outlined"
                      sx={{ minWidth: 125, '& .MuiSelect-select': { py: 0.75 } }}
                      renderValue={v => <StatusChip status={v} />}
                      aria-label={`Supplier payment for ${order.order_id}`}
                    >
                      {SUPPLIER_PAID_STATUSES.map(s => <MenuItem key={s} value={s}>{s}</MenuItem>)}
                    </Select>
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

      <Snackbar
        open={!!toast} autoHideDuration={6000} onClose={() => setToast('')}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity="error" onClose={() => setToast('')} variant="filled">{toast}</Alert>
      </Snackbar>

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
          {trackingError && <Alert severity="error" sx={{ mt: 2 }}>{trackingError}</Alert>}
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button color="inherit" onClick={() => setTrackingFor(null)} sx={{ color: 'text.secondary' }}>Cancel</Button>
          <Button variant="contained" onClick={saveTracking} disabled={savingTracking}>
            {savingTracking ? 'Saving…' : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Bulk delete confirmation */}
      <Dialog open={confirmBulk} onClose={() => setConfirmBulk(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>
          Delete {selected.length} order{selected.length === 1 ? '' : 's'}?
        </DialogTitle>
        <DialogContent>
          <Alert severity="warning" sx={{ mb: 2 }}>
            {formatINR(selectedValue)} of orders will be deleted permanently, along with their
            items and status history. Your revenue totals will drop accordingly.
          </Alert>
          <Typography variant="caption" color="text.secondary" component="div" sx={{ maxHeight: 120, overflowY: 'auto' }}>
            {selectedOrders.map(o => (
              <Box key={o.order_id} sx={{ fontFamily: 'monospace' }}>
                {o.order_id} · {o.customer_name} · {formatINR(Number(o.total) || 0)}
              </Box>
            ))}
          </Typography>
          {deleteError && <Alert severity="error" sx={{ mt: 2 }}>{deleteError}</Alert>}
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button color="inherit" onClick={() => setConfirmBulk(false)} sx={{ color: 'text.secondary' }}>Cancel</Button>
          <Button variant="contained" color="error" onClick={doBulkDelete} disabled={deleting}>
            {deleting ? 'Deleting…' : `Delete ${selected.length} order${selected.length === 1 ? '' : 's'}`}
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
