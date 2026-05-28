import Link from 'next/link';
import Image from 'next/image';
import { PRODUCTS } from '@/lib/products';
import { Product } from '@/lib/types';
import ProductCard from '@/components/ProductCard';
import {
  MapPinIcon, CogIcon, LeafIcon, DropletIcon,
  ShieldCheckIcon, StarIcon, ArrowRightIcon,
} from '@/components/Icons';

const TRUST_BADGES = [
  { Icon: MapPinIcon,      title: 'GI Recognised',   desc: 'Erode — India\'s turmeric capital' },
  { Icon: CogIcon,         title: 'Stone Ground',     desc: 'Traditional ancestral mill' },
  { Icon: LeafIcon,        title: 'Farm Direct',      desc: 'Zero middlemen' },
  { Icon: DropletIcon,     title: 'High Curcumin',    desc: '2.5–4.5% natural curcumin' },
  { Icon: ShieldCheckIcon, title: 'FSSAI Certified',  desc: 'Lic. 22426064000154' },
];

const REVIEWS = [
  { name: 'Kavitha R.', location: 'Chennai',   text: 'The colour and smell is unlike anything from a supermarket. This is what real turmeric smells like.' },
  { name: 'Priya M.',   location: 'Bengaluru', text: 'My mother asked where I bought this. She said it smells exactly like her village in Tamil Nadu.' },
  { name: 'Rajan S.',   location: 'Mumbai',    text: 'Switched from Tata Sampann. Will never go back. The quality difference is visible immediately.' },
];

const COMPARISON = [
  { feature: 'Curcumin Content',  ours: '2.5 – 4.5%',        theirs: '0.5 – 1.5%' },
  { feature: 'Origin',            ours: 'GI Tagged Erode',    theirs: 'Mixed / Unknown' },
  { feature: 'Artificial Color',  ours: 'None added',         theirs: 'Commonly added' },
  { feature: 'Starch / Fillers',  ours: 'None',               theirs: 'Common practice' },
  { feature: 'Processing',        ours: 'Slow stone ground',  theirs: 'High-heat machine' },
  { feature: 'Middlemen',         ours: 'Zero — farm direct', theirs: '3–4 layers' },
];

function Stars({ count = 5 }: { count?: number }) {
  return (
    <div className="flex gap-0.5">
      {Array(count).fill(0).map((_, i) => (
        <StarIcon key={i} className="w-4 h-4 text-gold" filled />
      ))}
    </div>
  );
}

