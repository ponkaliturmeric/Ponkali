'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Box, Typography, Button, Stack, TextField, Chip, Avatar, Switch,
} from '@mui/material';
import AdminLayout from '@/components/AdminLayout';
import PageHeader from '@/components/admin/PageHeader';
import MainCard from '@/components/admin/MainCard';
import StatusChip from '@/components/admin/StatusChip';
import { Product } from '@/lib/types';
import { BRAND, GOLD } from '@/components/admin/theme';

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [editingPrice, setEditingPrice] = useState<Record<number, string>>({});
  const [saving, setSaving] = useState<Record<number, boolean>>({});
  const router = useRouter();

  useEffect(() => {
    fetch('/api/orders?page=1').then(r => { if (r.status === 401) router.push('/admin/login'); });
    fetch('/api/products').then(r => r.json()).then(setProducts);
  }, [router]);

  const handlePriceEdit = (id: number, value: string) => setEditingPrice(prev => ({ ...prev, [id]: value }));

  const savePrice = async (product: Product) => {
    const newPrice = parseFloat(editingPrice[product.id] || String(product.price));
    if (isNaN(newPrice) || newPrice <= 0) return;
    setSaving(prev => ({ ...prev, [product.id]: true }));
    const res = await fetch(`/api/products/${product.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ price: newPrice }) });
    if (res.ok) {
      const updated = await res.json();
      setProducts(prev => prev.map(p => p.id === product.id ? updated : p));
      setEditingPrice(prev => { const n = { ...prev }; delete n[product.id]; return n; });
    }
    setSaving(prev => ({ ...prev, [product.id]: false }));
  };

  const toggleStock = async (product: Product) => {
    setSaving(prev => ({ ...prev, [product.id]: true }));
    const res = await fetch(`/api/products/${product.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ in_stock: product.in_stock === 1 ? 0 : 1 }) });
    if (res.ok) {
      const updated = await res.json();
      setProducts(prev => prev.map(p => p.id === product.id ? updated : p));
    }
    setSaving(prev => ({ ...prev, [product.id]: false }));
  };

  return (
    <AdminLayout>
      <PageHeader title="Products" subtitle="Manage pricing and stock availability" breadcrumbs={[{ label: 'Products' }]} />

      <Stack spacing={2}>
        {products.map(product => {
          const inStock = product.in_stock === 1;
          const priceChanged = editingPrice[product.id] !== undefined && editingPrice[product.id] !== String(product.price);
          return (
            <MainCard key={product.id} sx={{ borderColor: inStock ? 'divider' : '#FECACA' }} contentSx={{ p: 2.5 }}>
              <Stack direction={{ xs: 'column', sm: 'row' }} alignItems={{ sm: 'center' }} spacing={2}>
                <Avatar variant="rounded" sx={{ width: 56, height: 56, background: `linear-gradient(135deg, ${GOLD}, ${BRAND})`, fontSize: 12, fontWeight: 700 }}>
                  {product.weight}
                </Avatar>

                <Box sx={{ flex: 1 }}>
                  <Stack direction="row" alignItems="center" spacing={1} flexWrap="wrap" useFlexGap>
                    <Typography fontWeight={700} sx={{ fontSize: 15 }}>{product.name}</Typography>
                    <Typography variant="body2" color="text.secondary">{product.weight}</Typography>
                    {product.is_bestseller === 1 && <Chip label="Best Seller" size="small" sx={{ bgcolor: 'secondary.lighter', color: 'secondary.dark', fontWeight: 700, fontSize: 10 }} />}
                  </Stack>
                  <Typography variant="caption" color="text.disabled" sx={{ fontFamily: 'monospace' }}>{product.slug}</Typography>
                </Box>

                <Stack direction="row" alignItems="center" spacing={3} flexWrap="wrap" useFlexGap>
                  <Box>
                    <Typography variant="overline" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>Price (₹)</Typography>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <TextField
                        type="number"
                        value={editingPrice[product.id] !== undefined ? editingPrice[product.id] : product.price}
                        onChange={e => handlePriceEdit(product.id, e.target.value)}
                        sx={{ width: 110, '& input': { fontWeight: 700 } }}
                      />
                      {priceChanged && (
                        <Button variant="contained" color="secondary" size="small" onClick={() => savePrice(product)} disabled={saving[product.id]}>
                          {saving[product.id] ? '…' : 'Save'}
                        </Button>
                      )}
                    </Stack>
                  </Box>

                  <Box>
                    <Typography variant="overline" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>Stock</Typography>
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <Switch checked={inStock} onChange={() => toggleStock(product)} disabled={saving[product.id]} color="success" />
                      <StatusChip status={inStock ? 'in-stock' : 'out-of-stock'} />
                    </Stack>
                  </Box>
                </Stack>
              </Stack>
            </MainCard>
          );
        })}
      </Stack>

      <Typography variant="caption" color="text.disabled" sx={{ display: 'block', textAlign: 'center', mt: 4 }}>
        Price changes and stock status take effect immediately on the storefront.
      </Typography>
    </AdminLayout>
  );
}
