import type { Metadata } from 'next';
import { CogIcon, LeafIcon, PackageIcon, TruckIcon } from '@/components/Icons';

export const metadata: Metadata = {
  title: 'Our Story',
  description: 'Named after grandparents Ponnamal and Kaaliappa Gounder, who farmed Erode turmeric for 40+ years. Three generations of farm-direct purity from Perundurai, Erode.',
};

export default function OurStoryPage() {
  return (
    <div className="min-h-screen bg-cream">
      <div className="bg-dark-brown py-24 px-5 text-center">
        <p className="text-gold/70 text-[11px] font-semibold tracking-[0.35em] uppercase mb-5">Est. 1980s · Perundurai, Erode</p>
        <h1 className="font-display text-[42px] md:text-[64px] font-extrabold text-white tracking-tight leading-[1.0] mb-5">Our Story</h1>
        <p className="text-cream/50 text-[17px] max-w-lg mx-auto leading-[1.7]">
          Named after a grandmother and grandfather who gave everything to this land.
        </p>
      </div>

      <div className="max-w-2xl mx-auto px-5 py-20 space-y-20">
        {/* Ponnamal */}
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="rounded-2xl overflow-hidden bg-gradient-to-br from-[#F5D878] via-[#C47D10] to-[#2C1000] h-72 flex items-center justify-center">
            <div className="text-center p-8">
              <p className="text-white/40 text-[10px] tracking-widest uppercase mb-3">Grandmother</p>
              <p className="text-white font-extrabold text-[22px] mb-2">Ponnamal Gounder</p>
              <p className="text-cream/60 text-[13px]">The name behind our brand</p>
            </div>
          </div>
          <div>
            <h2 className="font-display text-[24px] font-extrabold text-dark-brown tracking-tight mb-4">Ponnamal — The First Seed</h2>
            <p className="text-gray-600 leading-[1.9] text-[16px]">
              Our grandmother Ponnamal tended these turmeric fields before we could walk. She knew every row, every plant, every season. She would say turmeric is not just a spice — it is medicine, it is prayer, it is the smell of home. We carry her name so we never forget what this is about.
            </p>
          </div>
        </div>

        {/* Kaaliappa */}
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="md:order-2 rounded-2xl overflow-hidden bg-gradient-to-br from-[#2C1000] via-[#7A3B00] to-[#D4960A] h-72 flex items-center justify-center">
            <div className="text-center p-8">
              <p className="text-white/40 text-[10px] tracking-widest uppercase mb-3">Grandfather</p>
              <p className="text-white font-extrabold text-[22px] mb-2">Kaaliappa Gounder</p>
              <p className="text-cream/60 text-[13px]">Builder of the stone mill</p>
            </div>
          </div>
          <div className="md:order-1">
            <h2 className="font-display text-[24px] font-extrabold text-dark-brown tracking-tight mb-4">Kaaliappa — The Stone Mill</h2>
            <p className="text-gray-600 leading-[1.9] text-[16px]">
              Our grandfather Kaaliappa built the stone mill with his own hands. He believed that turmeric ground by machine loses its soul — the oils, the fragrance, the depth. He was right. Forty years later, the same stone mill still runs. Slower than a factory. Truer than anything you can buy in a supermarket.
            </p>
          </div>
        </div>

        {/* The Farm */}
        <div className="bg-white rounded-2xl p-8 md:p-10 border border-black/6">
          <h2 className="text-[24px] font-extrabold text-dark-brown tracking-tight mb-5">The Farm — Perundurai, Erode</h2>
          <p className="text-gray-600 leading-[1.9] text-[16px] mb-4">
            Erode is not called the Yellow City for nothing. This district in Tamil Nadu produces some of the world&apos;s finest turmeric — with curcumin levels of 2.5–4.5%, double the national average. The Erode variety is GI-tagged, meaning it can only come from here. There is no substitute.
          </p>
          <p className="text-gray-600 leading-[1.9] text-[16px]">
            Our fields in Perundurai have been farmed organically for generations. The same water, the same soil, the same sun. We use no synthetic fertilisers. We rotate crops. We respect the land as it has given to us.
          </p>
        </div>

        {/* Three generations */}
        <div className="bg-dark-brown rounded-2xl p-8 md:p-10">
          <h2 className="font-display text-[24px] font-extrabold text-gold tracking-tight mb-5">Three Generations, One Promise</h2>
          <p className="text-cream/70 leading-[1.9] text-[16px] mb-4">
            We are the third generation. We grew up watching our grandparents farm, our parents grind, and now we carry this forward — not with nostalgia, but with pride. The world changed. Distribution changed. But we did not change what matters: the land, the stone, the purity.
          </p>
          <p className="text-cream/70 leading-[1.9] text-[16px] mb-4">
            Ponkali Masalas was born from a simple question: why should a Chennai family not be able to buy the same turmeric that our grandmother grew? Why should it pass through four middlemen, lose its freshness, and arrive on your shelf mixed with starch and artificial colour?
          </p>
          <p className="text-gold font-semibold leading-[1.7] text-[16px]">
            It shouldn&apos;t. And now it doesn&apos;t. Same land. Same seeds. Same promise.
          </p>
        </div>

        {/* What makes it different */}
        <div>
          <h2 className="font-display text-[24px] font-extrabold text-dark-brown tracking-tight mb-8">What Makes Ponkali Different</h2>
          <div className="grid md:grid-cols-2 gap-4">
            {[
              { Icon: LeafIcon, title: 'We grow it', desc: 'Our own fields in Perundurai, Erode. We know every row.' },
              { Icon: CogIcon, title: 'We grind it', desc: 'On the stone mill our grandfather built. Slow, cold, true.' },
              { Icon: PackageIcon, title: 'We pack it', desc: 'Within days of grinding. No warehouse. No waiting.' },
              { Icon: TruckIcon, title: 'We ship it', desc: 'Direct to your door. No middlemen. Full traceability.' },
            ].map(({ Icon, title, desc }) => (
              <div key={title} className="bg-white rounded-xl p-5 border border-black/6 flex gap-4">
                <div className="w-9 h-9 rounded-full bg-gold/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Icon className="w-4 h-4 text-gold" />
                </div>
                <div>
                  <p className="font-bold text-dark-brown text-[15px]">{title}</p>
                  <p className="text-[14px] text-gray-500 mt-1 leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* FSSAI */}
        <div className="border border-black/8 rounded-2xl p-6 text-center">
          <p className="text-[11px] text-gray-400 mb-1 tracking-wider uppercase font-medium">FSSAI Licensed · Certified Safe</p>
          <p className="font-bold text-dark-brown">Lic. No. 22426064000154</p>
          <p className="text-[13px] text-gray-500 mt-2">Manufactured by The Native, Perundurai, Erode — 638055, Tamil Nadu</p>
        </div>
      </div>
    </div>
  );
}
