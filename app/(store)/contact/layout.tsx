import type { Metadata } from 'next';
import { buildMetadata } from '@/lib/seo';

export const metadata: Metadata = buildMetadata({
  title: 'Contact',
  description: 'Get in touch with Ponkali Masalas. For orders, questions or wholesale enquiries, we\'re a family farm and we\'re happy to talk.',
  path: '/contact',
});

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
