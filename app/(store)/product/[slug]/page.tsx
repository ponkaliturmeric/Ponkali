import type { Metadata } from 'next';
import ProductDetail from '@/components/ProductDetail';
import JsonLd from '@/components/JsonLd';
import { PRODUCTS } from '@/lib/products';
import { getCatalogItem } from '@/lib/catalog';
import Faq from '@/components/Faq';
import { FAQ } from '@/lib/content';
import { buildMetadata, productJsonLd, breadcrumbJsonLd } from '@/lib/seo';

// The set of SKUs is fixed in code, so every slug is pre-rendered; the price and
// stock inside come from the DB (admin-editable) and refresh at most once a minute.
export function generateStaticParams() {
  return PRODUCTS.map((p) => ({ slug: p.slug }));
}
export const revalidate = 60;

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const product = await getCatalogItem(params.slug);

  if (!product) {
    return buildMetadata({
      title: 'Erode Turmeric Powder',
      path: `/product/${params.slug}`,
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

  return (
    <>
      {product && (
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
      )}
      <ProductDetail slug={params.slug} />
      {product && (
        <Faq
          items={FAQ.filter((f) => /curcumin|pure|store|deliver|payment|organic/i.test(f.question))}
          eyebrow="Good to know"
          title="Questions about this turmeric"
        />
      )}
    </>
  );
}
