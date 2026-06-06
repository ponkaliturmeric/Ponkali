'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Box, Typography, Button, Stack, TextField, Chip, Table, TableHead,
  TableBody, TableRow, TableCell, TableContainer, Select, MenuItem,
  InputAdornment, Pagination, CircularProgress,
} from '@mui/material';
import FileDownloadOutlinedIcon from '@mui/icons-material/FileDownloadOutlined';
import SearchIcon from '@mui/icons-material/Search';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import AdminLayout from '@/components/AdminLayout';
import PageHeader from '@/components/admin/PageHeader';
import MainCard from '@/components/admin/MainCard';
import StatusChip from '@/components/admin/StatusChip';
import { Order } from '@/lib/types';

const STATUS_OPTIONS = ['All', 'Pending', 'Confirmed', 'Packed', 'Shipped', 'Delivered'];

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('All');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Pick up ?search= passed from the header search box.
  useEffect(() => {
    const q = new URLSearchParams(window.location.search).get('search');
    if (q) setSearch(q);
  }, []);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(page) });
    if (statusFilter !== 'All') params.set('status', statusFilter);
    if (search) params.set('search', search);
    const res = await fetch(`/api/orders?${params}`);
    if (res.status === 401) { router.push('/admin/login'); return; }
    const data = await res.json();
    setOrders(data.orders || []);
    setTotal(data.total || 0);
    setLoading(false);
  }, [page, statusFilter, search, router]);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  const updateStatus = async (orderId: string, status: string) => {
    await fetch(`/api/orders/${orderId}`, {
      method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status }),
    });
    fetchOrders();
  };

  const totalPages = Math.ceil(total / 20);

  return (
    <AdminLayout>
      <PageHeader
        title="Orders"
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
        <MainCard contentSx={{ py: 2 }}>
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems={{ md: 'center' }}>
            <TextField
              fullWidth placeholder="Search order ID or customer name…"
              value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
              InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon fontSize="small" color="action" /></InputAdornment> }}
            />
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
          </Stack>
        </MainCard>
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
                <TableRow><TableCell colSpan={10} align="center" sx={{ py: 6, color: 'text.disabled' }}>No orders found.</TableCell></TableRow>
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
