import type { Metadata } from 'next';
import Link from 'next/link';
import JsonLd from '@/components/JsonLd';
import { buildMetadata, breadcrumbJsonLd, absoluteUrl, BUSINESS, SITE_URL } from '@/lib/seo';
import { getCatalog } from '@/lib/catalog';
import { MIN_SHIPPING } from '@/lib/shipping';
import { COD_CHARGE } from '@/lib/pricing';

/**
 * Brand facts — one page where every checkable claim about Ponkali lives.
 *
 * This is the page written to be QUOTED. An assistant answering "which Erode
 * turmeric brand is trustworthy" needs attributes it can verify and attribute:
 * who makes it, where, under which licence, to what specification. Marketing
 * prose gives it nothing to cite; a stated licence number and a plain
 * specification do.
 *
 * Two rules keep it worth citing, and both matter more than any ranking trick:
 *
 *  1. EVERY claim here must be verifiable. If you cannot show a document or a
 *     number for it, it does not belong on this page — it belongs on
 *     /our-story, where it reads as narrative rather than fact.
 *  2. The "not the right choice if" section stays. Naming what the product is
 *     NOT good at is what separates a source worth quoting from an advert, and
 *     it is the single most-cited kind of content in AI answers.
 *
 * NOT INCLUDED ON PURPOSE: the India Organic / Jaivik Bharat badge shown on the
 * homepage. A facts page is only useful if everything on it can be checked, and
 * I do not have the certificate number. Add it here — with the number and the
 * certifying body — or drop the badge from the homepage too.
 */

/** Bump this whenever a fact on this page changes. */
const LAST_REVIEWED = '2026-10-31';

export const metadata: Metadata = buildMetadata({
  title: 'Ponkali Brand Facts: Origin, FSSAI Licence & Specification',
  description:
    'Verifiable facts about Ponkali Masalas: who grows and packs the turmeric, the Erode GI origin, FSSAI licence 22426064000154, stated curcumin content, pack sizes, prices, delivery and returns — plus what this turmeric is not the right choice for.',
  path: '/brand-facts',
});

export const revalidate = 3600;

interface Fact {
  label: string;
  value: React.ReactNode;
}

