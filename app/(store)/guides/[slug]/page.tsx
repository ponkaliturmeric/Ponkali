import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import JsonLd from '@/components/JsonLd';
import Faq from '@/components/Faq';
import { articleJsonLd, breadcrumbJsonLd, buildMetadata } from '@/lib/seo';
import { GUIDES, getGuide } from '@/lib/content';
import { getFromPrice } from '@/lib/catalog';

export function generateStaticParams() {
  return GUIDES.map((g) => ({ slug: g.slug }));
}
export const revalidate = 60;

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const guide = getGuide(params.slug);
  if (!guide) return buildMetadata({ title: 'Guide', path: `/guides/${params.slug}`, noindex: true });
  return buildMetadata({
    title: guide.title,
    description: guide.description,
    path: `/guides/${guide.slug}`,
  });
}

export default async function GuidePage({ params }: { params: { slug: string } }) {
  const guide = getGuide(params.slug);
  if (!guide) notFound();
  const fromPrice = await getFromPrice();
  const others = GUIDES.filter((g) => g.slug !== guide.slug);

  return (
    <article className="min-h-screen bg-cream">
      <JsonLd
        data={[
          articleJsonLd(guide),
          breadcrumbJsonLd([
            { name: 'Home', path: '/' },
            { name: 'Guides', path: '/guides' },
            { name: guide.title, path: `/guides/${guide.slug}` },
          ]),
        ]}
      />

      <header className="bg-dark-brown py-16 px-5">
        <div className="max-w-3xl mx-auto">
          <nav aria-label="Breadcrumb" className="text-[12px] text-white/50 mb-6">
            <Link href="/" className="hover:text-white">Home</Link> <span className="mx-1.5">/</span>
            <Link href="/guides" className="hover:text-white">Guides</Link>
          </nav>
          <h1 className="font-hero text-[32px] md:text-[44px] font-extrabold text-white tracking-tight leading-[1.1] mb-5">{guide.title}</h1>
          <p className="text-white/75 text-[17px] leading-[1.7]">{guide.intro}</p>
          <p className="text-white/40 text-[12px] mt-6">
            By Ponkali Masalas, Erode · Updated {new Date(guide.updated).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-5 py-14">
        <div className="bg-white rounded-2xl border border-black/6 p-8 md:p-12">
          {guide.sections.map((s) => (
            <section key={s.heading} className="mb-10 last:mb-0">
              <h2 className="font-hero text-[22px] font-extrabold text-dark-brown tracking-tight mb-4">{s.heading}</h2>
              {s.paragraphs.map((p, i) => (
                <p key={i} className="text-[16px] text-gray-700 leading-[1.85] mb-4">{p}</p>
              ))}
              {s.bullets && (
                <ul className="list-disc pl-5 space-y-2 mb-4">
                  {s.bullets.map((b, i) => (
                    <li key={i} className="text-[16px] text-gray-700 leading-[1.75]">{b}</li>
                  ))}
                </ul>
              )}
            </section>
          ))}
        </div>

        {/* Product CTA — this is the lead */}
        <div className="mt-8 bg-dark-brown rounded-2xl p-8 md:p-10 text-center">
          <p className="text-gold/70 text-[11px] font-semibold tracking-[0.35em] uppercase mb-3">Farm direct</p>
          <h2 className="font-hero text-[26px] md:text-[32px] font-extrabold text-white tracking-tight mb-3">
            GI-tagged Erode turmeric, from the farm that grew it
          </h2>
          <p className="text-white/70 text-[15px] mb-7 max-w-md mx-auto">
            2.5% to 3.5% natural curcumin. Ground and packed on our farm in Erode. Delivered anywhere in India.
          </p>
          <Link href="/shop" className="inline-block bg-gold text-dark-brown px-9 py-3.5 rounded-full font-semibold text-[15px] hover:bg-yellow-500 transition-colors">
            Shop Ponkali Turmeric, from ₹{fromPrice}
          </Link>
        </div>

        {others.length > 0 && (
          <div className="mt-12">
            <h2 className="font-hero text-[20px] font-extrabold text-dark-brown tracking-tight mb-4">More guides</h2>
            <ul className="space-y-2">
              {others.map((g) => (
                <li key={g.slug}>
                  <Link href={`/guides/${g.slug}`} className="text-[15px] text-gold font-medium hover:underline">{g.title}</Link>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {guide.faq && guide.faq.length > 0 && (
        <Faq items={guide.faq} eyebrow="Quick answers" title="Common questions" />
      )}
    </article>
  );
}
