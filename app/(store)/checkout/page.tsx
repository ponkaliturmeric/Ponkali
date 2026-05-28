'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useCart } from '@/components/CartContext';
import { ShieldCheckIcon, TruckIcon } from '@/components/Icons';

const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka',
  'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram',
  'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu',
  'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
  'Andaman and Nicobar Islands', 'Chandigarh', 'Dadra and Nagar Haveli and Daman and Diu',
  'Delhi', 'Jammu and Kashmir', 'Ladakh', 'Lakshadweep', 'Puducherry',
];

const inputClass = 'w-full border border-black/12 rounded-xl px-4 py-3 text-[14px] focus:outline-none focus:border-gold transition-colors bg-white placeholder:text-gray-300';
const labelClass = 'block text-[12px] font-semibold text-dark-brown uppercase tracking-wider mb-1.5';

export default function CheckoutPage() {
  const { items, subtotal, clearCart } = useCart();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'upi' | 'cod'>('upi');

  const [form, setForm] = useState({
    customer_name: '',
    phone: '',
    email: '',
    address_line1: '',
    address_line2: '',
    city: '',
    state: 'Tamil Nadu',
    pincode: '',
    landmark: '',
    upi_id: '',
  });

  const shipping = subtotal >= 399 ? 0 : 60;
  const codCharge = paymentMethod === 'cod' ? 30 : 0;
  const total = subtotal + shipping + codCharge;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (items.length === 0) {
      setError('Your cart is empty.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          payment_method: paymentMethod,
          subtotal,
          shipping,
          cod_charge: codCharge,
          total,
          items: items.map(i => ({
            product_name: i.product.name,
            weight: i.product.weight,
            quantity: i.quantity,
            price: i.product.price,
          })),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Something went wrong. Please try again.');
        return;
      }

      // Save order to localStorage so confirmation page can display it without a DB
      try {
        localStorage.setItem(`ponkali_order_${data.order_id}`, JSON.stringify({
          order_id: data.order_id,
          customer_name: form.customer_name,
          phone: form.phone,
          total,
          payment_method: paymentMethod,
          status: 'Pending',
          created_at: new Date().toISOString(),
          items: items.map(i => ({
            product_name: i.product.name,
            weight: i.product.weight,
            quantity: i.quantity,
            price: i.product.price,
          })),
        }));
      } catch { /* ignore if localStorage unavailable */ }

      clearCart();
      router.push(`/order-confirmation/${data.order_id}`);
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-cream flex flex-col items-center justify-center px-5 text-center">
        <h1 className="text-[28px] font-extrabold text-dark-brown tracking-tight mb-3">Your cart is empty</h1>
        <p className="text-gray-500 mb-7 text-[16px]">Add something from the shop before checking out.</p>
        <Link href="/shop" className="bg-dark-brown text-cream px-9 py-3.5 rounded-full font-semibold text-[15px] hover:bg-black transition-colors">
          Browse Products
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream">
      <div className="max-w-5xl mx-auto px-5 py-12">
        <h1 className="text-[32px] font-extrabold text-dark-brown tracking-tight mb-10">Checkout</h1>

        <form onSubmit={handleSubmit}>
          <div className="grid md:grid-cols-3 gap-7">
            {/* Left — Form */}
            <div className="md:col-span-2 space-y-5">

              {/* Contact */}
              <div className="bg-white rounded-2xl p-6 border border-black/6">
                <h2 className="font-extrabold text-dark-brown text-[17px] tracking-tight mb-5">Contact Details</h2>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <label className={labelClass}>Full Name *</label>
                    <input name="customer_name" required value={form.customer_name} onChange={handleChange}
                      placeholder="Ramesh Kumar" className={inputClass} />
                  </div>
                  <div>
                    <label className={labelClass}>Phone (WhatsApp) *</label>
                    <input name="phone" required type="tel" value={form.phone} onChange={handleChange}
                      placeholder="9876543210" className={inputClass} />
                  </div>
                  <div>
                    <label className={labelClass}>Email</label>
                    <input name="email" type="email" value={form.email} onChange={handleChange}
                      placeholder="you@example.com" className={inputClass} />
                  </div>
                </div>
              </div>

              {/* Delivery */}
              <div className="bg-white rounded-2xl p-6 border border-black/6">
                <h2 className="font-extrabold text-dark-brown text-[17px] tracking-tight mb-5">Delivery Address</h2>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <label className={labelClass}>House / Flat No., Street *</label>
                    <input name="address_line1" required value={form.address_line1} onChange={handleChange}
                      placeholder="Flat 3B, Anna Nagar" className={inputClass} />
                  </div>
                  <div className="sm:col-span-2">
                    <label className={labelClass}>Area / Locality</label>
                    <input name="address_line2" value={form.address_line2} onChange={handleChange}
                      placeholder="Near Saravana Stores (optional)" className={inputClass} />
                  </div>
                  <div>
                    <label className={labelClass}>City *</label>
                    <input name="city" required value={form.city} onChange={handleChange}
                      placeholder="Chennai" className={inputClass} />
                  </div>
                  <div>
                    <label className={labelClass}>PIN Code *</label>
                    <input name="pincode" required value={form.pincode} onChange={handleChange}
                      placeholder="600001" className={inputClass} />
                  </div>
                  <div className="sm:col-span-2">
                    <label className={labelClass}>State *</label>
                    <select name="state" required value={form.state} onChange={handleChange}
                      className={inputClass}>
                      {INDIAN_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                  <div className="sm:col-span-2">
                    <label className={labelClass}>Landmark</label>
                    <input name="landmark" value={form.landmark} onChange={handleChange}
                      placeholder="Opposite Apollo Hospital (optional)" className={inputClass} />
                  </div>
                </div>
              </div>

              {/* Payment */}
              <div className="bg-white rounded-2xl p-6 border border-black/6">
                <h2 className="font-extrabold text-dark-brown text-[17px] tracking-tight mb-5">Payment</h2>
                <div className="space-y-3">
                  <label className={`flex items-start gap-4 p-4 rounded-xl border-2 cursor-pointer transition-colors ${paymentMethod === 'upi' ? 'border-dark-brown bg-dark-brown/[0.02]' : 'border-black/10 hover:border-black/20'}`}>
                    <input type="radio" name="payment" value="upi" checked={paymentMethod === 'upi'}
                      onChange={() => setPaymentMethod('upi')} className="mt-1 accent-gold" />
                    <div className="flex-1">
                      <p className="font-semibold text-dark-brown text-[15px]">UPI Payment</p>
                      <p className="text-[13px] text-gray-400 mt-0.5">Google Pay, PhonePe, Paytm, BHIM</p>
                      {paymentMethod === 'upi' && (
                        <div className="mt-3">
                          <input name="upi_id" value={form.upi_id} onChange={handleChange}
                            placeholder="yourname@upi" className={inputClass} />
                          <p className="text-[12px] text-gray-400 mt-2">
                            We&apos;ll send a payment request after confirming your order.
                          </p>
                        </div>
                      )}
                    </div>
                  </label>

                  <label className={`flex items-start gap-4 p-4 rounded-xl border-2 cursor-pointer transition-colors ${paymentMethod === 'cod' ? 'border-dark-brown bg-dark-brown/[0.02]' : 'border-black/10 hover:border-black/20'}`}>
                    <input type="radio" name="payment" value="cod" checked={paymentMethod === 'cod'}
                      onChange={() => setPaymentMethod('cod')} className="mt-1 accent-gold" />
                    <div>
                      <p className="font-semibold text-dark-brown text-[15px]">Cash on Delivery</p>
                      <p className="text-[13px] text-gray-400 mt-0.5">Pay when delivered · +₹30 COD charge</p>
                    </div>
                  </label>
                </div>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700 text-[14px]">
                  {error}
                </div>
              )}
            </div>

            {/* Right — Summary */}
            <div className="md:col-span-1">
              <div className="bg-white rounded-2xl p-6 border border-black/6 sticky top-24">
                <h2 className="font-extrabold text-dark-brown text-[17px] tracking-tight mb-5">Order Summary</h2>

                <div className="space-y-3 mb-5">
                  {items.map(item => (
                    <div key={item.product.slug} className="flex justify-between text-[13px]">
                      <span className="text-gray-500 flex-1 pr-3 leading-snug">
                        {item.product.name} {item.product.weight}
                        {item.quantity > 1 && <span className="text-gray-400"> ×{item.quantity}</span>}
                      </span>
                      <span className="font-semibold text-dark-brown flex-shrink-0">₹{item.product.price * item.quantity}</span>
                    </div>
                  ))}
                </div>

                <div className="border-t border-black/6 pt-4 space-y-2.5 mb-5">
                  <div className="flex justify-between text-[13px]">
                    <span className="text-gray-500">Subtotal</span>
                    <span className="font-semibold">₹{subtotal}</span>
                  </div>
                  <div className="flex justify-between text-[13px]">
                    <span className="text-gray-500">Shipping</span>
                    <span className={`font-semibold ${shipping === 0 ? 'text-green-600' : ''}`}>
                      {shipping === 0 ? 'Free' : `₹${shipping}`}
                    </span>
                  </div>
                  {paymentMethod === 'cod' && (
                    <div className="flex justify-between text-[13px]">
                      <span className="text-gray-500">COD Charge</span>
                      <span className="font-semibold">₹30</span>
                    </div>
                  )}
                </div>

                <div className="border-t border-black/6 pt-4 flex justify-between items-center mb-5">
                  <span className="font-extrabold text-dark-brown text-[16px]">Total</span>
                  <span className="font-extrabold text-dark-brown text-[22px]">₹{total}</span>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-dark-brown text-cream py-4 rounded-full font-semibold text-[15px] hover:bg-black transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Placing Order...' : 'Place Order'}
                </button>

                <div className="mt-4 flex items-center gap-2 justify-center">
                  <ShieldCheckIcon className="w-3.5 h-3.5 text-gray-300" />
                  <p className="text-[11px] text-gray-300">Secure checkout · 3–5 day delivery</p>
                </div>

                <div className="mt-4 flex items-center gap-2 text-[12px] text-green-600 bg-green-50 rounded-xl px-3 py-2.5">
                  <TruckIcon className="w-3.5 h-3.5 flex-shrink-0" />
                  {subtotal >= 399
                    ? 'Free shipping applied'
                    : `Add ₹${399 - subtotal} more for free shipping`}
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
