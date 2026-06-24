import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { CogIcon, LeafIcon, PackageIcon, TruckIcon, ArrowRightIcon } from '@/components/Icons';
import { buildMetadata } from '@/lib/seo';

export const metadata: Metadata = buildMetadata({
  title: 'Our Story',
  description: 'Named after grandparents Ponnamal and Kaaliappa Gounder, who farmed Erode turmeric for 40+ years. Three generations of farm-direct purity from Erode.',
  path: '/our-story',
});

export default function OurStoryPage() {
  return (
    <div className="min-h-screen bg-white">

      {/* ── HERO ── */}
      <div className="bg-dark-brown py-24 px-5 text-center">
        <p className="text-gold/70 text-[11px] font-semibold tracking-[0.35em] uppercase mb-5">
          Est. 1980s · Erode
        </p>
        <h1 className="font-hero text-[48px] md:text-[72px] font-extrabold text-white tracking-tight leading-[1.0] mb-5">
          Our Story
        </h1>
        <p className="text-cream/50 text-[17px] max-w-lg mx-auto leading-[1.7]">
          Named after a grandmother and grandfather who gave everything to this land.
        </p>
      </div>

      {/* ── GRANDPARENTS + PRODUCT IMAGE ── */}
      <section className="py-20 px-5 bg-cream">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-14 items-center">

          {/* Product image — shows the grandparents illustration */}
          <div className="relative max-w-xl mx-auto md:max-w-none w-full">
  <div className="rounded-2xl overflow-hidden bg-white border border-black/6 shadow-md aspect-square relative w-full min-h-[350px] md:min-h-[500px]">
    <Image
      src="/images/new-prd-img0.png"
      alt="Ponkali Turmeric, Ponnamal and Kaaliappa Gounder"
      fill
      className="object-contain p-6"
      sizes="(max-width: 768px) 100vw, 50vw"
      priority
    />
  </div>
  <p className="text-center text-[13px] text-gray-500 mt-4 font-semibold tracking-wide">
    Ponnamal &amp; Kaaliappa, Erode
  </p>
</div>

          <div>
            <p className="text-gold text-[11px] font-semibold tracking-[0.3em] uppercase mb-4">The People Behind the Brand</p>
            <h2 className="font-hero text-[32px] md:text-[40px] font-extrabold text-dark-brown tracking-tight leading-[1.05] mb-6">
              Ponnamal &amp; Kaaliappa: their names are on every packet
            </h2>
            <p className="text-gray-600 leading-[1.9] text-[16px] mb-5">
              Our grandmother <strong className="text-dark-brown font-semibold">Ponnamal</strong> tended these turmeric fields before we could walk. She knew every row, every plant and every season. She would say turmeric is not just a spice. It is medicine, it is prayer, it is the smell of home.
            </p>
            <p className="text-gray-600 leading-[1.9] text-[16px] mb-5">
              Our grandfather <strong className="text-dark-brown font-semibold">Kaaliappa</strong> built the stone mill with his own hands. He believed that turmeric ground by machine loses its soul: the oils, the fragrance, the depth. He was right. Forty years later, the same stone mill still runs.
            </p>
            <p className="text-gray-600 leading-[1.9] text-[16px]">
              We carry their names so we never forget what this is about.
            </p>
          </div>
        </div>
      </section>

      {/* ── THE FARM ── */}
      <section className="py-20 px-5 bg-white">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-gold text-[11px] font-semibold tracking-[0.3em] uppercase mb-4">The Land</p>
            <h2 className="font-hero text-[32px] md:text-[40px] font-extrabold text-dark-brown tracking-tight">
              Erode, the Yellow City
            </h2>
          </div>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-cream rounded-2xl p-8 border border-black/6">
              <p className="text-gray-600 leading-[1.9] text-[16px]">
                Erode is not called the Yellow City for nothing. This district in Tamil Nadu produces some of the world&apos;s finest turmeric, with curcumin levels of 2.5% to 3.5%, double the national average. The Erode variety is GI-tagged, meaning it can only come from here. There is no substitute.
              </p>
            </div>
            <div className="bg-cream rounded-2xl p-8 border border-black/6">
              <p className="text-gray-600 leading-[1.9] text-[16px]">
                Our fields in Erode have been farmed organically for generations. The same water, the same soil, the same sun. We use no synthetic fertilisers. We rotate crops. We respect the land as it has given to us.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── FARM PHOTO GALLERY PREVIEW ── */}
      <section className="py-16 px-5 bg-dark-brown">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-10">
            <p className="text-gold/70 text-[11px] font-semibold tracking-[0.3em] uppercase mb-3">Real Photos</p>
            <h2 className="font-hero text-[28px] md:text-[36px] font-extrabold text-white tracking-tight mb-3">
              See Our Farm, Exactly as It Is
            </h2>
            <p className="text-cream/40 text-[15px]">The fields, the harvest, the processing. No stock photos.</p>
          </div>

          {/* 6-image preview */}
          <div className="grid grid-cols-3 gap-2 sm:gap-3 mb-8">
            {[1, 4, 13, 5, 9, 16].map(n => (
              <Link key={n} href="/farm" className="relative aspect-square rounded-xl overflow-hidden group">
                <Image
                  src={`/images/farm/farm-${String(n).padStart(2, '0')}.jpeg`}
                  alt="Ponkali farm in Erode"
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                  sizes="(max-width: 768px) 33vw, 20vw"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300" />
              </Link>
            ))}
          </div>

          <div className="text-center">
            <Link
              href="/farm"
              className="inline-flex items-center gap-2 border border-white/20 text-cream/70 px-8 py-3.5 rounded-full font-semibold text-[14px] hover:border-gold hover:text-gold transition-all"
            >
              See All 17 Farm Photos →
            </Link>
          </div>
        </div>
      </section>

      {/* ── THREE GENERATIONS ── */}
      <section className="py-20 px-5 bg-dark-brown">
        <div className="max-w-4xl mx-auto">
          <p className="text-gold/70 text-[11px] font-semibold tracking-[0.3em] uppercase mb-5">Our Promise</p>
          <h2 className="font-hero text-[32px] md:text-[42px] font-extrabold text-white tracking-tight mb-8 leading-[1.05]">
            Three Generations, One Promise
          </h2>
          <div className="space-y-5 text-cream/70 leading-[1.9] text-[16px]">
            <p>
              We are the third generation. We grew up watching our grandparents farm and our parents grind, and now we carry this forward, not with nostalgia but with pride. The world changed. Distribution changed. But we did not change what matters: the land, the stone, the purity.
            </p>
            <p>
              Ponkali Masalas was born from a simple question: why should a Chennai family not be able to buy the same turmeric that our grandmother grew? Why should it pass through four middlemen, lose its freshness, and arrive on your shelf mixed with starch and artificial colour?
            </p>
            <p className="text-gold font-semibold text-[17px]">
              It shouldn&apos;t. And now it doesn&apos;t. Same land. Same seeds. Same promise.
            </p>
          </div>
        </div>
      </section>

      {/* ── PROCESS ── */}
      <section className="py-20 px-5 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="mb-14 text-center">
            <p className="text-gold text-[11px] font-semibold tracking-[0.3em] uppercase mb-3">End to End</p>
            <h2 className="font-hero text-[30px] md:text-[38px] font-extrabold text-dark-brown">
              What Makes Ponkali Different
            </h2>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            {[
              { Icon: LeafIcon,    title: 'We grow it',  desc: 'Our own fields in Erode. We know every row, every harvest.' },
              { Icon: CogIcon,     title: 'We grind it', desc: 'On the stone mill our grandfather built. Slow, cold, preserving every essential oil.' },
              { Icon: PackageIcon, title: 'We pack it',  desc: 'Within days of grinding. No warehouse. No long storage. Packed fresh.' },
              { Icon: TruckIcon,   title: 'We ship it',  desc: 'Direct to your door. No middlemen. Full traceability from farm to kitchen.' },
            ].map(({ Icon, title, desc }) => (
              <div key={title} className="bg-cream rounded-2xl p-6 border border-black/6 flex gap-4 items-start">
                <div className="w-10 h-10 rounded-full bg-gold/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Icon className="w-5 h-5 text-gold" />
                </div>
                <div>
                  <p className="font-hero font-bold text-dark-brown text-[18px] mb-1">{title}</p>
                  <p className="text-[14px] text-gray-500 leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PACKAGING / HERITAGE IMAGE ── */}
      <section className="py-20 px-5 bg-cream">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-14 items-center">
          <div>
            <p className="text-gold text-[11px] font-semibold tracking-[0.3em] uppercase mb-4">Inside Every Pack</p>
            <h2 className="font-hero text-[30px] md:text-[38px] font-extrabold text-dark-brown tracking-tight leading-[1.05] mb-6">
              What you read on the back is what&apos;s inside
            </h2>
            <p className="text-gray-600 leading-[1.9] text-[16px] mb-5">
              The back of every Ponkali pack carries the full heritage story in English, Tamil, Hindi and Telugu. We believe you should know exactly where your food comes from, who grew it and how it was made.
            </p>
            <p className="text-gray-600 leading-[1.9] text-[16px] mb-8">
              Ingredients: 100% pure turmeric powder. That is the entire list.
            </p>
            <div className="border border-black/8 rounded-2xl p-5">
              <p className="text-[11px] text-gray-400 mb-1 tracking-wider uppercase font-medium">FSSAI Licensed</p>
              <p className="font-bold text-dark-brown text-[15px]">Lic. No. 22426064000154</p>
              <p className="text-[13px] text-gray-500 mt-1">The Native, Erode, 638055, Tamil Nadu</p>
            </div>
          </div>

          {/* Back of packaging image */}
          <div className="rounded-2xl overflow-hidden bg-white border border-black/6 shadow-sm aspect-square relative max-w-sm mx-auto md:max-w-none">
            <Image
              src="/images/new-prd-img1.png"
              alt="Ponkali Turmeric Powder, front and back packaging"
              fill
              className="object-contain p-6"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-20 px-5 bg-dark-brown text-center">
        <p className="text-gold/70 text-[11px] font-semibold tracking-[0.3em] uppercase mb-4">From Our Farm</p>
        <h2 className="font-hero text-[32px] md:text-[42px] font-extrabold text-white tracking-tight mb-4">
          Taste What Three Generations Built
        </h2>
        <p className="text-cream/50 text-[16px] mb-8 max-w-md mx-auto">
          Free shipping on every order. Delivered in 3 to 5 days anywhere in India.
        </p>
        <Link
          href="/shop"
          className="inline-flex items-center gap-2 bg-gold text-dark-brown px-10 py-4 rounded-full font-bold text-[15px] hover:bg-yellow-400 transition-all"
        >
          Shop Now
          <ArrowRightIcon className="w-4 h-4" />
        </Link>
      </section>

    </div>
  );
}
