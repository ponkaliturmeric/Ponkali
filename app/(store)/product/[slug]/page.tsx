import type { Metadata } from 'next';
import ProductDetail from '@/components/ProductDetail';
import JsonLd from '@/components/JsonLd';
import { PRODUCTS } from '@/lib/products';
import { buildMetadata, productJsonLd, breadcrumbJsonLd } from '@/lib/seo';

// Pre-render every SKU at build time — products are a fixed catalogue.
export function generateStaticParams() {
  return PRODUCTS.map((p) => ({ slug: p.slug }));
}

function findProduct(slug: string) {
  return PRODUCTS.find((p) => p.slug === slug);
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const product = findProduct(params.slug);

  if (!product) {
    return buildMetadata({
      title: 'Erode Turmeric Powder',
      path: `/product/${params.slug}`,
    });
  }

  const title = `${product.name} ${product.weight}: Buy Pure GI-Tagged Turmeric`;
  const description = `Buy ${product.name} (${product.weight}) for ₹${product.price}. Naturally grown GI-tagged Erode turmeric, 2.5% to 3.5% natural curcumin, FSSAI certified. ${product.in_stock ? 'In stock' : 'Currently unavailable'} · Free shipping on every order.`;

  return buildMetadata({
    title,
    description,
    path: `/product/${product.slug}`,
    images: [
      {
        url: '/images/product-1.jpeg',
        alt: `Ponkali ${product.name} ${product.weight}`,
      },
    ],
  });
}

export default function ProductPage({ params }: { params: { slug: string } }) {
  const product = findProduct(params.slug);

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
    </>
  );
}
