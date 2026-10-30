import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import JsonLd from '@/components/JsonLd';
import Faq from '@/components/Faq';
import { buildMetadata, breadcrumbJsonLd, absoluteUrl, BUSINESS, SITE_URL } from '@/lib/seo';
import type { FaqItem } from '@/lib/content';
import { CheckIcon, ShieldCheckIcon, TruckIcon, LeafIcon } from '@/components/Icons';

/**
 * Wholesale / bulk landing page.
 *
 * Commercially the most valuable page on the site to rank for: "turmeric powder
 * wholesale", "bulk turmeric supplier erode", "turmeric manufacturer tamil nadu"
 * are low-competition, high-intent searches where the visitor is a business
 * about to place a repeat order — and Erode is the obvious origin to search
 * from. Enquiries land in the admin's Bulk Enquiries pipeline.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * CONFIRM BEFORE YOU LEAN ON THIS PAGE. The answers below deliberately ASK
 * rather than promise, because these are business decisions only you can make.
 * Replace them with your real policy once you have decided:
 *   • minimum order quantity
 *   • whether you do private label / unlabelled packing, and in which sizes
 *   • payment terms (advance %, credit)
 *   • whether you can issue a GST invoice
 *   • sample policy (free or paid, who pays the shipping)
 * Everything else here (origin, curcumin range, FSSAI licence, dispatch and
 * delivery times) is already true of your retail orders.
 * ─────────────────────────────────────────────────────────────────────────────
 */

export const metadata: Metadata = buildMetadata({
  title: 'Bulk & Wholesale Turmeric Powder Supplier in Erode, Tamil Nadu',
  description:
    'Buy turmeric powder in bulk direct from a third-generation Erode farm. GI-tagged, 2.5% to 3.5% natural curcumin, FSSAI certified, no middlemen. For hotels, caterers, tiffin centres, retailers and resellers across India. Send your quantity for a quote.',
  path: '/bulk-orders',
});

export const revalidate = 3600;

const WHO_FOR = [
  { title: 'Hotels & restaurants', desc: 'Consistent colour and aroma across every batch, so your sambar tastes the same in March as it did in January.' },
  { title: 'Caterers & tiffin centres', desc: 'Large packs at a lower price per kilo than retail pouches, delivered on a schedule you set.' },
  { title: 'Retailers & kirana stores', desc: 'Stock a single-origin, GI-tagged turmeric you can tell a story about, not another white-label powder.' },
  { title: 'Resellers & D2C brands', desc: 'Source from the farm that grows it, with the curcumin range and FSSAI licence documented.' },
  { title: 'Food manufacturers', desc: 'Turmeric powder with a stated 2.5% to 3.5% natural curcumin and no added colour or fillers.' },
  { title: 'Corporate & wedding gifting', desc: 'Bulk quantities of a regional speciality with genuine provenance from Erode.' },
];

const WHY_DIRECT = [
  { Icon: LeafIcon, title: 'One farm, one origin', desc: 'Every kilo is grown on our own land in the GI-tagged Erode belt. Not pooled at a mandi, not blended from several districts.' },
  { Icon: ShieldCheckIcon, title: 'Documented quality', desc: `2.5% to 3.5% natural curcumin, no added colour, no fillers, FSSAI licence ${BUSINESS.fssai}.` },
  { Icon: TruckIcon, title: 'No middlemen', desc: 'You buy from the grower and the miller, which is where the price advantage in a bulk order actually comes from.' },
];

const STEPS = [
  { n: '01', title: 'Send your requirement', desc: 'Quantity, pack size and how often you need it. WhatsApp is fastest; the contact form works too.' },
  { n: '02', title: 'We quote you', desc: 'A price per kilo for that quantity and packing, plus delivery to your city.' },
  { n: '03', title: 'Check a sample', desc: 'Ask for a sample before committing to a repeat order. Colour, aroma and grind are easier to judge in your own kitchen.' },
  { n: '04', title: 'We mill and dispatch', desc: 'Ground close to dispatch rather than pulled from long storage, then shipped anywhere in India.' },
];

