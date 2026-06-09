'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Box, Typography, Button, Stack, CircularProgress, LinearProgress,
} from '@mui/material';
import ShoppingBagOutlinedIcon from '@mui/icons-material/ShoppingBagOutlined';
import CurrencyRupeeRoundedIcon from '@mui/icons-material/CurrencyRupeeRounded';
import AccessTimeRoundedIcon from '@mui/icons-material/AccessTimeRounded';
import TrendingUpRoundedIcon from '@mui/icons-material/TrendingUpRounded';
import CalendarMonthOutlinedIcon from '@mui/icons-material/CalendarMonthOutlined';
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined';
import PercentRoundedIcon from '@mui/icons-material/PercentRounded';
import FileDownloadOutlinedIcon from '@mui/icons-material/FileDownloadOutlined';
import LocalShippingOutlinedIcon from '@mui/icons-material/LocalShippingOutlined';
import GroupsOutlinedIcon from '@mui/icons-material/GroupsOutlined';
import MailOutlineRoundedIcon from '@mui/icons-material/MailOutlineRounded';
import AdminLayout from '@/components/AdminLayout';
import PageHeader from '@/components/admin/PageHeader';
import StatCard from '@/components/admin/StatCard';
import MainCard from '@/components/admin/MainCard';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';

interface AnalyticsData {
  daily: { date: string; orders: number; revenue: number }[];
  byStatus: { status: string; count: number }[];
  byPayment: { payment_method: string; count: number; revenue: number }[];
  topProducts: { product_name: string; weight: string; qty_sold: number; revenue: number }[];
  monthly: { month: string; orders: number; revenue: number }[];
  totals: {
    total_orders: number; total_revenue: number; avg_order_value: number;
    pending: number; delivered: number; today_orders: number; today_revenue: number;
  };
}

const STATUS_COLORS: Record<string, string> = {
  Pending: '#FFBF00', Confirmed: '#00A2AE', Packed: '#1C3311',
  Shipped: '#4A7A3A', Delivered: '#00A854', Cancelled: '#F04134',
};
const PIE_COLORS = ['#1C3311', '#E8950A', '#00A854', '#00A2AE', '#4A7A3A'];

const formatDate = (d: string) => { const dt = new Date(d); return `${dt.getDate()} ${dt.toLocaleString('en', { month: 'short' })}`; };
const formatMonth = (m: string) => { const [y, mo] = m.split('-'); return new Date(Number(y), Number(mo) - 1).toLocaleString('en', { month: 'short', year: '2-digit' }); };
const formatINR = (v: number) => v >= 100000 ? `₹${(v / 100000).toFixed(1)}L` : v >= 1000 ? `₹${(v / 1000).toFixed(1)}k` : `₹${v}`;

const tooltipStyle = { borderRadius: 8, border: '1px solid #F0F0F0', fontSize: 12, boxShadow: '0px 8px 24px rgba(38,38,38,0.12)' };

