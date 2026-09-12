import type { Metadata } from 'next';
import { buildMetadata } from '@/lib/seo';
import LegalPage from '@/components/LegalPage';
import { FREE_SHIPPING_ABOVE, PACK_WEIGHT_G, STATE_ZONES, ZONE_RATES, type Zone } from '@/lib/shipping';

export const metadata: Metadata = buildMetadata({
  title: 'Shipping Policy',
  description: 'Ponkali Masalas ships GI-tagged Erode turmeric all over India. Delivery is charged by destination and weight, with delivery in 3 to 5 working days.',
  path: '/shipping-policy',
});

const ZONE_ORDER: Zone[] = ['A', 'B', 'C', 'D', 'E'];

/** States in each zone, for the coverage table. */
function statesIn(zone: Zone): string {
  return Object.entries(STATE_ZONES)
    .filter(([, z]) => z === zone)
    .map(([state]) => state)
    .sort()
    .join(', ');
}

export default function ShippingPolicyPage() {
  return (
    <LegalPage
      eyebrow="Delivery"
      title="Shipping Policy"
      intro="Every order ships from our farm in Erode, Tamil Nadu. Delivery is charged at cost, based on where it is going and how much it weighs."
      updated="12 September 2026"
    >
      <h2>Delivery Charges</h2>
      <p>
        Delivery is calculated at checkout from your <strong>state</strong> and the <strong>total weight</strong> of your
        order, in 500&nbsp;g slabs. The charge you see in your cart and at checkout is the exact amount — there are no
        hidden fees.
        {FREE_SHIPPING_ABOVE != null && (
          <> Orders of <strong>₹{FREE_SHIPPING_ABOVE} or more ship free</strong>.</>
        )}
      </p>
      <div className="overflow-x-auto">
        <table>
          <thead>
            <tr>
              <th>Zone</th>
              <th>States</th>
              <th>First 500 g</th>
              <th>Each extra 500 g</th>
            </tr>
          </thead>
          <tbody>
            {ZONE_ORDER.map((z) => (
              <tr key={z}>
                <td><strong>{ZONE_RATES[z].label}</strong></td>
                <td>{statesIn(z)}</td>
                <td>₹{ZONE_RATES[z].base}</td>
                <td>₹{ZONE_RATES[z].perExtraSlab}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p>
        Pack weights used for the calculation include packaging: 100&nbsp;g pack ≈ {PACK_WEIGHT_G['turmeric-100g']}&nbsp;g,
        250&nbsp;g ≈ {PACK_WEIGHT_G['turmeric-250g']}&nbsp;g, 500&nbsp;g ≈ {PACK_WEIGHT_G['turmeric-500g']}&nbsp;g,
        1&nbsp;kg ≈ {PACK_WEIGHT_G['turmeric-1kg']}&nbsp;g. For example, a single 250&nbsp;g pack to Chennai is
        ₹{ZONE_RATES.A.base}; a 1&nbsp;kg pack to Delhi is ₹{ZONE_RATES.C.base + 2 * ZONE_RATES.C.perExtraSlab}.
      </p>
      <p>
        Cash on Delivery orders carry an additional ₹30 handling charge, shown separately at checkout.
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
