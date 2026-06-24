'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useCart } from '@/components/CartContext';
import { MinusIcon, PlusIcon, TrashIcon } from '@/components/Icons';

export default function CartPage() {
  const { items, removeItem, updateQuantity, subtotal, clearCart } = useCart();
  const shipping = 0; // Free shipping on every order.
  const total = subtotal + shipping;

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-cream flex flex-col items-center justify-center px-5">
        <div className="w-16 h-16 rounded-full bg-white border border-black/8 flex items-center justify-center mb-6">
          <svg className="w-7 h-7 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 0 0-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 0 0-16.536-1.84M7.5 14.25 5.106 5.272M6 20.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Zm12.75 0a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z" />
          </svg>
        </div>
        <h1 className="text-[28px] font-extrabold text-dark-brown tracking-tight mb-2">Your cart is empty</h1>
        <p className="text-gray-500 mb-8 text-[16px]">Add some pure Erode turmeric to get started.</p>
        <Link
          href="/shop"
          className="bg-dark-brown text-cream px-9 py-3.5 rounded-full font-semibold text-[15px] hover:bg-black transition-colors"
        >
          Shop Now
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream">
      <div className="max-w-5xl mx-auto px-5 py-12">
        <h1 className="text-[32px] font-extrabold text-dark-brown tracking-tight mb-8">
          Cart <span className="text-gray-300 font-normal text-[24px]">({items.reduce((s, i) => s + i.quantity, 0)})</span>
        </h1>

        {/* Free shipping on every order */}
        {subtotal > 0 && (
          <div className="bg-green-50 border border-green-100 rounded-2xl p-4 mb-6">
            <p className="text-[14px] font-semibold text-green-700">Free shipping on every order</p>
          </div>
        )}

        <div className="grid md:grid-cols-3 gap-7">
          {/* Items */}
          <div className="md:col-span-2 space-y-3">
            {items.map(item => (
              <div key={item.product.slug} className="bg-white rounded-2xl p-5 border border-black/6 flex gap-4">
                <div className="w-[72px] h-[72px] flex-shrink-0 bg-[#F5E8A0] rounded-xl overflow-hidden relative">
                  <Image
                    src="/images/new-prd-img0.png"
                    alt={item.product.name}
                    fill
                    className="object-contain p-1.5"
                    sizes="72px"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-dark-brown text-[15px]">{item.product.name}</p>
                  <p className="text-[13px] text-gray-400 mt-0.5">{item.product.weight}</p>
                  <div className="flex items-center gap-2.5 mt-3">
                    <button
                      onClick={() => updateQuantity(item.product.slug, item.quantity - 1)}
                      className="w-7 h-7 rounded-full border border-black/10 flex items-center justify-center hover:border-gold hover:text-gold transition-colors"
                    >
                      <MinusIcon className="w-3 h-3" />
                    </button>
                    <span className="text-[15px] font-semibold w-6 text-center">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.product.slug, item.quantity + 1)}
                      className="w-7 h-7 rounded-full border border-black/10 flex items-center justify-center hover:border-gold hover:text-gold transition-colors"
                    >
                      <PlusIcon className="w-3 h-3" />
                    </button>
                  </div>
                </div>
                <div className="flex flex-col items-end justify-between">
                  <p className="font-bold text-dark-brown text-[18px]">₹{item.product.price * item.quantity}</p>
                  <button
                    onClick={() => removeItem(item.product.slug)}
                    className="text-gray-300 hover:text-red-400 transition-colors"
                  >
                    <TrashIcon className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}

            <div className="flex justify-between items-center pt-2 px-1">
              <button onClick={clearCart} className="text-[13px] text-gray-300 hover:text-red-400 transition-colors">
                Clear cart
              </button>
              <Link href="/shop" className="text-[13px] text-gray-500 hover:text-gold transition-colors font-medium">
                ← Continue Shopping
              </Link>
            </div>
          </div>

          {/* Summary */}
          <div>
            <div className="bg-white rounded-2xl p-6 border border-black/6 sticky top-24">
              <h2 className="font-extrabold text-dark-brown text-[18px] tracking-tight mb-5">Summary</h2>
              <div className="space-y-3 text-[14px]">
                <div className="flex justify-between">
                  <span className="text-gray-500">Subtotal</span>
                  <span className="font-semibold">₹{subtotal}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Shipping</span>
                  <span className="text-green-600 font-semibold">Free</span>
                </div>
              </div>
              <div className="border-t border-black/6 mt-4 pt-4 flex justify-between font-extrabold text-dark-brown text-[18px]">
                <span>Total</span>
                <span>₹{total}</span>
              </div>
              <Link
                href="/checkout"
                className="block w-full bg-dark-brown text-cream text-center py-4 rounded-full font-semibold text-[15px] hover:bg-black transition-colors mt-5"
              >
                Proceed to Checkout
              </Link>
              <p className="text-[11px] text-gray-300 text-center mt-3">Secure checkout · All orders tracked</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
