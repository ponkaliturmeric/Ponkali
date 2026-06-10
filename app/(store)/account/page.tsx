'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { PackageIcon } from '@/components/Icons';

interface OrderSummary {
  order_id: string;
  created_at: string;
  total: number;
  status: string;
  payment_method: string;
  item_count: number;
}

const STATUS_STYLES: Record<string, string> = {
  Pending: 'text-amber-700 bg-amber-50',
  Paid: 'text-blue-700 bg-blue-50',
  Confirmed: 'text-blue-700 bg-blue-50',
  Packed: 'text-purple-700 bg-purple-50',
  Shipped: 'text-cyan-700 bg-cyan-50',
  Delivered: 'text-green-700 bg-green-50',
  Cancelled: 'text-red-700 bg-red-50',
};

const formatDate = (d: string) =>
  new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

export default function AccountPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<OrderSummary[] | null>(null);
  const [profile, setProfile] = useState<{ email: string | null; name: string | null }>({ email: null, name: null });
  const [error, setError] = useState(false);

  useEffect(() => {
    let active = true;

    // Profile info for the signed-in customer.
    fetch('/api/auth/me')
      .then((r) => r.json())
      .then((d) => {
        if (active) setProfile({ email: d.user?.email ?? null, name: d.user?.name ?? null });
      })
      .catch(() => {});

    fetch('/api/account/orders')
      .then((r) => {
        if (r.status === 401) {
          router.push('/login?redirect=/account');
          return null;
        }
        if (!r.ok) throw new Error();
        return r.json();
      })
      .then((data) => {
        if (active && data) setOrders(data.orders);
      })
      .catch(() => {
        if (active) setError(true);
      });
    return () => {
      active = false;
    };
  }, [router]);

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/');
    router.refresh();
  };

  return (
    <div className="min-h-[80vh] bg-cream px-5 py-12">
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <p className="text-gold text-[11px] font-semibold tracking-[0.3em] uppercase mb-2">Your Account</p>
          <h1 className="text-[28px] font-extrabold text-dark-brown tracking-tight">My Account</h1>
        </div>

        {/* Profile */}
        <div className="bg-white border border-black/6 rounded-2xl p-6 mb-8 flex items-center justify-between gap-4">
          <div className="min-w-0">
            {profile.name && (
              <p className="font-bold text-dark-brown text-[17px] truncate mb-0.5">{profile.name}</p>
            )}
            <p className="text-[11px] text-gray-400 font-semibold uppercase tracking-wider mb-0.5">Email</p>
            <p className="font-medium text-dark-brown text-[14px] truncate">
              {profile.email ?? '—'}
            </p>
          </div>
          <button
            onClick={handleLogout}
            className="flex-shrink-0 border border-dark-brown/20 text-dark-brown px-5 py-2.5 rounded-full text-[13px] font-semibold hover:bg-dark-brown hover:text-cream transition-colors"
          >
            Sign Out
          </button>
        </div>

        <h2 className="text-[18px] font-bold text-dark-brown mb-4">My Orders</h2>

        {/* Error */}
        {error && (
          <div className="bg-white border border-black/6 rounded-2xl p-8 text-center">
            <p className="text-gray-500 text-[14px] mb-4">Couldn&apos;t load your orders.</p>
            <button
              onClick={() => window.location.reload()}
              className="bg-dark-brown text-cream px-6 py-2.5 rounded-full text-[13px] font-semibold hover:bg-black transition-colors"
            >
              Retry
            </button>
          </div>
        )}

        {/* Loading */}
        {!error && orders === null && (
          <div className="flex items-center justify-center h-48">
            <div className="w-7 h-7 border-2 border-gold border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {/* Empty */}
        {!error && orders !== null && orders.length === 0 && (
          <div className="bg-white border border-black/6 rounded-2xl p-10 text-center">
            <div className="w-14 h-14 rounded-full bg-cream flex items-center justify-center mx-auto mb-4">
              <PackageIcon className="w-6 h-6 text-gold/60" />
            </div>
            <p className="font-semibold text-dark-brown mb-1">No orders yet</p>
            <p className="text-[14px] text-gray-400 mb-6">When you place an order it&apos;ll show up here.</p>
            <Link
              href="/shop"
              className="inline-block bg-dark-brown text-cream px-7 py-3 rounded-full text-[14px] font-semibold hover:bg-black transition-colors"
            >
              Browse Products
            </Link>
          </div>
        )}

        {/* Orders list */}
        {!error && orders !== null && orders.length > 0 && (
          <div className="space-y-3">
            {orders.map((o) => (
              <Link
                key={o.order_id}
                href={`/order-confirmation/${o.order_id}`}
                className="block bg-white border border-black/6 rounded-2xl p-5 hover:border-gold/50 transition-colors"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-bold text-dark-brown text-[15px] tracking-wide">{o.order_id}</p>
                    <p className="text-[12px] text-gray-400 mt-0.5">
                      {formatDate(o.created_at)} · {o.item_count} {o.item_count === 1 ? 'item' : 'items'} ·{' '}
                      {o.payment_method === 'cod' ? 'Cash on Delivery' : 'Paid online'}
                    </p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="font-extrabold text-dark-brown text-[16px]">₹{o.total.toLocaleString('en-IN')}</p>
                    <span
                      className={`inline-block text-[11px] font-bold px-2.5 py-0.5 rounded-full mt-1 capitalize ${
                        STATUS_STYLES[o.status] || 'text-gray-600 bg-gray-100'
                      }`}
                    >
                      {o.status}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
