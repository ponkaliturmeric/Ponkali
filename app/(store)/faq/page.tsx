import type { Metadata } from 'next';
import Link from 'next/link';
import Faq from '@/components/Faq';
import { buildMetadata } from '@/lib/seo';
import { FAQ, GUIDES } from '@/lib/content';
import { ArrowRightIcon } from '@/components/Icons';

export const metadata: Metadata = buildMetadata({
  title: 'Erode Turmeric FAQ: Curcumin, Purity, Delivery and More',
  description:
    'Answers from the Ponkali farm in Erode: what the GI tag means, our curcumin content, how to test turmeric purity at home, storage, delivery charges and payment options.',
  path: '/faq',
});

export default function FaqPage() {
  return (
    <div className="min-h-screen bg-cream">
      <div className="bg-dark-brown py-16 px-5 text-center">
        <p className="text-gold/70 text-[11px] font-semibold tracking-[0.35em] uppercase mb-4">Help</p>
        <h1 className="font-hero text-[36px] md:text-[48px] font-extrabold text-white tracking-tight mb-4">Frequently asked questions</h1>
        <p className="text-white/70 text-[16px] max-w-xl mx-auto leading-[1.7]">
          About Erode turmeric, our farm, and ordering from Ponkali. Can&apos;t find it here? WhatsApp us at +91 99440 33696.
        </p>
      </div>

      <Faq items={FAQ} eyebrow="Answers" title="Erode turmeric, explained" />

      <section className="bg-white py-16 px-5">
        <div className="max-w-3xl mx-auto">
          <h2 className="font-hero text-[24px] font-extrabold text-dark-brown tracking-tight mb-6">Go deeper</h2>
          <ul className="space-y-4">
            {GUIDES.map((g) => (
              <li key={g.slug}>
                <Link href={`/guides/${g.slug}`} className="group flex items-start justify-between gap-4 bg-cream rounded-2xl p-5 border border-black/6 hover:border-gold/40 transition-colors">
                  <span>
                    <span className="block font-semibold text-dark-brown text-[16px] group-hover:text-gold transition-colors">{g.title}</span>
                    <span className="block text-[13px] text-gray-500 mt-1 leading-[1.6]">{g.description}</span>
                  </span>
                  <ArrowRightIcon className="w-4 h-4 text-gold flex-shrink-0 mt-1" />
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </div>
  );
}
