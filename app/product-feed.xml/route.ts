import { getCatalog } from '@/lib/catalog';
import { absoluteUrl, BUSINESS, SITE_NAME, SITE_URL } from '@/lib/seo';
import { ZONE_RATES } from '@/lib/shipping';

export const revalidate = 3600;

const esc = (s: string) =>
  s.replace(/[<>&'"]/g, (c) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', "'": '&apos;', '"': '&quot;' }[c] as string));

/**
 * Google Merchant Center product feed (RSS 2.0 + g: namespace). Submitting this
 * URL in Merchant Center lists the packs in Google's free Shopping tab and in
 * "Popular products" on Search — no ad spend. Prices and stock come from the
 * live catalogue. Shipping is declared per-country at the lowest zone rate here;
 * set the exact zone table in Merchant Center → Shipping for precise display.
 */
export async function GET() {
  const catalog = await getCatalog();
  const minShip = Math.min(...Object.values(ZONE_RATES).map((r) => r.base));

  const items = catalog
    .map((p) => {
      const grams = parseFloat(p.weight) * (p.weight.endsWith('kg') ? 1000 : 1);
      return `
    <item>
      <g:id>${esc(p.slug)}</g:id>
      <g:title>${esc(`Ponkali ${p.name} ${p.weight} — GI-Tagged Erode Turmeric, Farm Direct`)}</g:title>
      <g:description>${esc(p.description ?? '')}</g:description>
      <g:link>${absoluteUrl(`/product/${p.slug}`)}</g:link>
      <g:image_link>${absoluteUrl('/images/new-prd-img0.png')}</g:image_link>
      <g:additional_image_link>${absoluteUrl('/images/new-prd-img1.png')}</g:additional_image_link>
      <g:availability>${p.in_stock ? 'in_stock' : 'out_of_stock'}</g:availability>
      <g:price>${p.price.toFixed(2)} INR</g:price>
      <g:brand>${esc(BUSINESS.brand)}</g:brand>
      <g:mpn>${esc(p.slug)}</g:mpn>
      <g:identifier_exists>no</g:identifier_exists>
      <g:condition>new</g:condition>
      <g:google_product_category>Food, Beverages &amp; Tobacco &gt; Food Items &gt; Seasonings &amp; Spices &gt; Herbs &amp; Spices</g:google_product_category>
      <g:product_type>Spices &gt; Turmeric Powder</g:product_type>
      <g:item_group_id>erode-turmeric-powder</g:item_group_id>
      <g:shipping_weight>${grams} g</g:shipping_weight>
      <g:shipping>
        <g:country>IN</g:country>
        <g:price>${minShip.toFixed(2)} INR</g:price>
      </g:shipping>
      <g:product_detail>
        <g:section_name>Specifications</g:section_name>
        <g:attribute_name>Curcumin content</g:attribute_name>
        <g:attribute_value>2.5% to 3.5%</g:attribute_value>
      </g:product_detail>
      <g:product_detail>
        <g:section_name>Specifications</g:section_name>
        <g:attribute_name>Origin</g:attribute_name>
        <g:attribute_value>Erode, Tamil Nadu (GI-tagged)</g:attribute_value>
      </g:product_detail>
      <g:product_highlight>GI-tagged Erode turmeric</g:product_highlight>
      <g:product_highlight>2.5% to 3.5% natural curcumin</g:product_highlight>
      <g:product_highlight>Grown, ground and packed on one family farm</g:product_highlight>
      <g:product_highlight>FSSAI licensed, no added colour or fillers</g:product_highlight>
    </item>`;
    })
    .join('');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">
  <channel>
    <title>${esc(SITE_NAME)}</title>
    <link>${SITE_URL}</link>
    <description>GI-tagged Erode turmeric powder, farm direct from Erode, Tamil Nadu.</description>${items}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: { 'Content-Type': 'application/xml; charset=utf-8', 'Cache-Control': 'public, max-age=3600' },
  });
}
