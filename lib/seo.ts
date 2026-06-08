import type { Metadata } from 'next';
import { Product } from './types';

/**
 * Central SEO configuration. The production domain is read from
 * NEXT_PUBLIC_SITE_URL — set it in your Vercel / .env to the live URL.
 * Defaults to the production domain so builds and previews resolve correctly.
 */
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ?? 'https://www.ponkali.in'
).replace(/\/$/, '');

export const SITE_NAME = 'Ponkali Masalas';
export const SITE_TAGLINE = 'Pure Erode Turmeric, Farm Direct';

export const DEFAULT_DESCRIPTION =
  'GI-tagged Erode turmeric powder, stone ground on our family mill and grown over three generations. Naturally high in curcumin at 2.5% to 3.5%, with nothing added. FSSAI certified. Free shipping on every order.';

export const TWITTER_HANDLE = '@ponkalimasalas';

/** Business details — keep in sync with the footer and product packaging. */
export const BUSINESS = {
  legalName: 'Ponkali Masalas',
  email: 'ponkaliturmeric@gmail.com',
  phone: '+91-99440-33696',
  whatsapp: '919944033696',
  fssai: '22426064000154',
  street: 'The Native, Perundurai',
  locality: 'Erode',
  region: 'Tamil Nadu',
  postalCode: '638055',
  country: 'IN',
  brand: 'Ponkali',
} as const;

/** Social / external profiles for Organization `sameAs`. Add real URLs as they go live. */
export const SOCIAL_PROFILES: string[] = [
  // 'https://www.instagram.com/ponkalimasalas',
  // 'https://www.facebook.com/ponkalimasalas',
  `https://wa.me/${BUSINESS.whatsapp}`,
];

/** Absolute URL helper — turns a path into a fully-qualified canonical URL. */
export function absoluteUrl(path = '/'): string {
  if (path.startsWith('http')) return path;
  return `${SITE_URL}${path.startsWith('/') ? path : `/${path}`}`;
}

/**
 * Builds a consistent Metadata object for a page: canonical + Open Graph +
 * Twitter, all derived from a single title/description/path.
 */
export function buildMetadata({
  title,
  description = DEFAULT_DESCRIPTION,
  path = '/',
  images,
  noindex = false,
}: {
  title?: string;
  description?: string;
  path?: string;
  images?: { url: string; width?: number; height?: number; alt?: string }[];
  noindex?: boolean;
}): Metadata {
  const canonical = absoluteUrl(path);
  return {
    title,
    description,
    alternates: { canonical },
    robots: noindex
      ? { index: false, follow: false }
      : undefined,
    openGraph: {
      type: 'website',
      url: canonical,
      siteName: SITE_NAME,
      title: title ?? `${SITE_NAME}: ${SITE_TAGLINE}`,
      description,
      locale: 'en_IN',
      ...(images ? { images } : {}),
    },
    twitter: {
      card: 'summary_large_image',
      title: title ?? `${SITE_NAME}: ${SITE_TAGLINE}`,
      description,
      ...(images ? { images: images.map((i) => i.url) } : {}),
    },
  };
}

/* ──────────────────────────  JSON-LD builders  ────────────────────────── */

/** Organization + WebSite + Store graph — rendered once, site-wide. */
export function organizationJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization',
        '@id': `${SITE_URL}/#organization`,
        name: SITE_NAME,
        legalName: BUSINESS.legalName,
        url: SITE_URL,
        logo: {
          '@type': 'ImageObject',
          url: absoluteUrl('/images/logo.jpg'),
        },
        email: BUSINESS.email,
        telephone: BUSINESS.phone,
        sameAs: SOCIAL_PROFILES,
        address: {
          '@type': 'PostalAddress',
          streetAddress: BUSINESS.street,
          addressLocality: BUSINESS.locality,
          addressRegion: BUSINESS.region,
          postalCode: BUSINESS.postalCode,
          addressCountry: BUSINESS.country,
        },
        contactPoint: {
          '@type': 'ContactPoint',
          telephone: BUSINESS.phone,
          email: BUSINESS.email,
          contactType: 'customer service',
          areaServed: 'IN',
          availableLanguage: ['English', 'Tamil'],
        },
      },
      {
        '@type': 'WebSite',
        '@id': `${SITE_URL}/#website`,
        url: SITE_URL,
        name: SITE_NAME,
        description: DEFAULT_DESCRIPTION,
        publisher: { '@id': `${SITE_URL}/#organization` },
        inLanguage: 'en-IN',
      },
      {
        '@type': 'Store',
        '@id': `${SITE_URL}/#store`,
        name: SITE_NAME,
        image: absoluteUrl('/images/product-1.jpeg'),
        url: SITE_URL,
        telephone: BUSINESS.phone,
        email: BUSINESS.email,
        priceRange: '₹₹',
        parentOrganization: { '@id': `${SITE_URL}/#organization` },
        address: {
          '@type': 'PostalAddress',
          streetAddress: BUSINESS.street,
          addressLocality: BUSINESS.locality,
          addressRegion: BUSINESS.region,
          postalCode: BUSINESS.postalCode,
          addressCountry: BUSINESS.country,
        },
      },
    ],
  };
}

/** Product schema with Offer for a single SKU. */
export function productJsonLd(product: Product) {
  const url = absoluteUrl(`/product/${product.slug}`);
  const priceValidUntil = new Date(new Date().getFullYear() + 1, 11, 31)
    .toISOString()
    .slice(0, 10);

  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    '@id': `${url}#product`,
    name: `${product.name} ${product.weight}`,
    image: [
      absoluteUrl('/images/product-1.jpeg'),
      absoluteUrl('/images/product-2.jpeg'),
    ],
    description:
      product.description ??
      'Single-origin Erode turmeric powder, stone ground on our family mill. A GI-tagged variety with 2.5% to 3.5% natural curcumin, no additives and no fillers.',
    sku: product.slug,
    mpn: product.slug,
    brand: { '@type': 'Brand', name: BUSINESS.brand },
    category: 'Spices > Turmeric Powder',
    additionalProperty: [
      { '@type': 'PropertyValue', name: 'Net Weight', value: product.weight },
      { '@type': 'PropertyValue', name: 'Curcumin Content', value: '2.5% to 3.5%' },
      { '@type': 'PropertyValue', name: 'FSSAI Licence', value: BUSINESS.fssai },
    ],
    offers: {
      '@type': 'Offer',
      url,
      priceCurrency: 'INR',
      price: product.price,
      priceValidUntil,
      availability: product.in_stock
        ? 'https://schema.org/InStock'
        : 'https://schema.org/OutOfStock',
      itemCondition: 'https://schema.org/NewCondition',
      seller: { '@id': `${SITE_URL}/#organization` },
      shippingDetails: {
        '@type': 'OfferShippingDetails',
        shippingRate: {
          '@type': 'MonetaryAmount',
          value: 0,
          currency: 'INR',
        },
        shippingDestination: {
          '@type': 'DefinedRegion',
          addressCountry: 'IN',
        },
      },
    },
  };
}

/** Breadcrumb trail for a product page (matches the visible breadcrumb). */
export function breadcrumbJsonLd(items: { name: string; path: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}

/** FAQPage schema — the items MUST match FAQ content visible on the page. */
export function faqJsonLd(items: { question: string; answer: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer,
      },
    })),
  };
}

/** ItemList of all SKUs for the shop / homepage. */
export function productListJsonLd(products: Product[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'Ponkali Erode Turmeric Powder',
    itemListElement: products.map((p, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      url: absoluteUrl(`/product/${p.slug}`),
      name: `${p.name} ${p.weight}`,
    })),
  };
}