export default function AdminDashboardPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const router = useRouter();

  useEffect(() => {
    let active = true;
    fetch('/api/admin/analytics')
      .then(r => { if (r.status === 401) { router.push('/admin/login'); return null; } if (!r.ok) throw new Error(); return r.json(); })
      .then(d => { if (active && d) { setData(d); setLoading(false); } })
      .catch(() => { if (active) { setError(true); setLoading(false); } });
    return () => { active = false; };
  }, [router]);

  if (error) {
    return (
      <AdminLayout>
        <Stack alignItems="center" justifyContent="center" spacing={2} sx={{ height: 256 }}>
          <Typography color="text.secondary">Couldn&apos;t load dashboard data.</Typography>
          <Button variant="contained" onClick={() => window.location.reload()}>Retry</Button>
        </Stack>
      </AdminLayout>
    );
  }

  if (loading || !data) {
    return <AdminLayout><Stack alignItems="center" justifyContent="center" sx={{ height: 256 }}><CircularProgress /></Stack></AdminLayout>;
  }

  const { totals, daily, byStatus, byPayment, topProducts, monthly } = data;
  const deliveryRate = totals.total_orders > 0 ? Math.round((totals.delivered / totals.total_orders) * 100) : 0;
  const prev7 = daily.slice(-14, -7).reduce((s, d) => s + d.revenue, 0);
  const curr7 = daily.slice(-7).reduce((s, d) => s + d.revenue, 0);
  const revenueTrend = prev7 > 0 ? Math.round((curr7 - prev7) / prev7 * 100) : undefined;

  const today = new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

  return (
    <AdminLayout>
      <PageHeader
        title="Dashboard"
        subtitle={today}
        action={
          <Stack direction="row" spacing={1.5}>
            <Button variant="outlined" color="inherit" startIcon={<FileDownloadOutlinedIcon />} href="/api/orders/export?format=csv" sx={{ color: 'text.secondary' }}>CSV</Button>
            <Button variant="contained" startIcon={<FileDownloadOutlinedIcon />} href="/api/orders/export?format=xlsx">Excel</Button>
          </Stack>
        }
      />

      {/* KPI cards */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr 1fr', lg: 'repeat(4, 1fr)' }, gap: 2.5, mb: 2.5 }}>
        <StatCard title="Total Orders" value={totals.total_orders} icon={ShoppingBagOutlinedIcon} color="primary" caption={`${totals.today_orders} today`} />
        <StatCard title="Total Revenue" value={`₹${(totals.total_revenue || 0).toLocaleString('en-IN')}`} icon={CurrencyRupeeRoundedIcon} color="secondary" trend={revenueTrend} caption="vs last week" />
        <StatCard title="Pending Orders" value={totals.pending} icon={AccessTimeRoundedIcon} color="warning" caption="Awaiting action" />
        <StatCard title="Avg Order Value" value={`₹${Math.round(totals.avg_order_value || 0)}`} icon={TrendingUpRoundedIcon} color="info" caption={`${deliveryRate}% delivered`} />
      </Box>
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr 1fr', lg: 'repeat(4, 1fr)' }, gap: 2.5, mb: 3 }}>
        <StatCard title="Today's Orders" value={totals.today_orders} icon={CalendarMonthOutlinedIcon} color="primary" />
        <StatCard title="Delivered" value={totals.delivered} icon={Inventory2OutlinedIcon} color="success" caption={`${deliveryRate}% success rate`} />
        <StatCard title="Today's Revenue" value={`₹${(totals.today_revenue || 0).toLocaleString('en-IN')}`} icon={CurrencyRupeeRoundedIcon} color="secondary" />
        <StatCard title="Delivery Rate" value={`${deliveryRate}%`} icon={PercentRoundedIcon} color="info" caption={`${totals.total_orders} total orders`} />
      </Box>

      {/* Revenue area */}
      <Box sx={{ mb: 3 }}>
        <MainCard title="Revenue — Last 30 Days">
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={daily} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#E8950A" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#E8950A" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#F5F5F5" />
              <XAxis dataKey="date" tickFormatter={formatDate} tick={{ fontSize: 11, fill: '#8C8C8C' }} axisLine={false} tickLine={false} interval={4} />
              <YAxis tickFormatter={formatINR} tick={{ fontSize: 11, fill: '#8C8C8C' }} axisLine={false} tickLine={false} width={48} />
              <Tooltip formatter={(v: unknown) => [`₹${Number(v).toLocaleString('en-IN')}`, 'Revenue']} labelFormatter={d => formatDate(String(d))} contentStyle={tooltipStyle} />
              <Area type="monotone" dataKey="revenue" stroke="#E8950A" strokeWidth={2.5} fill="url(#revGrad)" dot={false} activeDot={{ r: 4, fill: '#E8950A' }} />
            </AreaChart>
          </ResponsiveContainer>
        </MainCard>
      </Box>

      {/* Orders + status */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { md: '1fr 1fr' }, gap: 2.5, mb: 3 }}>
        <MainCard title="Orders — Last 30 Days">
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={daily} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F5F5F5" vertical={false} />
              <XAxis dataKey="date" tickFormatter={formatDate} tick={{ fontSize: 11, fill: '#8C8C8C' }} axisLine={false} tickLine={false} interval={6} />
              <YAxis tick={{ fontSize: 11, fill: '#8C8C8C' }} axisLine={false} tickLine={false} width={28} allowDecimals={false} />
              <Tooltip formatter={(v: unknown) => [Number(v), 'Orders']} labelFormatter={d => formatDate(String(d))} contentStyle={tooltipStyle} />
              <Bar dataKey="orders" fill="#1C3311" radius={[4, 4, 0, 0]} maxBarSize={24} />
            </BarChart>
          </ResponsiveContainer>
        </MainCard>

        <MainCard title="Orders by Status">
          {byStatus.length === 0 ? (
            <Stack alignItems="center" justifyContent="center" sx={{ height: 220, color: 'text.disabled' }}>No orders yet</Stack>
          ) : (
            <Stack direction="row" alignItems="center" spacing={2}>
              <Box sx={{ width: '55%' }}>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie data={byStatus} dataKey="count" nameKey="status" cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={2}>
                      {byStatus.map(e => <Cell key={e.status} fill={STATUS_COLORS[e.status] || '#BFBFBF'} />)}
                    </Pie>
                    <Tooltip formatter={(v: unknown) => [Number(v), 'Orders']} contentStyle={tooltipStyle} />
                  </PieChart>
                </ResponsiveContainer>
              </Box>
              <Stack spacing={1.25} sx={{ flex: 1 }}>
                {byStatus.map(s => (
                  <Stack key={s.status} direction="row" alignItems="center" justifyContent="space-between">
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: STATUS_COLORS[s.status] || '#BFBFBF' }} />
                      <Typography variant="body1" color="text.secondary" fontWeight={500}>{s.status}</Typography>
                    </Stack>
                    <Typography variant="body1" fontWeight={700}>{s.count}</Typography>
                  </Stack>
                ))}
              </Stack>
            </Stack>
          )}
        </MainCard>
      </Box>

      {/* Monthly + payment */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { md: '1fr 1fr' }, gap: 2.5, mb: 3 }}>
        <MainCard title="Monthly Revenue">
          {monthly.length === 0 ? (
            <Stack alignItems="center" justifyContent="center" sx={{ height: 220, color: 'text.disabled' }}>No data yet</Stack>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={monthly} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F5F5F5" vertical={false} />
                <XAxis dataKey="month" tickFormatter={formatMonth} tick={{ fontSize: 11, fill: '#8C8C8C' }} axisLine={false} tickLine={false} />
                <YAxis tickFormatter={formatINR} tick={{ fontSize: 11, fill: '#8C8C8C' }} axisLine={false} tickLine={false} width={48} />
                <Tooltip formatter={(v: unknown) => [`₹${Number(v).toLocaleString('en-IN')}`, 'Revenue']} labelFormatter={m => formatMonth(String(m))} contentStyle={tooltipStyle} />
                <Bar dataKey="revenue" fill="#E8950A" radius={[6, 6, 0, 0]} maxBarSize={40} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </MainCard>

        <MainCard title="Payment Methods">
          {byPayment.length === 0 ? (
            <Stack alignItems="center" justifyContent="center" sx={{ height: 220, color: 'text.disabled' }}>No data yet</Stack>
          ) : (
            <Stack direction="row" alignItems="center" spacing={2}>
              <Box sx={{ width: '55%' }}>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie data={byPayment} dataKey="revenue" nameKey="payment_method" cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={2}>
                      {byPayment.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                    </Pie>
                    <Tooltip formatter={(v: unknown) => [`₹${Number(v).toLocaleString('en-IN')}`, 'Revenue']} contentStyle={tooltipStyle} />
                  </PieChart>
                </ResponsiveContainer>
              </Box>
              <Stack spacing={1.75} sx={{ flex: 1 }}>
                {byPayment.map((p, i) => (
                  <Box key={p.payment_method}>
                    <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 0.5 }}>
                      <Stack direction="row" alignItems="center" spacing={1}>
                        <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: PIE_COLORS[i % PIE_COLORS.length] }} />
                        <Typography variant="body1" color="text.secondary" fontWeight={500} sx={{ textTransform: 'capitalize' }}>
                          {p.payment_method === 'cod' ? 'Cash on Delivery' : 'UPI'}
                        </Typography>
                      </Stack>
                      <Typography variant="body1" fontWeight={700}>{p.count}</Typography>
                    </Stack>
                    <Typography variant="caption" color="text.disabled" sx={{ pl: 2.25 }}>₹{Number(p.revenue).toLocaleString('en-IN')}</Typography>
                  </Box>
                ))}
              </Stack>
            </Stack>
          )}
        </MainCard>
      </Box>

      {/* Top products */}
      <Box sx={{ mb: 3 }}>
        <MainCard title="Top Products">
          {topProducts.length === 0 ? (
            <Typography color="text.disabled" sx={{ textAlign: 'center', py: 4 }}>No sales data yet</Typography>
          ) : (
            <Stack spacing={2}>
              {topProducts.map((p, i) => {
                const maxQty = topProducts[0].qty_sold;
                return (
                  <Stack key={i} direction="row" alignItems="center" spacing={2}>
                    <Typography sx={{ width: 18, fontWeight: 700, color: 'text.disabled' }}>{i + 1}</Typography>
                    <Box sx={{ flex: 1 }}>
                      <Stack direction="row" justifyContent="space-between" sx={{ mb: 0.75 }}>
                        <Typography variant="body1" fontWeight={600}>
                          {p.product_name} <Typography component="span" variant="body1" color="text.disabled">({p.weight})</Typography>
                        </Typography>
                        <Box sx={{ textAlign: 'right' }}>
                          <Typography component="span" variant="body1" fontWeight={700}>{p.qty_sold} units</Typography>
                          <Typography component="span" variant="caption" color="text.disabled" sx={{ ml: 1 }}>₹{Number(p.revenue).toLocaleString('en-IN')}</Typography>
                        </Box>
                      </Stack>
                      <LinearProgress
                        variant="determinate" value={(p.qty_sold / maxQty) * 100}
                        sx={{ '& .MuiLinearProgress-bar': { bgcolor: 'secondary.main', borderRadius: 8 } }}
                      />
                    </Box>
                  </Stack>
                );
              })}
            </Stack>
          )}
        </MainCard>
      </Box>

      {/* Quick actions */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr 1fr', sm: 'repeat(3, 1fr)', lg: 'repeat(5, 1fr)' }, gap: 1.5 }}>
        <Button variant="contained" startIcon={<ShoppingBagOutlinedIcon />} href="/admin/orders" sx={{ py: 1.5 }}>All Orders</Button>
        <Button variant="outlined" color="inherit" startIcon={<GroupsOutlinedIcon />} href="/admin/customers" sx={{ py: 1.5, color: 'text.secondary' }}>Customers</Button>
        <Button variant="outlined" color="inherit" startIcon={<LocalShippingOutlinedIcon />} href="/admin/products" sx={{ py: 1.5, color: 'text.secondary' }}>Products</Button>
        <Button variant="outlined" color="inherit" startIcon={<MailOutlineRoundedIcon />} href="/admin/messages" sx={{ py: 1.5, color: 'text.secondary' }}>Messages</Button>
        <Button variant="outlined" color="inherit" startIcon={<FileDownloadOutlinedIcon />} href="/api/orders/export?format=xlsx" sx={{ py: 1.5, color: 'text.secondary' }}>Export Excel</Button>
      </Box>
    </AdminLayout>
  );
}
