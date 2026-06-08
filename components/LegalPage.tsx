import type { ReactNode } from 'react';
import Mandala from './Mandala';

/**
 * Shared shell for the legal / policy pages (privacy, shipping, refunds, terms).
 * Pages pass plain markup as children; styling for headings, paragraphs and
 * lists is applied here via scoped Tailwind selectors so each page stays clean.
 */
export default function LegalPage({
  eyebrow,
  title,
  intro,
  updated,
  children,
}: {
  eyebrow: string;
  title: string;
  intro: string;
  updated: string;
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen bg-cream">
      <div className="relative overflow-hidden py-20 px-5 text-center bg-dark-brown">
        <Mandala className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[640px] h-[640px] text-white opacity-[0.08] pointer-events-none select-none" />
        <div className="relative z-10">
          <p className="text-gold text-[11px] font-semibold tracking-[0.35em] uppercase mb-5">{eyebrow}</p>
          <h1 className="font-hero text-[36px] md:text-[52px] font-extrabold text-white tracking-tight mb-4">{title}</h1>
          <p className="text-white/75 text-[16px] max-w-xl mx-auto leading-[1.7]">{intro}</p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-5 py-16">
        <div
          className="bg-white rounded-2xl border border-black/6 p-8 md:p-12
            [&_h2]:font-hero [&_h2]:text-[20px] [&_h2]:font-extrabold [&_h2]:text-dark-brown [&_h2]:tracking-tight [&_h2]:mt-10 [&_h2]:mb-3 [&_h2:first-child]:mt-0
            [&_p]:text-[15px] [&_p]:text-gray-600 [&_p]:leading-[1.8] [&_p]:mb-4
            [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:mb-4 [&_ul]:space-y-1.5
            [&_li]:text-[15px] [&_li]:text-gray-600 [&_li]:leading-[1.7]
            [&_a]:text-gold [&_a]:font-medium hover:[&_a]:underline
            [&_strong]:text-dark-brown [&_strong]:font-semibold"
        >
          {children}
          <p className="text-[13px] text-gray-400 mt-10 pt-6 border-t border-black/6">Last updated: {updated}</p>
        </div>
      </div>
    </div>
  );
}
