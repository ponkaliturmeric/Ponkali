import type { Metadata } from 'next';
import JsonLd from '@/components/JsonLd';
import { buildMetadata, breadcrumbJsonLd, collectionPageJsonLd, productGroupJsonLd } from '@/lib/seo';
import { getCatalog } from '@/lib/catalog';

export const metadata: Metadata = buildMetadata({
  title: 'Shop Pure Erode Turmeric Powder: 100g, 250g, 500g & 1kg',
  description:
    'Buy pure Erode turmeric powder that is GI-tagged, naturally grown and farm direct. Available in 100g, 250g, 500g and 1kg packs from ₹149. Delivered all over India.',
  path: '/shop',
});

// Prices come from the admin-editable catalogue; refresh at most once a minute.
export const revalidate = 60;

/**
 * The listing page carries the schema for the whole range, not just one pack:
 *
 *  • ProductGroup  — declares the four packs as SIZES OF ONE PRODUCT. Before
 *    this, the four /product/* pages looked like four rival products competing
 *    for "erode turmeric powder", so Google picked one and discounted the rest.
 *    It also makes the range eligible to show as a price range (₹149 – ₹719).
 *  • CollectionPage + ItemList — gives /shop its own identity instead of
 *    looking like a thin duplicate of the product pages.
 *  • BreadcrumbList — the Home › Shop trail in the result.
 *
 * It lives in the layout because the page itself is a client component.
 */
export default async function ShopLayout({ children }: { children: React.ReactNode }) {
  const catalog = await getCatalog();

  return (
    <>
      <JsonLd
        data={[
          productGroupJsonLd(catalog),
          collectionPageJsonLd({
            name: 'Erode Turmeric Powder — All Pack Sizes',
            description:
              'Every pack size of Ponkali single-origin Erode turmeric powder: 100g, 250g, 500g and 1kg, farm direct from Erode, Tamil Nadu.',
            path: '/shop',
            products: catalog,
          }),
          breadcrumbJsonLd([
            { name: 'Home', path: '/' },
            { name: 'Shop', path: '/shop' },
          ]),
        ]}
      />
      {children}
    </>
  );
}
