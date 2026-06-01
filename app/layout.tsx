import type { Metadata } from 'next';
import { Wix_Madefor_Text, Playfair_Display, Plus_Jakarta_Sans } from 'next/font/google';
import './globals.css';
import JsonLd from '@/components/JsonLd';
import Analytics from '@/components/Analytics';
import {
  SITE_URL,
  SITE_NAME,
  SITE_TAGLINE,
  DEFAULT_DESCRIPTION,
  TWITTER_HANDLE,
  organizationJsonLd,
} from '@/lib/seo';

const wixMadefor = Wix_Madefor_Text({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-madefor',
  display: 'swap',
});

const playfair = Playfair_Display({
  subsets: ['latin'],
  weight: ['700', '800'],
  style: ['normal'],
  variable: '--font-playfair',
  display: 'swap',
});

// Closest to General Sans available on Google Fonts
const jakartaSans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['500', '600', '700', '800'],
  variable: '--font-jakarta',
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} — ${SITE_TAGLINE}`,
    template: `%s | ${SITE_NAME}`,
  },
  description: DEFAULT_DESCRIPTION,
  applicationName: SITE_NAME,
  keywords: [
    'erode turmeric',
    'GI tagged turmeric',
    'stone ground turmeric',
    'pure turmeric powder',
    'farm direct turmeric',
    'high curcumin turmeric',
    'organic turmeric powder india',
    'buy turmeric online',
    'ponkali masalas',
  ],
  authors: [{ name: SITE_NAME }],
  creator: SITE_NAME,
  publisher: SITE_NAME,
  alternates: {
    canonical: '/',
  },
  category: 'Food & Spices',
  formatDetection: { email: false, telephone: false, address: false },
  openGraph: {
    type: 'website',
    url: SITE_URL,
    siteName: SITE_NAME,
    title: `${SITE_NAME} — ${SITE_TAGLINE}`,
    description: DEFAULT_DESCRIPTION,
    locale: 'en_IN',
  },
  twitter: {
    card: 'summary_large_image',
    title: `${SITE_NAME} — ${SITE_TAGLINE}`,
    description: DEFAULT_DESCRIPTION,
    creator: TWITTER_HANDLE,
    site: TWITTER_HANDLE,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
      'max-video-preview': -1,
    },
  },
  verification: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION
    ? { google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION }
    : undefined,
  icons: {
    icon: '/images/logo.jpg',
    apple: '/images/logo.jpg',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${wixMadefor.variable} ${playfair.variable} ${jakartaSans.variable}`}>
      <body className="bg-cream text-black font-sans antialiased">
        <JsonLd data={organizationJsonLd()} />
        {children}
        <Analytics />
      </body>
    </html>
  );
}
