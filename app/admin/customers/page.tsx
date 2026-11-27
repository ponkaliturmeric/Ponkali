'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Box, Typography, Button, Stack, TextField, Chip, Table, TableHead,
  TableBody, TableRow, TableCell, TableContainer, Select, MenuItem,
  InputAdornment, Pagination, CircularProgress, Avatar, IconButton,
  Tooltip, Dialog, DialogTitle, DialogContent, DialogActions, Alert, Checkbox,
  LinearProgress,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import ReceiptLongOutlinedIcon from '@mui/icons-material/ReceiptLongOutlined';
import GroupsOutlinedIcon from '@mui/icons-material/GroupsOutlined';
import LoyaltyOutlinedIcon from '@mui/icons-material/LoyaltyOutlined';
import CurrencyRupeeRoundedIcon from '@mui/icons-material/CurrencyRupeeRounded';
import TrendingUpRoundedIcon from '@mui/icons-material/TrendingUpRounded';
import AdminLayout from '@/components/AdminLayout';
import PageHeader from '@/components/admin/PageHeader';
import MainCard from '@/components/admin/MainCard';
import StatCard from '@/components/admin/StatCard';
import BulkBar from '@/components/admin/BulkBar';
import { BRAND, GOLD } from '@/components/admin/theme';

interface Customer {
  phone: string | null;
  customer_name: string;
  email: string | null;
  city: string | null;
  state: string | null;
  order_count: number;
  total_spent: number;
  first_order: string;
  last_order: string;
  has_account: boolean;
}

interface Summary {
  total_customers: number;
  repeat_customers: number;
  total_spent: number;
  avg_ltv: number;
}

const SORT_OPTIONS = [
  { value: 'spent', label: 'Top spenders' },
  { value: 'orders', label: 'Most orders' },
  { value: 'recent', label: 'Recently ordered' },
  { value: 'name', label: 'Name (A→Z)' },
];

/** RFM-lite segment from order count — Registered (no orders) / New / Returning / VIP. */
function segment(orderCount: number): { label: string; bg: string; fg: string } {
  if (orderCount >= 3) return { label: 'VIP', bg: '#FCE7C7', fg: '#7E5207' };
  if (orderCount === 2) return { label: 'Returning', bg: '#E0F7F8', fg: '#00727B' };
  if (orderCount === 1) return { label: 'New', bg: '#F0F0F0', fg: '#595959' };
  return { label: 'Registered', bg: '#EDE7F6', fg: '#5E35B1' };
}

