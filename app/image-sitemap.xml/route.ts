import { PRODUCTS } from '@/lib/products';
import { SITE_URL } from '@/lib/seo';

export const revalidate = 86400;

/**
 * Google Image sitemap. Next 14's typed `sitemap.ts` has no `images` field
 * (that arrived in Next 15), so the image extension is emitted here instead and
 * both sitemaps are listed in robots.txt.
 *
 * Worth having: "erode turmeric", "turmeric powder colour" and "turmeric farm"
 * are visual searches, and Google Images is a traffic source most small shops
 * never claim. Each <image:image> carries a caption and title so the photo can
 * rank on its own and link back to the page it sits on.
 */

const esc = (s: string) =>
  s.replace(/[<>&'"]/g, (c) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', "'": '&apos;', '"': '&quot;' }[c] as string));

interface SitemapImage {
  loc: string;
  title: string;
  caption: string;
}

const PRODUCT_IMAGES: SitemapImage[] = [
  {
    loc: '/images/new-prd-img0.png',
    title: 'Ponkali Erode Turmeric Powder pack, front',
    caption: 'GI-tagged Erode turmeric powder from the Ponkali family farm in Erode, Tamil Nadu.',
  },
  {
    loc: '/images/new-prd-img1.png',
    title: 'Ponkali Erode Turmeric Powder pack, back label',
    caption: 'Back label showing the FSSAI licence, net weight and 2.5% to 3.5% natural curcumin.',
  },
];

const FARM_IMAGES: SitemapImage[] = [
  { loc: '/images/turmeric-har.jpeg', title: 'Turmeric harvest in Erode', caption: 'Freshly lifted turmeric rhizomes at harvest on the Ponkali farm in Erode.' },
  { loc: '/images/harvest.jpeg', title: 'Harvested turmeric drying', caption: 'Harvested Erode turmeric laid out to dry before grinding.' },
  { loc: '/images/plant.jpeg', title: 'Turmeric plants growing', caption: 'Turmeric growing in the GI-tagged Erode soil, nurtured by three generations.' },
  { loc: '/images/har.jpeg', title: 'Turmeric roots after harvest', caption: 'Erode turmeric roots, the raw material for Ponkali turmeric powder.' },
];

/** Every photo in public/images/farm, captioned generically. */
const GALLERY_IMAGES: SitemapImage[] = Array.from({ length: 14 }, (_, i) => {
  const num = String(i + 1).padStart(2, '0');
  return {
    loc: `/images/farm/farm-${num}.jpeg`,
    title: `Ponkali turmeric farm, Erode — photo ${i + 1}`,
    caption: 'The Ponkali family turmeric farm in Erode, Tamil Nadu: growing, harvesting and grinding.',
  };
});

function urlEntry(path: string, images: SitemapImage[]): string {
  const tags = images
    .map(
      (img) => `
    <image:image>
      <image:loc>${SITE_URL}${img.loc}</image:loc>
      <image:title>${esc(img.title)}</image:title>
      <image:caption>${esc(img.caption)}</image:caption>
    </image:image>`,
    )
    .join('');
  return `
  <url>
    <loc>${SITE_URL}${path}</loc>${tags}
  </url>`;
}

export async function GET() {
  const entries = [
    urlEntry('/', [...PRODUCT_IMAGES, ...FARM_IMAGES]),
    urlEntry('/shop', PRODUCT_IMAGES),
    urlEntry('/farm', [...FARM_IMAGES, ...GALLERY_IMAGES]),
    urlEntry('/our-story', FARM_IMAGES),
    ...PRODUCTS.map((p) => urlEntry(`/product/${p.slug}`, PRODUCT_IMAGES)),
  ].join('');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">${entries}
</urlset>`;

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=86400',
    },
  });
}
