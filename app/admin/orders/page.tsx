'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Box, Typography, Button, Stack, TextField, Chip, Table, TableHead,
  TableBody, TableRow, TableCell, TableContainer, Select, MenuItem,
  InputAdornment, Pagination, CircularProgress, Divider,
} from '@mui/material';
import FileDownloadOutlinedIcon from '@mui/icons-material/FileDownloadOutlined';
import SearchIcon from '@mui/icons-material/Search';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import AdminLayout from '@/components/AdminLayout';
import PageHeader from '@/components/admin/PageHeader';
import MainCard from '@/components/admin/MainCard';
import StatusChip from '@/components/admin/StatusChip';
import { Order } from '@/lib/types';

const STATUS_OPTIONS = ['All', 'Pending', 'Confirmed', 'Packed', 'Shipped', 'Delivered'];

const PAYMENT_OPTIONS = [
  { value: 'all', label: 'All payments' },
  { value: 'online', label: 'Online (Razorpay)' },
  { value: 'cod', label: 'Cash on Delivery' },
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

interface Summary { count: number; revenue: number; avg_order_value: number }

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [total, setTotal] = useState(0);
  const [summary, setSummary] = useState<Summary>({ count: 0, revenue: 0, avg_order_value: 0 });
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('All');
  const [payment, setPayment] = useState('all');
  const [datePreset, setDatePreset] = useState('all');
  const [sort, setSort] = useState('recent');
  // `searchInput` updates on every keystroke; `search` is the debounced value
  // that actually drives the fetch, so we don't hit the API on every character.
  const [searchInput, setSearchInput] = useState(() =>
    typeof window === 'undefined' ? '' : new URLSearchParams(window.location.search).get('search') || '',
  );
  const [search, setSearch] = useState(searchInput);
  const [loading, setLoading] = useState(true);
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
  }, [page, statusFilter, search, payment, datePreset, sort, router]);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  const updateStatus = async (orderId: string, status: string) => {
    await fetch(`/api/orders/${orderId}`, {
      method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status }),
    });
    fetchOrders();
  };

  const totalPages = Math.ceil(total / 20);

  const hasFilters =
    statusFilter !== 'All' || payment !== 'all' || datePreset !== 'all' || search !== '';
  const clearAll = () => {
    setStatusFilter('All'); setPayment('all'); setDatePreset('all');
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
            <Button variant="contained" startIcon={<FileDownloadOutlinedIcon />} href="/api/orders/export?format=xlsx">Excel</Button>
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
                {['Order ID', 'Date', 'Customer', 'Phone', 'City', 'Items', 'Amount', 'Payment', 'Status', ''].map((h, i) => (
                  <TableCell key={i}>{h}</TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={10} align="center" sx={{ py: 6 }}><CircularProgress size={26} /></TableCell></TableRow>
              ) : orders.length === 0 ? (
                <TableRow><TableCell colSpan={10} align="center" sx={{ py: 6, color: 'text.disabled' }}>No orders match these filters.</TableCell></TableRow>
              ) : orders.map(order => (
                <TableRow key={order.order_id} hover>
                  <TableCell sx={{ fontFamily: 'monospace', fontWeight: 700, color: 'primary.main' }}>{order.order_id}</TableCell>
                  <TableCell sx={{ color: 'text.secondary' }}>{new Date(order.created_at).toLocaleDateString('en-IN')}</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>{order.customer_name}</TableCell>
                  <TableCell sx={{ color: 'text.secondary' }}>{order.phone}</TableCell>
                  <TableCell sx={{ color: 'text.secondary' }}>{order.city}</TableCell>
                  <TableCell sx={{ color: 'text.secondary' }}>{order.item_count ?? '—'}</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>₹{order.total}</TableCell>
                  <TableCell><StatusChip status={order.payment_method} /></TableCell>
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
                    <Button component={Link} href={`/admin/orders/${order.order_id}`} size="small" startIcon={<VisibilityOutlinedIcon sx={{ fontSize: 16 }} />}>View</Button>
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
    </AdminLayout>
  );
}
