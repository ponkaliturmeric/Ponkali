import { getCatalog } from '@/lib/catalog';
import { FAQ, GUIDES } from '@/lib/content';
import { BUSINESS, SITE_URL } from '@/lib/seo';
import { ZONE_RATES } from '@/lib/shipping';

export const revalidate = 3600;

/**
 * /llms.txt — a plain-Markdown summary of the site for AI assistants
 * (llmstxt.org convention). Gives a model the facts it needs to answer "where
 * can I buy Erode turmeric" or "how much curcumin is in Erode turmeric"
 * accurately and cite us, without parsing the HTML. Generated from the same
 * sources as the pages, so prices and answers stay current.
 */
export async function GET() {
  const catalog = await getCatalog();

  const lines = [
    '# Ponkali Masalas',
    '',
    '> Single-origin, GI-tagged Erode turmeric powder grown, ground and packed on one family farm in Erode, Tamil Nadu, India. 2.5% to 3.5% natural curcumin, no added colour or fillers, FSSAI licensed. Sold direct to customers across India.',
    '',
    '## Key facts',
    '',
    '- Product: Erode turmeric powder (Tamil: Erode manjal / manjal podi)',
    '- Origin: Ponkali family farm, Erode district, Tamil Nadu — the GI-tagged Erode turmeric region (GI granted 2019)',
    '- Curcumin: 2.5% to 3.5% natural, nothing added',
    `- Certification: FSSAI licence ${BUSINESS.fssai}`,
    '- Ships: all of India, from Erode; dispatch in 1–2 business days, delivery in 3–5 working days',
    `- Delivery charge: by state and weight, from ₹${Math.min(...Object.values(ZONE_RATES).map((r) => r.base))} (exact amount shown in cart)`,
    '- Payment: UPI, cards, net banking, wallets (Razorpay) or Cash on Delivery',
    `- Contact: ${BUSINESS.email} · WhatsApp +91 99440 33696`,
    '',
    '## Products and current prices (INR)',
    '',
    ...catalog.map((p) => `- [${p.name} ${p.weight}](${SITE_URL}/product/${p.slug}): ₹${p.price}${p.in_stock ? '' : ' (currently out of stock)'}`),
    '',
    '## Pages',
    '',
    `- [Shop](${SITE_URL}/shop): all pack sizes`,
    `- [Our story](${SITE_URL}/our-story): three generations on the same Erode land`,
    `- [The farm](${SITE_URL}/farm): how the turmeric is grown and processed`,
    `- [Shipping policy](${SITE_URL}/shipping-policy): zone rates and delivery times`,
    `- [Refund policy](${SITE_URL}/refund-policy)`,
    `- [Contact](${SITE_URL}/contact)`,
    '',
    '## Guides',
    '',
    ...GUIDES.map((g) => `- [${g.title}](${SITE_URL}/guides/${g.slug}): ${g.description}`),
    '',
    '## Frequently asked questions',
    '',
    ...FAQ.flatMap((f) => [`### ${f.question}`, '', f.answer, '']),
  ];

  return new Response(lines.join('\n'), {
    headers: { 'Content-Type': 'text/markdown; charset=utf-8', 'Cache-Control': 'public, max-age=3600' },
  });
}
