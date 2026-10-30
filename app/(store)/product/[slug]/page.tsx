import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import ProductDetail from '@/components/ProductDetail';
import JsonLd from '@/components/JsonLd';
import { PRODUCTS } from '@/lib/products';
import { getCatalogItem } from '@/lib/catalog';
import Faq from '@/components/Faq';
import { FAQ } from '@/lib/content';
import { buildMetadata, productJsonLd, breadcrumbJsonLd } from '@/lib/seo';
import { reviewsFor } from '@/lib/reviews';
import { PACK_NOTES } from '@/lib/products';

// The set of SKUs is fixed in code, so every slug is pre-rendered; the price and
// stock inside come from the DB (admin-editable) and refresh at most once a minute.
export function generateStaticParams() {
  return PRODUCTS.map((p) => ({ slug: p.slug }));
}
/**
 * Only the four slugs above exist. Without this, Next treats any other slug as
 * a page to generate on demand and — because this route is ISR (revalidate
 * below) — serves the not-found render with HTTP 200, a soft 404. Google then
 * sees an unlimited supply of 200-status duplicate URLs. `false` makes anything
 * outside generateStaticParams a real 404 before the page even runs.
 */
export const dynamicParams = false;
export const revalidate = 60;

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const product = await getCatalogItem(params.slug);

  // An unknown slug 404s below, so keep it out of the index either way.
  if (!product) {
    return buildMetadata({
      title: 'Product not found',
      path: `/product/${params.slug}`,
      noindex: true,
    });
  }

  const title = `${product.name} ${product.weight}: Buy Pure GI-Tagged Turmeric`;
  const description = `Buy ${product.name} (${product.weight}) for ₹${product.price}. Naturally grown GI-tagged Erode turmeric, 2.5% to 3.5% natural curcumin, FSSAI certified. ${product.in_stock ? 'In stock' : 'Currently unavailable'} · Delivered all over India.`;

  return buildMetadata({
    title,
    description,
    path: `/product/${product.slug}`,
    images: [
      {
        url: '/images/new-prd-img0.png',
        alt: `Ponkali ${product.name} ${product.weight}`,
      },
    ],
  });
}

export default async function ProductPage({ params }: { params: { slug: string } }) {
  const product = await getCatalogItem(params.slug);

  // A slug that isn't in the catalogue must 404, not render the default pack.
  // Previously /product/anything returned HTTP 200 with the 250g page inside,
  // which Google treats as a soft 404 — an unlimited supply of duplicate URLs
  // all serving the same content, which drags down the real product pages.
  if (!product) notFound();

  const reviews = reviewsFor(product.slug);
  const note = PACK_NOTES[product.weight];

  return (
    <>
      <JsonLd
        data={[
          productJsonLd(product),
          breadcrumbJsonLd([
            { name: 'Home', path: '/' },
            { name: 'Shop', path: '/shop' },
            { name: `${product.name} ${product.weight}`, path: `/product/${product.slug}` },
          ]),
        ]}
      />

      <ProductDetail slug={params.slug} />

      {/* Pack-specific copy — distinct text per SKU, so the four pack pages are
          not near-duplicates of one another. */}
      <section className="bg-white py-14 px-5 border-t border-black/5">
        <div className="max-w-3xl mx-auto">
          <h2 className="font-hero text-[24px] md:text-[28px] font-extrabold text-dark-brown tracking-tight mb-4">
            About the {product.weight} pack
          </h2>
          <p className="text-[16px] text-gray-700 leading-[1.85] mb-6">{product.description}</p>
          {note && (
            <dl className="grid sm:grid-cols-2 gap-4">
              <div className="bg-cream rounded-2xl p-5">
                <dt className="text-[11px] font-semibold text-gold uppercase tracking-[0.2em] mb-1.5">Best for</dt>
                <dd className="text-[15px] text-dark-brown font-medium">{note.bestFor}</dd>
              </div>
              <div className="bg-cream rounded-2xl p-5">
                <dt className="text-[11px] font-semibold text-gold uppercase tracking-[0.2em] mb-1.5">Typically lasts</dt>
                <dd className="text-[15px] text-dark-brown font-medium">{note.lasts} of everyday cooking</dd>
              </div>
            </dl>
          )}
        </div>
      </section>

      {/* Reviews render only when lib/reviews.ts holds real ones — the schema
          and the visible page must always agree. */}
      {reviews.length > 0 && (
        <section className="bg-cream py-14 px-5">
          <div className="max-w-3xl mx-auto">
            <h2 className="font-hero text-[24px] md:text-[28px] font-extrabold text-dark-brown tracking-tight mb-6">
              What customers say
            </h2>
            <div className="space-y-4">
              {reviews.map((r, i) => (
                <figure key={i} className="bg-white rounded-2xl border border-black/6 p-6">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-gold text-[14px]" aria-hidden>{'★'.repeat(r.rating)}</span>
                    <span className="sr-only">{r.rating} out of 5</span>
                  </div>
                  <blockquote className="text-[15px] text-gray-700 leading-[1.8]">{r.body}</blockquote>
                  <figcaption className="text-[13px] text-gray-400 mt-3">
                    {r.author} ·{' '}
                    <time dateTime={r.date}>
                      {new Date(r.date).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}
                    </time>
                  </figcaption>
                </figure>
              ))}
            </div>
          </div>
        </section>
      )}

      <Faq
        items={FAQ.filter((f) => /curcumin|pure|store|deliver|payment|organic/i.test(f.question))}
        eyebrow="Good to know"
        title="Questions about this turmeric"
      />
    </>
  );
}
