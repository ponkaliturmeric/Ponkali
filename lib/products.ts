import { Product } from './types';

/**
 * The retail catalogue, and the source of truth for product COPY.
 *
 * Each pack gets its OWN description. That is an SEO requirement, not a style
 * choice: all four /product/* pages previously shared one identical paragraph,
 * which reads to Google as four near-duplicate pages competing for the same
 * query — so it picks one and discounts the rest. Distinct copy gives each pack
 * its own intent to rank for ("100g trial pack", "1kg turmeric powder price"),
 * and the same text flows to the Merchant Center feed and /llms.txt.
 *
 * Every claim here must stay true to the pack: curcumin range, origin, FSSAI
 * licence and the "no additives" promise are the brand's verifiable facts.
 */

const SHARED_FACTS =
  'Grown in the GI-tagged Erode region, stone ground on our family mill and packed on the farm. 2.5% to 3.5% natural curcumin, no added colour, no fillers, FSSAI certified.';

export const PRODUCTS: Product[] = [
  {
    id: 1,
    slug: 'turmeric-100g',
    name: 'Erode Turmeric Powder',
    weight: '100g',
    price: 149,
    in_stock: 1,
    is_bestseller: 0,
    description:
      `The 100g trial pack: enough pure Erode manjal podi for about a month of everyday cooking in a small kitchen, and the easiest way to taste the difference against supermarket turmeric before committing to a bigger pack. ${SHARED_FACTS}`,
  },
  {
    id: 2,
    slug: 'turmeric-250g',
    name: 'Erode Turmeric Powder',
    weight: '250g',
    price: 299,
    in_stock: 1,
    is_bestseller: 1,
    description:
      `Our most-ordered pack. 250g of GI-tagged Erode turmeric powder lasts a family of four roughly two to three months of daily sambar, rasam, curries and turmeric milk, at a better price per gram than the 100g pouch. ${SHARED_FACTS}`,
  },
  {
    id: 3,
    slug: 'turmeric-500g',
    name: 'Erode Turmeric Powder',
    weight: '500g',
    price: 449,
    in_stock: 1,
    is_bestseller: 0,
    description:
      `The best-value everyday pack: 500g works out far cheaper per gram than small pouches and covers about five months for a regular household, or a few weeks for a tiffin centre or home caterer. ${SHARED_FACTS}`,
  },
  {
    id: 4,
    slug: 'turmeric-1kg',
    name: 'Erode Turmeric Powder',
    weight: '1kg',
    price: 719,
    in_stock: 1,
    is_bestseller: 0,
    description:
      `The 1kg family pack, and our lowest price per gram. Suited to large households, joint families and small kitchens that cook in volume — roughly ten months of daily use. Store it sealed, away from light and heat, and it keeps its colour and aroma. ${SHARED_FACTS}`,
  },
];

/** Pack-size specific angles reused on the product page and in the feed. */
export const PACK_NOTES: Record<string, { bestFor: string; lasts: string }> = {
  '100g': { bestFor: 'Trying us for the first time', lasts: 'about 1 month' },
  '250g': { bestFor: 'A family of four, everyday cooking', lasts: 'about 2 to 3 months' },
  '500g': { bestFor: 'Best value for regular cooking', lasts: 'about 5 months' },
  '1kg':  { bestFor: 'Large or joint families, bulk cooking', lasts: 'about 10 months' },
};

/**
 * The lowest catalogue price — a static fallback for "from ₹X" copy in client
 * components. Server components should prefer getFromPrice() in lib/catalog.ts,
 * which reads the live, admin-editable price.
 */
export const FROM_PRICE = Math.min(...PRODUCTS.map((p) => p.price));
