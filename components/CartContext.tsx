'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { Product, CartItem } from '@/lib/types';

interface CartContextType {
  items: CartItem[];
  addItem: (product: Product, quantity?: number) => void;
  removeItem: (slug: string) => void;
  updateQuantity: (slug: string, quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
  subtotal: number;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

const CartContext = createContext<CartContextType | null>(null);

// Bumped from the legacy `ponkali_cart` key. Older builds could leave a stale
// item (e.g. a phantom 100g pack) persisted in a browser; switching keys gives
// every visitor a clean cart exactly once and ignores that legacy data.
const CART_KEY = 'ponkali_cart_v2';

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  // Don't persist until the initial load has run, otherwise the first render's
  // empty `items` would overwrite a freshly-restored cart.
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    localStorage.removeItem('ponkali_cart'); // drop the legacy key + its stale data
    const stored = localStorage.getItem(CART_KEY);
    let initial: CartItem[] = [];
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) initial = parsed;
      } catch {
        initial = [];
      }
    }
    setItems(initial);
    setLoaded(true);

    // Reconcile against the live catalogue so prices/stock the admin has changed
    // are reflected everywhere the cart is shown (mini-cart, cart page, checkout
    // summary). Stored prices are captured at add-time and otherwise go stale.
    if (initial.length) {
      fetch('/api/products')
        .then(r => r.json())
        .then((live: Product[]) => {
          if (!Array.isArray(live)) return;
          const bySlug = new Map(live.map(p => [p.slug, p]));
          setItems(prev => prev
            .filter(i => bySlug.has(i.product.slug))
            .map(i => ({ ...i, product: { ...i.product, ...bySlug.get(i.product.slug)! } })),
          );
        })
        .catch(() => { /* keep stored prices if the catalogue is unreachable */ });
    }
  }, []);

  useEffect(() => {
    if (!loaded) return;
    localStorage.setItem(CART_KEY, JSON.stringify(items));
  }, [items, loaded]);

  const addItem = (product: Product, quantity = 1) => {
    setItems(prev => {
      const existing = prev.find(i => i.product.slug === product.slug);
      if (existing) {
        return prev.map(i =>
          i.product.slug === product.slug
            ? { ...i, quantity: i.quantity + quantity }
            : i
        );
      }
      return [...prev, { product, quantity }];
    });
    setIsOpen(true);
  };

  const removeItem = (slug: string) => {
    setItems(prev => prev.filter(i => i.product.slug !== slug));
  };

  const updateQuantity = (slug: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(slug);
      return;
    }
    setItems(prev =>
      prev.map(i => i.product.slug === slug ? { ...i, quantity } : i)
    );
  };

  const clearCart = () => setItems([]);

  const totalItems = items.reduce((sum, i) => sum + i.quantity, 0);
  const subtotal = items.reduce((sum, i) => sum + i.product.price * i.quantity, 0);

  return (
    <CartContext.Provider value={{
      items, addItem, removeItem, updateQuantity, clearCart,
      totalItems, subtotal, isOpen, setIsOpen,
    }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}
