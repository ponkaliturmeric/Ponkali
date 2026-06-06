import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRightIcon } from '@/components/Icons';
import { buildMetadata } from '@/lib/seo';
import { FROM_PRICE } from '@/lib/products';

export const metadata: Metadata = buildMetadata({
  title: 'From Our Farm',
  description: 'Real photos from our turmeric farm in Perundurai, Erode: the fields, the harvest and the traditional processing. This is where your Ponkali turmeric begins.',
  path: '/farm',
});

const FARM_IMAGES = Array.from({ length: 17 }, (_, i) => ({
  src: `/images/farm/farm-${String(i + 1).padStart(2, '0')}.jpeg`,
  alt: `Ponkali turmeric farm in Perundurai, Erode`,
}));

export default function FarmPage() {
  return (
    <div className="min-h-screen bg-dark-brown">

      {/* ── Hero ── */}
      <div className="py-20 px-5 text-center border-b border-white/6">
        <p className="text-gold/70 text-[11px] font-semibold tracking-[0.35em] uppercase mb-5">
          Perundurai, Erode · Tamil Nadu
        </p>
        <h1 className="font-hero text-[44px] md:text-[68px] font-extrabold text-white tracking-tight leading-[1.0] mb-5">
          From Our Farm
        </h1>
        <p className="text-cream/50 text-[16px] md:text-[18px] max-w-xl mx-auto leading-[1.7]">
          Real photos from our fields in Perundurai. The same soil, the same people
          and the same process that has produced Erode turmeric for generations.
        </p>
      </div>

      {/* ── Gallery ── */}
      <div className="px-3 sm:px-5 py-10">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3">
            {FARM_IMAGES.map((img, i) => (
              <div
                key={i}
                className="relative aspect-square rounded-xl overflow-hidden group cursor-pointer"
              >
                <Image
                  src={img.src}
                  alt={img.alt}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/15 transition-colors duration-300" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Bottom note + CTA ── */}
      <div className="py-16 px-5 text-center border-t border-white/6">
        <p className="text-cream/40 text-[14px] mb-2 max-w-md mx-auto leading-relaxed">
          Every photo here is from our family&apos;s land in Perundurai.
          No stock images. No outside sourcing. This is exactly where your turmeric comes from.
        </p>
        <p className="text-gold/60 text-[13px] font-medium mb-8">
          GI Recognised · Erode, Tamil Nadu
        </p>

        <Link
          href="/shop"
          className="inline-flex items-center gap-2 bg-gold text-dark-brown px-10 py-4 rounded-full font-bold text-[15px] hover:bg-yellow-400 transition-all mb-6"
        >
          Shop Now, from ₹{FROM_PRICE}
          <ArrowRightIcon className="w-4 h-4" />
        </Link>

        <div>
          <Link
            href="/our-story"
            className="text-cream/35 text-[13px] hover:text-cream/60 transition-colors"
          >
            ← Back to Our Story
          </Link>
        </div>
      </div>

    </div>
  );
}