const BULK_FAQ: FaqItem[] = [
  {
    question: 'What is the minimum quantity for a bulk turmeric order?',
    answer:
      'Tell us the quantity you have in mind and we will tell you whether we can do it and at what price. Anything above the 1kg retail pack is worth asking about, and the price per kilo improves as the quantity goes up. Send your requirement on WhatsApp at +91 99440 33696 and you will get a straight answer the same day.',
  },
  {
    question: 'Can you supply turmeric powder unlabelled or under our own brand?',
    answer:
      'Ask us. Packing and labelling are decided per order, so the answer depends on the pack size and quantity you need. Describe what you want in your enquiry — bag size, labelled or plain, your own artwork — and we will tell you what is possible.',
  },
  {
    question: 'Where do you ship bulk orders?',
    answer:
      'Anywhere in India, from Erode in Tamil Nadu. Retail orders dispatch in one to two business days and reach most cities in three to five working days. A large consignment is quoted with its own delivery time and freight, which we confirm before you pay.',
  },
  {
    question: 'How is wholesale turmeric priced?',
    answer:
      'By quantity and packing, quoted per order. Turmeric is an agricultural commodity, so a rate quoted months in advance would be a guess. What stays fixed is that you are buying from the grower rather than through two or three traders, and that the origin and curcumin content are the same every time.',
  },
  {
    question: 'Is the bulk turmeric the same as the retail packs?',
    answer:
      'Yes. The same crop from the same Erode land, stone ground on the same family mill, 2.5% to 3.5% natural curcumin, nothing added. The only difference in a bulk order is the quantity and how it is packed.',
  },
  {
    question: 'Can we visit the farm before ordering?',
    answer:
      'Serious bulk buyers are welcome to arrange a visit to the farm in Erode. Message us on WhatsApp to fix a time. If you cannot travel, the photographs and video on our farm page show the growing, harvesting and grinding.',
  },
];

const waLink = `https://wa.me/${BUSINESS.whatsapp}?text=${encodeURIComponent(
  'Hi! I would like a quote for a bulk turmeric powder order. Quantity needed: ',
)}`;

