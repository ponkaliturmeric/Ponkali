import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import ProductShowcase from '@/components/ProductShowcase';
import FarmGallery from '@/components/FarmGallery';
import JsonLd from '@/components/JsonLd';
import { buildMetadata, productListJsonLd, faqJsonLd } from '@/lib/seo';
import { PRODUCTS, FROM_PRICE } from '@/lib/products';
import {
  MapPinIcon, LeafIcon, TruckIcon, DropletIcon,
  ShieldCheckIcon, StarIcon, ArrowRightIcon,
} from '@/components/Icons';
import Mandala from '@/components/Mandala';
import HeroVideo from '@/components/HeroVideo';

export const metadata: Metadata = buildMetadata({
  title: 'Pure Erode Turmeric, Farm Direct',
  description:
    'Buy GI-tagged Erode turmeric powder, naturally grown and freshly ground. 2.5% to 3.5% natural curcumin, zero additives and FSSAI certified. Shipped direct from our family farm. Free shipping above ₹399.',
  path: '/',
});

const TRUST_BADGES = [
  { Icon: MapPinIcon,      title: 'GI Recognised',    desc: 'Erode, India\'s turmeric capital' },
  { Icon: LeafIcon,        title: 'Naturally Grown',  desc: 'Chemical-free farm practices' },
  { Icon: TruckIcon,       title: 'Farm Direct',      desc: 'Zero middlemen' },
  { Icon: DropletIcon,     title: 'High Curcumin',    desc: '2.5% to 3.5% natural curcumin' },
  { Icon: ShieldCheckIcon, title: 'FSSAI Certified',  desc: 'Lic. 22426064000154' },
];

const REVIEWS = [
  { name: 'Kavitha R.', location: 'Chennai',   text: 'The colour and smell is unlike anything from a supermarket. This is what real turmeric smells like.' },
  { name: 'Priya M.',   location: 'Bengaluru', text: 'My mother asked where I bought this. She said it smells exactly like her village in Tamil Nadu.' },
  { name: 'Rajan S.',   location: 'Mumbai',    text: 'Switched from Tata Sampann. Will never go back. The quality difference is visible immediately.' },
];


