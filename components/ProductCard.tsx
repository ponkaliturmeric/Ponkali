'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Product } from '@/lib/types';
import { useCart } from './CartContext';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { addItem } = useCart();

  return (
    <div className="group bg-white rounded-2xl overflow-hidden border border-black/6 hover:shadow-lg hover:shadow-black/8 transition-all duration-300">
      <Link href={`/product/${product.slug}`}>
        <div className="relative h-52 bg-[#F5E8A0] overflow-hidden">
          <Image
            src="/images/product-1.jpeg"
            alt={`${product.name} ${product.weight}`}
            fill
            className="object-contain p-4 group-hover:scale-105 transition-transform duration-500"
            sizes="(max-width: 768px) 50vw, 25vw"
          />
          <div className="absolute inset-0 flex flex-col items-end justify-end p-3">
            <span className="text-dark-brown/70 font-bold text-[12px] bg-white/70 backdrop-blur-sm px-2.5 py-1 rounded-full">
              {product.weight}
            </span>
          </div>
          {product.is_bestseller === 1 && (
            <div className="absolute top-3 left-3">
              <span className="bg-dark-brown text-cream text-[10px] font-bold px-2.5 py-1 rounded-full tracking-wider uppercase">
                Best Seller
              </span>
            </div>
          )}
          {product.in_stock === 0 && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <span className="text-white font-semibold text-[15px]">Out of Stock</span>
            </div>
          )}
        </div>
      </Link>

      <div className="p-4">
        <Link href={`/product/${product.slug}`}>
          <p className="text-[12px] font-medium text-gray-400 uppercase tracking-wider mb-1">Ponkali Masalas</p>
          <h3 className="font-semibold text-dark-brown text-[15px] leading-snug">{product.name}</h3>
          <p className="font-bold text-gold text-[22px] mt-2 leading-none">₹{product.price}</p>
        </Link>

        <button
          onClick={() => product.in_stock === 1 && addItem(product)}
          disabled={product.in_stock === 0}
          className="mt-3.5 w-full bg-dark-brown text-cream py-2.5 rounded-full font-semibold text-[14px] hover:bg-black transition-all duration-150 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {product.in_stock === 1 ? 'Add to Cart' : 'Out of Stock'}
        </button>
      </div>
    </div>
  );
}
