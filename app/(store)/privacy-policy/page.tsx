import type { Metadata } from 'next';
import { buildMetadata } from '@/lib/seo';
import LegalPage from '@/components/LegalPage';

export const metadata: Metadata = buildMetadata({
  title: 'Privacy Policy',
  description: 'How Ponkali Masalas collects, uses and protects your personal information when you shop with us.',
  path: '/privacy-policy',
});

export default function PrivacyPolicyPage() {
  return (
    <LegalPage
      eyebrow="Your Privacy"
      title="Privacy Policy"
      intro="We respect your privacy and collect only what we need to process your orders and serve you better."
      updated="8 June 2026"
    >
      <p>
        This Privacy Policy explains how Ponkali Masalas (&ldquo;we&rdquo;, &ldquo;us&rdquo;, &ldquo;our&rdquo;)
        collects, uses and safeguards your personal information when you visit our website or place an order with us.
      </p>

      <h2>Information We Collect</h2>
      <p>When you place an order or contact us, we may collect:</p>
      <ul>
        <li>Your name, delivery address, email address and phone number.</li>
        <li>Order details such as the products you buy and your payment method.</li>
        <li>Payment information, which is processed securely by our payment partner — we never store your card or UPI credentials.</li>
        <li>Basic technical data such as your IP address and browser type, used to keep the site secure.</li>
      </ul>

      <h2>How We Use Your Information</h2>
      <ul>
        <li>To process, pack and deliver your orders.</li>
        <li>To send you order confirmations and delivery updates.</li>
        <li>To respond to your questions and provide customer support.</li>
        <li>To improve our products, website and service.</li>
      </ul>

      <h2>Cookies</h2>
      <p>
        Our website uses cookies to remember your cart and preferences and to understand how the site is used. You can
        disable cookies in your browser settings, though some parts of the site may not work as expected.
      </p>

      <h2>Sharing Your Information</h2>
      <p>
        We do not sell or rent your personal data. We share it only with the partners needed to fulfil your order — for
        example our courier and payment gateway — and only to the extent required to complete your purchase, or where
        the law requires us to.
      </p>

      <h2>Data Retention</h2>
      <p>
        We keep your order information for as long as needed to fulfil your order, meet legal and accounting
        requirements, and resolve any disputes.
      </p>

      <h2>Your Rights</h2>
      <p>
        You may ask us to view, correct or delete the personal information we hold about you, subject to any records we
        are legally required to keep. To make a request, simply email us.
      </p>

      <h2>Contact Us</h2>
      <p>
        If you have any questions about this policy, write to us at{' '}
        <a href="mailto:ponkaliturmeric@gmail.com">ponkaliturmeric@gmail.com</a> or call{' '}
        <a href="tel:+919944033696">+91 99440 33696</a>.
      </p>
    </LegalPage>
  );
}
