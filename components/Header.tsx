'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
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
  const [orderId, setOrderId] = useState('');
  const profileRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

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

  const handleTrack = () => {
    const id = orderId.trim().toUpperCase();
    if (id) {
      setProfileOpen(false);
      setOrderId('');
      router.push(`/order-confirmation/${id}`);
    }
  };

  return (
    <header className="sticky top-[37px] z-30 bg-cream border-b border-black/8">
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
              aria-label="Track order"
            >
              <UserIcon className="w-5 h-5" />
            </button>

            {profileOpen && (
              <div className="absolute right-0 top-full mt-2 w-72 bg-white border border-black/8 rounded-2xl shadow-xl p-5 z-50">
                <p className="font-bold text-dark-brown text-[15px] mb-1">Track Your Order</p>
                <p className="text-[12px] text-gray-400 mb-4">No account needed — enter your order ID</p>

                <div className="flex gap-2 mb-3">
                  <input
                    value={orderId}
                    onChange={e => setOrderId(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleTrack()}
                    placeholder="PKL-20260528-1234"
                    className="flex-1 border border-black/12 rounded-xl px-3 py-2 text-[13px] focus:outline-none focus:border-gold font-mono"
                  />
                  <button
                    onClick={handleTrack}
                    className="bg-dark-brown text-cream px-4 py-2 rounded-xl text-[13px] font-semibold hover:bg-gold hover:text-dark-brown transition-all"
                  >
                    Track
                  </button>
                </div>

                <div className="border-t border-black/6 pt-3">
                  <a
                    href="https://wa.me/919944033696?text=Hi! I'd like to track my Ponkali order."
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-[13px] text-[#25D366] font-semibold hover:underline"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z" />
                    </svg>
                    WhatsApp to track order
                  </a>
                </div>

                <p className="text-[11px] text-gray-300 mt-3 text-center">
                  Guest checkout · No sign-up required
                </p>
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
        <div className="md:hidden bg-cream border-t border-black/8 px-5 py-5 flex flex-col gap-4">
          {NAV.map(([label, href]) => (
            <Link key={href} href={href} onClick={() => setMenuOpen(false)}
              className="text-[15px] font-semibold text-dark-brown tracking-wide">
              {label}
            </Link>
          ))}
          <div className="border-t border-black/8 pt-4 mt-1">
            <p className="text-[12px] text-gray-400 font-medium uppercase tracking-wider mb-2">Track Your Order</p>
            <div className="flex gap-2">
              <input
                value={orderId}
                onChange={e => setOrderId(e.target.value)}
                placeholder="PKL-20260528-1234"
                className="flex-1 border border-black/12 rounded-xl px-3 py-2 text-[13px] focus:outline-none focus:border-gold font-mono bg-white"
              />
              <button
                onClick={() => { handleTrack(); setMenuOpen(false); }}
                className="bg-dark-brown text-cream px-4 py-2 rounded-xl text-[13px] font-semibold"
              >
                Track
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
