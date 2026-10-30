import type { Metadata } from 'next';
import { Product } from './types';
import { ZONE_RATES, STATE_ZONES, type Zone } from './shipping';
import type { Guide } from './content';
import { reviewAggregate, reviewsFor } from './reviews';

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
  'GI-tagged Erode turmeric powder, stone ground on our family mill and grown over three generations. Naturally high in curcumin at 2.5% to 3.5%, with nothing added. FSSAI certified. Delivered all over India from our farm in Erode.';

export const TWITTER_HANDLE = '@ponkalimasalas';

/** Business details — keep in sync with the footer and product packaging. */
export const BUSINESS = {
  legalName: 'Ponkali Masalas',
  email: 'ponkaliturmeric@gmail.com',
  phone: '+91-99440-33696',
  whatsapp: '919944033696',
  fssai: '22426064000154',
  street: 'The Native',
  locality: 'Erode',
  region: 'Tamil Nadu',
  postalCode: '638055',
  country: 'IN',
  brand: 'Ponkali',
  /**
   * Approximate location of the farm, for the Store/LocalBusiness schema — it
   * makes the business eligible to be understood geographically ("turmeric farm
   * near Erode"). These are ERODE CITY-level coordinates, deliberately not
   * precise: replace them with the farm's exact pin from Google Maps (right
   * click → the first number pair) when you set up the Google Business Profile.
   */
  latitude: 11.3410,
  longitude: 77.7172,
} as const;

/** The stable id for the group of turmeric pack sizes (used by ProductGroup). */
export const PRODUCT_GROUP_ID = 'ponkali-erode-turmeric-powder';

/**
 * Social / external profiles for Organization `sameAs`. These are what let
 * Google tie the website, the Instagram account and the Facebook page together
 * into ONE brand entity — the thing that eventually earns a knowledge panel for
 * "ponkali". They were commented out while the real handles were already live
 * in the footer, so the schema was claiming no social presence at all.
 * Keep this list identical to the icons in components/Footer.tsx.
 */
export const SOCIAL_PROFILES: string[] = [
  'https://www.instagram.com/ponkali_masala',
  'https://www.facebook.com/ponkali.turmeric',
  'https://www.youtube.com/@ponkali',
  `https://wa.me/${BUSINESS.whatsapp}`,
];

/**
 * The site's language set, for reciprocal hreflang. The Tamil page targets the
 * searches this brand's own customers actually type ("மஞ்சள் பொடி",
 * "ஈரோடு மஞ்சள்"), which almost nobody in the market serves.
 */
export const LANGUAGE_ALTERNATES: Record<string, string> = {
  'en-IN': '/',
  'ta-IN': '/manjal-podi',
  'x-default': '/',
};

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
  languages,
}: {
  title?: string;
  description?: string;
  path?: string;
  images?: { url: string; width?: number; height?: number; alt?: string }[];
  noindex?: boolean;
  /**
   * hreflang map, e.g. { 'en-IN': '/', 'ta-IN': '/manjal-podi' }. Google only
   * honours hreflang when it is RECIPROCAL, so every page in a language set
   * must declare the whole set — including itself.
   */
  languages?: Record<string, string>;
}): Metadata {
  const canonical = absoluteUrl(path);
  return {
    title,
    description,
    alternates: {
      canonical,
      ...(languages
        ? {
            languages: Object.fromEntries(
              Object.entries(languages).map(([lang, href]) => [lang, absoluteUrl(href)]),
            ),
          }
        : {}),
    },
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
        foundingLocation: { '@type': 'Place', name: 'Erode, Tamil Nadu, India' },
        areaServed: 'IN',
        knowsAbout: ['Erode turmeric', 'GI-tagged turmeric', 'Curcumin content', 'Turmeric farming', 'Turmeric adulteration tests'],
        slogan: SITE_TAGLINE,
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
        image: absoluteUrl('/images/new-prd-img0.png'),
        url: SITE_URL,
        telephone: BUSINESS.phone,
        email: BUSINESS.email,
        priceRange: '₹₹',
        parentOrganization: { '@id': `${SITE_URL}/#organization` },
        geo: {
          '@type': 'GeoCoordinates',
          latitude: BUSINESS.latitude,
          longitude: BUSINESS.longitude,
        },
        areaServed: { '@type': 'Country', name: 'India' },
        currenciesAccepted: 'INR',
        paymentAccepted: 'UPI, Credit Card, Debit Card, Net Banking, Cash on Delivery',
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
      absoluteUrl('/images/new-prd-img0.png'),
      absoluteUrl('/images/new-prd-img1.png'),
    ],
    description:
      product.description ??
      'Single-origin Erode turmeric powder, stone ground on our family mill. A GI-tagged variety with 2.5% to 3.5% natural curcumin, no additives and no fillers.',
    sku: product.slug,
    mpn: product.slug,
    brand: { '@type': 'Brand', name: BUSINESS.brand },
    category: 'Spices > Turmeric Powder',
    countryOfOrigin: 'IN',
    weight: { '@type': 'QuantitativeValue', value: parseFloat(product.weight) * (product.weight.endsWith('kg') ? 1000 : 1), unitCode: 'GRM' },
    additionalProperty: [
      { '@type': 'PropertyValue', name: 'Net Weight', value: product.weight },
      { '@type': 'PropertyValue', name: 'Curcumin Content', value: '2.5% to 3.5%' },
      { '@type': 'PropertyValue', name: 'FSSAI Licence', value: BUSINESS.fssai },
    ],
    // Tells Google these four pages are SIZES OF ONE PRODUCT, not four rival
    // products. Without it the pack pages compete with each other for the same
    // query and Google picks one, discounting the others.
    size: product.weight,
    inProductGroupWithID: PRODUCT_GROUP_ID,
    isVariantOf: { '@id': `${SITE_URL}/shop#product-group` },
    // Star ratings appear only when lib/reviews.ts holds real, published
    // reviews — see the note in that file.
    ...reviewSnippet(product.slug),
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
      shippingDetails: shippingDetailsJsonLd(),
      hasMerchantReturnPolicy: RETURN_POLICY_JSONLD,
    },
  };
}

