'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useCart } from './CartContext';
import { XIcon, MinusIcon, PlusIcon, CartIcon } from './Icons';

export default function MiniCart() {
  const { items, removeItem, updateQuantity, subtotal, totalItems, isOpen, setIsOpen } = useCart();
  const shipping = 0; // Free shipping on every order.
  const total = subtotal + shipping;

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/30 z-40 backdrop-blur-sm" onClick={() => setIsOpen(false)} />
      <div className="fixed right-0 top-0 h-full w-full max-w-[400px] bg-white z-50 shadow-2xl flex flex-col">
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
          <div>
            <h2 className="font-bold text-[16px] text-dark-brown">Your Cart</h2>
            <p className="text-[12px] text-gray-400 mt-0.5">{totalItems} {totalItems === 1 ? 'item' : 'items'}</p>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="p-2 text-gray-400 hover:text-dark-brown transition-colors rounded-full hover:bg-gray-50"
          >
            <XIcon className="w-5 h-5" />
          </button>
        </div>

        {items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
            <div className="w-16 h-16 rounded-full bg-cream flex items-center justify-center mb-4">
              <CartIcon className="w-7 h-7 text-gold/60" />
            </div>
            <p className="font-semibold text-dark-brown mb-1">Your cart is empty</p>
            <p className="text-[14px] text-gray-400 mb-6">Add some pure Erode turmeric</p>
            <button
              onClick={() => setIsOpen(false)}
              className="bg-gold text-white px-6 py-2.5 rounded-full text-[14px] font-semibold hover:bg-yellow-600 transition-colors"
            >
              Continue Shopping
            </button>
          </div>
        ) : (
          <>
            {subtotal > 0 && (
              <div className="mx-5 mt-4 p-3.5 bg-green-50 rounded-xl border border-green-100">
                <p className="text-[12px] text-green-700 font-semibold">Free shipping on every order</p>
              </div>
            )}

            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
              {items.map(item => (
                <div key={item.product.slug} className="flex gap-3.5">
                  <div className="w-16 h-16 rounded-xl flex-shrink-0 overflow-hidden bg-white border border-black/8 relative">
                    <Image
                      src="/images/new-prd-img.png"
                      alt={item.product.name}
                      fill
                      className="object-contain p-1"
                      sizes="64px"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-[14px] text-dark-brown leading-snug">{item.product.name}</p>
                    <p className="text-[12px] text-gray-400 mt-0.5">{item.product.weight}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <button
                        onClick={() => updateQuantity(item.product.slug, item.quantity - 1)}
                        className="w-6 h-6 rounded-full border border-gray-200 flex items-center justify-center hover:border-gold hover:text-gold transition-colors"
                      >
                        <MinusIcon className="w-3 h-3" />
                      </button>
                      <span className="text-[14px] font-semibold w-5 text-center">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.product.slug, item.quantity + 1)}
                        className="w-6 h-6 rounded-full border border-gray-200 flex items-center justify-center hover:border-gold hover:text-gold transition-colors"
                      >
                        <PlusIcon className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                  <div className="flex flex-col items-end justify-between">
                    <p className="font-bold text-[15px] text-dark-brown">₹{item.product.price * item.quantity}</p>
                    <button
                      onClick={() => removeItem(item.product.slug)}
                      className="text-[11px] text-gray-300 hover:text-red-400 transition-colors font-medium"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="px-5 pb-6 pt-4 border-t border-gray-100 space-y-2.5">
              <div className="flex justify-between text-[14px]">
                <span className="text-gray-500">Subtotal</span>
                <span className="font-semibold">₹{subtotal}</span>
              </div>
              <div className="flex justify-between text-[14px]">
                <span className="text-gray-500">Shipping</span>
                <span className="text-green-600 font-semibold">Free</span>
              </div>
              <div className="flex justify-between font-bold text-dark-brown text-[16px] border-t border-gray-100 pt-2.5">
                <span>Total</span>
                <span>₹{total}</span>
              </div>
              <Link
                href="/checkout"
                onClick={() => setIsOpen(false)}
                className="block w-full bg-dark-brown text-cream text-center py-3.5 rounded-full font-semibold text-[15px] mt-3 hover:bg-black transition-colors"
              >
                Checkout
              </Link>
              <Link
                href="/cart"
                onClick={() => setIsOpen(false)}
                className="block w-full text-center py-2 text-dark-brown/50 text-[13px] hover:text-dark-brown transition-colors"
              >
                View full cart
              </Link>
            </div>
          </>
        )}
      </div>
    </>
  );
}