export default function HomePage() {
  const typedProducts = PRODUCTS as Product[];

  return (
    <>
      {/* ─── 1. HERO ─── */}
      <section className="bg-dark-brown relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none" style={{
          background: 'radial-gradient(ellipse 55% 80% at 75% 50%, rgba(212,150,10,0.07) 0%, transparent 65%)',
        }} />

        <div className="max-w-6xl mx-auto px-5 py-20 md:py-0 md:min-h-[95vh] grid md:grid-cols-[1fr_420px] lg:grid-cols-[1fr_480px] gap-10 lg:gap-16 items-center relative z-10">

          {/* Left — Copy */}
          <div className="pt-4 md:pt-0">
            {/* Social proof anchor */}
            <div className="flex items-center gap-2.5 mb-7">
              <Stars count={5} />
              <span className="text-cream/40 text-[13px]">Trusted by 200+ families across India</span>
            </div>

            <p className="text-gold/80 text-[11px] font-semibold tracking-[0.35em] uppercase mb-5">
              GI Recognised · Perundurai, Erode
            </p>

            <h1 className="font-display text-[44px] md:text-[54px] lg:text-[64px] font-extrabold text-white leading-[1.02] tracking-[-0.02em] mb-6">
              The Turmeric Your<br />
              <span className="text-gold italic">Grandparents Knew</span>
            </h1>

            <p className="text-cream/55 text-[17px] leading-[1.75] mb-8 max-w-[500px]">
              Three generations of farming in Erode — stone ground on our ancestral mill.
              2.5–4.5% natural curcumin. Zero additives. Shipped direct from our family farm
              to your kitchen.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 mb-8">
              <Link
                href="/shop"
                className="bg-gold text-dark-brown px-9 py-4 rounded-full font-bold text-[15px] hover:bg-yellow-400 transition-all duration-150 text-center tracking-wide"
              >
                Shop Now — from ₹169
              </Link>
              <Link
                href="/our-story"
                className="border border-cream/20 text-cream/70 px-9 py-4 rounded-full font-semibold text-[15px] hover:border-cream/50 hover:text-cream transition-all duration-150 text-center"
              >
                Our Story
              </Link>
            </div>

            <div className="flex flex-wrap gap-2">
              {['GI Tagged', 'FSSAI Certified', 'Lab Tested', 'Farm Direct', 'Free Ship ₹399+'].map(t => (
                <span key={t} className="text-[11px] text-cream/30 border border-cream/10 px-3 py-1 rounded-full">
                  {t}
                </span>
              ))}
            </div>
          </div>

          {/* Right — Product image (desktop only) */}
          <div className="hidden md:block py-16 relative">
            <div className="relative rounded-3xl bg-[#F5E8A0]/12 border border-white/5 aspect-square overflow-hidden">
              <Image
                src="/images/product-1.jpeg"
                alt="Ponkali Erode Turmeric Powder"
                fill
                className="object-contain p-8"
                priority
                sizes="480px"
              />
            </div>

            {/* Floating metric badge — curcumin */}
            <div className="absolute -left-8 top-1/3 bg-white rounded-2xl px-4 py-3.5 shadow-2xl shadow-black/20">
              <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider mb-0.5">Curcumin</p>
              <p className="text-[22px] font-extrabold text-dark-brown leading-none">2.5–4.5%</p>
              <p className="text-[10px] text-gray-400 mt-0.5">Lab Tested</p>
            </div>

            {/* Floating price badge */}
            <div className="absolute -right-5 bottom-1/4 bg-dark-brown border border-gold/20 rounded-2xl px-4 py-3.5 shadow-2xl">
              <p className="text-[10px] text-gold/50 font-semibold uppercase tracking-wider mb-0.5">Starting at</p>
              <p className="text-[22px] font-extrabold text-gold leading-none">₹169</p>
              <p className="text-[10px] text-cream/30 mt-0.5">Free ship ₹399+</p>
            </div>
          </div>
        </div>
      </section>

      {/* ─── 2. TRUST BAR ─── */}
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

      {/* ─── 3. STATS BAR ─── */}
      <section className="bg-white border-b border-black/5">
        <div className="max-w-5xl mx-auto px-5">
          <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-y md:divide-y-0 divide-black/5">
            {[
              { value: '3rd Gen', label: 'Family Farm' },
              { value: '2.5–4.5%', label: 'Curcumin Content' },
              { value: 'Zero',    label: 'Additives Added' },
              { value: '200+',   label: 'Families Served' },
            ].map(({ value, label }) => (
              <div key={label} className="py-8 px-6 text-center">
                <p className="text-[28px] md:text-[32px] font-extrabold text-dark-brown leading-none">{value}</p>
                <p className="text-[13px] text-gray-400 mt-2 font-medium">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── 4. PRODUCTS ─── */}
      <section className="py-20 px-5 bg-cream">
        <div className="max-w-6xl mx-auto">
          <div className="mb-12">
            <p className="text-gold text-[11px] font-semibold tracking-[0.3em] uppercase mb-3">Choose Your Pack</p>
            <h2 className="font-display text-[34px] md:text-[42px] font-extrabold text-dark-brown tracking-tight">
              Pure Erode Turmeric Powder
            </h2>
            <p className="text-gray-500 mt-2 text-[16px] max-w-md">
              Same farm. Same stone-ground purity. Every size ships fresh.
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-5">
            {typedProducts.map(product => (
              <ProductCard key={product.slug} product={product} />
            ))}
          </div>
          <p className="text-center text-[13px] text-gray-400 mt-6">
            Free shipping on orders above ₹399 · Delivered in 3–5 days across India
          </p>
        </div>
      </section>

      {/* ─── 5. PROCESS ─── */}
      <section className="py-20 px-5 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="mb-14 text-center">
            <p className="text-gold text-[11px] font-semibold tracking-[0.3em] uppercase mb-3">Full Transparency</p>
            <h2 className="font-display text-[32px] md:text-[40px] font-extrabold text-dark-brown">
              Farm to Kitchen — Our Way
            </h2>
            <p className="text-gray-400 mt-3 text-[16px]">Every step is ours. No outsourcing. No compromise.</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-black/5 rounded-2xl overflow-hidden">
            {[
              { step: '01', title: 'Grown in Erode', desc: 'GI-recognised soil in Perundurai, nurtured by our family for three generations.' },
              { step: '02', title: 'Stone Ground',   desc: 'Slow-ground on our ancestral stone mill. No heat, no shortcuts, no compromise on aroma.' },
              { step: '03', title: 'Packed Fresh',   desc: 'Sealed within 24 hours of grinding. No warehouses, no long storage.' },
              { step: '04', title: 'Shipped Direct', desc: 'From our farm to your doorstep. 3–5 days, anywhere in India.' },
            ].map(({ step, title, desc }) => (
              <div key={step} className="bg-white p-8 md:p-10">
                <p className="text-[48px] font-extrabold text-gold/15 leading-none mb-5 select-none">{step}</p>
                <h3 className="font-bold text-dark-brown text-[16px] mb-2">{title}</h3>
                <p className="text-gray-400 text-[14px] leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── 6. NOT ALL TURMERIC IS EQUAL ─── */}
      <section className="py-20 px-5 bg-dark-brown">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-gold/70 text-[11px] font-semibold tracking-[0.3em] uppercase mb-3">The Real Difference</p>
            <h2 className="font-display text-[32px] md:text-[42px] font-extrabold text-white">
              Not All Turmeric Is Equal
            </h2>
            <p className="text-cream/40 mt-3 text-[16px] max-w-md mx-auto">
              Here&apos;s what most packaged brands don&apos;t tell you.
            </p>
          </div>

          <div className="rounded-2xl overflow-hidden border border-white/8">
            {/* Header */}
            <div className="grid grid-cols-[1fr_1fr_1fr] bg-white/5 text-center">
              <div className="px-4 py-4 text-left">
                <p className="text-cream/25 text-[11px] font-semibold uppercase tracking-wider">Feature</p>
              </div>
              <div className="px-4 py-4 border-l border-white/5 text-center">
                <p className="text-gold font-bold text-[14px]">Ponkali</p>
                <p className="text-gold/40 text-[11px] mt-0.5">Our farm, Erode</p>
              </div>
              <div className="px-4 py-4 border-l border-white/5 text-center">
                <p className="text-cream/40 font-medium text-[13px]">Commercial Brands</p>
                <p className="text-cream/20 text-[11px] mt-0.5">Supermarket</p>
              </div>
            </div>

            {COMPARISON.map(({ feature, ours, theirs }, i) => (
              <div key={feature} className={`grid grid-cols-[1fr_1fr_1fr] text-center ${i % 2 === 0 ? 'bg-white/[0.02]' : ''}`}>
                <div className="px-4 py-4 text-cream/35 text-[13px] text-left border-t border-white/4">{feature}</div>
                <div className="px-4 py-4 border-l border-t border-white/4 text-center">
                  <span className="text-gold font-semibold text-[13px]">{ours}</span>
                </div>
                <div className="px-4 py-4 border-l border-t border-white/4 text-center">
                  <span className="text-cream/30 text-[13px]">{theirs}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-10 text-center">
            <Link
              href="/shop"
              className="inline-flex items-center gap-2 bg-gold text-dark-brown px-9 py-4 rounded-full font-bold text-[15px] hover:bg-yellow-400 transition-all"
            >
              Try the Real Difference
              <ArrowRightIcon className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ─── 7. OUR STORY ─── */}
      <section className="py-20 px-5 bg-cream">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-14 items-center">
            <div className="rounded-2xl overflow-hidden bg-[#F5E8A0] h-80 md:h-[500px] relative">
              <Image
                src="/images/product-2.jpeg"
                alt="Ponkali Turmeric Powder — front and back of packaging"
                fill
                className="object-contain p-6"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            </div>
            <div>
              <p className="text-gold text-[11px] font-semibold tracking-[0.3em] uppercase mb-5">Our Heritage</p>
              <h2 className="font-display text-[34px] md:text-[40px] font-extrabold text-dark-brown tracking-tight mb-6 leading-[1.05]">
                Their names are on every packet
              </h2>
              <p className="text-gray-600 leading-[1.8] mb-5 text-[16px]">
                Ponkali is named after our grandparents — <strong className="text-dark-brown font-semibold">Ponnamal</strong> and <strong className="text-dark-brown font-semibold">Kaaliappa Gounder</strong> — who farmed this same Erode land for over 40 years. They knew every row, every plant, every season.
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

      {/* ─── 8. REVIEWS ─── */}
      <section className="py-20 px-5 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="mb-12">
            <p className="text-gold text-[11px] font-semibold tracking-[0.3em] uppercase mb-3">Customer Stories</p>
            <div className="flex flex-col sm:flex-row sm:items-end gap-3">
              <h2 className="font-display text-[34px] md:text-[42px] font-extrabold text-dark-brown tracking-tight leading-none">
                Trusted by families across India
              </h2>
              <div className="flex items-center gap-2 pb-1">
                <Stars count={5} />
                <span className="text-gray-400 text-[14px] font-medium">4.9 avg · 200+ orders</span>
              </div>
            </div>
          </div>
          <div className="grid md:grid-cols-3 gap-5">
            {REVIEWS.map(review => (
              <div key={review.name} className="p-7 rounded-2xl bg-cream border border-black/6 flex flex-col">
                <Stars count={5} />
                <p className="text-dark-brown/75 leading-[1.8] text-[15px] mt-5 mb-6 flex-1">
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

      {/* ─── 9. CTA + GUARANTEE ─── */}
      <section className="py-20 px-5 bg-[#F5E4B0]">
        <div className="max-w-xl mx-auto text-center">
          <p className="text-dark-brown/40 text-[11px] font-semibold tracking-[0.3em] uppercase mb-4">
            Direct from the Farm
          </p>
          <h2 className="font-display text-[34px] md:text-[44px] font-extrabold text-dark-brown tracking-tight mb-4 leading-[1.05]">
            Taste the Difference Today
          </h2>
          <p className="text-dark-brown/60 mb-8 text-[16px]">
            Free shipping above ₹399. Delivered in 3–5 working days anywhere in India.
          </p>
          <Link
            href="/shop"
            className="bg-dark-brown text-cream px-12 py-4 rounded-full font-bold text-[15px] hover:bg-black transition-all duration-150 inline-block tracking-wide"
          >
            Shop Now
          </Link>
          <p className="text-dark-brown/40 text-[13px] mt-6 leading-relaxed">
            If you don&apos;t love it, we&apos;ll make it right — no questions asked.
          </p>
        </div>
      </section>
    </>
  );
}