/**
 * One OfferShippingDetails per delivery zone, generated from lib/shipping.ts so
 * Google's price/shipping display can never disagree with checkout. Rate shown
 * is the first-500 g charge for that zone.
 */
function shippingDetailsJsonLd() {
  const zones = Object.keys(ZONE_RATES) as Zone[];
  return zones.map((z) => ({
    '@type': 'OfferShippingDetails',
    shippingRate: { '@type': 'MonetaryAmount', value: ZONE_RATES[z].base, currency: 'INR' },
    shippingDestination: {
      '@type': 'DefinedRegion',
      addressCountry: 'IN',
      addressRegion: Object.entries(STATE_ZONES).filter(([, zz]) => zz === z).map(([st]) => st),
    },
    deliveryTime: {
      '@type': 'ShippingDeliveryTime',
      handlingTime: { '@type': 'QuantitativeValue', minValue: 1, maxValue: 2, unitCode: 'DAY' },
      transitTime: { '@type': 'QuantitativeValue', minValue: 3, maxValue: 5, unitCode: 'DAY' },
    },
  }));
}

/** Mirrors /refund-policy: damaged/incorrect items reported within 24 h, refund to source. */
const RETURN_POLICY_JSONLD = {
  '@type': 'MerchantReturnPolicy',
  applicableCountry: 'IN',
  returnPolicyCategory: 'https://schema.org/MerchantReturnFiniteReturnWindow',
  merchantReturnDays: 1,
  returnMethod: 'https://schema.org/ReturnByMail',
  returnFees: 'https://schema.org/FreeReturn',
  refundType: 'https://schema.org/FullRefund',
  merchantReturnLink: `${SITE_URL}/refund-policy`,
};

/** Article schema for a /guides page — author is the brand (a real farm, not a persona). */
export function articleJsonLd(guide: Guide) {
  const url = absoluteUrl(`/guides/${guide.slug}`);
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    '@id': `${url}#article`,
    headline: guide.title,
    description: guide.description,
    url,
    mainEntityOfPage: url,
    datePublished: guide.published,
    dateModified: guide.updated,
    inLanguage: 'en-IN',
    author: { '@id': `${SITE_URL}/#organization` },
    publisher: { '@id': `${SITE_URL}/#organization` },
    image: [absoluteUrl('/images/turmeric-har.jpeg'), absoluteUrl('/images/new-prd-img0.png')],
    about: { '@type': 'Thing', name: 'Erode turmeric' },
    articleSection: 'Guides',
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


/* ───────────────────  Reviews (only when genuine)  ─────────────────── */

/**
 * aggregateRating + review nodes, or nothing at all. Spread into a Product.
 * Driven entirely by lib/reviews.ts, which ships empty: a rating snippet
 * without real reviews behind it is a policy violation that costs the whole
 * site its rich results.
 */
function reviewSnippet(slug?: string) {
  const agg = reviewAggregate(slug);
  if (!agg) return {};
  const reviews = reviewsFor(slug);
  return {
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: agg.ratingValue,
      reviewCount: agg.reviewCount,
      bestRating: 5,
      worstRating: 1,
    },
    review: reviews.slice(0, 10).map((r) => ({
      '@type': 'Review',
      author: { '@type': 'Person', name: r.author },
      datePublished: r.date,
      reviewBody: r.body,
      reviewRating: {
        '@type': 'Rating',
        ratingValue: r.rating,
        bestRating: 5,
        worstRating: 1,
      },
    })),
  };
}

