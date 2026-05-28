'use client';

import { useEffect, useState } from 'react';
import ProductCard from '@/components/ProductCard';
import { Product } from '@/lib/types';

const WEIGHT_FILTERS = ['All', '100g', '250g', '500g', '1kg'];

export default function ShopPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [filter, setFilter] = useState('All');
  const [sort, setSort] = useState('price-asc');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/products')
      .then(r => r.json())
      .then(data => {
        setProducts(data);
        setLoading(false);
      });
  }, []);

  const filtered = products
    .filter(p => filter === 'All' || p.weight === filter)
    .sort((a, b) => {
      if (sort === 'price-asc') return a.price - b.price;
      if (sort === 'price-desc') return b.price - a.price;
      return 0;
    });

  return (
    <div className="min-h-screen bg-cream">
      {/* Hero */}
      <div className="bg-dark-brown py-16 px-5 text-center">
        <p className="text-gold/70 text-[11px] font-semibold tracking-[0.35em] uppercase mb-4">Farm Direct · Erode, Tamil Nadu</p>
        <h1 className="text-[42px] md:text-[56px] font-extrabold text-white tracking-tight leading-none mb-4">
          Shop Turmeric
        </h1>
        <p className="text-cream/50 text-[16px] max-w-sm mx-auto leading-relaxed">
          Stone ground. GI tagged. Zero adulteration. Choose your size.
        </p>
      </div>

      <div className="max-w-6xl mx-auto px-5 py-10">
        {/* Filters row */}
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center mb-10">
          <div className="flex gap-2 flex-wrap">
            {WEIGHT_FILTERS.map(w => (
              <button
                key={w}
                onClick={() => setFilter(w)}
                className={`px-5 py-2 rounded-full text-[13px] font-semibold transition-all border ${
                  filter === w
                    ? 'bg-dark-brown text-cream border-dark-brown'
                    : 'border-dark-brown/15 text-dark-brown bg-white hover:border-dark-brown/40'
                }`}
              >
                {w}
              </button>
            ))}
          </div>
          <select
            value={sort}
            onChange={e => setSort(e.target.value)}
            className="border border-dark-brown/15 rounded-full px-5 py-2 text-[13px] bg-white text-dark-brown focus:outline-none focus:border-gold font-medium"
          >
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
          </select>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-5">
            {[1,2,3,4].map(i => (
              <div key={i} className="bg-white rounded-2xl overflow-hidden border border-black/6 animate-pulse">
                <div className="h-52 bg-black/5" />
                <div className="p-4 space-y-2">
                  <div className="h-3 bg-black/5 rounded w-1/2" />
                  <div className="h-4 bg-black/5 rounded w-3/4" />
                  <div className="h-6 bg-black/5 rounded w-1/3" />
                  <div className="h-9 bg-black/5 rounded-full mt-2" />
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-400 text-[16px]">No products match this filter.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-5">
            {filtered.map(product => (
              <ProductCard key={product.slug} product={product} />
            ))}
          </div>
        )}

        {/* Trust note */}
        <div className="mt-16 bg-white rounded-2xl border border-black/6 p-8 text-center">
          <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-[0.3em] mb-3">Why Ponkali</p>
          <div className="flex flex-wrap justify-center gap-6 text-[14px] text-dark-brown font-medium">
            {['GI-Tagged Erode Origin', 'Stone Ground · No Heat', 'Free Shipping ₹399+', 'FSSAI Certified', 'Farm Direct Pricing'].map(item => (
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
