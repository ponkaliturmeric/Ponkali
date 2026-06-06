import { Product } from './types';

const description = 'Pure Erode turmeric powder, stone ground on our family mill. Grown in the GI-tagged Erode region with 2.5% to 3.5% natural curcumin. No added colour, no fillers and no adulteration. FSSAI certified and packed fresh from our farm in Perundurai, Erode.';

export const PRODUCTS: Product[] = [
  { id: 1, slug: 'turmeric-100g', name: 'Erode Turmeric Powder', weight: '100g', price: 149, in_stock: 1, is_bestseller: 0, description },
  { id: 2, slug: 'turmeric-250g', name: 'Erode Turmeric Powder', weight: '250g', price: 299, in_stock: 1, is_bestseller: 1, description },
  { id: 3, slug: 'turmeric-500g', name: 'Erode Turmeric Powder', weight: '500g', price: 449, in_stock: 1, is_bestseller: 0, description },
  { id: 4, slug: 'turmeric-1kg',  name: 'Erode Turmeric Powder', weight: '1kg',  price: 719, in_stock: 1, is_bestseller: 0, description },
];

/**
 * The lowest catalogue price — the single source of truth for every "from ₹X"
 * marketing line (hero, farm CTA, etc.). Deriving it here means the copy can
 * never drift out of sync with the actual product prices.
 */
export const FROM_PRICE = Math.min(...PRODUCTS.map((p) => p.price));
