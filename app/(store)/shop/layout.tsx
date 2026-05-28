import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Shop',
  description: 'Buy pure Erode turmeric powder — GI-tagged, stone ground, farm direct. Available in 100g, 250g, 500g and 1kg. Free shipping above ₹399.',
};

export default function ShopLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
