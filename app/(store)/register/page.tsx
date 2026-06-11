'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { EyeIcon, EyeOffIcon } from '@/components/Icons';

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (name.trim().length < 2) {
      setError('Please enter your name.');
      return;
    }
    // Normalise to a 10-digit mobile (mirror of the server's normalizePhone):
    // strip non-digits, then drop a 12-digit "91…" country code or an 11-digit
    // "0…" trunk prefix. Require a 10-digit number starting 6–9.
    let digits = phone.replace(/\D/g, '');
    if (digits.length === 12 && digits.startsWith('91')) digits = digits.slice(2);
    if (digits.length === 11 && digits.startsWith('0')) digits = digits.slice(1);
    if (!/^[6-9]\d{9}$/.test(digits)) {
      setError('Please enter a valid 10-digit mobile number.');
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), phone: digits, email: email.trim(), password }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Could not create account. Please try again.');
        return;
      }

      const redirect = new URLSearchParams(window.location.search).get('redirect') || '/';
      router.push(redirect);
      router.refresh();
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] bg-cream flex items-center justify-center px-5 py-16">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <p className="text-gold text-[11px] font-semibold tracking-[0.3em] uppercase mb-3">
            Join Ponkali
          </p>
          <h1 className="text-[28px] font-extrabold text-dark-brown tracking-tight">Create Account</h1>
          <p className="text-gray-500 text-[14px] mt-2">
            Create an account for faster checkout & order updates
          </p>
        </div>

        <div className="bg-white rounded-2xl p-8 border border-black/6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-[12px] font-semibold text-dark-brown uppercase tracking-wider mb-1.5">
                Full Name
              </label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                required
                autoComplete="name"
                placeholder="Your name"
                className="w-full border border-black/12 rounded-xl px-4 py-3 text-[14px] focus:outline-none focus:border-gold transition-colors bg-white"
              />
            </div>

            <div>
              <label className="block text-[12px] font-semibold text-dark-brown uppercase tracking-wider mb-1.5">
                Mobile Number
              </label>
              <input
                type="tel"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                required
                autoComplete="tel"
                inputMode="numeric"
                placeholder="9876543210"
                className="w-full border border-black/12 rounded-xl px-4 py-3 text-[14px] focus:outline-none focus:border-gold transition-colors bg-white"
              />
              <p className="text-[11px] text-gray-400 mt-1.5">You can sign in with this number.</p>
            </div>

            <div>
              <label className="block text-[12px] font-semibold text-dark-brown uppercase tracking-wider mb-1.5">
                Email <span className="text-gray-400 normal-case font-normal">(optional)</span>
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                autoComplete="email"
                placeholder="you@example.com"
                className="w-full border border-black/12 rounded-xl px-4 py-3 text-[14px] focus:outline-none focus:border-gold transition-colors bg-white"
              />
            </div>

            <div>
              <label className="block text-[12px] font-semibold text-dark-brown uppercase tracking-wider mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  autoComplete="new-password"
                  minLength={8}
                  placeholder="At least 8 characters"
                  className="w-full border border-black/12 rounded-xl px-4 py-3 pr-12 text-[14px] focus:outline-none focus:border-gold transition-colors bg-white"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(v => !v)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-dark-brown transition-colors"
                >
                  {showPassword ? <EyeOffIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
                </button>
              </div>
              <p className="text-[11px] text-gray-400 mt-1.5">Use at least 8 characters.</p>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-red-700 text-[13px]">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gold text-white py-3.5 rounded-full font-semibold text-[14px] hover:bg-dark-brown transition-colors disabled:opacity-50 mt-2"
            >
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>
        </div>

        <p className="text-center text-[14px] text-gray-500 mt-6">
          Already have an account?{' '}
          <Link href="/login" className="text-dark-brown font-semibold hover:text-gold transition-colors">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
