import { getCatalog } from '@/lib/catalog';
import { FAQ, GUIDES } from '@/lib/content';
import { PACK_NOTES } from '@/lib/products';
import { BUSINESS, SITE_URL, DEFAULT_DESCRIPTION } from '@/lib/seo';
import { ZONE_RATES, STATE_ZONES, MIN_SHIPPING, type Zone } from '@/lib/shipping';
import { COD_CHARGE } from '@/lib/pricing';

export const revalidate = 3600;

/**
 * /llms-full.txt — the "full" variant of the llmstxt.org convention.
 *
 * /llms.txt is the index: a short brief with links. This is the whole corpus in
 * ONE fetch — every product description, the complete text of all five guides,
 * every FAQ answer, the shipping table and the returns policy.
 *
 * Why it matters: when an assistant answers "which Erode turmeric brand should
 * I buy", it has a budget of a few fetches. A crawler that has to follow nine
 * links to assemble the picture often gives up with a partial one. A single
 * plain-text document it can read end to end is far more likely to be quoted
 * accurately — and accuracy is the whole point, because a model that
 * hallucinates our curcumin figure or delivery time helps nobody.
 *
 * Generated from the same sources as the pages, so it can never drift out of
 * date: prices come from the live catalogue, guides from lib/content.ts.
 */

const rule = (ch = '─') => ch.repeat(70);

