import type { Metadata } from 'next';
import { Public_Sans } from 'next/font/google';
import AdminThemeRegistry from '@/components/admin/AdminThemeRegistry';

const publicSans = Public_Sans({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800'],
  variable: '--font-public-sans',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Admin — Ponkali Masalas',
  robots: { index: false, follow: false },
};

export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={publicSans.variable}>
      <AdminThemeRegistry>{children}</AdminThemeRegistry>
    </div>
  );
}