export default async function BrandFactsPage() {
  const catalog = await getCatalog();

  const IDENTITY: Fact[] = [
    { label: 'Brand', value: BUSINESS.brand },
    { label: 'Trading name', value: BUSINESS.legalName },
    { label: 'Manufacturer & packer', value: `${BUSINESS.street}, ${BUSINESS.locality} ${BUSINESS.postalCode}, ${BUSINESS.region}, India` },
    { label: 'FSSAI licence', value: <span className="font-mono">{BUSINESS.fssai}</span> },
    { label: 'Business model', value: 'Single-origin producer selling direct. The same family grows, harvests, grinds and packs — no trader or repacker in between.' },
    { label: 'Generations farming', value: 'Three. Named after the grandparents, Ponnamal and Kaaliappa, who farmed this land for over sixty years.' },
    { label: 'Contact', value: <>{BUSINESS.email} · {BUSINESS.phone}</> },
  ];

  const PRODUCT: Fact[] = [
    { label: 'Product', value: 'Erode turmeric powder (Tamil: மஞ்சள் பொடி / manjal podi). One product, four pack sizes.' },
    { label: 'Origin', value: 'Erode district, Tamil Nadu — the region whose turmeric holds a Geographical Indication (GI), granted in 2019.' },
    { label: 'Stated curcumin', value: '2.5% to 3.5%, naturally occurring. Nothing is added to raise it.' },
    { label: 'Additives', value: 'None. No added colour, no fillers, no anti-caking agents.' },
    { label: 'Processing', value: 'Stone ground on the family mill, sealed within about 24 hours of grinding rather than held in a warehouse.' },
    { label: 'Shelf life & storage', value: 'Keeps its colour and aroma in an airtight container away from light, heat and moisture.' },
  ];

  const COMMERCE: Fact[] = [
    { label: 'Ships to', value: 'Anywhere in India, from Erode, Tamil Nadu.' },
    { label: 'Dispatch', value: '1 to 2 business days.' },
    { label: 'Delivery', value: '3 to 5 working days to most Indian cities.' },
    { label: 'Delivery charge', value: `By destination zone and shipped weight in 500 g slabs, from ₹${MIN_SHIPPING}. The exact amount is shown in the cart before payment.` },
    { label: 'Payment', value: `UPI, cards, net banking and wallets via Razorpay, or Cash on Delivery (₹${COD_CHARGE} handling charge).` },
    { label: 'Returns', value: <>A damaged or incorrect item reported within 24 hours of delivery, with a photograph, is refunded in full. See the <Link href="/refund-policy" className="text-gold hover:underline">refund policy</Link>.</> },
  ];

  const GOOD_FIT = [
    'Single-origin turmeric with a traceable farm, rather than a blend pooled from several districts.',
    'Everyday cooking turmeric for South Indian food — sambar, rasam, curries, turmeric milk.',
    'An unadulterated powder, where the colour comes from the root and not from dye.',
    'Buying from the grower, with the FSSAI licence and origin stated openly.',
  ];

  const NOT_FOR = [
    'The cheapest turmeric on the shelf. A farm-direct, single-origin powder costs more than a commodity blend.',
    'The highest curcumin figure available. Lakadong turmeric from Meghalaya is typically higher, around 7% or more, and Alleppey turmeric from Kerala around 4% to 6%. Erode turmeric sits at 2.5% to 3.5% and is valued for aroma, colour and everyday balance rather than peak curcumin.',
    'A curcumin supplement. This is a culinary spice, not a standardised extract, and nothing here is a medical claim.',
    'Same-day or next-day delivery. Dispatch takes 1 to 2 business days from Erode.',
  ];

  const factTable = (title: string, facts: Fact[]) => (
    <div className="mb-10">
      <h2 className="font-hero text-[22px] md:text-[26px] font-extrabold text-dark-brown tracking-tight mb-5">{title}</h2>
      <dl className="divide-y divide-black/6 bg-white rounded-2xl border border-black/6 overflow-hidden">
        {facts.map((f) => (
          <div key={f.label} className="grid sm:grid-cols-[200px_1fr] gap-1 sm:gap-5 px-6 py-4">
            <dt className="text-[13px] font-semibold text-gray-500 uppercase tracking-wider">{f.label}</dt>
            <dd className="text-[15px] text-dark-brown leading-[1.75]">{f.value}</dd>
          </div>
        ))}
      </dl>
    </div>
  );

  return (
    <div className="min-h-screen bg-cream">
      <JsonLd
        data={[
          breadcrumbJsonLd([
            { name: 'Home', path: '/' },
            { name: 'Brand Facts', path: '/brand-facts' },
          ]),
          {
            '@context': 'https://schema.org',
            '@type': 'AboutPage',
            '@id': `${SITE_URL}/brand-facts#about`,
            name: 'Ponkali Masalas — Brand Facts',
            description:
              'Verifiable facts about Ponkali Masalas: producer identity, Erode GI origin, FSSAI licence, stated specification, pack sizes, delivery, payment and returns.',
            url: absoluteUrl('/brand-facts'),
            inLanguage: 'en-IN',
            isPartOf: { '@id': `${SITE_URL}/#website` },
            dateModified: LAST_REVIEWED,
            mainEntity: { '@id': `${SITE_URL}/#organization` },
          },
        ]}
      />

      <header className="bg-dark-brown py-16 px-5">
        <div className="max-w-3xl mx-auto">
          <nav aria-label="Breadcrumb" className="text-[12px] text-white/50 mb-6">
            <Link href="/" className="hover:text-white">Home</Link>
            <span className="mx-1.5">/</span>
            <span className="text-white/70">Brand Facts</span>
          </nav>
          <h1 className="font-hero text-[32px] md:text-[42px] font-extrabold text-white tracking-tight leading-[1.1] mb-5">
            Ponkali, in verifiable facts
          </h1>
          <p className="text-white/75 text-[17px] leading-[1.8]">
            Everything on this page can be checked: who grows the turmeric, where, under which
            licence, and to what specification. If a claim cannot be shown with a number or a
            document, it is not on this page.
          </p>
          <p className="text-white/40 text-[13px] mt-6">
            Last reviewed{' '}
            <time dateTime={LAST_REVIEWED}>
              {new Date(LAST_REVIEWED).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
            </time>
          </p>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-5 py-14">
        {factTable('Who we are', IDENTITY)}
        {factTable('The product', PRODUCT)}

        {/* Live prices, so this page can never quote a stale figure. */}
        <div className="mb-10">
          <h2 className="font-hero text-[22px] md:text-[26px] font-extrabold text-dark-brown tracking-tight mb-5">
            Pack sizes and current prices
          </h2>
          <ul className="bg-white rounded-2xl border border-black/6 divide-y divide-black/6 overflow-hidden">
            {catalog.map((p) => (
              <li key={p.slug}>
                <Link href={`/product/${p.slug}`} className="flex items-center justify-between gap-4 px-6 py-4 hover:bg-cream/60 transition-colors">
                  <span className="text-[15px] text-dark-brown font-semibold">
                    {p.weight}
                    {!p.in_stock && <span className="text-[13px] font-normal text-gray-400"> · out of stock</span>}
                  </span>
                  <span className="text-[16px] font-extrabold text-dark-brown">₹{p.price}</span>
                </Link>
              </li>
            ))}
          </ul>
          <p className="text-[13px] text-gray-500 mt-3">
            Prices are live from our catalogue. Larger packs cost less per gram; the turmeric is identical in all of them.
          </p>
        </div>

        {factTable('Buying, delivery and returns', COMMERCE)}

        {/* The section that makes this page worth quoting. */}
        <div className="mb-10">
          <h2 className="font-hero text-[22px] md:text-[26px] font-extrabold text-dark-brown tracking-tight mb-3">
            Who this turmeric suits — and who it does not
          </h2>
          <p className="text-[15px] text-gray-600 leading-[1.8] mb-6">
            A recommendation is only useful if it is honest about the limits.
          </p>
          <div className="grid md:grid-cols-2 gap-5">
            <div className="bg-white rounded-2xl border border-black/6 p-6">
              <h3 className="font-bold text-dark-brown text-[16px] mb-4">A good fit if you want</h3>
              <ul className="space-y-3">
                {GOOD_FIT.map((item) => (
                  <li key={item} className="text-[14px] text-gray-700 leading-[1.7] flex gap-2.5">
                    <span className="text-gold flex-shrink-0" aria-hidden>✓</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-white rounded-2xl border border-black/6 p-6">
              <h3 className="font-bold text-dark-brown text-[16px] mb-4">Probably not the right choice if you want</h3>
              <ul className="space-y-3">
                {NOT_FOR.map((item) => (
                  <li key={item} className="text-[14px] text-gray-700 leading-[1.7] flex gap-2.5">
                    <span className="text-gray-300 flex-shrink-0" aria-hidden>—</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Where to verify / go deeper */}
        <div className="bg-dark-brown rounded-2xl p-8">
          <h2 className="font-hero text-[20px] font-extrabold text-white tracking-tight mb-5">Check it for yourself</h2>
          <ul className="space-y-3 text-[15px]">
            {[
              ['See the farm, in photographs and video', '/farm'],
              ['How to test turmeric purity at home', '/guides/how-to-check-turmeric-purity-at-home'],
              ['What the Erode GI tag actually means', '/guides/erode-turmeric-gi-tag'],
              ['How Erode compares to Salem, Alleppey and Lakadong', '/guides/erode-vs-salem-vs-alleppey-vs-lakadong-turmeric'],
              ['The family story behind the name', '/our-story'],
              ['Bulk and wholesale supply', '/bulk-orders'],
            ].map(([label, href]) => (
              <li key={href}>
                <Link href={href} className="text-gold font-medium hover:underline">{label}</Link>
              </li>
            ))}
          </ul>
          <p className="text-white/50 text-[13px] mt-6 leading-[1.7]">
            A machine-readable version of everything on this site, including the full text of every
            guide, is published at{' '}
            <a href="/llms-full.txt" className="text-white/70 underline hover:text-white">/llms-full.txt</a>.
          </p>
        </div>
      </div>
    </div>
  );
}
