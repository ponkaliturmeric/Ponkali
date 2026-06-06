'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Script from 'next/script';
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
  const [paymentMethod, setPaymentMethod] = useState<'online' | 'cod'>('online');

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

  const cartPayload = () => items.map(i => ({ slug: i.product.slug, quantity: i.quantity }));

  const persistOrder = (orderId: string, method: 'online' | 'cod', paid: boolean) => {
    // Save order locally so the confirmation page can render it without a DB.
    try {
      localStorage.setItem(`ponkali_order_${orderId}`, JSON.stringify({
        order_id: orderId,
        customer_name: form.customer_name,
        phone: form.phone,
        total,
        payment_method: method,
        status: paid ? 'Paid' : 'Pending',
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
    router.push(`/order-confirmation/${orderId}`);
  };

  // Cash on Delivery — record the order, collect payment on delivery.
  const placeCodOrder = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          payment_method: 'cod',
          // Server recomputes prices/shipping/total from these slug+qty pairs.
          items: cartPayload(),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Something went wrong. Please try again.');
        setLoading(false);
        return;
      }
      persistOrder(data.order_id, 'cod', false);
    } catch {
      setError('Network error. Please try again.');
      setLoading(false);
    }
  };

  // Online payment via Razorpay Checkout — amount is computed & verified server-side.
  const payWithRazorpay = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/razorpay/order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: cartPayload() }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Could not start payment. Please try again.');
        setLoading(false);
        return;
      }

      const RazorpayCtor = (window as unknown as {
        Razorpay?: new (o: Record<string, unknown>) => {
          open: () => void;
          on: (e: string, cb: (r: { error?: { description?: string } }) => void) => void;
        };
      }).Razorpay;

      if (!RazorpayCtor) {
        setError('Payment library failed to load. Please refresh and try again.');
        setLoading(false);
        return;
      }

      const rzp = new RazorpayCtor({
        key: data.keyId,
        amount: data.amount,
        currency: data.currency,
        name: 'Ponkali Masalas',
        description: 'Pure Erode Turmeric Order Payment',
        image: '/images/logo.jpg',
        order_id: data.orderId,
        prefill: {
          name: form.customer_name,
          email: form.email,
          contact: form.phone,
        },
        notes: {
          address: `${form.address_line1}, ${form.city}, ${form.state} ${form.pincode}`,
        },
        theme: { color: '#E8950A' },
        handler: async (response: {
          razorpay_order_id: string;
          razorpay_payment_id: string;
          razorpay_signature: string;
        }) => {
          try {
            const verifyRes = await fetch('/api/razorpay/verify', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                customer: { ...form, items: cartPayload() },
              }),
            });
            const verifyData = await verifyRes.json();
            if (!verifyRes.ok) {
              setError(verifyData.error || 'Payment could not be verified. If money was deducted, please contact us.');
              setLoading(false);
              return;
            }
            persistOrder(verifyData.order_id, 'online', true);
          } catch {
            setError('Could not verify payment. If money was deducted, please contact us.');
            setLoading(false);
          }
        },
        modal: {
          ondismiss: () => setLoading(false),
        },
      });

      rzp.on('payment.failed', (resp) => {
        setError(resp.error?.description || 'Payment failed. Please try again.');
        setLoading(false);
      });
      rzp.open();
    } catch {
      setError('Network error. Please try again.');
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (items.length === 0) {
      setError('Your cart is empty.');
      return;
    }
    if (paymentMethod === 'online') {
      await payWithRazorpay();
    } else {
      await placeCodOrder();
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
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="afterInteractive" />
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
                  <label className={`flex items-start gap-4 p-4 rounded-xl border-2 cursor-pointer transition-colors ${paymentMethod === 'online' ? 'border-dark-brown bg-dark-brown/[0.02]' : 'border-black/10 hover:border-black/20'}`}>
                    <input type="radio" name="payment" value="online" checked={paymentMethod === 'online'}
                      onChange={() => setPaymentMethod('online')} className="mt-1 accent-gold" />
                    <div className="flex-1">
                      <p className="font-semibold text-dark-brown text-[15px]">Pay Online</p>
                      <p className="text-[13px] text-gray-400 mt-0.5">UPI · Cards · Netbanking · Wallets, secured by Razorpay</p>
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
                  {loading
                    ? (paymentMethod === 'online' ? 'Processing…' : 'Placing Order…')
                    : (paymentMethod === 'online' ? `Pay ₹${total}` : 'Place Order')}
                </button>

                <div className="mt-4 flex items-center gap-2 justify-center">
                  <ShieldCheckIcon className="w-3.5 h-3.5 text-gray-300" />
                  <p className="text-[11px] text-gray-300">Secure checkout · 3 to 5 day delivery</p>
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
