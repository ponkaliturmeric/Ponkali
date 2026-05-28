'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useCart } from './CartContext';
import { CartIcon, MenuIcon, XIcon } from './Icons';

export default function Header() {
  const { totalItems, setIsOpen } = useCart();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky top-[37px] z-30 bg-cream border-b border-black/8">
      <div className="max-w-6xl mx-auto px-5 h-16 flex items-center justify-between">
        <Link href="/" className="font-extrabold text-xl tracking-brand text-dark-brown">
          PONKALI
        </Link>

        <nav className="hidden md:flex items-center gap-8">
          {[['Home', '/'], ['Our Story', '/our-story'], ['Shop', '/shop'], ['Contact', '/contact']].map(([label, href]) => (
            <Link
              key={href}
              href={href}
              className="text-[14px] font-medium text-dark-brown/70 hover:text-dark-brown transition-colors tracking-wide"
            >
              {label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
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

          <button
            className="md:hidden p-2 text-dark-brown hover:text-gold transition-colors"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
          >
            {menuOpen ? <XIcon className="w-5 h-5" /> : <MenuIcon className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {menuOpen && (
        <div className="md:hidden bg-cream border-t border-black/8 px-5 py-5 flex flex-col gap-5">
          {[['Home', '/'], ['Our Story', '/our-story'], ['Shop', '/shop'], ['Contact', '/contact']].map(([label, href]) => (
            <Link
              key={href}
              href={href}
              onClick={() => setMenuOpen(false)}
              className="text-[15px] font-semibold text-dark-brown tracking-wide"
            >
              {label}
            </Link>
          ))}
        </div>
      )}
    </header>
  );
}
