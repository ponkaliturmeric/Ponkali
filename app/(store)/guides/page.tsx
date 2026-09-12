import type { Metadata } from 'next';
import Link from 'next/link';
import { buildMetadata } from '@/lib/seo';
import { GUIDES } from '@/lib/content';
import { ArrowRightIcon } from '@/components/Icons';

export const metadata: Metadata = buildMetadata({
  title: 'Turmeric Guides: Purity, Curcumin and the Erode GI Tag',
  description:
    'Plain-language guides from a third-generation Erode turmeric farm: how to check turmeric purity at home, what curcumin percentages mean, and why Erode turmeric is GI-tagged.',
  path: '/guides',
});

export default function GuidesIndexPage() {
  return (
    <div className="min-h-screen bg-cream">
      <div className="bg-dark-brown py-16 px-5 text-center">
        <p className="text-gold/70 text-[11px] font-semibold tracking-[0.35em] uppercase mb-4">Learn</p>
        <h1 className="font-hero text-[36px] md:text-[48px] font-extrabold text-white tracking-tight mb-4">Turmeric, explained</h1>
        <p className="text-white/70 text-[16px] max-w-xl mx-auto leading-[1.7]">
          Straight answers from a family that has grown turmeric in Erode for three generations.
        </p>
      </div>
      <div className="max-w-3xl mx-auto px-5 py-14 space-y-5">
        {GUIDES.map((g) => (
          <Link
            key={g.slug}
            href={`/guides/${g.slug}`}
            className="block bg-white rounded-2xl border border-black/6 p-7 hover:border-gold/40 transition-colors group"
          >
            <h2 className="font-hero text-[22px] font-extrabold text-dark-brown tracking-tight mb-2 group-hover:text-gold transition-colors">{g.title}</h2>
            <p className="text-[15px] text-gray-600 leading-[1.7] mb-4">{g.description}</p>
            <span className="inline-flex items-center gap-2 text-[13px] font-semibold text-gold">
              Read the guide <ArrowRightIcon className="w-3.5 h-3.5" />
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
