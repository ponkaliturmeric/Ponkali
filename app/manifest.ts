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
      {
        src: '/images/logo.jpg',
        sizes: '512x512',
        type: 'image/jpeg',
      },
    ],
  };
}