const FAQ_ITEMS = [
  {
    question: "Is Ponkali turmeric 100% pure and free from adulteration?",
    answer: "Yes. Ponkali is single-origin Erode turmeric powder, naturally grown and freshly processed with nothing added: no synthetic colour, no starch, no fillers and no lead chromate. It is FSSAI certified (Lic. No. 22426064000154) and checked for purity.",
  },
  {
    question: "What is the curcumin content of Ponkali turmeric?",
    answer: "Our GI-tagged Erode turmeric naturally contains 2.5% to 3.5% curcumin, much higher than the 0.5% to 1.5% you find in most supermarket brands. Curcumin is the active compound behind turmeric's deep colour and health benefits.",
  },
  {
    question: "Where is Ponkali turmeric grown?",
    answer: "It is grown on our own family farm in Perundurai, Erode, the GI-recognised turmeric capital of Tamil Nadu. We have farmed this same land for three generations.",
  },
  {
    question: "How is it different from supermarket turmeric powder?",
    answer: "Most packaged brands blend turmeric from mixed or unknown origins, process it with high heat, and often add colour or starch. Ponkali is single-origin Erode turmeric, naturally grown and carefully processed to preserve its natural oils and aroma, and sold farm-direct with zero middlemen.",
  },
  {
    question: "Is Ponkali turmeric FSSAI certified?",
    answer: "Yes. FSSAI Licence No. 22426064000154, manufactured by The Native, Perundurai, Erode 638055, Tamil Nadu.",
  },
  {
    question: "How long does delivery take and is shipping free?",
    answer: "We ship across India in 3 to 5 working days. Shipping is free on orders above ₹399, and below that a flat ₹60 applies. Both Cash on Delivery and online payment (UPI, cards, netbanking) are available.",
  },
  {
    question: "How should I store turmeric powder, and how do I use it?",
    answer: "Store in a cool, dry place away from sunlight with the lid sealed, and use within 6 months for the best aroma. Use it in curries, sambhar and rasam, or stir half a teaspoon into warm milk for a daily golden-milk drink.",
  },
  {
    question: "What pack sizes are available?",
    answer: "Ponkali Erode Turmeric Powder comes in 100g, 250g, 500g and 1kg packs.",
  },
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
  return (
    <>
      <JsonLd data={[productListJsonLd(PRODUCTS), faqJsonLd(FAQ_ITEMS)]} />

      {/* ─── 1. HERO ─── */}
      <section className="bg-dark-brown relative overflow-hidden">
        {/* Decorative background video — desktop & non-metered connections only */}
        <HeroVideo />
        {/* Dark overlay to keep text readable over video */}
        <div className="absolute inset-0 bg-dark-brown/60 pointer-events-none" />
        <div className="absolute inset-0 pointer-events-none" style={{
          background: 'radial-gradient(ellipse 55% 80% at 75% 50%, rgba(212,150,10,0.07) 0%, transparent 65%)',
        }} />
        {/* Corner mandala — top-right, clipped by overflow-hidden, stays clear of text */}
        <Mandala className="absolute -top-20 -right-20 w-[340px] h-[340px] text-gold opacity-[0.07] pointer-events-none select-none" />
        {/* Corner mandala — bottom-left, only visible on md+ where it won't touch the copy */}
        <Mandala className="hidden md:block absolute -bottom-20 -left-20 w-[280px] h-[280px] text-gold opacity-[0.05] pointer-events-none select-none" />

        <div className="max-w-6xl mx-auto px-5 relative z-10
          flex flex-col gap-10
          md:grid md:grid-cols-[1fr_360px] lg:grid-cols-[1fr_440px] md:gap-8 lg:gap-12 md:items-center
          pt-14 pb-12 md:py-0 md:min-h-[88vh]">

          {/* Left — Copy */}
          <div className="order-1 md:order-1">

           

            <h1 className="font-hero font-bold text-white tracking-[-0.03em] mb-7
              text-[9vw] leading-[1.1]
              sm:text-[46px] sm:leading-[1.05]
              md:text-[50px] md:leading-[1.0]
              lg:text-[64px] lg:leading-[0.97]">
              The Turmeric Your<br />
              <span className="text-gold">Grandparents Knew</span>
            </h1>

            <p className="text-cream/60 text-[16px] leading-[1.8] mb-8 max-w-[460px]">
              Three generations of naturally grown turmeric from Erode.
              2.5% to 3.5% natural curcumin, zero additives and zero middlemen.
              Shipped direct from our family farm to your kitchen.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 mb-8">
              <Link
                href="/shop"
                className="bg-cream text-dark-brown px-9 py-4 rounded-full font-bold text-[15px] hover:bg-white transition-all duration-150 text-center tracking-wide shadow-md"
              >
                Shop Now, from ₹{FROM_PRICE}
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
                <span key={t} className="text-[11px] text-cream/50 border border-cream/20 px-3 py-1 rounded-full">
                  {t}
                </span>
              ))}
            </div>
          </div>

          {/* Right — Product image (all devices) */}
          <div className="order-2 md:order-2 relative py-4 md:py-16">
            {/* Constrain size on mobile, full on desktop */}
            <div className="relative rounded-2xl bg-white/8 border border-none overflow-hidden
              aspect-square max-w-[260px] mx-auto
              md:max-w-none md:rounded-3xl">
              <Image
                src="/images/product-1.jpeg"
                alt="Ponkali Erode Turmeric Powder"
                fill
                className="object-contain p-4 md:p-8"
                priority
                sizes="(max-width: 768px) 260px, 480px"
              />
            </div>

            {/* Floating badges — desktop only */}
            <div className="hidden md:block absolute -left-8 top-1/3 bg-white rounded-2xl px-4 py-3.5 shadow-2xl shadow-black/20">
              <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider mb-0.5">Curcumin</p>
              <p className="text-[22px] font-extrabold text-dark-brown leading-none">2.5-3.5%</p>
              <p className="text-[10px] text-gray-400 mt-0.5">Lab Tested</p>
            </div>
            <div className="hidden md:block absolute -right-5 bottom-1/4 bg-dark-brown border border-gold/20 rounded-2xl px-4 py-3.5 shadow-2xl">
              <p className="text-[10px] text-gold/50 font-semibold uppercase tracking-wider mb-0.5">Starting at</p>
              <p className="text-[22px] font-extrabold text-gold leading-none">₹{FROM_PRICE}</p>
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
              { value: '2.5-3.5%', label: 'Curcumin Content' },
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

      {/* ─── 4. PRODUCT SHOWCASE ─── */}
      <ProductShowcase />

      {/* ─── 5. PROCESS ─── */}
      <section className="py-10 px-5 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="mb-14 text-center">
            <p className="text-gold text-[11px] font-semibold tracking-[0.3em] uppercase mb-3">Full Transparency</p>
            <h2 className="font-hero text-[32px] md:text-[40px] font-extrabold text-dark-brown">
              From Our Farm to Your Kitchen
            </h2>
            <p className="text-gray-400 mt-3 text-[16px]">Every step is ours. No outsourcing. No compromise.</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-black/5 rounded-2xl overflow-hidden">
            {[
              { step: '01', title: 'Grown in Erode', desc: 'GI-recognised soil in Perundurai, nurtured by our family for three generations.' },
              { step: '02', title: 'Freshly Ground',  desc: 'Cleanly processed and freshly ground. No excess heat, no shortcuts, no compromise on aroma.' },
              { step: '03', title: 'Packed Fresh',   desc: 'Sealed within 24 hours of grinding. No warehouses, no long storage.' },
              { step: '04', title: 'Shipped Direct', desc: 'From our farm to your doorstep in 3 to 5 days, anywhere in India.' },
            ].map(({ step, title, desc }) => (
              <div key={step} className="bg-white p-8 md:p-10">
                <p className="text-[48px] font-extrabold text-gold/35 leading-none mb-5 select-none">{step}</p>
                <h3 className="font-bold text-dark-brown text-[16px] mb-2">{title}</h3>
                <p className="text-gray-400 text-[14px] leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── 6. FARM GALLERY ─── */}
      <FarmGallery />

      {/* ─── 7. OUR STORY ─── */}
      <section className="py-20 px-5 bg-cream">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-14 items-center">
            <div className="rounded-2xl overflow-hidden bg-cream h-80 md:h-[500px] relative border border-none">
              <Image
                src="/images/product-2.jpeg"
                alt="Ponkali Turmeric Powder, front and back of packaging"
                fill
                className="object-contain p-6"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            </div>
            <div>
              <p className="text-gold text-[11px] font-semibold tracking-[0.3em] uppercase mb-5">Our Heritage</p>
              <h2 className="font-hero text-[34px] md:text-[40px] font-extrabold text-dark-brown tracking-tight mb-6 leading-[1.05]">
                Their names are on every packet
              </h2>
              <p className="text-gray-600 leading-[1.8] mb-5 text-[16px]">
                Ponkali is named after our grandparents, <strong className="text-dark-brown font-semibold">Ponnamal</strong> and <strong className="text-dark-brown font-semibold">Kaaliappa</strong>, who farmed this same Erode land for over 40 years. They knew every row, every plant and every season.
              </p>
              <p className="text-gray-600 leading-[1.8] mb-8 text-[16px]">
                Same land. Same seeds. Same promise. What reaches your kitchen is not just turmeric. It is our family&apos;s legacy, packed with nothing added.
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
              <h2 className="font-hero text-[34px] md:text-[42px] font-extrabold text-dark-brown tracking-tight leading-none">
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

      {/* ─── 9. FAQ ─── */}
      <section className="py-20 px-5 bg-white border-t border-black/5">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-gold text-[11px] font-semibold tracking-[0.3em] uppercase mb-3">Good to Know</p>
            <h2 className="font-hero text-[32px] md:text-[40px] font-extrabold text-dark-brown tracking-tight">
              Frequently Asked Questions
            </h2>
          </div>
          <div className="border-t border-black/8">
            {FAQ_ITEMS.map(({ question, answer }) => (
              <details key={question} className="group border-b border-black/8 py-5">
                <summary className="flex items-center justify-between cursor-pointer list-none gap-6">
                  <h3 className="font-semibold text-dark-brown text-[16px]">{question}</h3>
                  <span className="text-gold text-[24px] leading-none flex-shrink-0 transition-transform duration-200 group-open:rotate-45">
                    +
                  </span>
                </summary>
                <p className="text-gray-600 leading-[1.8] text-[15px] mt-3">{answer}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ─── 10. CTA + GUARANTEE ─── */}
      <section className="py-20 px-5 bg-[#F5E4B0]">
        <div className="max-w-xl mx-auto text-center">
          <p className="text-dark-brown/40 text-[11px] font-semibold tracking-[0.3em] uppercase mb-4">
            Direct from the Farm
          </p>
          <h2 className="font-hero text-[34px] md:text-[44px] font-extrabold text-dark-brown tracking-tight mb-4 leading-[1.05]">
            Taste the Difference Today
          </h2>
          <p className="text-dark-brown/60 mb-8 text-[16px]">
            Free shipping above ₹399. Delivered in 3 to 5 working days anywhere in India.
          </p>
          <Link
            href="/shop"
            className="bg-dark-brown text-cream px-12 py-4 rounded-full font-bold text-[15px] hover:bg-black transition-all duration-150 inline-block tracking-wide"
          >
            Shop Now
          </Link>
          <p className="text-dark-brown/40 text-[13px] mt-6 leading-relaxed">
            If you don&apos;t love it, we&apos;ll make it right. No questions asked.
          </p>
        </div>
      </section>
    </>
  );
}
