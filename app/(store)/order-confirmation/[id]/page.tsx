'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { CheckCircleIcon, WhatsAppIcon, TruckIcon, PackageIcon } from '@/components/Icons';

interface OrderItem {
  product_name: string;
  weight: string;
  quantity: number;
  price: number;
}

interface Order {
  order_id: string;
  customer_name: string;
  phone: string;
  total: number;
  payment_method: string;
  status: string;
  created_at: string;
  items: OrderItem[];
}

export default function OrderConfirmationPage() {
  const params = useParams();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetch(`/api/orders/${params.id}`)
      .then(r => {
        if (!r.ok) throw new Error();
        return r.json();
      })
      .then(data => {
        setOrder(data);
        setLoading(false);
      })
      .catch(() => {
        // Fall back to localStorage (used when no database is configured)
        try {
          const cached = localStorage.getItem(`ponkali_order_${params.id}`);
          if (cached) {
            setOrder(JSON.parse(cached));
            setLoading(false);
            return;
          }
        } catch { /* ignore */ }
        setError(true);
        setLoading(false);
      });
  }, [params.id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-gold border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center text-center px-5">
        <div>
          <h1 className="text-[28px] font-extrabold text-dark-brown mb-3">Order Not Found</h1>
          <p className="text-gray-500 mb-6">We couldn&apos;t find this order. If you just placed it, please check your WhatsApp for details.</p>
          <Link href="/shop" className="bg-dark-brown text-cream px-8 py-3.5 rounded-full font-semibold text-[15px] hover:bg-black transition-colors">
            Back to Shop
          </Link>
        </div>
      </div>
    );
  }

  const isCOD = order.payment_method === 'cod';
  const firstName = order.customer_name.split(' ')[0];
  const whatsappMsg = encodeURIComponent(
    `Hi! I just placed Order ${order.order_id} on Ponkali Masalas for ₹${order.total}. Can you confirm the dispatch details?`
  );

  return (
    <div className="min-h-screen bg-cream py-12 px-5">
      <div className="max-w-lg mx-auto">

        {/* Success header */}
        <div className="text-center mb-10">
          <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-5 border border-green-100">
            <CheckCircleIcon className="w-10 h-10 text-green-500" />
          </div>
          <h1 className="text-[30px] font-extrabold text-dark-brown tracking-tight mb-2">
            Order Confirmed
          </h1>
          <p className="text-gray-500 text-[15px] leading-relaxed">
            Thank you, {firstName}. Your order has been received and will be dispatched soon.
          </p>
        </div>

        {/* Order card */}
        <div className="bg-white border border-black/8 rounded-2xl p-6 mb-5">
          <div className="flex items-center justify-between mb-5 pb-5 border-b border-black/6">
            <div>
              <p className="text-[11px] text-gray-400 uppercase tracking-wider font-medium mb-1">Order ID</p>
              <p className="font-bold text-dark-brown text-[17px] tracking-wide">{order.order_id}</p>
            </div>
            <div className="text-right">
              <p className="text-[11px] text-gray-400 uppercase tracking-wider font-medium mb-1">Status</p>
              <span className="text-[12px] font-bold text-amber-700 bg-amber-50 px-3 py-1 rounded-full capitalize">
                {order.status}
              </span>
            </div>
          </div>

          {/* Items */}
          <div className="space-y-3 mb-5">
            {order.items.map((item, i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-gold/10 rounded-lg flex items-center justify-center">
                    <PackageIcon className="w-4 h-4 text-gold" />
                  </div>
                  <div>
                    <p className="text-[13px] font-semibold text-dark-brown">{item.product_name}</p>
                    <p className="text-[12px] text-gray-400">{item.weight} · Qty {item.quantity}</p>
                  </div>
                </div>
                <p className="font-semibold text-dark-brown text-[14px]">₹{item.price * item.quantity}</p>
              </div>
            ))}
          </div>

          <div className="border-t border-black/6 pt-4 flex items-center justify-between">
            <p className="font-bold text-dark-brown">Total</p>
            <p className="font-extrabold text-dark-brown text-[20px]">₹{order.total}</p>
          </div>
        </div>

        {/* Payment / delivery note */}
        <div className={`rounded-2xl p-5 mb-5 flex items-start gap-3 ${isCOD ? 'bg-amber-50 border border-amber-100' : 'bg-blue-50 border border-blue-100'}`}>
          <TruckIcon className={`w-5 h-5 flex-shrink-0 mt-0.5 ${isCOD ? 'text-amber-600' : 'text-blue-600'}`} />
          <div>
            <p className={`font-bold text-[14px] mb-1 ${isCOD ? 'text-amber-800' : 'text-blue-800'}`}>
              {isCOD ? 'Cash on Delivery' : 'UPI Payment'}
            </p>
            <p className={`text-[13px] leading-relaxed ${isCOD ? 'text-amber-700' : 'text-blue-700'}`}>
              {isCOD
                ? `Please keep ₹${order.total} ready at the time of delivery. Your order will be dispatched within 1–2 business days.`
                : 'Payment received. Your order will be dispatched within 1–2 business days.'}
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-3">
          <a
            href={`https://wa.me/919876543210?text=${whatsappMsg}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2.5 bg-[#25D366] text-white py-4 rounded-full font-semibold text-[15px] hover:bg-[#1fba58] transition-colors"
          >
            <WhatsAppIcon className="w-5 h-5" />
            Track via WhatsApp
          </a>
          <Link
            href="/shop"
            className="flex items-center justify-center py-4 rounded-full border-2 border-dark-brown/20 text-dark-brown font-semibold text-[15px] hover:border-dark-brown hover:bg-dark-brown hover:text-cream transition-all"
          >
            Continue Shopping
          </Link>
        </div>

        <p className="text-center text-gray-400 text-[12px] mt-8 leading-relaxed">
          Questions? Contact us at ponkalimasalas@gmail.com or WhatsApp +91 98765 43210
        </p>
      </div>
    </div>
  );
}
