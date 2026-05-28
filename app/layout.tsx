import type { Metadata } from 'next';
import { DM_Sans, Playfair_Display } from 'next/font/google';
import './globals.css';

const dmSans = DM_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-dm-sans',
  display: 'swap',
});

const playfair = Playfair_Display({
  subsets: ['latin'],
  weight: ['700', '800'],
  style: ['normal', 'italic'],
  variable: '--font-playfair',
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: 'Ponkali Masalas — Pure Erode Turmeric, Farm Direct',
    template: '%s | Ponkali Masalas',
  },
  description: 'GI-tagged Erode turmeric powder, stone ground on our ancestral mill. Three generations of farm-direct purity. FSSAI certified. Free shipping above ₹399.',
  keywords: ['erode turmeric', 'GI turmeric', 'stone ground turmeric', 'pure turmeric powder', 'farm direct turmeric'],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${dmSans.variable} ${playfair.variable}`}>
      <body className="bg-cream text-black font-sans antialiased">
        {children}
      </body>
    </html>
  );
}
