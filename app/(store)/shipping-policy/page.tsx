import type { Metadata } from 'next';
import { buildMetadata } from '@/lib/seo';
import LegalPage from '@/components/LegalPage';

export const metadata: Metadata = buildMetadata({
  title: 'Shipping Policy',
  description: 'Free shipping on every Ponkali Masalas order across India, with delivery in 3 to 5 working days.',
  path: '/shipping-policy',
});

export default function ShippingPolicyPage() {
  return (
    <LegalPage
      eyebrow="Delivery"
      title="Shipping Policy"
      intro="Shipping is on us — every Ponkali order ships free, anywhere in India."
      updated="8 June 2026"
    >
      <h2>Free Shipping on Every Order</h2>
      <p>
        We offer <strong>free shipping on all orders</strong> across India. There are no minimum order values and no
        delivery charges — the price you see at checkout is the price you pay.
      </p>

      <h2>Dispatch &amp; Delivery Time</h2>
      <ul>
        <li>Orders are usually dispatched within 1 to 2 business days of being placed.</li>
        <li>Delivery typically takes 3 to 5 working days, depending on your location.</li>
        <li>Orders are not dispatched or delivered on Sundays and public holidays.</li>
      </ul>

      <h2>Coverage</h2>
      <p>
        We deliver to most pin codes across India through our courier partners. In rare cases a location may not be
        serviceable; if so, we will contact you to arrange an alternative.
      </p>

      <h2>Order Tracking</h2>
      <p>
        Once your order is dispatched, we will share tracking details by email or phone so you can follow your shipment
        until it reaches you.
      </p>

      <h2>Delays &amp; Issues</h2>
      <p>
        Occasionally deliveries can be delayed by factors outside our control, such as weather or courier disruptions.
        If your order is delayed, marked delivered but not received, or arrives damaged, please contact us at{' '}
        <a href="mailto:ponkaliturmeric@gmail.com">ponkaliturmeric@gmail.com</a> or{' '}
        <a href="tel:+919944033696">+91 99440 33696</a> and we will sort it out for you.
      </p>
    </LegalPage>
  );
}
