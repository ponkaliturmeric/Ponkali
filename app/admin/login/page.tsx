'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminLoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      if (res.ok) {
        router.push('/admin/dashboard');
      } else {
        setError('Invalid username or password.');
      }
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-dark-brown flex items-center justify-center px-5">
      <div className="w-full max-w-sm">

        {/* Brand */}
        <div className="text-center mb-10">
          <p className="font-extrabold text-[28px] tracking-brand text-gold mb-1">PONKALI</p>
          <p className="text-cream/30 text-[13px] font-medium tracking-widest uppercase">Admin Panel</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl p-8">
          <h2 className="font-extrabold text-dark-brown text-[20px] tracking-tight mb-6">Sign In</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-[12px] font-semibold text-dark-brown uppercase tracking-wider mb-1.5">
                Username
              </label>
              <input
                type="text"
                value={username}
                onChange={e => setUsername(e.target.value)}
                required
                autoComplete="username"
                placeholder="ponkali_admin"
                className="w-full border border-black/12 rounded-xl px-4 py-3 text-[14px] focus:outline-none focus:border-gold transition-colors"
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
                className="w-full border border-black/12 rounded-xl px-4 py-3 text-[14px] focus:outline-none focus:border-gold transition-colors"
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

          <p className="text-[11px] text-gray-300 text-center mt-5">Session expires after 24 hours</p>
        </div>

        <p className="text-center mt-6">
          <a href="/" className="text-cream/30 text-[12px] hover:text-cream/60 transition-colors">
            ← Back to Store
          </a>
        </p>
      </div>
    </div>
  );
}
