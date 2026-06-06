'use client';

import ProductShowcase from '@/components/ProductShowcase';

export default function ShopPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <div className="bg-dark-brown py-14 px-5 text-center">
        <p className="text-gold/70 text-[11px] font-semibold tracking-[0.35em] uppercase mb-4">
          Farm Direct · Erode, Tamil Nadu
        </p>
        <h1 className="font-hero text-[38px] md:text-[52px] font-extrabold text-white tracking-tight leading-tight mb-4">
          Pure Erode Turmeric Powder
        </h1>
        <p className="text-cream/50 text-[16px] max-w-md mx-auto leading-relaxed">
          Naturally grown in Erode. GI tagged. Zero adulteration.
          Choose your weight, and every pack ships direct from our farm.
        </p>
      </div>

      <ProductShowcase />

      {/* Trust footer */}
      <div className="max-w-4xl mx-auto px-5 pb-20">
        <div className="bg-cream rounded-2xl border border-black/6 p-8 text-center">
          <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-[0.3em] mb-4">Why Ponkali</p>
          <div className="flex flex-wrap justify-center gap-6 text-[14px] text-dark-brown font-medium">
            {[
              'GI-Tagged Erode Origin',
              'Naturally Grown',
              'Free Shipping ₹399+',
              'FSSAI Certified',
              '3rd Generation Farm',
              'Zero Additives',
            ].map(item => (
              <span key={item} className="flex items-center gap-1.5">
                <span className="text-gold text-[10px]">◆</span>
                {item}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
