import type { MetadataRoute } from 'next';
import { SITE_NAME, SITE_TAGLINE, DEFAULT_DESCRIPTION } from '@/lib/seo';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${SITE_NAME} — ${SITE_TAGLINE}`,
    short_name: SITE_NAME,
    description: DEFAULT_DESCRIPTION,
    start_url: '/',
    display: 'standalone',
    background_color: '#FBF5E5',
    theme_color: '#3A2A18',
    icons: [
      // The brand logo asset is 256×256 — declare the real size so installable
      // PWA / Android add-to-home-screen doesn't reject a size mismatch.
      { src: '/icon.jpg', sizes: '256x256', type: 'image/jpeg' },
      { src: '/favicon.ico', sizes: '48x48', type: 'image/x-icon' },
    ],
  };
}
