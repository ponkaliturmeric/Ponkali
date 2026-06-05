'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import AdminLayout from '@/components/AdminLayout';
import { Order } from '@/lib/types';

interface OrderWithHistory extends Order {
  history?: { status: string; changed_at: string; notes?: string }[];
}

const STATUS_OPTIONS = ['Pending', 'Confirmed', 'Packed', 'Shipped', 'Delivered'];
const STATUS_COLORS: Record<string, string> = {
  Pending: 'bg-yellow-100 text-yellow-800',
  Confirmed: 'bg-blue-100 text-blue-800',
  Packed: 'bg-purple-100 text-purple-800',
  Shipped: 'bg-indigo-100 text-indigo-800',
  Delivered: 'bg-green-100 text-green-800',
};

export default function AdminOrderDetailPage({ params }: { params: { id: string } }) {
  const [order, setOrder] = useState<OrderWithHistory | null>(null);
  const [loading, setLoading] = useState(true);
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const router = useRouter();

  useEffect(() => {
    fetch(`/api/orders/${params.id}`)
      .then(r => {
        if (r.status === 401) { router.push('/admin/login'); return null; }
        return r.json();
      })
      .then(data => {
        if (data) {
          setOrder(data);
          setNotes(data.notes || '');
        }
        setLoading(false);
      });
  }, [params.id, router]);

  const updateStatus = async (status: string) => {
    setSaving(true);
    const res = await fetch(`/api/orders/${params.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    const data = await res.json();
    setOrder(data);
    setSaving(false);
  };

  const saveNotes = async () => {
    setSaving(true);
    await fetch(`/api/orders/${params.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ notes }),
    });
    setSaving(false);
  };

  const printOrder = () => window.print();

  if (loading) {
    return (
      <AdminLayout>
        <div className="text-center py-16 text-gray-400">Loading order...</div>
      </AdminLayout>
    );
  }

  if (!order) {
    return (
      <AdminLayout>
        <div className="text-center py-16">
          <p className="text-gray-500 mb-4">Order not found.</p>
          <Link href="/admin/orders" className="text-gold hover:underline">Back to Orders</Link>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="flex items-center justify-between mb-6">
        <div>
          <Link href="/admin/orders" className="text-sm text-gray-500 hover:text-gold mb-1 block">← Back to Orders</Link>
          <h1 className="text-2xl font-black text-gray-900">{order.order_id}</h1>
          <p className="text-gray-500 text-sm">{new Date(order.created_at).toLocaleString('en-IN')}</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={printOrder}
            className="border border-gray-300 text-gray-700 px-4 py-2 rounded-xl text-sm font-semibold hover:border-gold"
          >
            Print Slip
          </button>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Customer & order details */}
        <div className="md:col-span-2 space-y-5">
          {/* Customer */}
          <div className="bg-white rounded-2xl p-6 border border-gray-100">
            <h2 className="font-black text-gray-900 mb-4">Customer Details</h2>
            <div className="grid sm:grid-cols-2 gap-3 text-sm">
              {[
                ['Name', order.customer_name],
                ['Phone', order.phone],
                ['Email', order.email || '—'],
                ['City', `${order.city}, ${order.state}`],
                ['PIN', order.pincode],
                ['Payment', order.payment_method === 'cod' ? 'Cash on Delivery' : 'Online (Razorpay)'],
              ].map(([label, value]) => (
                <div key={label}>
                  <p className="text-gray-500 font-medium">{label}</p>
                  <p className="text-gray-900 font-semibold">{value}</p>
                </div>
              ))}
              <div className="sm:col-span-2">
                <p className="text-gray-500 font-medium">Delivery Address</p>
                <p className="text-gray-900 font-semibold">
                  {order.address_line1}
                  {order.address_line2 && `, ${order.address_line2}`}
                  {order.landmark && ` (Near ${order.landmark})`}
                </p>
              </div>
            </div>
          </div>

          {/* Order items */}
          <div className="bg-white rounded-2xl p-6 border border-gray-100">
            <h2 className="font-black text-gray-900 mb-4">Order Items</h2>
            <div className="space-y-3">
              {(order.items || []).map((item, i) => (
                <div key={i} className="flex justify-between items-center text-sm py-2 border-b border-gray-50 last:border-0">
                  <div>
                    <p className="font-semibold text-gray-900">{item.product_name} ({item.weight})</p>
                    <p className="text-gray-500">Qty: {item.quantity} × ₹{item.price}</p>
                  </div>
                  <p className="font-bold text-gray-900">₹{item.price * item.quantity}</p>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal</span>
                <span>₹{order.subtotal}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Shipping</span>
                <span>{order.shipping === 0 ? 'FREE' : `₹${order.shipping}`}</span>
              </div>
              {order.cod_charge > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-600">COD Charge</span>
                  <span>₹{order.cod_charge}</span>
                </div>
              )}
              <div className="flex justify-between font-black text-gray-900 text-base border-t pt-2">
                <span>Total</span>
                <span>₹{order.total}</span>
              </div>
            </div>
          </div>

          {/* Notes */}
          <div className="bg-white rounded-2xl p-6 border border-gray-100">
            <h2 className="font-black text-gray-900 mb-3">Internal Notes</h2>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              rows={3}
              placeholder="Add internal notes about this order..."
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-gold resize-none"
            />
            <button
              onClick={saveNotes}
              disabled={saving}
              className="mt-2 bg-gray-900 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-gray-700 disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save Notes'}
            </button>
          </div>
        </div>

        {/* Sidebar: status + timeline */}
        <div className="space-y-5">
          {/* Update status */}
          <div className="bg-white rounded-2xl p-6 border border-gray-100">
            <h2 className="font-black text-gray-900 mb-3">Order Status</h2>
            <div className="mb-4">
              <span className={`px-3 py-1.5 rounded-full text-sm font-bold ${STATUS_COLORS[order.status] || 'bg-gray-100 text-gray-700'}`}>
                {order.status}
              </span>
            </div>
            <p className="text-sm text-gray-500 mb-3">Update status:</p>
            <div className="space-y-2">
              {STATUS_OPTIONS.map(s => (
                <button
                  key={s}
                  onClick={() => updateStatus(s)}
                  disabled={s === order.status || saving}
                  className={`w-full text-left px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors border ${
                    s === order.status
                      ? 'border-gold bg-gold/10 text-gold cursor-default'
                      : 'border-gray-200 hover:border-gold hover:text-gold'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Status timeline */}
          {order.history && order.history.length > 0 && (
            <div className="bg-white rounded-2xl p-6 border border-gray-100">
              <h2 className="font-black text-gray-900 mb-4">Timeline</h2>
              <div className="space-y-3">
                {order.history.map((h, i) => (
                  <div key={i} className="flex gap-3 text-sm">
                    <div className="flex flex-col items-center">
                      <div className="w-3 h-3 rounded-full bg-gold mt-0.5 flex-shrink-0" />
                      {i < order.history!.length - 1 && <div className="w-0.5 flex-1 bg-gray-200 mt-1" />}
                    </div>
                    <div className="pb-3">
                      <p className="font-semibold text-gray-900">{h.status}</p>
                      <p className="text-gray-400 text-xs">
                        {new Date(h.changed_at).toLocaleString('en-IN')}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
