'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useCart } from '@/components/CartContext';
import { Product } from '@/lib/types';
import { StarIcon, TruckIcon, ShieldCheckIcon, LeafIcon, MinusIcon, PlusIcon, CheckIcon } from '@/components/Icons';

const WEIGHT_ORDER = ['100g', '250g', '500g', '1kg'];

export default function ProductPage() {
  const params = useParams();
  const router = useRouter();
  const { addItem } = useCart();
  const [products, setProducts] = useState<Product[]>([]);
  const [selected, setSelected] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/products')
      .then(r => r.json())
      .then((data: Product[]) => {
        setProducts(data);
        const found = data.find(p => p.slug === params.slug);
        if (found) {
          setSelected(found);
        } else {
          const fallback = data.find(p => p.slug === 'erode-turmeric-250g') ?? data[0];
          if (fallback) setSelected(fallback);
        }
        setLoading(false);
      });
  }, [params.slug]);

  const handleAddToCart = () => {
    if (!selected) return;
    addItem(selected, quantity);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const handleBuyNow = () => {
    if (!selected) return;
    addItem(selected, quantity);
    router.push('/checkout');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-gold border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!selected) return null;

  const discount = selected.original_price
    ? Math.round(((selected.original_price - selected.price) / selected.original_price) * 100)
    : null;

  const sortedProducts = [...products].sort(
    (a, b) => WEIGHT_ORDER.indexOf(a.weight) - WEIGHT_ORDER.indexOf(b.weight)
  );

  return (
    <div className="min-h-screen bg-cream">
      {/* Breadcrumb */}
      <div className="max-w-6xl mx-auto px-5 pt-6 pb-2">
        <nav className="flex items-center gap-2 text-[13px] text-gray-400">
          <Link href="/" className="hover:text-dark-brown transition-colors">Home</Link>
          <span>/</span>
          <Link href="/shop" className="hover:text-dark-brown transition-colors">Shop</Link>
          <span>/</span>
          <span className="text-dark-brown">Erode Turmeric Powder</span>
        </nav>
      </div>

      <div className="max-w-6xl mx-auto px-5 py-8 md:py-14">
        <div className="grid md:grid-cols-2 gap-10 lg:gap-20 items-start">

          {/* Left — Product Images */}
          <div className="sticky top-24">
            {/* Main image */}
            <div className="relative rounded-3xl overflow-hidden bg-[#F5E8A0] aspect-square">
              {selected.is_bestseller === 1 && (
                <div className="absolute top-5 left-5 z-10 bg-dark-brown text-cream text-[11px] font-bold tracking-[0.12em] uppercase px-3 py-1.5 rounded-full">
                  Best Seller
                </div>
              )}
              {discount && (
                <div className="absolute top-5 right-5 z-10 bg-gold text-white text-[12px] font-bold px-3 py-1.5 rounded-full">
                  -{discount}%
                </div>
              )}
              <Image
                src="/images/product-1.jpeg"
                alt={`Ponkali Erode Turmeric Powder ${selected.weight}`}
                fill
                className="object-contain p-6"
                sizes="(max-width: 768px) 100vw, 50vw"
                priority
              />
            </div>

            {/* Secondary image — back of pack */}
            <div className="relative mt-3 rounded-2xl overflow-hidden bg-[#F5E8A0] h-36">
              <Image
                src="/images/product-2.jpeg"
                alt="Ponkali Turmeric Powder — front and back packaging"
                fill
                className="object-contain px-4 py-2"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            </div>

            {/* Trust strip */}
            <div className="mt-3 grid grid-cols-3 gap-3">
              {[
                { Icon: LeafIcon, label: 'Farm Direct' },
                { Icon: ShieldCheckIcon, label: 'FSSAI Certified' },
                { Icon: TruckIcon, label: 'Fast Shipping' },
              ].map(({ Icon, label }) => (
                <div key={label} className="bg-white rounded-xl p-3 flex flex-col items-center gap-1.5 border border-black/6">
                  <Icon className="w-4 h-4 text-gold" />
                  <span className="text-[11px] text-gray-500 font-medium text-center">{label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right — Details */}
          <div>
            <p className="text-gold text-[11px] font-semibold tracking-[0.3em] uppercase mb-3">
              GI-Tagged · Erode · Stone Ground
            </p>
            <h1 className="text-[32px] md:text-[40px] font-extrabold text-dark-brown tracking-tight leading-tight mb-4">
              Erode Turmeric Powder
            </h1>

            {/* Stars */}
            <div className="flex items-center gap-2 mb-5">
              <div className="flex">
                {[1,2,3,4,5].map(i => (
                  <StarIcon key={i} filled className="w-4 h-4 text-gold" />
                ))}
              </div>
              <span className="text-[13px] text-gray-500">4.9 · 240 reviews</span>
            </div>

            {/* Price */}
            <div className="flex items-baseline gap-3 mb-6">
              <span className="text-[36px] font-extrabold text-dark-brown">₹{selected.price}</span>
              {selected.original_price && (
                <span className="text-[20px] text-gray-400 line-through">₹{selected.original_price}</span>
              )}
              {discount && (
                <span className="text-[13px] font-bold text-green-600 bg-green-50 px-2.5 py-0.5 rounded-full">
                  Save {discount}%
                </span>
              )}
            </div>

            {/* Weight Selector */}
            <div className="mb-7">
              <p className="text-[12px] font-semibold text-gray-500 uppercase tracking-wider mb-3">Select Size</p>
              <div className="flex flex-wrap gap-2">
                {sortedProducts.map(p => (
                  <button
                    key={p.id}
                    onClick={() => { setSelected(p); setQuantity(1); }}
                    className={`px-5 py-2.5 rounded-full border text-[14px] font-semibold transition-all ${
                      selected.id === p.id
                        ? 'bg-dark-brown text-cream border-dark-brown'
                        : 'border-dark-brown/20 text-dark-brown hover:border-dark-brown/50'
                    }`}
                  >
                    {p.weight}
                    {p.is_bestseller === 1 && (
                      <span className="ml-1.5 text-[10px] text-gold font-bold">★</span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Quantity */}
            <div className="mb-7">
              <p className="text-[12px] font-semibold text-gray-500 uppercase tracking-wider mb-3">Quantity</p>
              <div className="flex items-center border border-dark-brown/20 rounded-full w-fit">
                <button
                  onClick={() => setQuantity(q => Math.max(1, q - 1))}
                  className="w-11 h-11 flex items-center justify-center text-dark-brown hover:bg-dark-brown/5 rounded-l-full transition-colors"
                >
                  <MinusIcon className="w-4 h-4" />
                </button>
                <span className="w-10 text-center font-semibold text-dark-brown text-[16px]">{quantity}</span>
                <button
                  onClick={() => setQuantity(q => Math.min(10, q + 1))}
                  className="w-11 h-11 flex items-center justify-center text-dark-brown hover:bg-dark-brown/5 rounded-r-full transition-colors"
                >
                  <PlusIcon className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-3 mb-8">
              <button
                onClick={handleAddToCart}
                className={`flex-1 py-4 rounded-full font-semibold text-[15px] border-2 transition-all flex items-center justify-center gap-2 ${
                  added
                    ? 'bg-dark-brown text-cream border-dark-brown'
                    : 'border-dark-brown text-dark-brown hover:bg-dark-brown hover:text-cream'
                }`}
              >
                {added ? (
                  <>
                    <CheckIcon className="w-4 h-4" />
                    Added
                  </>
                ) : 'Add to Cart'}
              </button>
              <button
                onClick={handleBuyNow}
                className="flex-1 py-4 rounded-full font-semibold text-[15px] bg-gold text-white hover:bg-dark-brown transition-colors"
              >
                Buy Now
              </button>
            </div>

            {/* Delivery note */}
            <div className="flex items-center gap-2.5 bg-green-50 border border-green-100 rounded-xl px-4 py-3 mb-8">
              <TruckIcon className="w-4 h-4 text-green-600 flex-shrink-0" />
              <p className="text-[13px] text-green-700 font-medium">
                Free delivery on orders above ₹399 · Usually ships in 1–2 days
              </p>
            </div>

            {/* Product Details */}
            <div className="space-y-0">
              <div className="border-t border-black/8 py-5">
                <h3 className="font-bold text-dark-brown mb-3 text-[15px]">About This Product</h3>
                <p className="text-gray-600 leading-[1.8] text-[15px]">
                  {selected.description ?? 'Single-origin Erode turmeric powder, stone ground on our ancestral mill in Perundurai. GI-tagged variety with naturally high curcumin content (2.5–4.5%). No additives, no fillers — just pure turmeric as it has been grown and ground for three generations.'}
                </p>
              </div>

              <div className="border-t border-black/8 py-5">
                <h3 className="font-bold text-dark-brown mb-3 text-[15px]">What Makes It Different</h3>
                <ul className="space-y-2.5">
                  {[
                    'GI-tagged Erode variety — certified origin',
                    'Stone ground on ancestral mill — preserves natural oils',
                    'No synthetic colours, fillers, or additives',
                    'FSSAI certified · Lic. No. 22426064000154',
                    'Packed fresh within days of grinding',
                  ].map(point => (
                    <li key={point} className="flex items-start gap-2.5 text-[14px] text-gray-600">
                      <CheckIcon className="w-4 h-4 text-gold flex-shrink-0 mt-0.5" />
                      {point}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="border-t border-black/8 py-5">
                <h3 className="font-bold text-dark-brown mb-3 text-[15px]">Storage</h3>
                <p className="text-gray-600 text-[14px] leading-relaxed">
                  Store in a cool, dry place away from direct sunlight. Keep the lid tightly sealed. Best consumed within 6 months of purchase for optimal flavour and potency.
                </p>
              </div>
            </div>

            {/* FSSAI badge */}
            <div className="mt-5 bg-white border border-black/8 rounded-xl px-5 py-4">
              <div className="flex items-center gap-3">
                <ShieldCheckIcon className="w-5 h-5 text-gold flex-shrink-0" />
                <div>
                  <p className="text-[12px] font-bold text-dark-brown">FSSAI Licensed · Food Safe</p>
                  <p className="text-[11px] text-gray-400">Lic. No. 22426064000154 · The Native, Perundurai, Erode</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Reviews */}
      <div className="border-t border-black/8 bg-white py-16">
        <div className="max-w-4xl mx-auto px-5">
          <div className="text-center mb-10">
            <h2 className="text-[28px] font-extrabold text-dark-brown tracking-tight mb-2">Customer Reviews</h2>
            <div className="flex items-center justify-center gap-2">
              <div className="flex">
                {[1,2,3,4,5].map(i => <StarIcon key={i} filled className="w-5 h-5 text-gold" />)}
              </div>
              <span className="text-gray-500 text-[14px] font-medium">4.9 out of 5 · 240 reviews</span>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-5">
            {[
              { name: 'Meena R.', location: 'Chennai', text: 'The colour and aroma are completely different from what you buy in supermarkets. You can tell immediately this is real turmeric. My sambhar has never smelled better.', date: '3 weeks ago' },
              { name: 'Arvind K.', location: 'Bengaluru', text: 'Bought the 500g pack and have already ordered again. The difference in quality is remarkable — deeply fragrant, bright yellow. I use it in milk every night.', date: '1 month ago' },
              { name: 'Lakshmi S.', location: 'Coimbatore', text: 'As someone from Erode, I know what real turmeric smells like. This is as close as you can get without going to the farm yourself. Highly recommend.', date: '2 weeks ago' },
              { name: 'Priya N.', location: 'Mumbai', text: 'Ordered the 1kg. Excellent quality, well packed, arrived quickly. The golden colour is so vibrant — makes every curry look restaurant quality.', date: '5 days ago' },
            ].map(review => (
              <div key={review.name} className="bg-cream rounded-2xl p-6 border border-black/6">
                <div className="flex items-center gap-0.5 mb-3">
                  {[1,2,3,4,5].map(i => <StarIcon key={i} filled className="w-3.5 h-3.5 text-gold" />)}
                </div>
                <p className="text-gray-700 text-[14px] leading-[1.8] mb-4">&ldquo;{review.text}&rdquo;</p>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-dark-brown text-[13px]">{review.name}</p>
                    <p className="text-gray-400 text-[12px]">{review.location}</p>
                  </div>
                  <span className="text-gray-400 text-[12px]">{review.date}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Mobile sticky CTA */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-black/10 p-4 z-40">
        <div className="flex gap-3">
          <button
            onClick={handleAddToCart}
            className="flex-1 py-3.5 rounded-full border-2 border-dark-brown text-dark-brown font-semibold text-[14px] hover:bg-dark-brown hover:text-cream transition-colors"
          >
            Add to Cart
          </button>
          <button
            onClick={handleBuyNow}
            className="flex-1 py-3.5 rounded-full bg-gold text-white font-semibold text-[14px] hover:bg-dark-brown transition-colors"
          >
            Buy Now
          </button>
        </div>
      </div>
    </div>
  );
}
