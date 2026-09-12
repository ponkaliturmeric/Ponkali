import JsonLd from './JsonLd';
import { faqJsonLd } from '@/lib/seo';
import type { FaqItem } from '@/lib/content';

/**
 * Visible FAQ + matching FAQPage schema. Uses native <details> so every answer
 * is in the HTML for crawlers (not loaded on click), and works without JS.
 */
export default function Faq({
  items,
  eyebrow = 'Questions',
  title = 'Frequently asked about Erode turmeric',
  dark = false,
}: {
  items: FaqItem[];
  eyebrow?: string;
  title?: string;
  dark?: boolean;
}) {
  return (
    <section className={dark ? 'bg-dark-brown py-20 px-5' : 'bg-cream py-20 px-5'} aria-labelledby="faq-heading">
      <JsonLd data={faqJsonLd(items)} />
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-12">
          <p className={`text-[11px] font-semibold tracking-[0.35em] uppercase mb-4 ${dark ? 'text-gold/70' : 'text-gold'}`}>{eyebrow}</p>
          <h2 id="faq-heading" className={`font-hero text-[30px] md:text-[38px] font-extrabold tracking-tight ${dark ? 'text-white' : 'text-dark-brown'}`}>
            {title}
          </h2>
        </div>
        <div className="space-y-3">
          {items.map((item) => (
            <details
              key={item.question}
              className={`group rounded-2xl border px-6 py-5 ${dark ? 'bg-white/[0.04] border-white/10' : 'bg-white border-black/6'}`}
            >
              <summary className={`cursor-pointer list-none flex items-start justify-between gap-4 font-semibold text-[16px] ${dark ? 'text-white' : 'text-dark-brown'}`}>
                <h3 className="font-semibold text-[16px]">{item.question}</h3>
                <span className={`flex-shrink-0 mt-0.5 text-[20px] leading-none transition-transform group-open:rotate-45 ${dark ? 'text-gold' : 'text-gold'}`} aria-hidden>+</span>
              </summary>
              <p className={`mt-3 text-[15px] leading-[1.8] ${dark ? 'text-white/70' : 'text-gray-600'}`}>{item.answer}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
