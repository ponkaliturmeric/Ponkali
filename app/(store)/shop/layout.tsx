import type { Metadata } from 'next';
import { buildMetadata } from '@/lib/seo';

export const metadata: Metadata = buildMetadata({
  title: 'Shop Pure Erode Turmeric Powder',
  description: 'Buy pure Erode turmeric powder that is GI-tagged, naturally grown and farm direct. Available in 100g, 250g, 500g and 1kg. Free shipping above ₹399.',
  path: '/shop',
});

export default function ShopLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
