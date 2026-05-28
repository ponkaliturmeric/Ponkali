'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { PRODUCTS } from '@/lib/products';
import { Product } from '@/lib/types';
import { useCart } from './CartContext';

const WEIGHT_ORDER = ['100g', '250g', '500g', '1kg'];

const VARIANT_INFO: Record<string, { label: string; supply: string; perGram: string }> = {
  '100g': { label: 'Try It',        supply: '~1 month',   perGram: '₹1.69 per gram' },
  '250g': { label: 'Most Popular',  supply: '~2.5 months', perGram: '₹1.32 per gram' },
  '500g': { label: 'Best Value',    supply: '~5 months',  perGram: '₹1.20 per gram' },
  '1kg':  { label: 'Family Pack',   supply: '~10 months', perGram: '₹0.85 per gram' },
};

export default function ProductShowcase() {
  const products = PRODUCTS as Product[];
  const ordered = WEIGHT_ORDER.map(w => products.find(p => p.weight === w)!).filter(Boolean);
  const defaultProduct = ordered.find(p => p.is_bestseller === 1) ?? ordered[1];
  const [selected, setSelected] = useState<Product>(defaultProduct);
  const [activeImg, setActiveImg] = useState<1 | 2>(1);
  const { addItem } = useCart();

  const info = VARIANT_INFO[selected.weight];
  const freeShipping = selected.price >= 399;

  return (
    <section className="py-16 md:py-24 px-5 bg-white">
      <div className="max-w-5xl mx-auto">
        <div className="grid md:grid-cols-2 gap-10 lg:gap-16 items-start">

          {/* ── Left: Product image ── */}
          <div className="sticky top-24">
            {/* Main image — packaging yellow background matches the actual product */}
            <div
              className="rounded-3xl overflow-hidden aspect-square relative"
              style={{ backgroundColor: '#F5C418' }}
            >
              <Image
                src={activeImg === 1 ? '/images/product-1.jpeg' : '/images/product-2.jpeg'}
                alt={`Ponkali Erode Turmeric Powder ${selected.weight}`}
                fill
                className="object-contain p-8 transition-opacity duration-300"
                priority
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            </div>

            {/* Thumbnail switcher */}
            <div className="flex gap-3 mt-3">
              {([1, 2] as const).map(n => (
                <button
                  key={n}
                  onClick={() => setActiveImg(n)}
                  className={`flex-1 aspect-square rounded-xl overflow-hidden border-2 transition-all relative ${
                    activeImg === n ? 'border-dark-brown' : 'border-transparent opacity-50 hover:opacity-75'
                  }`}
                  style={{ backgroundColor: '#F5C418' }}
                >
                  <Image
                    src={`/images/product-${n}.jpeg`}
                    alt={`View ${n}`}
                    fill
                    className="object-contain p-2"
                    sizes="80px"
                  />
                </button>
              ))}
            </div>
          </div>

          {/* ── Right: Product info ── */}
          <div className="pt-2">
            <p className="text-gold text-[11px] font-semibold tracking-[0.35em] uppercase mb-3">
              GI Recognised · Perundurai, Erode
            </p>

            <h1 className="font-display text-[38px] md:text-[46px] font-extrabold text-dark-brown leading-[1.05] tracking-tight mb-3">
              Erode Turmeric<br />Powder
            </h1>

            <p className="text-gray-500 text-[16px] mb-5 leading-relaxed">
              Stone-ground on our ancestral mill. 2.5–4.5% natural curcumin.
              Zero additives. FSSAI certified. Direct from our family farm.
            </p>

            {/* Trust pills */}
            <div className="flex flex-wrap gap-2 mb-7">
              {['GI Tagged', 'Stone Ground', 'FSSAI Certified', 'Lab Tested', 'Farm Direct'].map(t => (
                <span key={t} className="text-[11px] font-semibold text-dark-brown/60 border border-dark-brown/15 px-3 py-1 rounded-full">
                  {t}
                </span>
              ))}
            </div>

            {/* Weight selector */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-3">
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
                    className={`py-3.5 rounded-2xl border-2 transition-all text-center flex flex-col items-center gap-0.5 ${
                      selected.weight === p.weight
                        ? 'border-dark-brown bg-dark-brown text-cream'
                        : 'border-dark-brown/12 text-dark-brown hover:border-dark-brown/50 bg-white'
                    } disabled:opacity-40 disabled:cursor-not-allowed`}
                  >
                    <span className="font-bold text-[15px]">{p.weight}</span>
                    <span className={`text-[11px] font-medium ${selected.weight === p.weight ? 'text-cream/60' : 'text-gray-400'}`}>
                      ₹{p.price}
                    </span>
                  </button>
                ))}
              </div>
              {info && (
                <p className="text-[12px] text-gray-400 mt-2.5">{info.perGram}</p>
              )}
            </div>

            {/* Price display */}
            <div className="flex items-center gap-3 mb-5">
              <p className="font-display font-extrabold text-dark-brown text-[48px] leading-none">
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

            {/* CTA */}
            <button
              onClick={() => selected.in_stock === 1 && addItem(selected)}
              disabled={selected.in_stock === 0}
              className="w-full bg-dark-brown text-cream py-4 rounded-full font-bold text-[16px] hover:bg-gold hover:text-dark-brown transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed mb-3"
            >
              {selected.in_stock === 1 ? `Add to Cart — ₹${selected.price}` : 'Out of Stock'}
            </button>

            <Link
              href={`/product/${selected.slug}`}
              className="block w-full text-center py-3.5 rounded-full border-2 border-dark-brown/15 text-dark-brown/70 font-semibold text-[14px] hover:border-dark-brown hover:text-dark-brown transition-all mb-5"
            >
              View Full Details
            </Link>

            {/* Shipping + guarantee */}
            <div className="space-y-2.5 pt-5 border-t border-black/6">
              <div className="flex items-center gap-2.5">
                <span className="text-[16px]">🚚</span>
                <p className="text-[13px] text-gray-500">
                  {freeShipping
                    ? <span className="text-dark-green font-semibold">Free shipping on this order</span>
                    : <>Add <strong className="text-dark-brown">₹{399 - selected.price}</strong> more for free shipping</>
                  }
                </p>
              </div>
              <div className="flex items-center gap-2.5">
                <span className="text-[16px]">✓</span>
                <p className="text-[13px] text-gray-500">Delivered in 3–5 days anywhere in India</p>
              </div>
              <div className="flex items-center gap-2.5">
                <span className="text-[16px]">❤️</span>
                <p className="text-[13px] text-gray-500">If you don&apos;t love it, we&apos;ll make it right</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
