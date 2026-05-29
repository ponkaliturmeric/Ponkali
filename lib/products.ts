import { Product } from './types';

const description = 'Pure Erode turmeric powder, stone ground on our ancestral mill. GI-recognised region. 2.5–4.5% natural curcumin. No additives. No adulteration. FSSAI certified. Directly from our family farm in Perundurai, Erode.';

export const PRODUCTS: Product[] = [
  { id: 1, slug: 'turmeric-100g', name: 'Erode Turmeric Powder', weight: '100g', price: 149, in_stock: 1, is_bestseller: 0, description },
  { id: 2, slug: 'turmeric-250g', name: 'Erode Turmeric Powder', weight: '250g', price: 299, in_stock: 1, is_bestseller: 1, description },
  { id: 3, slug: 'turmeric-500g', name: 'Erode Turmeric Powder', weight: '500g', price: 449, in_stock: 1, is_bestseller: 0, description },
  { id: 4, slug: 'turmeric-1kg',  name: 'Erode Turmeric Powder', weight: '1kg',  price: 719, in_stock: 1, is_bestseller: 0, description },
];
