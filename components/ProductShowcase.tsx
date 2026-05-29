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
  '100g': { label: 'Try It',       supply: '~1 month',    perGram: '₹1.49 per gram' },
  '250g': { label: 'Most Popular', supply: '~2.5 months', perGram: '₹1.20 per gram' },
  '500g': { label: 'Best Value',   supply: '~5 months',   perGram: '₹0.90 per gram' },
  '1kg':  { label: 'Family Pack',  supply: '~10 months',  perGram: '₹0.72 per gram' },
};

const WA_NUMBER = '919944033696';

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

  const waMessage = encodeURIComponent(
    `Hi! I'd like to order Ponkali Erode Turmeric Powder ${selected.weight} — ₹${selected.price}. Please confirm.`
  );

  return (
    <section className="py-10 md:py-20 px-4 sm:px-5 bg-white">
      <div className="max-w-5xl mx-auto">
        <div className="grid md:grid-cols-2 gap-8 lg:gap-16 items-start">

          {/* ── Left: Gallery — vertical thumbs + main image ── */}
          <div className="md:sticky md:top-24">
            <div className="flex gap-2 sm:gap-3">

              {/* Vertical thumbnails on the LEFT — smaller */}
              <div className="flex flex-col gap-2">
                {([1, 2] as const).map(n => (
                  <button
                    key={n}
                    onClick={() => setActiveImg(n)}
                    className={`w-14 sm:w-16 aspect-square rounded-xl overflow-hidden border-2 transition-all relative bg-white flex-shrink-0 ${
                      activeImg === n ? 'border-dark-brown shadow-sm' : 'border-black/8 opacity-55 hover:opacity-80'
                    }`}
                  >
                    <Image
                      src={`/images/product-${n}.jpeg`}
                      alt={`View ${n}`}
                      fill
                      className="object-contain p-1"
                      sizes="64px"
                    />
                  </button>
                ))}
              </div>

              {/* Main image — fills remaining width */}
              <div className="flex-1 rounded-2xl overflow-hidden aspect-square relative bg-white border border-black/8 shadow-sm">
                <Image
                  src={activeImg === 1 ? '/images/product-1.jpeg' : '/images/product-2.jpeg'}
                  alt={`Ponkali Erode Turmeric Powder ${selected.weight}`}
                  fill
                  className="object-contain p-3 md:p-4 transition-opacity duration-300"
                  priority
                  sizes="(max-width: 768px) 90vw, 45vw"
                />
              </div>
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

            {/* Buy Now */}
            <button
              onClick={handleBuyNow}
              disabled={selected.in_stock === 0}
              className="w-full bg-gold text-dark-brown py-4 rounded-full font-bold text-[16px] hover:bg-yellow-400 active:scale-[0.98] transition-all duration-150 disabled:opacity-40 disabled:cursor-not-allowed mb-2.5"
            >
              {selected.in_stock === 1 ? `Buy Now — ₹${selected.price}` : 'Out of Stock'}
            </button>

            {/* Add to Cart */}
            <button
              onClick={() => selected.in_stock === 1 && addItem(selected)}
              disabled={selected.in_stock === 0}
              className="w-full bg-dark-brown text-cream py-3.5 rounded-full font-semibold text-[15px] hover:bg-black active:scale-[0.98] transition-all duration-150 disabled:opacity-40 disabled:cursor-not-allowed mb-2.5"
            >
              Add to Cart
            </button>

            {/* WhatsApp Order */}
            <a
              href={`https://wa.me/${WA_NUMBER}?text=${waMessage}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-center gap-2 bg-[#25D366] text-white py-3.5 rounded-full font-semibold text-[15px] hover:bg-[#1ebe5a] active:scale-[0.98] transition-all duration-150 mb-2"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z" />
              </svg>
              Order via WhatsApp
            </a>

            {/* Guest + view details */}
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
