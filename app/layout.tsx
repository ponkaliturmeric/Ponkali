import type { Metadata } from 'next';
import { Wix_Madefor_Text } from 'next/font/google';
import './globals.css';

const wixMadefor = Wix_Madefor_Text({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-madefor',
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
    <html lang="en" className={wixMadefor.variable}>
      <body className="bg-cream text-black font-sans antialiased">
        {children}
      </body>
    </html>
  );
}
