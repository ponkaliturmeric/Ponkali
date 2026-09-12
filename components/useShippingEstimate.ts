'use client';

import { useEffect, useState } from 'react';
import { CartItem } from '@/lib/types';
import { calculateShipping, DEFAULT_STATE, STATE_ZONES, type ShippingQuote } from '@/lib/shipping';

/**
 * The destination state the shopper has picked (cart page / checkout), shared
 * across the cart, mini-cart and checkout via localStorage so the delivery
 * estimate is the same everywhere. The server recomputes the real charge from
 * the same lib/shipping.ts table, so the estimate is exact once the state is
 * right.
 */
const STATE_KEY = 'ponkali_ship_state';

export function useShippingState(): [string, (s: string) => void] {
  const [state, setStateRaw] = useState(DEFAULT_STATE);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STATE_KEY);
      if (stored && stored in STATE_ZONES) setStateRaw(stored);
    } catch { /* ignore */ }
  }, []);

  const setState = (s: string) => {
    setStateRaw(s);
    try { localStorage.setItem(STATE_KEY, s); } catch { /* ignore */ }
  };

  return [state, setState];
}

export function useShippingEstimate(items: CartItem[], subtotal: number, state: string): ShippingQuote {
  return calculateShipping({
    state,
    lines: items.map((i) => ({ slug: i.product.slug, quantity: i.quantity })),
    subtotal,
  });
}
