'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  ShoppingBag, IndianRupee, Clock, CalendarDays,
  TrendingUp, PackageCheck, BarChart3, Download,
  ArrowUpRight, Percent
} from 'lucide-react';
import AdminLayout from '@/components/AdminLayout';
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
    total_orders: number;
    total_revenue: number;
    avg_order_value: number;
    pending: number;
    delivered: number;
    today_orders: number;
    today_revenue: number;
  };
}

const STATUS_COLORS: Record<string, string> = {
  Pending: '#F59E0B',
  Confirmed: '#3B82F6',
  Packed: '#8B5CF6',
  Shipped: '#06B6D4',
  Delivered: '#10B981',
  Cancelled: '#EF4444',
};

const PIE_COLORS = ['#D4960A', '#2C1000', '#10B981', '#3B82F6', '#8B5CF6'];

function StatCard({
  label, value, sub, Icon, trend, color,
}: {
  label: string;
  value: string | number;
  sub?: string;
  Icon: React.ElementType;
  trend?: string;
  color: string;
}) {
  return (
    <div className="bg-white rounded-2xl p-5 border border-gray-100 flex flex-col gap-3">
      <div className="flex items-start justify-between">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>
          <Icon size={18} strokeWidth={1.75} />
        </div>
        {trend && (
          <span className="flex items-center gap-1 text-[12px] font-semibold text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
            <ArrowUpRight size={12} />
            {trend}
          </span>
        )}
      </div>
      <div>
        <p className="text-[26px] font-extrabold text-gray-900 tracking-tight leading-none">{value}</p>
        <p className="text-gray-400 text-[13px] mt-1 font-medium">{label}</p>
        {sub && <p className="text-gray-300 text-[11px] mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

function SectionHeader({ title, sub }: { title: string; sub?: string }) {
  return (
    <div className="mb-5">
      <h2 className="text-[16px] font-extrabold text-gray-900 tracking-tight">{title}</h2>
      {sub && <p className="text-[13px] text-gray-400 mt-0.5">{sub}</p>}
    </div>
  );
}

const formatDate = (d: string) => {
  const dt = new Date(d);
  return `${dt.getDate()} ${dt.toLocaleString('en', { month: 'short' })}`;
};

const formatMonth = (m: string) => {
  const [y, mo] = m.split('-');
  return new Date(Number(y), Number(mo) - 1).toLocaleString('en', { month: 'short', year: '2-digit' });
};

const formatINR = (v: number) =>
  v >= 100000 ? `₹${(v / 100000).toFixed(1)}L` : v >= 1000 ? `₹${(v / 1000).toFixed(1)}k` : `₹${v}`;

export default function AdminDashboardPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const router = useRouter();

  useEffect(() => {
    let active = true;
    fetch('/api/admin/analytics')
      .then(r => {
        if (r.status === 401) { router.push('/admin/login'); return null; }
        if (!r.ok) throw new Error(`Analytics request failed (${r.status})`);
        return r.json();
      })
      .then(d => {
        if (active && d) { setData(d); setLoading(false); }
      })
      .catch(() => {
        // Don't leave the admin staring at a spinner forever on a failed/empty response.
        if (active) { setError(true); setLoading(false); }
      });
    return () => { active = false; };
  }, [router]);

  if (error) {
    return (
      <AdminLayout>
        <div className="flex flex-col items-center justify-center h-64 gap-4 text-center">
          <p className="text-gray-500 text-[14px]">Couldn&apos;t load dashboard data.</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-dark-brown text-cream px-5 py-2.5 rounded-xl text-[13px] font-semibold hover:bg-black transition-colors"
          >
            Retry
          </button>
        </div>
      </AdminLayout>
    );
  }

  if (loading || !data) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="w-7 h-7 border-2 border-gold border-t-transparent rounded-full animate-spin" />
        </div>
      </AdminLayout>
    );
  }

  const { totals, daily, byStatus, byPayment, topProducts, monthly } = data;
  const deliveryRate = totals.total_orders > 0
    ? Math.round((totals.delivered / totals.total_orders) * 100)
    : 0;

  const last7 = daily.slice(-7);
  const prev7Revenue = daily.slice(-14, -7).reduce((s, d) => s + d.revenue, 0);
  const curr7Revenue = last7.reduce((s, d) => s + d.revenue, 0);
  const revenueChange = prev7Revenue > 0
    ? `${((curr7Revenue - prev7Revenue) / prev7Revenue * 100).toFixed(0)}%`
    : null;

  return (
    <AdminLayout>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-[22px] font-extrabold text-gray-900 tracking-tight">Dashboard</h1>
          <p className="text-gray-400 text-[13px] mt-0.5">
            {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        </div>
        <div className="flex gap-2">
          <a
            href="/api/orders/export?format=csv"
            className="flex items-center gap-1.5 border border-gray-200 text-gray-600 px-4 py-2 rounded-xl text-[13px] font-semibold hover:border-gold hover:text-gold transition-colors"
          >
            <Download size={14} />
            CSV
          </a>
          <a
            href="/api/orders/export?format=xlsx"
            className="flex items-center gap-1.5 bg-dark-brown text-cream px-4 py-2 rounded-xl text-[13px] font-semibold hover:bg-black transition-colors"
          >
            <Download size={14} />
            Excel
          </a>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          label="Total Orders"
          value={totals.total_orders}
          sub={`${totals.today_orders} today`}
          Icon={ShoppingBag}
          color="text-blue-600 bg-blue-50"
        />
        <StatCard
          label="Total Revenue"
          value={`₹${(totals.total_revenue || 0).toLocaleString('en-IN')}`}
          sub={`₹${(totals.today_revenue || 0).toLocaleString('en-IN')} today`}
          Icon={IndianRupee}
          trend={revenueChange ?? undefined}
          color="text-gold bg-amber-50"
        />
        <StatCard
          label="Pending Orders"
          value={totals.pending}
          sub="Awaiting action"
          Icon={Clock}
          color="text-orange-500 bg-orange-50"
        />
        <StatCard
          label="Avg Order Value"
          value={`₹${Math.round(totals.avg_order_value || 0)}`}
          sub={`${deliveryRate}% delivered`}
          Icon={TrendingUp}
          color="text-purple-600 bg-purple-50"
        />
      </div>

      {/* Secondary stat row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          label="Today's Orders"
          value={totals.today_orders}
          Icon={CalendarDays}
          color="text-indigo-600 bg-indigo-50"
        />
        <StatCard
          label="Delivered"
          value={totals.delivered}
          sub={`${deliveryRate}% success rate`}
          Icon={PackageCheck}
          color="text-green-600 bg-green-50"
        />
        <StatCard
          label="Today's Revenue"
          value={`₹${(totals.today_revenue || 0).toLocaleString('en-IN')}`}
          Icon={IndianRupee}
          color="text-teal-600 bg-teal-50"
        />
        <StatCard
          label="Delivery Rate"
          value={`${deliveryRate}%`}
          sub={`${totals.total_orders} total orders`}
          Icon={Percent}
          color="text-rose-600 bg-rose-50"
        />
      </div>

      {/* Revenue chart — 30 days */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-6">
        <SectionHeader title="Revenue — Last 30 Days" sub="Daily revenue trend" />
        <ResponsiveContainer width="100%" height={240}>
          <AreaChart data={daily} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#D4960A" stopOpacity={0.15} />
                <stop offset="95%" stopColor="#D4960A" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
            <XAxis
              dataKey="date"
              tickFormatter={formatDate}
              tick={{ fontSize: 11, fill: '#9CA3AF' }}
              axisLine={false}
              tickLine={false}
              interval={4}
            />
            <YAxis
              tickFormatter={formatINR}
              tick={{ fontSize: 11, fill: '#9CA3AF' }}
              axisLine={false}
              tickLine={false}
              width={48}
            />
            <Tooltip
              formatter={(v: unknown) => [`₹${Number(v).toLocaleString('en-IN')}`, 'Revenue']}
              labelFormatter={(d) => formatDate(String(d))}
              contentStyle={{ borderRadius: 12, border: '1px solid #E5E7EB', fontSize: 12 }}
            />
            <Area
              type="monotone"
              dataKey="revenue"
              stroke="#D4960A"
              strokeWidth={2}
              fill="url(#revenueGrad)"
              dot={false}
              activeDot={{ r: 4, fill: '#D4960A' }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Orders chart + Status breakdown */}
      <div className="grid md:grid-cols-2 gap-6 mb-6">

        {/* Daily orders bar chart */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <SectionHeader title="Orders — Last 30 Days" sub="Daily order volume" />
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={daily} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" vertical={false} />
              <XAxis
                dataKey="date"
                tickFormatter={formatDate}
                tick={{ fontSize: 11, fill: '#9CA3AF' }}
                axisLine={false}
                tickLine={false}
                interval={6}
              />
              <YAxis
                tick={{ fontSize: 11, fill: '#9CA3AF' }}
                axisLine={false}
                tickLine={false}
                width={28}
                allowDecimals={false}
              />
              <Tooltip
                formatter={(v: unknown) => [Number(v), 'Orders']}
                labelFormatter={(d) => formatDate(String(d))}
                contentStyle={{ borderRadius: 12, border: '1px solid #E5E7EB', fontSize: 12 }}
              />
              <Bar dataKey="orders" fill="#2C1000" radius={[4, 4, 0, 0]} maxBarSize={24} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Status breakdown pie */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <SectionHeader title="Orders by Status" sub="Current distribution" />
          {byStatus.length === 0 ? (
            <div className="flex items-center justify-center h-[220px] text-gray-300 text-[14px]">No orders yet</div>
          ) : (
            <div className="flex items-center gap-4">
              <ResponsiveContainer width="55%" height={200}>
                <PieChart>
                  <Pie
                    data={byStatus}
                    dataKey="count"
                    nameKey="status"
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={2}
                  >
                    {byStatus.map((entry) => (
                      <Cell key={entry.status} fill={STATUS_COLORS[entry.status] || '#9CA3AF'} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(v: unknown) => [Number(v), 'Orders']}
                    contentStyle={{ borderRadius: 12, border: '1px solid #E5E7EB', fontSize: 12 }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex-1 space-y-2">
                {byStatus.map(s => (
                  <div key={s.status} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span
                        className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                        style={{ background: STATUS_COLORS[s.status] || '#9CA3AF' }}
                      />
                      <span className="text-[12px] text-gray-600 font-medium">{s.status}</span>
                    </div>
                    <span className="text-[12px] font-bold text-gray-900">{s.count}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Monthly revenue + Payment breakdown */}
      <div className="grid md:grid-cols-2 gap-6 mb-6">

        {/* Monthly bar chart */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <SectionHeader title="Monthly Revenue" sub="Last 6 months" />
          {monthly.length === 0 ? (
            <div className="flex items-center justify-center h-[220px] text-gray-300 text-[14px]">No data yet</div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={monthly} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" vertical={false} />
                <XAxis
                  dataKey="month"
                  tickFormatter={formatMonth}
                  tick={{ fontSize: 11, fill: '#9CA3AF' }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tickFormatter={formatINR}
                  tick={{ fontSize: 11, fill: '#9CA3AF' }}
                  axisLine={false}
                  tickLine={false}
                  width={48}
                />
                <Tooltip
                  formatter={(v: unknown) => [`₹${Number(v).toLocaleString('en-IN')}`, 'Revenue']}
                  labelFormatter={(m) => formatMonth(String(m))}
                  contentStyle={{ borderRadius: 12, border: '1px solid #E5E7EB', fontSize: 12 }}
                />
                <Bar dataKey="revenue" fill="#D4960A" radius={[6, 6, 0, 0]} maxBarSize={40} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Payment method */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <SectionHeader title="Payment Methods" sub="Revenue by method" />
          {byPayment.length === 0 ? (
            <div className="flex items-center justify-center h-[220px] text-gray-300 text-[14px]">No data yet</div>
          ) : (
            <div className="flex items-center gap-4">
              <ResponsiveContainer width="55%" height={200}>
                <PieChart>
                  <Pie
                    data={byPayment}
                    dataKey="revenue"
                    nameKey="payment_method"
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={2}
                  >
                    {byPayment.map((_, i) => (
                      <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(v: unknown) => [`₹${Number(v).toLocaleString('en-IN')}`, 'Revenue']}
                    contentStyle={{ borderRadius: 12, border: '1px solid #E5E7EB', fontSize: 12 }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex-1 space-y-3">
                {byPayment.map((p, i) => (
                  <div key={p.payment_method}>
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <span
                          className="w-2.5 h-2.5 rounded-full"
                          style={{ background: PIE_COLORS[i % PIE_COLORS.length] }}
                        />
                        <span className="text-[12px] text-gray-600 font-medium capitalize">
                          {p.payment_method === 'cod' ? 'Cash on Delivery' : 'UPI'}
                        </span>
                      </div>
                      <span className="text-[12px] font-bold text-gray-900">{p.count}</span>
                    </div>
                    <p className="text-[11px] text-gray-400 pl-4">₹{Number(p.revenue).toLocaleString('en-IN')}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Top products */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-6">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-[16px] font-extrabold text-gray-900 tracking-tight">Top Products</h2>
            <p className="text-[13px] text-gray-400 mt-0.5">By units sold</p>
          </div>
          <BarChart3 size={18} className="text-gray-300" />
        </div>
        {topProducts.length === 0 ? (
          <p className="text-gray-300 text-[14px] text-center py-8">No sales data yet</p>
        ) : (
          <div className="space-y-3">
            {topProducts.map((p, i) => {
              const maxQty = topProducts[0].qty_sold;
              return (
                <div key={i} className="flex items-center gap-4">
                  <span className="text-[12px] font-bold text-gray-300 w-4">{i + 1}</span>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[13px] font-semibold text-gray-800">
                        {p.product_name} <span className="font-normal text-gray-400">({p.weight})</span>
                      </span>
                      <div className="text-right">
                        <span className="text-[13px] font-bold text-gray-900">{p.qty_sold} units</span>
                        <span className="text-[11px] text-gray-400 ml-2">₹{Number(p.revenue).toLocaleString('en-IN')}</span>
                      </div>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-1.5">
                      <div
                        className="h-1.5 rounded-full bg-gold transition-all"
                        style={{ width: `${(p.qty_sold / maxQty) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { href: '/admin/orders', label: 'All Orders', Icon: ShoppingBag, color: 'bg-dark-brown text-cream hover:bg-black' },
          { href: '/admin/products', label: 'Products', Icon: PackageCheck, color: 'bg-white text-gray-700 border border-gray-200 hover:border-gold hover:text-gold' },
          { href: '/api/orders/export?format=csv', label: 'Export CSV', Icon: Download, color: 'bg-white text-gray-700 border border-gray-200 hover:border-gold hover:text-gold' },
          { href: '/api/orders/export?format=xlsx', label: 'Export Excel', Icon: Download, color: 'bg-white text-gray-700 border border-gray-200 hover:border-gold hover:text-gold' },
        ].map(({ href, label, Icon, color }) => (
          <a
            key={href}
            href={href}
            className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-[13px] font-semibold transition-colors ${color}`}
          >
            <Icon size={14} />
            {label}
          </a>
        ))}
      </div>
    </AdminLayout>
  );
}