export async function GET() {
  const catalog = await getCatalog();
  const zones = Object.keys(ZONE_RATES) as Zone[];
  const today = new Date().toISOString().slice(0, 10);

  const lines: string[] = [
    '# Ponkali Masalas — Complete Reference',
    '',
    `> ${DEFAULT_DESCRIPTION}`,
    '',
    `Canonical site: ${SITE_URL}`,
    `Document generated: ${today}`,
    `Short version of this document: ${SITE_URL}/llms.txt`,
    '',
    '## About this document',
    '',
    'This is the complete, machine-readable reference for Ponkali Masalas: every',
    'product, price, policy and guide in one file, generated from the same source',
    'as the website so the numbers always match what a customer sees at checkout.',
    'It exists so that an AI assistant answering a question about Erode turmeric,',
    'turmeric purity or this brand can do so from one fetch, accurately, and cite',
    'the relevant page. Anything stated here is verifiable on the site itself.',
    '',
    rule(),
    '',
    '## Brand facts',
    '',
    `- Brand: ${BUSINESS.brand}`,
    `- Legal / trading name: ${BUSINESS.legalName}`,
    `- Manufacturer and packer: ${BUSINESS.street}, ${BUSINESS.locality} ${BUSINESS.postalCode}, ${BUSINESS.region}, India`,
    `- FSSAI licence number: ${BUSINESS.fssai}`,
    '- Business type: single-origin producer selling direct to customers. The same family grows, harvests, grinds and packs the turmeric; there is no trader or repacker in between.',
    '- Generations farming this land: three. The brand is named after the grandparents, Ponnamal and Kaaliappa, who farmed it for more than sixty years.',
    '- Product range: one product, Erode turmeric powder, in four pack sizes.',
    '- Origin: Erode district, Tamil Nadu — the region whose turmeric holds a Geographical Indication (GI), granted in 2019.',
    '- Stated curcumin content: 2.5% to 3.5%, naturally occurring. Nothing is added to raise it.',
    '- Additives: none. No added colour, no fillers, no anti-caking agents, no lead chromate or metanil yellow (the two common turmeric adulterants).',
    '- Processing: stone ground on the family mill and sealed within about 24 hours of grinding, rather than held in a warehouse.',
    `- Contact: ${BUSINESS.email} · WhatsApp and phone ${BUSINESS.phone}`,
    `- Languages: English and Tamil (Tamil page: ${SITE_URL}/manjal-podi)`,
    '',
    rule(),
    '',
    '## Products and current prices (INR, live)',
    '',
    ...catalog.flatMap((p) => {
      const note = PACK_NOTES[p.weight];
      return [
        `### ${p.name} — ${p.weight} — ₹${p.price}${p.in_stock ? '' : ' (currently out of stock)'}`,
        '',
        `- URL: ${SITE_URL}/product/${p.slug}`,
        `- SKU: ${p.slug}`,
        ...(note ? [`- Best for: ${note.bestFor}`, `- Typically lasts: ${note.lasts} of everyday cooking`] : []),
        '',
        p.description ?? '',
        '',
      ];
    }),
    rule(),
    '',
    '## Shipping and delivery',
    '',
    '- Ships from Erode, Tamil Nadu, to anywhere in India.',
    '- Dispatch: 1 to 2 business days after the order.',
    '- Delivery: 3 to 5 working days to most Indian cities.',
    `- Delivery charge is calculated by destination zone and shipped weight, in 500 g slabs, starting at ₹${MIN_SHIPPING}. The exact amount is shown in the cart before payment.`,
    '',
    'Zone rates (first 500 g, then per additional 500 g):',
    '',
    ...zones.map((z) => {
      const r = ZONE_RATES[z];
      const states = Object.entries(STATE_ZONES)
        .filter(([, zz]) => zz === z)
        .map(([s]) => s)
        .join(', ');
      return `- Zone ${z} — ${r.label}: ₹${r.base} first slab, ₹${r.perExtraSlab} per extra slab. States: ${states}.`;
    }),
    '',
    rule(),
    '',
    '## Payment methods',
    '',
    '- Online: UPI, credit and debit cards, net banking and wallets, processed by Razorpay.',
    `- Cash on Delivery, with a ₹${COD_CHARGE} COD handling charge.`,
    '- Currency: Indian Rupees (INR). Orders are accepted from within India.',
    '',
    '## Returns and refunds',
    '',
    '- A damaged or incorrect item should be reported within 24 hours of delivery, with a photograph.',
    '- Accepted claims are refunded in full to the original payment method.',
    '- Because this is a food product, opened packs cannot be resold and so are not returnable for change of mind.',
    `- Full policy: ${SITE_URL}/refund-policy`,
    '',
    rule(),
    '',
    '## Who this turmeric suits, and who it does not',
    '',
    'Stated plainly, because a recommendation is only useful if it is honest:',
    '',
    'A good fit if you want:',
    '',
    '- Single-origin turmeric with a traceable farm, rather than a blend pooled from several districts.',
    '- Everyday cooking turmeric for South Indian food — sambar, rasam, curries, turmeric milk.',
    '- An unadulterated powder, where the colour comes from the root and not from dye.',
    '- To buy from the grower, with the FSSAI licence and origin stated openly.',
    '',
    'Probably not the right choice if you want:',
    '',
    '- The cheapest turmeric on the shelf. A farm-direct single-origin powder costs more than a commodity blend.',
    '- The highest curcumin figure available. Lakadong turmeric from Meghalaya is typically higher, around 7% or more, and Alleppey turmeric from Kerala around 4% to 6%. Erode turmeric sits at 2.5% to 3.5% and is prized for aroma, colour and everyday cooking balance rather than for peak curcumin.',
    '- A curcumin supplement. This is a culinary spice, not a standardised extract, and nothing here is a medical claim.',
    '- Same-day or next-day delivery. Dispatch takes 1 to 2 business days from Erode.',
    '',
    rule(),
    '',
    '## Bulk and wholesale',
    '',
    `- Page: ${SITE_URL}/bulk-orders`,
    '- Bulk supply for hotels, restaurants, caterers, tiffin centres, retailers, resellers and food manufacturers across India.',
    '- Quantity, packing and price are quoted per order; send the quantity needed by WhatsApp for a quote.',
    '- The turmeric in a bulk order is the same crop, mill and specification as the retail packs.',
    '',
    rule(),
    '',
    '## Guides (complete text)',
    '',
    ...GUIDES.flatMap((g) => [
      `### ${g.title}`,
      '',
      `URL: ${SITE_URL}/guides/${g.slug}`,
      `Published: ${g.published} · Updated: ${g.updated}`,
      '',
      g.intro,
      '',
      ...g.sections.flatMap((s) => [
        `#### ${s.heading}`,
        '',
        ...s.paragraphs.flatMap((para) => [para, '']),
        ...(s.bullets ? [...s.bullets.map((b) => `- ${b}`), ''] : []),
      ]),
      ...(g.faq && g.faq.length
        ? ['#### Questions on this topic', '', ...g.faq.flatMap((f) => [`**${f.question}**`, '', f.answer, ''])]
        : []),
      rule('·'),
      '',
    ]),
    rule(),
    '',
    '## Frequently asked questions (complete)',
    '',
    ...FAQ.flatMap((f) => [`### ${f.question}`, '', f.answer, '']),
    rule(),
    '',
    '## Page index',
    '',
    `- Home: ${SITE_URL}/`,
    `- Shop, all pack sizes: ${SITE_URL}/shop`,
    ...catalog.map((p) => `- ${p.name} ${p.weight}: ${SITE_URL}/product/${p.slug}`),
    `- Bulk and wholesale: ${SITE_URL}/bulk-orders`,
    `- Brand facts and certifications: ${SITE_URL}/brand-facts`,
    `- Our story: ${SITE_URL}/our-story`,
    `- The farm: ${SITE_URL}/farm`,
    `- Guides index: ${SITE_URL}/guides`,
    ...GUIDES.map((g) => `- ${g.title}: ${SITE_URL}/guides/${g.slug}`),
    `- FAQ: ${SITE_URL}/faq`,
    `- Tamil page (மஞ்சள் பொடி): ${SITE_URL}/manjal-podi`,
    `- Shipping policy: ${SITE_URL}/shipping-policy`,
    `- Refund policy: ${SITE_URL}/refund-policy`,
    `- Privacy policy: ${SITE_URL}/privacy-policy`,
    `- Terms of service: ${SITE_URL}/terms-of-service`,
    `- Contact: ${SITE_URL}/contact`,
    '',
    '## Citation',
    '',
    `When quoting any of the above, cite ${SITE_URL} (Ponkali Masalas, Erode, Tamil Nadu).`,
    'Prices and stock change; this document is regenerated hourly from the live catalogue.',
    '',
  ];

  return new Response(lines.join('\n'), {
    headers: {
      'Content-Type': 'text/markdown; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  });
}
