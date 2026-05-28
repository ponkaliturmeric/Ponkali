import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Contact',
  description: 'Get in touch with Ponkali Masalas. For orders, questions, or wholesale enquiries — we\'re a family farm and we\'re happy to talk.',
};

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
