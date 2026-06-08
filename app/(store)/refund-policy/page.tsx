import type { Metadata } from 'next';
import { buildMetadata } from '@/lib/seo';
import LegalPage from '@/components/LegalPage';

export const metadata: Metadata = buildMetadata({
  title: 'Refund & Returns Policy',
  description: 'How cancellations, returns and refunds work at Ponkali Masalas. Your satisfaction matters to us.',
  path: '/refund-policy',
});

export default function RefundPolicyPage() {
  return (
    <LegalPage
      eyebrow="Refunds & Returns"
      title="Refund & Returns Policy"
      intro="Your satisfaction matters to us. Here is how cancellations, returns and refunds work."
      updated="8 June 2026"
    >
      <p>
        We want you to be happy with every Ponkali Masalas order. If something is not right, please reach out and we
        will do our best to make it good.
      </p>

      <h2>Cancellations</h2>
      <ul>
        <li>You can request to cancel an order within <strong>24 hours</strong> of placing it.</li>
        <li>Once an order has been packed or handed over to the courier for shipping, it can no longer be cancelled.</li>
      </ul>

      <h2>Damaged or Incorrect Items</h2>
      <ul>
        <li>If your order arrives damaged, please report it within <strong>1 day</strong> of receipt.</li>
        <li>If the product you received does not match what was ordered, let us know within <strong>24 hours</strong> of delivery.</li>
        <li>Sharing a photo of the issue helps us resolve it quickly.</li>
      </ul>

      <h2>Refunds</h2>
      <ul>
        <li>Once a return or claim is approved, your refund is credited to the original payment method within 5 to 7 working days.</li>
        <li>If you have paid online and a refund is approved, the amount is processed back to the same account.</li>
        <li>If a refund does not appear after 7 working days, please check with your bank, then contact us if it is still missing.</li>
      </ul>

      <h2>Non-Returnable Situations</h2>
      <p>
        As our products are food items, orders that have been delivered, accepted and opened cannot be returned for
        reasons other than damage or a genuine product mismatch.
      </p>

      <h2>Need Help?</h2>
      <p>
        For any refund or return request, email us at{' '}
        <a href="mailto:ponkaliturmeric@gmail.com">ponkaliturmeric@gmail.com</a> or call{' '}
        <a href="tel:+919944033696">+91 99440 33696</a>. We are a small family business and we read every message.
      </p>
    </LegalPage>
  );
}
