'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState, useRef, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useCart } from './CartContext';
import { CartIcon, MenuIcon, XIcon, UserIcon } from './Icons';

const NAV = [
  ['Home', '/'],
  ['Our Story', '/our-story'],
  ['Shop', '/shop'],
  ['Contact', '/contact'],
];

export default function Header() {
  const { totalItems, setIsOpen } = useCart();
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [user, setUser] = useState<{ email?: string | null; phone?: string | null; name?: string | null } | null>(null);
  const profileRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const pathname = usePathname();

  // Close profile dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  // Load the current customer session for account links. Re-runs on every
  // route change so the header reflects a fresh login/logout without needing a
  // full page reload (router.push doesn't remount this client component).
  useEffect(() => {
    let active = true;
    fetch('/api/auth/me')
      .then(r => r.json())
      .then(d => { if (active) setUser(d.user); })
      .catch(() => { if (active) setUser(null); });
    return () => { active = false; };
  }, [pathname]);

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    setUser(null);
    setProfileOpen(false);
    setMenuOpen(false);
    router.push('/');
    router.refresh();
  };

  return (
    <header className="sticky top-[37px] z-30 bg-white border-b border-black/8">
      <div className="max-w-6xl mx-auto px-5 h-16 flex items-center justify-between">

        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 flex-shrink-0">
          <Image src="/images/logo.jpg" alt="Ponkali" width={48} height={48} className="rounded-full" />
          <span className="font-extrabold text-[20px] tracking-widest text-dark-brown">PONKALI</span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-8">
          {NAV.map(([label, href]) => (
            <Link key={href} href={href}
              className="text-[14px] font-medium text-dark-brown/70 hover:text-dark-brown transition-colors tracking-wide">
              {label}
            </Link>
          ))}
        </nav>

        {/* Right icons */}
        <div className="flex items-center gap-1">

          {/* Profile / Order tracking */}
          <div className="relative" ref={profileRef}>
            <button
              onClick={() => setProfileOpen(v => !v)}
              className="p-2 text-dark-brown hover:text-gold transition-colors"
              aria-label="Account"
            >
              <UserIcon className="w-5 h-5" />
            </button>

            {profileOpen && (
              <div className="absolute right-0 top-full mt-2 w-72 bg-white border border-black/8 rounded-2xl shadow-xl p-5 z-50">
                {/* Account */}
                {user ? (
                  <>
                    <p className="text-[12px] text-gray-400 mb-0.5">Signed in as</p>
                    {user.name && (
                      <p className="font-semibold text-dark-brown text-[14px] truncate">{user.name}</p>
                    )}
                    <p className="text-[13px] text-gray-500 truncate mb-3">{user.email || user.phone}</p>
                    <Link
                      href="/account"
                      onClick={() => setProfileOpen(false)}
                      className="block w-full text-center bg-dark-brown text-cream py-2 rounded-xl text-[13px] font-semibold hover:bg-gold hover:text-dark-brown transition-all mb-2"
                    >
                      My Account
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="w-full border border-dark-brown/20 text-dark-brown py-2 rounded-xl text-[13px] font-semibold hover:bg-dark-brown hover:text-cream transition-all"
                    >
                      Sign Out
                    </button>
                  </>
                ) : (
                  <>
                    <p className="font-bold text-dark-brown text-[15px] mb-1">Your Account</p>
                    <p className="text-[12px] text-gray-400 mb-4">Sign in to view your orders</p>
                    <div className="flex gap-2">
                      <Link
                        href="/login"
                        onClick={() => setProfileOpen(false)}
                        className="flex-1 text-center bg-dark-brown text-cream py-2 rounded-xl text-[13px] font-semibold hover:bg-gold hover:text-dark-brown transition-all"
                      >
                        Sign In
                      </Link>
                      <Link
                        href="/register"
                        onClick={() => setProfileOpen(false)}
                        className="flex-1 text-center border border-dark-brown/20 text-dark-brown py-2 rounded-xl text-[13px] font-semibold hover:border-dark-brown/50 transition-all"
                      >
                        Register
                      </Link>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Cart */}
          <button
            onClick={() => setIsOpen(true)}
            className="relative p-2 hover:text-gold transition-colors text-dark-brown"
            aria-label="Open cart"
          >
            <CartIcon className="w-5 h-5" />
            {totalItems > 0 && (
              <span className="absolute top-0.5 right-0.5 bg-gold text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold leading-none">
                {totalItems}
              </span>
            )}
          </button>

          {/* Mobile menu */}
          <button
            className="md:hidden p-2 text-dark-brown hover:text-gold transition-colors"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
          >
            {menuOpen ? <XIcon className="w-5 h-5" /> : <MenuIcon className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile nav */}
      {menuOpen && (
        <div className="md:hidden bg-white border-t border-black/8 px-5 py-5 flex flex-col gap-4">
          {NAV.map(([label, href]) => (
            <Link key={href} href={href} onClick={() => setMenuOpen(false)}
              className="text-[15px] font-semibold text-dark-brown tracking-wide">
              {label}
            </Link>
          ))}
          <div className="border-t border-black/8 pt-4 mt-1">
            {user ? (
              <div>
                <p className="text-[12px] text-gray-400 mb-0.5">Signed in as</p>
                {user.name && (
                  <p className="text-[14px] font-semibold text-dark-brown truncate">{user.name}</p>
                )}
                <p className="text-[13px] text-gray-500 truncate mb-3">{user.email || user.phone}</p>
                <Link
                  href="/account"
                  onClick={() => setMenuOpen(false)}
                  className="block w-full text-center bg-dark-brown text-cream py-2.5 rounded-xl text-[14px] font-semibold mb-2"
                >
                  My Account
                </Link>
                <button
                  onClick={handleLogout}
                  className="w-full text-[14px] font-semibold text-dark-brown border border-dark-brown/20 py-2.5 rounded-xl"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <div className="flex gap-2">
                <Link
                  href="/login"
                  onClick={() => setMenuOpen(false)}
                  className="flex-1 text-center bg-dark-brown text-cream py-2.5 rounded-xl text-[14px] font-semibold"
                >
                  Sign In
                </Link>
                <Link
                  href="/register"
                  onClick={() => setMenuOpen(false)}
                  className="flex-1 text-center border border-dark-brown/20 text-dark-brown py-2.5 rounded-xl text-[14px] font-semibold"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
