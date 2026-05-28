'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import AdminLayout from '@/components/AdminLayout';
import { Product } from '@/lib/types';

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [editingPrice, setEditingPrice] = useState<Record<number, string>>({});
  const [saving, setSaving] = useState<Record<number, boolean>>({});
  const router = useRouter();

  useEffect(() => {
    fetch('/api/orders?page=1').then(r => { if (r.status === 401) router.push('/admin/login'); });
    fetch('/api/products').then(r => r.json()).then(setProducts);
  }, [router]);

  const handlePriceEdit = (id: number, value: string) => {
    setEditingPrice(prev => ({ ...prev, [id]: value }));
  };

  const savePrice = async (product: Product) => {
    const newPrice = parseFloat(editingPrice[product.id] || String(product.price));
    if (isNaN(newPrice) || newPrice <= 0) return;
    setSaving(prev => ({ ...prev, [product.id]: true }));
    const res = await fetch(`/api/products/${product.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ price: newPrice }),
    });
    if (res.ok) {
      const updated = await res.json();
      setProducts(prev => prev.map(p => p.id === product.id ? updated : p));
      setEditingPrice(prev => { const n = { ...prev }; delete n[product.id]; return n; });
    }
    setSaving(prev => ({ ...prev, [product.id]: false }));
  };

  const toggleStock = async (product: Product) => {
    setSaving(prev => ({ ...prev, [product.id]: true }));
    const res = await fetch(`/api/products/${product.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ in_stock: product.in_stock === 1 ? 0 : 1 }),
    });
    if (res.ok) {
      const updated = await res.json();
      setProducts(prev => prev.map(p => p.id === product.id ? updated : p));
    }
    setSaving(prev => ({ ...prev, [product.id]: false }));
  };

  return (
    <AdminLayout>
      <div className="mb-7">
        <h1 className="text-[24px] font-extrabold text-gray-900 tracking-tight">Products</h1>
        <p className="text-gray-400 text-[14px] mt-1">Manage pricing and stock availability</p>
      </div>

      <div className="space-y-3">
        {products.map(product => (
          <div
            key={product.id}
            className={`bg-white rounded-2xl p-5 border transition-all ${product.in_stock === 0 ? 'border-red-100 opacity-70' : 'border-gray-100'}`}
          >
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-gold to-dark-brown flex items-center justify-center flex-shrink-0">
                <span className="text-white font-bold text-[11px]">{product.weight}</span>
              </div>

              <div className="flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-bold text-gray-900 text-[15px]">{product.name}</h3>
                  <span className="text-gray-400 text-[13px]">{product.weight}</span>
                  {product.is_bestseller === 1 && (
                    <span className="bg-gold/10 text-gold text-[11px] font-bold px-2 py-0.5 rounded-full tracking-wide uppercase">
                      Best Seller
                    </span>
                  )}
                </div>
                <p className="text-[12px] text-gray-300 mt-0.5 font-mono">{product.slug}</p>
              </div>

              <div className="flex items-center gap-4 flex-wrap">
                {/* Price editor */}
                <div>
                  <p className="text-[11px] text-gray-400 font-medium uppercase tracking-wider mb-1.5">Price (₹)</p>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      value={editingPrice[product.id] !== undefined ? editingPrice[product.id] : product.price}
                      onChange={e => handlePriceEdit(product.id, e.target.value)}
                      className="w-24 border border-gray-200 rounded-xl px-3 py-2 text-[14px] font-bold focus:outline-none focus:border-gold transition-colors"
                    />
                    {editingPrice[product.id] !== undefined && editingPrice[product.id] !== String(product.price) && (
                      <button
                        onClick={() => savePrice(product)}
                        disabled={saving[product.id]}
                        className="bg-gold text-white px-3 py-2 rounded-xl text-[12px] font-bold hover:bg-yellow-600 disabled:opacity-50 transition-colors"
                      >
                        {saving[product.id] ? '...' : 'Save'}
                      </button>
                    )}
                  </div>
                </div>

                {/* Stock toggle */}
                <div>
                  <p className="text-[11px] text-gray-400 font-medium uppercase tracking-wider mb-1.5">Stock</p>
                  <button
                    onClick={() => toggleStock(product)}
                    disabled={saving[product.id]}
                    className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-[13px] font-semibold transition-colors disabled:opacity-50 ${
                      product.in_stock === 1
                        ? 'bg-green-50 text-green-700 hover:bg-green-100'
                        : 'bg-red-50 text-red-600 hover:bg-red-100'
                    }`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${product.in_stock === 1 ? 'bg-green-500' : 'bg-red-500'}`} />
                    {product.in_stock === 1 ? 'In Stock' : 'Out of Stock'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <p className="text-[12px] text-gray-300 text-center mt-8">
        Price changes and stock status take effect immediately on the storefront.
      </p>
    </AdminLayout>
  );
}
