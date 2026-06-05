'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import AdminLayout from '@/components/AdminLayout';
import { Download } from 'lucide-react';
import { Order } from '@/lib/types';

const STATUS_OPTIONS = ['All', 'Pending', 'Confirmed', 'Packed', 'Shipped', 'Delivered'];
const STATUS_COLORS: Record<string, string> = {
  Pending: 'bg-yellow-100 text-yellow-800',
  Confirmed: 'bg-blue-100 text-blue-800',
  Packed: 'bg-purple-100 text-purple-800',
  Shipped: 'bg-indigo-100 text-indigo-800',
  Delivered: 'bg-green-100 text-green-800',
};

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('All');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(page) });
    if (statusFilter !== 'All') params.set('status', statusFilter);
    if (search) params.set('search', search);

    const res = await fetch(`/api/orders?${params}`);
    if (res.status === 401) {
      router.push('/admin/login');
      return;
    }
    const data = await res.json();
    setOrders(data.orders || []);
    setTotal(data.total || 0);
    setLoading(false);
  }, [page, statusFilter, search, router]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const updateStatus = async (orderId: string, status: string) => {
    await fetch(`/api/orders/${orderId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    fetchOrders();
  };

  const totalPages = Math.ceil(total / 20);

  return (
    <AdminLayout>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-[22px] font-extrabold text-gray-900 tracking-tight">Orders</h1>
          <p className="text-gray-400 text-[13px] mt-0.5">{total} total orders</p>
        </div>
        <div className="flex gap-2">
          <a
            href="/api/orders/export?format=csv"
            className="flex items-center gap-1.5 border border-gray-200 text-gray-600 px-4 py-2 rounded-xl text-[13px] font-semibold hover:border-gold hover:text-gold transition-colors"
          >
            <Download size={13} />
            CSV
          </a>
          <a
            href="/api/orders/export?format=xlsx"
            className="flex items-center gap-1.5 bg-dark-brown text-cream px-4 py-2 rounded-xl text-[13px] font-semibold hover:bg-black transition-colors"
          >
            <Download size={13} />
            Excel
          </a>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl p-4 border border-gray-100 mb-6 flex flex-col sm:flex-row gap-3">
        <input
          type="text"
          placeholder="Search order ID or customer name..."
          value={search}
          onChange={e => { setSearch(e.target.value); setPage(1); }}
          className="flex-1 border border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-gold"
        />
        <div className="flex gap-2 flex-wrap">
          {STATUS_OPTIONS.map(s => (
            <button
              key={s}
              onClick={() => { setStatusFilter(s); setPage(1); }}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                statusFilter === s ? 'bg-gold text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                {['Order ID', 'Date', 'Customer', 'Phone', 'City', 'Items', 'Amount', 'Payment', 'Status', 'Actions'].map(h => (
                  <th key={h} className="px-4 py-3 text-left font-semibold text-gray-500 whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr>
                  <td colSpan={10} className="text-center py-10 text-gray-400">Loading orders...</td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={10} className="text-center py-10 text-gray-400">No orders found.</td>
                </tr>
              ) : orders.map(order => (
                <tr key={order.order_id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-mono text-xs font-bold text-dark-brown whitespace-nowrap">{order.order_id}</td>
                  <td className="px-4 py-3 text-gray-500 whitespace-nowrap">
                    {new Date(order.created_at).toLocaleDateString('en-IN')}
                  </td>
                  <td className="px-4 py-3 font-medium whitespace-nowrap">{order.customer_name}</td>
                  <td className="px-4 py-3 text-gray-600">{order.phone}</td>
                  <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{order.city}</td>
                  <td className="px-4 py-3 text-gray-600 text-xs max-w-32 truncate">{order.item_count ?? '—'}</td>
                  <td className="px-4 py-3 font-bold whitespace-nowrap">₹{order.total}</td>
                  <td className="px-4 py-3 text-gray-600 capitalize">{order.payment_method}</td>
                  <td className="px-4 py-3">
                    <select
                      value={order.status}
                      onChange={e => updateStatus(order.order_id, e.target.value)}
                      className={`text-xs font-semibold px-2 py-1 rounded-full border-0 focus:outline-none cursor-pointer ${STATUS_COLORS[order.status] || 'bg-gray-100 text-gray-700'}`}
                    >
                      {STATUS_OPTIONS.slice(1).map(s => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </td>
                  <td className="px-4 py-3">
                    <Link href={`/admin/orders/${order.order_id}`} className="text-gold hover:underline text-xs font-semibold">
                      View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-gray-100 flex items-center justify-between">
            <p className="text-sm text-gray-500">
              Page {page} of {totalPages} · {total} orders
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-1.5 rounded-lg border border-gray-200 text-sm disabled:opacity-50 hover:border-gold"
              >
                Previous
              </button>
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-3 py-1.5 rounded-lg border border-gray-200 text-sm disabled:opacity-50 hover:border-gold"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