const formatINR = (v: number) => `₹${(v || 0).toLocaleString('en-IN')}`;
const initials = (name: string) =>
  name.trim().split(/\s+/).slice(0, 2).map(w => w[0]?.toUpperCase() ?? '').join('') || '?';

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [total, setTotal] = useState(0);
  const [summary, setSummary] = useState<Summary>({ total_customers: 0, repeat_customers: 0, total_spent: 0, avg_ltv: 0 });
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState('spent');
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  // A customer has no id — the row key is its phone, or its email for an
  // account that never ordered. Same key the delete endpoint matches on.
  const [selected, setSelected] = useState<string[]>([]);
  const [confirmBulk, setConfirmBulk] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<Customer | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');
  const router = useRouter();
  const firstRun = useRef(true);

  useEffect(() => {
    if (firstRun.current) { firstRun.current = false; return; }
    const t = setTimeout(() => { setSearch(searchInput.trim()); setPage(1); }, 350);
    return () => clearTimeout(t);
  }, [searchInput]);

  const fetchCustomers = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), sort });
      if (search) params.set('search', search);
      const res = await fetch(`/api/admin/customers?${params}`);
      if (res.status === 401) { router.push('/admin/login'); return; }
      const data = await res.json().catch(() => ({}));
      const rows = data.customers || [];
      const count = data.total || 0;

      // Same guard as the orders list, and for the same reason: an out-of-range
      // page reports a total of 0, so stepping back cannot rely on the count.
      if (rows.length === 0 && page > 1) {
        setPage(p => Math.max(1, p - 1));
        return;
      }

      setCustomers(rows);
      setTotal(count);
      if (data.summary) setSummary(data.summary);
    } catch {
      setCustomers([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [page, sort, search, router]);

  useEffect(() => { fetchCustomers(); }, [fetchCustomers]);

  // Drop the selection whenever the visible rows are about to change.
  useEffect(() => { setSelected([]); }, [fetchCustomers]);

  const keyOf = (c: Customer) => c.phone || c.email || '';
  const allOnPage = customers.map(keyOf).filter(Boolean);
  const allSelected = allOnPage.length > 0 && allOnPage.every(k => selected.includes(k));
  const someSelected = selected.length > 0 && !allSelected;
  const toggleAll = () => setSelected(allSelected ? [] : allOnPage);
  const toggleOne = (k: string) =>
    setSelected(prev => (prev.includes(k) ? prev.filter(x => x !== k) : prev.concat(k)));

  const selectedCustomers = customers.filter(c => selected.includes(keyOf(c)));
  const selectedOrders = selectedCustomers.reduce((n, c) => n + (c.order_count || 0), 0);
  const selectedSpend = selectedCustomers.reduce((n, c) => n + (c.total_spent || 0), 0);

  const doBulkDelete = async () => {
    setDeleting(true);
    setDeleteError('');
    try {
      const res = await fetch('/api/admin/customers', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customers: selectedCustomers.map(c => ({ phone: c.phone, email: c.email })),
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setDeleteError(data.error || 'Could not delete the selected customers.');
        return;
      }
      setConfirmBulk(false);
      setSelected([]);
      fetchCustomers();
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
      const params = new URLSearchParams();
      if (confirmDelete.phone) params.set('phone', confirmDelete.phone);
      if (confirmDelete.email) params.set('email', confirmDelete.email);
      const res = await fetch(`/api/admin/customers?${params}`, { method: 'DELETE' });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setDeleteError(data.error || 'Could not delete this customer.');
        return;
      }
      setConfirmDelete(null);
      fetchCustomers();
    } catch {
      setDeleteError('Could not reach the server. Please try again.');
    } finally {
      setDeleting(false);
    }
  };

  const totalPages = Math.ceil(total / 20);
  const repeatRate = summary.total_customers > 0
    ? Math.round((summary.repeat_customers / summary.total_customers) * 100) : 0;

  return (
    <AdminLayout>
      <PageHeader title="Customers" subtitle="Everyone who registered an account or placed an order" breadcrumbs={[{ label: 'Customers' }]} />

      {/* KPIs */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr 1fr', lg: 'repeat(4, 1fr)' }, gap: 2.5, mb: 2.5 }}>
        <StatCard title="Total Customers" value={summary.total_customers} icon={GroupsOutlinedIcon} color="primary" />
        <StatCard title="Repeat Customers" value={summary.repeat_customers} icon={LoyaltyOutlinedIcon} color="secondary" caption={`${repeatRate}% repeat rate`} />
        <StatCard title="Total Revenue" value={formatINR(summary.total_spent)} icon={CurrencyRupeeRoundedIcon} color="success" />
        <StatCard title="Avg Lifetime Value" value={formatINR(summary.avg_ltv)} icon={TrendingUpRoundedIcon} color="info" />
      </Box>

      {/* Filters */}
      <Box sx={{ mb: 2.5 }}>
        <MainCard contentSx={{ py: 2 }}>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems={{ sm: 'center' }}>
            <TextField
              fullWidth placeholder="Search by name, phone or email…"
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
            <Select size="small" value={sort} onChange={e => { setSort(e.target.value); setPage(1); }} sx={{ minWidth: 190, bgcolor: '#fff', '& .MuiSelect-select': { py: 1 } }}>
              {SORT_OPTIONS.map(o => <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>)}
            </Select>
          </Stack>
        </MainCard>
      </Box>

      <BulkBar
        count={selected.length} noun="customer"
        onClear={() => setSelected([])}
        onDelete={() => { setConfirmBulk(true); setDeleteError(''); }}
        busy={deleting}
      />

      {/* Table */}
      <MainCard noPadding>
        {/* Keeps the rows on screen during a refetch rather than replacing the
            table with a spinner. */}
        <Box sx={{ height: 3 }}>
          {loading && customers.length > 0 && <LinearProgress sx={{ height: 3 }} />}
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
                    disabled={customers.length === 0}
                    inputProps={{ 'aria-label': 'Select all customers on this page' }}
                  />
                </TableCell>
                {['Customer', 'Phone', 'Location', 'Orders', 'Total Spent', 'Last Order', 'Segment', ''].map((h, i) => (
                  <TableCell key={i} align={['Orders', 'Total Spent'].includes(h) ? 'right' : 'left'}>{h}</TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {loading && customers.length === 0 ? (
                <TableRow><TableCell colSpan={9} align="center" sx={{ py: 6 }}><CircularProgress size={26} /></TableCell></TableRow>
              ) : customers.length === 0 ? (
                <TableRow><TableCell colSpan={9} align="center" sx={{ py: 6, color: 'text.disabled' }}>No customers found.</TableCell></TableRow>
              ) : customers.map((c, i) => {
                const seg = segment(c.order_count);
                return (
                  <TableRow key={c.phone || c.email || `cust-${i}`} hover selected={selected.includes(keyOf(c))}>
                    <TableCell padding="checkbox">
                      <Checkbox
                        size="small"
                        checked={selected.includes(keyOf(c))}
                        onChange={() => toggleOne(keyOf(c))}
                        disabled={!keyOf(c)}
                        inputProps={{ 'aria-label': `Select ${c.customer_name || 'customer'}` }}
                      />
                    </TableCell>
                    <TableCell>
                      <Stack direction="row" spacing={1.5} alignItems="center">
                        <Avatar sx={{ width: 38, height: 38, fontSize: 13, fontWeight: 700, background: `linear-gradient(135deg, ${GOLD}, ${BRAND})` }}>
                          {initials(c.customer_name)}
                        </Avatar>
                        <Box sx={{ minWidth: 0 }}>
                          <Typography variant="body1" fontWeight={600} noWrap>{c.customer_name || '—'}</Typography>
                          {c.email && <Typography variant="caption" color="text.disabled" noWrap>{c.email}</Typography>}
                        </Box>
                      </Stack>
                    </TableCell>
                    <TableCell sx={{ color: 'text.secondary', fontFamily: 'monospace' }}>{c.phone || '—'}</TableCell>
                    <TableCell sx={{ color: 'text.secondary' }}>{[c.city, c.state].filter(Boolean).join(', ') || '—'}</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 600 }}>{c.order_count}</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 700 }}>{formatINR(c.total_spent)}</TableCell>
                    <TableCell sx={{ color: 'text.secondary' }}>{c.last_order ? new Date(c.last_order).toLocaleDateString('en-IN') : '—'}</TableCell>
                    <TableCell><Chip size="small" label={seg.label} sx={{ bgcolor: seg.bg, color: seg.fg, fontWeight: 700 }} /></TableCell>
                    <TableCell>
                      <Stack direction="row" spacing={0.25} alignItems="center">
                        {c.order_count > 0 && c.phone ? (
                          <Button component={Link} href={`/admin/orders?search=${encodeURIComponent(c.phone)}`} size="small" startIcon={<ReceiptLongOutlinedIcon sx={{ fontSize: 16 }} />}>Orders</Button>
                        ) : (
                          <Typography variant="caption" color="text.disabled" sx={{ mr: 0.5 }}>No orders yet</Typography>
                        )}
                        <Tooltip title="Delete customer">
                          <IconButton
                            size="small"
                            onClick={() => { setConfirmDelete(c); setDeleteError(''); }}
                            sx={{ color: 'text.disabled', '&:hover': { color: 'error.main' } }}
                          >
                            <DeleteOutlineRoundedIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Stack>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>

        {totalPages > 1 && (
          <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ p: 2, borderTop: '1px solid', borderColor: 'divider' }}>
            <Typography variant="body1" color="text.secondary">Page {page} of {totalPages} · {total} customers</Typography>
            <Pagination count={totalPages} page={page} onChange={(_, p) => setPage(p)} shape="rounded" color="primary" />
          </Stack>
        )}
      </MainCard>

      {/* Bulk delete confirmation — same warning as the single case, totalled. */}
      <Dialog open={confirmBulk} onClose={() => setConfirmBulk(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>
          Delete {selected.length} customer{selected.length === 1 ? '' : 's'}?
        </DialogTitle>
        <DialogContent>
          {selectedOrders > 0 ? (
            <Alert severity="warning" sx={{ mb: 2 }}>
              This also deletes <strong>{selectedOrders}</strong>{' '}
              order{selectedOrders === 1 ? '' : 's'} worth{' '}
              <strong>{formatINR(selectedSpend)}</strong> between them, including line items and
              status history. Your revenue, average order value and repeat-rate figures will drop
              accordingly.
            </Alert>
          ) : (
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              None of them have orders, so only their registered accounts are removed.
            </Typography>
          )}
          <Typography variant="caption" color="text.secondary" component="div" sx={{ maxHeight: 120, overflowY: 'auto' }}>
            {selectedCustomers.map(c => (
              <Box key={keyOf(c)}>
                {c.customer_name || '—'}{c.phone ? ` · ${c.phone}` : ''} · {c.order_count} order{c.order_count === 1 ? '' : 's'}
              </Box>
            ))}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1.5 }}>This cannot be undone.</Typography>
          {deleteError && <Alert severity="error" sx={{ mt: 2 }}>{deleteError}</Alert>}
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button color="inherit" onClick={() => setConfirmBulk(false)} sx={{ color: 'text.secondary' }}>Cancel</Button>
          <Button variant="contained" color="error" onClick={doBulkDelete} disabled={deleting}>
            {deleting ? 'Deleting…' : `Delete ${selected.length}`}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete confirmation.
          A customer is not a row here — it is their order history plus any
          account. So this dialog states the order count and lifetime value
          explicitly: deleting erases those orders, which permanently lowers the
          revenue and repeat-rate figures on the dashboard above. Nobody should
          discover that afterwards. */}
      <Dialog open={!!confirmDelete} onClose={() => setConfirmDelete(null)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>Delete this customer?</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
            <strong>{confirmDelete?.customer_name || 'This customer'}</strong>
            {confirmDelete?.phone ? ` · ${confirmDelete.phone}` : ''}
          </Typography>
          {confirmDelete && confirmDelete.order_count > 0 ? (
            <Alert severity="warning" sx={{ mb: 1.5 }}>
              This also deletes their <strong>{confirmDelete.order_count}</strong>{' '}
              order{confirmDelete.order_count === 1 ? '' : 's'} worth{' '}
              <strong>{formatINR(confirmDelete.total_spent)}</strong>, including the line items and
              status history. Your revenue, average order value and repeat-rate figures will drop
              accordingly.
            </Alert>
          ) : (
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
              They have no orders, so only their registered account is removed.
            </Typography>
          )}
          <Typography variant="body2" color="text.secondary">This cannot be undone.</Typography>
          {deleteError && <Alert severity="error" sx={{ mt: 2 }}>{deleteError}</Alert>}
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button color="inherit" onClick={() => setConfirmDelete(null)} sx={{ color: 'text.secondary' }}>Keep them</Button>
          <Button variant="contained" color="error" onClick={doDelete} disabled={deleting}>
            {deleting ? 'Deleting…' : 'Delete customer'}
          </Button>
        </DialogActions>
      </Dialog>
    </AdminLayout>
  );
}
