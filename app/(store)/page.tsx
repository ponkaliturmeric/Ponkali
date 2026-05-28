import Link from 'next/link';
import Image from 'next/image';
import { PRODUCTS } from '@/lib/products';
import { Product } from '@/lib/types';
import ProductCard from '@/components/ProductCard';
import {
  MapPinIcon, CogIcon, LeafIcon, DropletIcon,
  ShieldCheckIcon, GlobeIcon, StarIcon, ArrowRightIcon,
} from '@/components/Icons';

const TRUST_BADGES = [
  {
    Icon: MapPinIcon,
    title: 'GI Recognised',
    desc: 'Erode — India\'s turmeric capital',
  },
  {
    Icon: CogIcon,
    title: 'Stone Ground',
    desc: 'Traditional ancestral mill',
  },
  {
    Icon: LeafIcon,
    title: 'Farm Direct',
    desc: 'Zero middlemen',
  },
  {
    Icon: DropletIcon,
    title: 'High Curcumin',
    desc: '2.5–4.5% natural curcumin',
  },
  {
    Icon: ShieldCheckIcon,
    title: 'FSSAI Certified',
    desc: 'Lic. 22426064000154',
  },
];

const REVIEWS = [
  {
    name: 'Kavitha R.',
    location: 'Chennai',
    text: 'The colour and smell is unlike anything from a supermarket. This is what real turmeric smells like.',
  },
  {
    name: 'Priya M.',
    location: 'Bengaluru',
    text: 'My mother asked where I bought this. She said it smells like her village in Tamil Nadu.',
  },
  {
    name: 'Rajan S.',
    location: 'Mumbai',
    text: 'Switched from Tata Sampann. Will never go back. The quality difference is visible immediately.',
  },
];

function Stars() {
  return (
    <div className="flex gap-0.5 text-gold">
      {Array(5).fill(0).map((_, i) => (
        <StarIcon key={i} className="w-4 h-4" filled />
      ))}
    </div>
  );
}

