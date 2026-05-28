'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Product } from '@/lib/types';
import { useCart } from './CartContext';

const SERVING_LABELS: Record<string, string> = {
  '100g': 'Try it out · ~1 month',
  '250g': 'Most popular · ~2.5 months',
  '500g': 'Best value · ~5 months',
  '1kg':  'Family pack · ~10 months',
};

const VALUE_BADGE: Record<string, string> = {
  '500g': 'Best Value',
};

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { addItem } = useCart();
  const serving = SERVING_LABELS[product.weight] ?? '';
  const valueBadge = VALUE_BADGE[product.weight];

  return (
    <div className="group bg-white rounded-2xl overflow-hidden border border-black/6 hover:shadow-xl hover:shadow-black/10 hover:-translate-y-0.5 transition-all duration-300 flex flex-col">
      <Link href={`/product/${product.slug}`} className="block">
        <div className="relative h-52 bg-[#F5E8A0] overflow-hidden">
          <Image
            src="/images/product-1.jpeg"
            alt={`${product.name} ${product.weight}`}
            fill
            className="object-contain p-4 group-hover:scale-105 transition-transform duration-500"
            sizes="(max-width: 768px) 50vw, 25vw"
          />
          <div className="absolute top-3 left-3 flex flex-col gap-1.5">
            {product.is_bestseller === 1 && (
              <span className="bg-dark-brown text-cream text-[10px] font-bold px-2.5 py-1 rounded-full tracking-wider uppercase">
                Best Seller
              </span>
            )}
            {valueBadge && (
              <span className="bg-gold text-dark-brown text-[10px] font-bold px-2.5 py-1 rounded-full tracking-wider uppercase">
                {valueBadge}
              </span>
            )}
          </div>
          <div className="absolute bottom-3 right-3">
            <span className="text-dark-brown/80 font-bold text-[12px] bg-white/80 backdrop-blur-sm px-2.5 py-1 rounded-full">
              {product.weight}
            </span>
          </div>
          {product.in_stock === 0 && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <span className="text-white font-semibold text-[15px]">Out of Stock</span>
            </div>
          )}
        </div>
      </Link>

      <div className="p-4 flex flex-col flex-1">
        <Link href={`/product/${product.slug}`}>
          <p className="text-[11px] font-medium text-gray-400 uppercase tracking-wider mb-1">Erode Turmeric</p>
          <h3 className="font-bold text-dark-brown text-[15px] leading-snug">{product.weight} Pack</h3>
          {serving && (
            <p className="text-[12px] text-gray-400 mt-0.5 leading-snug">{serving}</p>
          )}
          <p className="font-extrabold text-dark-brown text-[24px] mt-2 leading-none">
            ₹{product.price}
          </p>
        </Link>

        <button
          onClick={() => product.in_stock === 1 && addItem(product)}
          disabled={product.in_stock === 0}
          className="mt-auto pt-3.5 w-full bg-dark-brown text-cream py-3 rounded-full font-bold text-[14px] hover:bg-gold hover:text-dark-brown transition-all duration-150 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {product.in_stock === 1 ? 'Add to Cart' : 'Out of Stock'}
        </button>
      </div>
    </div>
  );
}