/* ───────────────────  Variants, collections, video  ─────────────────── */

/**
 * ProductGroup for the pack sizes — Google's recommended markup for a product
 * sold in several sizes. It consolidates the four pack pages into one entity
 * (so they stop competing), and lets a result show a price RANGE, e.g.
 * "₹149 – ₹719", which is what a shopper comparing sellers looks for.
 */
export function productGroupJsonLd(products: Product[]) {
  // The range must span every variant listed in hasVariant below, not just the
  // in-stock ones: a variant priced outside lowPrice..highPrice is flagged as
  // inconsistent. Purchasability is expressed per variant instead — each
  // Product's own Offer carries InStock or OutOfStock — while `availability`
  // here reports whether anything in the group can be bought at all.
  const prices = products.map((p) => p.price);
  const anyInStock = products.some((p) => p.in_stock);

  return {
    '@context': 'https://schema.org',
    '@type': 'ProductGroup',
    '@id': `${SITE_URL}/shop#product-group`,
    name: 'Ponkali Erode Turmeric Powder',
    description:
      'Single-origin, GI-tagged Erode turmeric powder from one family farm in Erode, Tamil Nadu. Stone ground, 2.5% to 3.5% natural curcumin, no added colour or fillers. Sold in 100g, 250g, 500g and 1kg packs.',
    url: absoluteUrl('/shop'),
    productGroupID: PRODUCT_GROUP_ID,
    brand: { '@type': 'Brand', name: BUSINESS.brand },
    category: 'Spices > Turmeric Powder',
    countryOfOrigin: 'IN',
    image: [absoluteUrl('/images/new-prd-img0.png'), absoluteUrl('/images/new-prd-img1.png')],
    // The axis the variants differ on. Size only — same turmeric in every pack.
    variesBy: ['https://schema.org/size'],
    offers: {
      '@type': 'AggregateOffer',
      priceCurrency: 'INR',
      lowPrice: Math.min(...prices),
      highPrice: Math.max(...prices),
      offerCount: products.length,
      availability: anyInStock
        ? 'https://schema.org/InStock'
        : 'https://schema.org/OutOfStock',
      seller: { '@id': `${SITE_URL}/#organization` },
    },
    hasVariant: products.map((p) => productJsonLd(p)),
  };
}

/**
 * CollectionPage + ItemList for a listing page like /shop. Gives the listing its
 * own entity rather than letting it look like a thin duplicate of the product
 * pages, and is what powers a "products from this site" style result.
 */
export function collectionPageJsonLd({
  name, description, path, products,
}: {
  name: string;
  description: string;
  path: string;
  products: Product[];
}) {
  const url = absoluteUrl(path);
  return {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    '@id': `${url}#collection`,
    name,
    description,
    url,
    inLanguage: 'en-IN',
    isPartOf: { '@id': `${SITE_URL}/#website` },
    about: { '@id': `${SITE_URL}/shop#product-group` },
    mainEntity: {
      '@type': 'ItemList',
      numberOfItems: products.length,
      itemListElement: products.map((p, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        url: absoluteUrl(`/product/${p.slug}`),
        name: `${p.name} ${p.weight}`,
      })),
    },
  };
}

/**
 * VideoObject for the farm footage on the homepage. A video entity can earn a
 * video thumbnail in Search and makes the "is this a real farm?" question
 * answerable by a crawler, which is exactly the trust signal this brand sells on.
 */
export function videoObjectJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'VideoObject',
    '@id': `${SITE_URL}/#farm-video`,
    name: 'Inside the Ponkali turmeric farm in Erode',
    description:
      'Footage from the Ponkali family farm in Erode, Tamil Nadu, where the turmeric in every pack is grown, harvested and ground.',
    thumbnailUrl: [absoluteUrl('/images/turmeric-har.jpeg')],
    contentUrl: absoluteUrl('/videos/farm-video.mp4'),
    encodingFormat: 'video/mp4',
    uploadDate: '2026-01-15',
    isFamilyFriendly: true,
    inLanguage: 'en-IN',
    publisher: { '@id': `${SITE_URL}/#organization` },
    contentLocation: { '@type': 'Place', name: 'Erode, Tamil Nadu, India' },
  };
}