export default function BulkOrdersPage() {
  return (
    <div className="min-h-screen bg-cream">
      <JsonLd
        data={[
          breadcrumbJsonLd([
            { name: 'Home', path: '/' },
            { name: 'Bulk & Wholesale', path: '/bulk-orders' },
          ]),
          {
            '@context': 'https://schema.org',
            '@type': 'Service',
            '@id': `${SITE_URL}/bulk-orders#service`,
            name: 'Bulk and wholesale turmeric powder supply',
            serviceType: 'Wholesale turmeric powder supply',
            description:
              'Bulk supply of single-origin, GI-tagged Erode turmeric powder direct from the Ponkali family farm in Erode, Tamil Nadu, to hotels, caterers, retailers, resellers and food manufacturers across India.',
            url: absoluteUrl('/bulk-orders'),
            provider: { '@id': `${SITE_URL}/#organization` },
            areaServed: { '@type': 'Country', name: 'India' },
            audience: {
              '@type': 'BusinessAudience',
              name: 'Hotels, restaurants, caterers, tiffin centres, retailers, resellers and food manufacturers',
            },
            availableChannel: {
              '@type': 'ServiceChannel',
              serviceUrl: absoluteUrl('/bulk-orders'),
              servicePhone: BUSINESS.phone,
            },
          },
        ]}
      />

      {/* Hero */}
      <section className="bg-dark-brown py-16 md:py-20 px-5">
        <div className="max-w-5xl mx-auto grid md:grid-cols-[1fr_320px] gap-10 items-center">
          <div>
            <nav aria-label="Breadcrumb" className="text-[12px] text-white/50 mb-6">
              <Link href="/" className="hover:text-white">Home</Link>
              <span className="mx-1.5">/</span>
              <span className="text-white/70">Bulk &amp; Wholesale</span>
            </nav>
            <p className="text-gold/70 text-[11px] font-semibold tracking-[0.35em] uppercase mb-4">
              Farm direct · Erode, Tamil Nadu
            </p>
            <h1 className="font-hero text-[34px] md:text-[46px] font-extrabold text-white tracking-tight leading-[1.08] mb-5">
              Bulk &amp; wholesale turmeric powder,<br />
              <span className="text-gold">straight from the farm</span>
            </h1>
            <p className="text-white/75 text-[17px] leading-[1.75] mb-8 max-w-xl">
              We grow, mill and pack GI-tagged Erode turmeric on one family farm. If you buy
              turmeric by the kilo, for a kitchen, a shop or your own brand, you can buy it
              from the people who grew it instead of through three traders.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <a
                href={waLink}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-gold text-dark-brown px-9 py-4 rounded-full font-bold text-[15px] text-center hover:bg-yellow-500 transition-colors"
              >
                Get a bulk quote on WhatsApp
              </a>
              <Link
                href="/contact"
                className="border border-white/20 text-white/80 px-9 py-4 rounded-full font-semibold text-[15px] text-center hover:border-white/50 hover:text-white transition-colors"
              >
                Send an enquiry
              </Link>
            </div>
            <p className="text-white/40 text-[13px] mt-5">
              FSSAI licence {BUSINESS.fssai} · {BUSINESS.street}, {BUSINESS.locality} {BUSINESS.postalCode}
            </p>
          </div>
          <div className="relative aspect-square rounded-3xl overflow-hidden bg-white/5">
            <Image
              src="/images/turmeric-har.jpeg"
              alt="Freshly harvested Erode turmeric at the Ponkali farm, the raw material for bulk turmeric powder orders"
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 320px"
            />
          </div>
        </div>
      </section>

      {/* Why buy direct */}
      <section className="bg-white py-16 px-5">
        <div className="max-w-5xl mx-auto">
          <h2 className="font-hero text-[28px] md:text-[34px] font-extrabold text-dark-brown tracking-tight mb-10 text-center">
            Why a bulk buyer should come to the farm
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            {WHY_DIRECT.map(({ Icon, title, desc }) => (
              <div key={title} className="bg-cream rounded-2xl p-7 border border-black/5">
                <div className="w-11 h-11 rounded-full bg-gold/15 flex items-center justify-center mb-4">
                  <Icon className="w-5 h-5 text-gold" />
                </div>
                <h3 className="font-bold text-dark-brown text-[17px] mb-2">{title}</h3>
                <p className="text-gray-600 text-[15px] leading-[1.75]">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Who it is for */}
      <section className="bg-cream py-16 px-5">
        <div className="max-w-5xl mx-auto">
          <p className="text-gold text-[11px] font-semibold tracking-[0.3em] uppercase mb-3 text-center">Who buys in bulk</p>
          <h2 className="font-hero text-[28px] md:text-[34px] font-extrabold text-dark-brown tracking-tight mb-10 text-center">
            Built for kitchens that cook in volume
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {WHO_FOR.map(({ title, desc }) => (
              <div key={title} className="bg-white rounded-2xl p-6 border border-black/6">
                <div className="flex items-start gap-2.5 mb-2">
                  <CheckIcon className="w-4 h-4 text-gold flex-shrink-0 mt-1" />
                  <h3 className="font-bold text-dark-brown text-[16px]">{title}</h3>
                </div>
                <p className="text-gray-600 text-[14px] leading-[1.7] pl-7">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="bg-white py-16 px-5">
        <div className="max-w-5xl mx-auto">
          <h2 className="font-hero text-[28px] md:text-[34px] font-extrabold text-dark-brown tracking-tight mb-10 text-center">
            How a bulk order works
          </h2>
          <ol className="grid sm:grid-cols-2 lg:grid-cols-4 gap-px bg-black/5 rounded-2xl overflow-hidden">
            {STEPS.map(({ n, title, desc }) => (
              <li key={n} className="bg-white p-7">
                <p className="text-[40px] font-extrabold text-gold/35 leading-none mb-4 select-none">{n}</p>
                <h3 className="font-bold text-dark-brown text-[16px] mb-2">{title}</h3>
                <p className="text-gray-500 text-[14px] leading-[1.7]">{desc}</p>
              </li>
            ))}
          </ol>

          <div className="mt-10 bg-dark-brown rounded-2xl p-8 md:p-10 text-center">
            <h2 className="font-hero text-[24px] md:text-[30px] font-extrabold text-white tracking-tight mb-3">
              Tell us what you need
            </h2>
            <p className="text-white/70 text-[15px] mb-7 max-w-lg mx-auto leading-[1.7]">
              Quantity, pack size and your city is enough to start. We will come back with a
              price and a delivery time, and a sample if you want to judge it yourself first.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <a
                href={waLink}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-gold text-dark-brown px-9 py-3.5 rounded-full font-bold text-[15px] hover:bg-yellow-500 transition-colors"
              >
                WhatsApp +91 99440 33696
              </a>
              <Link
                href="/contact"
                className="border border-white/20 text-white/80 px-9 py-3.5 rounded-full font-semibold text-[15px] hover:border-white/50 hover:text-white transition-colors"
              >
                Use the contact form
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Faq items={BULK_FAQ} eyebrow="Wholesale questions" title="Bulk turmeric orders, answered" />
    </div>
  );
}