export default function HomePage() {
  const typedProducts = PRODUCTS as Product[];

  return (
    <>
      {/* Hero */}
      <section className="min-h-[92vh] bg-dark-brown flex items-center justify-center relative overflow-hidden">
        <div
          className="absolute inset-0"
          style={{
            background: 'radial-gradient(ellipse at 30% 60%, rgba(212,150,10,0.08) 0%, transparent 70%), radial-gradient(ellipse at 80% 20%, rgba(212,150,10,0.05) 0%, transparent 60%)',
          }}
        />
        <div className="max-w-3xl mx-auto px-5 text-center relative z-10">
          <p className="text-gold/80 text-[11px] font-semibold tracking-[0.35em] uppercase mb-8">
            Ponkali Masalas — Erode, Tamil Nadu
          </p>
          <h1 className="text-[42px] md:text-[72px] font-extrabold text-white leading-[1.0] tracking-[-0.03em] mb-7">
            From Our Farm,<br />
            <span className="text-gold">Into Your Kitchen</span>
          </h1>
          <p className="text-cream/60 text-[17px] md:text-[19px] leading-[1.7] mb-10 max-w-xl mx-auto font-normal">
            Three generations of turmeric farming in Erode — stone ground, GI-tagged, and shipped direct from our family farm. No middlemen. Nothing added.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center mb-12">
            <Link
              href="/shop"
              className="bg-gold text-dark-brown px-9 py-4 rounded-full font-bold text-[15px] hover:bg-yellow-400 transition-all duration-150 tracking-wide"
            >
              Shop Now
            </Link>
            <Link
              href="/our-story"
              className="border border-cream/20 text-cream/80 px-9 py-4 rounded-full font-semibold text-[15px] hover:border-cream/50 hover:text-cream transition-all duration-150"
            >
              Our Story
            </Link>
          </div>
          <div className="flex flex-wrap justify-center gap-x-5 gap-y-2 text-cream/35 text-[12px] font-medium tracking-wider uppercase">
            <span>GI Tagged</span>
            <span>·</span>
            <span>Stone Ground</span>
            <span>·</span>
            <span>FSSAI Certified</span>
            <span>·</span>
            <span>Free Shipping ₹399+</span>
          </div>
        </div>
      </section>

      {/* Trust badges */}
      <section className="bg-cream border-b border-black/6">
        <div className="max-w-6xl mx-auto px-5">
          <div className="grid grid-cols-2 md:grid-cols-5">
            {TRUST_BADGES.map((badge, i) => (
              <div
                key={badge.title}
                className={`flex flex-col items-center text-center py-8 px-4 ${
                  i < TRUST_BADGES.length - 1 ? 'border-b md:border-b-0 md:border-r border-black/6' : ''
                }`}
              >
                <div className="w-10 h-10 rounded-full bg-gold/10 flex items-center justify-center mb-3">
                  <badge.Icon className="w-5 h-5 text-gold" />
                </div>
                <p className="font-semibold text-dark-brown text-[13px] mb-1">{badge.title}</p>
                <p className="text-gray-500 text-[12px] leading-snug">{badge.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Products */}
      <section className="py-20 px-5 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="mb-12">
            <p className="text-gold text-[11px] font-semibold tracking-[0.3em] uppercase mb-3">Farm Direct</p>
            <h2 className="text-[34px] md:text-[42px] font-extrabold text-dark-brown tracking-tight">
              Pure Erode Turmeric Powder
            </h2>
            <p className="text-gray-500 mt-2 text-[16px]">
              Same farm. Same stone-ground purity. Choose your size.
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-5">
            {typedProducts.map(product => (
              <ProductCard key={product.slug} product={product} />
            ))}
          </div>
        </div>
      </section>

      {/* Our Story */}
      <section className="py-20 px-5 bg-cream">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-14 items-center">
            <div className="rounded-2xl overflow-hidden bg-[#F5E8A0] h-80 md:h-[480px] relative">
              <Image
                src="/images/product-2.jpeg"
                alt="Ponkali Turmeric Powder packaging — front and back"
                fill
                className="object-contain p-6"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            </div>
            <div>
              <p className="text-gold text-[11px] font-semibold tracking-[0.3em] uppercase mb-5">Our Heritage</p>
              <h2 className="text-[34px] md:text-[40px] font-extrabold text-dark-brown tracking-tight mb-6 leading-[1.05]">
                Their names are on every packet
              </h2>
              <p className="text-gray-600 leading-[1.8] mb-5 text-[16px]">
                Ponkali is named after our grandparents — Ponnamal and Kaaliappa Gounder — who farmed this same Erode land for over 40 years. They knew every row, every plant, every season.
              </p>
              <p className="text-gray-600 leading-[1.8] mb-8 text-[16px]">
                Same land. Same seeds. Same promise. What reaches your kitchen is not just turmeric — it is our family&apos;s legacy, packed with nothing added.
              </p>
              <Link
                href="/our-story"
                className="inline-flex items-center gap-2 text-dark-brown font-semibold text-[15px] group"
              >
                <span className="border-b border-dark-brown/30 group-hover:border-gold group-hover:text-gold transition-colors">
                  Read Our Full Story
                </span>
                <ArrowRightIcon className="w-4 h-4 group-hover:translate-x-1 group-hover:text-gold transition-all" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Why Ponkali */}
      <section className="py-20 px-5 bg-dark-brown">
        <div className="max-w-6xl mx-auto">
          <div className="mb-14">
            <p className="text-gold/70 text-[11px] font-semibold tracking-[0.3em] uppercase mb-3">The Difference</p>
            <h2 className="text-[34px] md:text-[42px] font-extrabold text-white tracking-tight">
              Why Ponkali?
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-px bg-white/6 rounded-2xl overflow-hidden">
            {[
              {
                Icon: GlobeIcon,
                title: 'The Erode Difference',
                text: 'GI-recognised Erode region — India\'s turmeric capital. 2.5–4.5% natural curcumin, double the national average. The soil, the climate, the elevation — everything contributes.',
              },
              {
                Icon: CogIcon,
                title: 'Stone Ground, Not Machine Ground',
                text: 'Our ancestral stone mill grinds slowly — preserving the essential oils, the natural aroma, and the deep colour that heat-intensive machines destroy.',
              },
              {
                Icon: LeafIcon,
                title: 'Zero Middlemen',
                text: 'We grow it, grind it, pack it, ship it. One farm. Full traceability. Your money goes directly back to the family that grew your food.',
              },
            ].map(({ Icon, title, text }) => (
              <div key={title} className="bg-dark-brown p-8 md:p-10">
                <div className="w-10 h-10 rounded-full bg-gold/10 flex items-center justify-center mb-6">
                  <Icon className="w-5 h-5 text-gold" />
                </div>
                <h3 className="font-bold text-white text-[18px] mb-4 leading-snug">{title}</h3>
                <p className="text-cream/50 text-[15px] leading-[1.8]">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Reviews */}
      <section className="py-20 px-5 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="mb-12">
            <p className="text-gold text-[11px] font-semibold tracking-[0.3em] uppercase mb-3">Customer Stories</p>
            <h2 className="text-[34px] md:text-[42px] font-extrabold text-dark-brown tracking-tight">
              Trusted by families across India
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-5">
            {REVIEWS.map(review => (
              <div key={review.name} className="p-7 rounded-2xl bg-cream border border-black/6">
                <Stars />
                <p className="text-dark-brown/80 leading-[1.8] text-[15px] mt-5 mb-6">
                  &ldquo;{review.text}&rdquo;
                </p>
                <div className="border-t border-black/6 pt-5">
                  <p className="font-bold text-dark-brown text-[15px]">{review.name}</p>
                  <p className="text-gray-400 text-[13px] mt-0.5">{review.location}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="py-20 px-5 bg-[#F5E4B0]">
        <div className="max-w-xl mx-auto text-center">
          <p className="text-dark-brown/50 text-[11px] font-semibold tracking-[0.3em] uppercase mb-4">Direct from the Farm</p>
          <h2 className="text-[34px] md:text-[44px] font-extrabold text-dark-brown tracking-tight mb-4 leading-[1.05]">
            Taste the Difference Today
          </h2>
          <p className="text-dark-brown/60 mb-9 text-[16px]">
            Free shipping above ₹399. Delivered in 3–5 working days anywhere in India.
          </p>
          <Link
            href="/shop"
            className="bg-dark-brown text-cream px-12 py-4 rounded-full font-bold text-[15px] hover:bg-black transition-all duration-150 inline-block tracking-wide"
          >
            Shop Now
          </Link>
        </div>
      </section>
    </>
  );
}
