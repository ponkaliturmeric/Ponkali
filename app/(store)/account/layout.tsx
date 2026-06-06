import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'My Orders',
  description: 'View your Ponkali Masalas order history.',
  robots: { index: false, follow: false },
  alternates: { canonical: '/account' },
};

export default function AccountLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
