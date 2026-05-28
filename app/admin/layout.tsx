import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Admin — Ponkali Masalas',
};

export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
