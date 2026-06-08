import type { Metadata } from 'next';
import { buildMetadata } from '@/lib/seo';
import LegalPage from '@/components/LegalPage';

export const metadata: Metadata = buildMetadata({
  title: 'Terms of Service',
  description: 'The terms that apply when you use the Ponkali Masalas website and place an order with us.',
  path: '/terms-of-service',
});

export default function TermsOfServicePage() {
  return (
    <LegalPage
      eyebrow="The Fine Print"
      title="Terms of Service"
      intro="These terms apply whenever you use our website or place an order with Ponkali Masalas."
      updated="8 June 2026"
    >
      <p>
        By accessing this website and placing an order, you agree to the terms set out below. Please read them carefully.
      </p>

      <h2>Eligibility</h2>
      <p>
        You must be at least 18 years old and able to enter into a legally binding contract to place an order. You are
        responsible for keeping your account details secure and for any activity that happens under your account.
      </p>

      <h2>Products &amp; Pricing</h2>
      <ul>
        <li>All prices are listed in Indian Rupees (INR).</li>
        <li>Shipping is free, so the price shown is the price you pay — a small charge applies only if you choose Cash on Delivery.</li>
        <li>We try to describe our products accurately, but natural colour, aroma and texture can vary slightly batch to batch.</li>
        <li>We reserve the right to correct any pricing errors before your order is dispatched.</li>
      </ul>

      <h2>Orders</h2>
      <p>
        Placing an order is an offer to buy. We confirm your order by email or phone, and we reserve the right to decline
        or cancel an order — for example if a product is out of stock or a pricing error has occurred — in which case any
        amount paid is refunded.
      </p>

      <h2>Acceptable Use</h2>
      <p>
        You agree not to misuse the website, attempt to disrupt its operation, upload harmful code, or copy our content,
        images or branding for your own use without permission.
      </p>

      <h2>Intellectual Property</h2>
      <p>
        All content on this website, including text, images, logos and the Ponkali name, is our property and may not be
        reproduced without our written consent.
      </p>

      <h2>Changes to These Terms</h2>
      <p>
        We may update these terms from time to time. Any changes take effect when posted on this page, so please check
        back occasionally.
      </p>

      <h2>Contact Us</h2>
      <p>
        Questions about these terms? Email us at{' '}
        <a href="mailto:ponkaliturmeric@gmail.com">ponkaliturmeric@gmail.com</a> or call{' '}
        <a href="tel:+919944033696">+91 99440 33696</a>.
      </p>
    </LegalPage>
  );
}
