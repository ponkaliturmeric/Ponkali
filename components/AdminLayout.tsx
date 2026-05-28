'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';
import {
  LayoutDashboard, ShoppingBag, Package, Menu, X,
  LogOut, ExternalLink,
} from 'lucide-react';

const NAV = [
  { href: '/admin/dashboard', label: 'Dashboard', Icon: LayoutDashboard },
  { href: '/admin/orders', label: 'Orders', Icon: ShoppingBag },
  { href: '/admin/products', label: 'Products', Icon: Package },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = async () => {
    setLoggingOut(true);
    await fetch('/api/admin/logout', { method: 'POST' });
    router.push('/admin/login');
  };

  const isActive = (href: string) =>
    pathname === href || (href !== '/admin/dashboard' && pathname.startsWith(href));

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-56 bg-dark-brown flex flex-col transform transition-transform duration-200 md:relative md:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="px-5 py-5 border-b border-white/8">
          <Link href="/admin/dashboard" onClick={() => setSidebarOpen(false)}>
            <p className="font-extrabold text-[15px] tracking-brand text-gold">PONKALI</p>
            <p className="text-[11px] text-white/30 mt-0.5 font-medium tracking-widest uppercase">Admin</p>
          </Link>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-0.5">
          {NAV.map(({ href, label, Icon }) => (
            <Link
              key={href}
              href={href}
              onClick={() => setSidebarOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium transition-colors ${
                isActive(href)
                  ? 'bg-gold/15 text-gold'
                  : 'text-white/50 hover:text-white hover:bg-white/5'
              }`}
            >
              <Icon size={15} strokeWidth={isActive(href) ? 2 : 1.5} />
              {label}
            </Link>
          ))}
        </nav>

        <div className="px-3 py-4 border-t border-white/8 space-y-1">
          <Link
            href="/"
            target="_blank"
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] text-white/30 hover:text-white/60 transition-colors font-medium"
          >
            <ExternalLink size={14} />
            View Store
          </Link>
          <button
            onClick={handleLogout}
            disabled={loggingOut}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium text-white/30 hover:text-red-400 hover:bg-red-400/5 transition-colors disabled:opacity-50"
          >
            <LogOut size={14} />
            {loggingOut ? 'Signing out...' : 'Sign Out'}
          </button>
        </div>
      </aside>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile top bar */}
        <header className="bg-white border-b border-gray-100 px-5 h-14 flex items-center justify-between md:hidden flex-shrink-0">
          <button
            onClick={() => setSidebarOpen(true)}
            className="text-gray-500 hover:text-dark-brown transition-colors"
          >
            <Menu size={20} />
          </button>
          <span className="font-extrabold text-dark-brown text-[13px] tracking-brand">PONKALI ADMIN</span>
          <button
            onClick={() => setSidebarOpen(false)}
            className={`text-gray-400 transition-opacity ${sidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
          >
            <X size={20} />
          </button>
        </header>

        <main className="flex-1 px-5 py-8 max-w-6xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
