'use client';

import { useState } from 'react';
import { MailIcon, PhoneIcon, MapPinIcon, WhatsAppIcon } from '@/components/Icons';
import Mandala from '@/components/Mandala';

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      setStatus(res.ok ? 'success' : 'error');
      if (res.ok) setForm({ name: '', email: '', message: '' });
    } catch {
      setStatus('error');
    }
  };

  return (
    <div className="min-h-screen bg-cream">
      <div className="relative overflow-hidden py-24 px-5 text-center bg-dark-brown" >
        <Mandala className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[640px] h-[640px] text-white opacity-[0.08] pointer-events-none select-none" />
        <div className="relative z-10 bg-dark-brown">
          <p className="text-gold text-[11px] font-semibold tracking-[0.35em] uppercase mb-5">Reach Us</p>
          <h1 className="font-hero text-[42px] md:text-[56px] font-extrabold text-white tracking-tight mb-4">Get in Touch</h1>
          <p className="text-white/75 text-[17px] max-w-md mx-auto leading-[1.7]">
            Questions, bulk orders, or just want to say hello — we&apos;re here.
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-5 py-20">
        <div className="grid md:grid-cols-2 gap-14">
          {/* Contact info */}
          <div>
            <h2 className="font-hero text-[22px] font-extrabold text-dark-brown tracking-tight mb-8">Reach Us Directly</h2>

            <div className="space-y-6">
              {[
                { Icon: MailIcon, label: 'Email', value: 'ponkaliturmeric@gmail.com', href: 'mailto:ponkaliturmeric@gmail.com' },
                { Icon: PhoneIcon, label: 'Phone', value: '+91 99440 33696', href: 'tel:9944033696' },
                { Icon: MapPinIcon, label: 'Address', value: 'The Native, Perundurai\nErode — 638055, Tamil Nadu', href: null },
              ].map(({ Icon, label, value, href }) => (
                <div key={label} className="flex gap-4">
                  <div className="w-10 h-10 rounded-full bg-gold/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Icon className="w-4.5 h-4.5 text-gold" />
                  </div>
                  <div>
                    <p className="text-[11px] font-semibold text-gray-400 tracking-wider uppercase mb-1">{label}</p>
                    {href ? (
                      <a href={href} className="text-[15px] text-dark-brown hover:text-gold transition-colors font-medium">
                        {value}
                      </a>
                    ) : (
                      <p className="text-[15px] text-dark-brown font-medium whitespace-pre-line">{value}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <a
              href="https://wa.me/919944033696"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-10 inline-flex items-center gap-3 bg-[#25D366] text-white px-6 py-3 rounded-full font-semibold text-[14px] hover:bg-[#1EBE5A] transition-colors"
            >
              <WhatsAppIcon className="w-5 h-5" />
              Chat on WhatsApp
            </a>

            <div className="mt-10 bg-white rounded-2xl p-6 border border-black/6">
              <p className="font-bold text-dark-brown mb-2 text-[15px]">Bulk / Wholesale Enquiries</p>
              <p className="text-[14px] text-gray-500 leading-relaxed">
                Looking for large quantities for your restaurant, store, or gifting? Contact us directly for bulk pricing.
              </p>
            </div>
          </div>

          {/* Form */}
          <div className="bg-white rounded-2xl p-8 border border-black/6">
            <h2 className="font-hero text-[20px] font-extrabold text-dark-brown tracking-tight mb-7">Send a Message</h2>

            {status === 'success' ? (
              <div className="text-center py-10">
                <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-5">
                  <svg className="w-7 h-7 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </div>
                <p className="font-bold text-dark-brown text-[18px] mb-2">Message Sent</p>
                <p className="text-gray-400 text-[14px] mb-7">We&apos;ll get back to you within 24 hours.</p>
                <button
                  onClick={() => setStatus('idle')}
                  className="bg-gold text-white px-6 py-2.5 rounded-full font-semibold text-[14px] hover:bg-yellow-600 transition-colors"
                >
                  Send Another
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-[12px] font-semibold text-dark-brown/60 uppercase tracking-wider mb-2">Your Name *</label>
                  <input
                    name="name"
                    required
                    value={form.name}
                    onChange={handleChange}
                    placeholder="Priya Ramachandran"
                    className="w-full border border-black/10 rounded-xl px-4 py-3 text-[15px] focus:outline-none focus:border-gold transition-colors bg-gray-50/50 placeholder:text-gray-300"
                  />
                </div>
                <div>
                  <label className="block text-[12px] font-semibold text-dark-brown/60 uppercase tracking-wider mb-2">Email Address</label>
                  <input
                    name="email"
                    type="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="priya@example.com"
                    className="w-full border border-black/10 rounded-xl px-4 py-3 text-[15px] focus:outline-none focus:border-gold transition-colors bg-gray-50/50 placeholder:text-gray-300"
                  />
                </div>
                <div>
                  <label className="block text-[12px] font-semibold text-dark-brown/60 uppercase tracking-wider mb-2">Message *</label>
                  <textarea
                    name="message"
                    required
                    value={form.message}
                    onChange={handleChange}
                    rows={5}
                    placeholder="I&apos;d like to know more about..."
                    className="w-full border border-black/10 rounded-xl px-4 py-3 text-[15px] focus:outline-none focus:border-gold transition-colors resize-none bg-gray-50/50 placeholder:text-gray-300"
                  />
                </div>

                {status === 'error' && (
                  <p className="text-red-500 text-[13px]">Something went wrong. Please try again.</p>
                )}

                <button
                  type="submit"
                  disabled={status === 'loading'}
                  className="w-full bg-dark-brown text-cream py-3.5 rounded-full font-semibold text-[15px] hover:bg-black transition-colors disabled:opacity-50"
                >
                  {status === 'loading' ? 'Sending...' : 'Send Message'}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
