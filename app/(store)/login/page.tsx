'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Could not sign in. Please try again.');
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
            Welcome Back
          </p>
          <h1 className="text-[28px] font-extrabold text-dark-brown tracking-tight">Sign In</h1>
          <p className="text-gray-500 text-[14px] mt-2">
            Sign in to your Ponkali account
          </p>
        </div>

        <div className="bg-white rounded-2xl p-8 border border-black/6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-[12px] font-semibold text-dark-brown uppercase tracking-wider mb-1.5">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                autoComplete="email"
                placeholder="you@example.com"
                className="w-full border border-black/12 rounded-xl px-4 py-3 text-[14px] focus:outline-none focus:border-gold transition-colors bg-white"
              />
            </div>

            <div>
              <label className="block text-[12px] font-semibold text-dark-brown uppercase tracking-wider mb-1.5">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                placeholder="••••••••••••"
                className="w-full border border-black/12 rounded-xl px-4 py-3 text-[14px] focus:outline-none focus:border-gold transition-colors bg-white"
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-red-700 text-[13px]">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-dark-brown text-cream py-3.5 rounded-full font-semibold text-[14px] hover:bg-black transition-colors disabled:opacity-50 mt-2"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>
        </div>

        <p className="text-center text-[14px] text-gray-500 mt-6">
          New to Ponkali?{' '}
          <Link href="/register" className="text-dark-brown font-semibold hover:text-gold transition-colors">
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
}
