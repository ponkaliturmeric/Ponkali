'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { PRODUCTS } from '@/lib/products';
import { Product } from '@/lib/types';
import { useCart } from './CartContext';
import { TruckIcon, CheckIcon, ShieldCheckIcon } from './Icons';

const WEIGHT_ORDER = ['100g', '250g', '500g', '1kg'];

const VARIANT_INFO: Record<string, { label: string; supply: string; perGram: string }> = {
  '100g': { label: 'Try It',       supply: '~1 month',    perGram: '₹1.69 per gram' },
  '250g': { label: 'Most Popular', supply: '~2.5 months', perGram: '₹1.32 per gram' },
  '500g': { label: 'Best Value',   supply: '~5 months',   perGram: '₹1.20 per gram' },
  '1kg':  { label: 'Family Pack',  supply: '~10 months',  perGram: '₹0.85 per gram' },
};

export default function ProductShowcase() {
  const router = useRouter();
  const products = PRODUCTS as Product[];
  const ordered = WEIGHT_ORDER.map(w => products.find(p => p.weight === w)!).filter(Boolean);
  const defaultProduct = ordered.find(p => p.is_bestseller === 1) ?? ordered[1];
  const [selected, setSelected] = useState<Product>(defaultProduct);
  const [activeImg, setActiveImg] = useState<1 | 2>(1);
  const { addItem } = useCart();

  const info = VARIANT_INFO[selected.weight];
  const freeShipping = selected.price >= 399;

  const handleBuyNow = () => {
    if (selected.in_stock === 1) {
      addItem(selected);
      router.push('/checkout');
    }
  };

  return (
    <section className="py-10 md:py-20 px-4 sm:px-5 bg-white">
      <div className="max-w-5xl mx-auto">
        <div className="grid md:grid-cols-2 gap-8 lg:gap-16 items-start">

          {/* ── Left: Product image — NOT sticky on mobile ── */}
          <div className="md:sticky md:top-24">
            <div className="rounded-2xl overflow-hidden aspect-square relative bg-white border border-black/8 shadow-sm">
              <Image
                src={activeImg === 1 ? '/images/product-1.jpeg' : '/images/product-2.jpeg'}
                alt={`Ponkali Erode Turmeric Powder ${selected.weight}`}
                fill
                className="object-contain p-3 md:p-4 transition-opacity duration-300"
                priority
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            </div>

            {/* Thumbnails */}
            <div className="flex gap-3 mt-3">
              {([1, 2] as const).map(n => (
                <button
                  key={n}
                  onClick={() => setActiveImg(n)}
                  className={`flex-1 aspect-square rounded-xl overflow-hidden border-2 transition-all relative bg-white ${
                    activeImg === n ? 'border-dark-brown shadow-sm' : 'border-transparent opacity-50 hover:opacity-75'
                  }`}
                >
                  <Image
                    src={`/images/product-${n}.jpeg`}
                    alt={`View ${n}`}
                    fill
                    className="object-contain p-1.5"
                    sizes="80px"
                  />
                </button>
              ))}
            </div>
          </div>

          {/* ── Right: Product info ── */}
          <div className="pt-0 md:pt-2">
            <p className="text-gold text-[11px] font-semibold tracking-[0.35em] uppercase mb-3">
              GI Recognised · Perundurai, Erode
            </p>

            <h1 className="font-display text-[32px] sm:text-[38px] md:text-[44px] font-extrabold text-dark-brown leading-[1.05] tracking-tight mb-3">
              Erode Turmeric Powder
            </h1>

            <p className="text-gray-500 text-[14px] sm:text-[15px] mb-5 leading-relaxed">
              Stone-ground on our ancestral mill. 2.5–4.5% natural curcumin.
              Zero additives. FSSAI certified. Direct from our family farm.
            </p>

            {/* Trust pills */}
            <div className="flex flex-wrap gap-1.5 mb-6">
              {['GI Tagged', 'Stone Ground', 'FSSAI Certified', 'Lab Tested', 'Farm Direct'].map(t => (
                <span key={t} className="text-[11px] font-semibold text-dark-brown/60 border border-dark-brown/15 px-3 py-1 rounded-full">
                  {t}
                </span>
              ))}
            </div>

            {/* Weight selector */}
            <div className="mb-5">
              <div className="flex items-center justify-between mb-2.5">
                <p className="text-[12px] font-bold text-dark-brown uppercase tracking-wider">Select Weight</p>
                {info && (
                  <p className="text-[12px] text-gray-400">{info.label} · {info.supply}</p>
                )}
              </div>
              <div className="grid grid-cols-4 gap-2">
                {ordered.map(p => (
                  <button
                    key={p.weight}
                    onClick={() => setSelected(p)}
                    disabled={p.in_stock === 0}
                    className={`py-3 rounded-xl border-2 transition-all text-center flex flex-col items-center gap-0.5 ${
                      selected.weight === p.weight
                        ? 'border-dark-brown bg-dark-brown text-cream'
                        : 'border-dark-brown/12 text-dark-brown hover:border-dark-brown/50 bg-white'
                    } disabled:opacity-40 disabled:cursor-not-allowed`}
                  >
                    <span className="font-bold text-[13px] sm:text-[15px]">{p.weight}</span>
                    <span className={`text-[10px] sm:text-[11px] font-medium ${selected.weight === p.weight ? 'text-cream/60' : 'text-gray-400'}`}>
                      ₹{p.price}
                    </span>
                  </button>
                ))}
              </div>
              {info && (
                <p className="text-[12px] text-gray-400 mt-2">{info.perGram}</p>
              )}
            </div>

            {/* Price */}
            <div className="flex items-center gap-3 mb-4">
              <p className="font-extrabold text-dark-brown text-[44px] leading-none tracking-tight">
                ₹{selected.price}
              </p>
              {selected.is_bestseller === 1 && (
                <span className="bg-terracotta text-white text-[11px] font-bold px-3 py-1.5 rounded-full tracking-wider uppercase">
                  Best Seller
                </span>
              )}
              {selected.weight === '500g' && (
                <span className="bg-dark-green text-white text-[11px] font-bold px-3 py-1.5 rounded-full tracking-wider uppercase">
                  Best Value
                </span>
              )}
            </div>

            {/* ── BUY NOW (primary) + Add to Cart (secondary) ── */}
            <button
              onClick={handleBuyNow}
              disabled={selected.in_stock === 0}
              className="w-full bg-gold text-dark-brown py-4 rounded-full font-bold text-[16px] hover:bg-yellow-400 active:scale-[0.98] transition-all duration-150 disabled:opacity-40 disabled:cursor-not-allowed mb-2.5"
            >
              {selected.in_stock === 1 ? `Buy Now — ₹${selected.price}` : 'Out of Stock'}
            </button>

            <button
              onClick={() => selected.in_stock === 1 && addItem(selected)}
              disabled={selected.in_stock === 0}
              className="w-full bg-dark-brown text-cream py-3.5 rounded-full font-semibold text-[15px] hover:bg-black active:scale-[0.98] transition-all duration-150 disabled:opacity-40 disabled:cursor-not-allowed mb-2"
            >
              Add to Cart
            </button>

            {/* Guest + view details row */}
            <div className="flex items-center justify-between mb-5">
              <p className="text-[12px] text-gray-400">No account needed · Guest checkout</p>
              <Link
                href={`/product/${selected.slug}`}
                className="text-[12px] text-dark-brown/50 hover:text-dark-brown underline underline-offset-2 transition-colors"
              >
                Full details →
              </Link>
            </div>

            {/* Shipping & guarantee */}
            <div className="space-y-2.5 pt-4 border-t border-black/6">
              <div className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-full bg-dark-brown/6 flex items-center justify-center flex-shrink-0">
                  <TruckIcon className="w-3.5 h-3.5 text-dark-brown" />
                </div>
                <p className="text-[13px] text-gray-600">
                  {freeShipping
                    ? <span className="text-dark-green font-semibold">Free shipping on this order</span>
                    : <>Add <strong className="text-dark-brown">₹{399 - selected.price}</strong> more for free shipping</>
                  }
                </p>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-full bg-dark-brown/6 flex items-center justify-center flex-shrink-0">
                  <CheckIcon className="w-3.5 h-3.5 text-dark-brown" />
                </div>
                <p className="text-[13px] text-gray-600">Delivered in 3–5 days anywhere in India</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-full bg-dark-brown/6 flex items-center justify-center flex-shrink-0">
                  <ShieldCheckIcon className="w-3.5 h-3.5 text-dark-brown" />
                </div>
                <p className="text-[13px] text-gray-600">If you don&apos;t love it, we&apos;ll make it right</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
