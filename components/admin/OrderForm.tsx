'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Box, Typography, Button, Stack, TextField, Select, MenuItem, IconButton,
  Divider, Alert, FormControlLabel, Checkbox, InputAdornment, Tooltip,
  CircularProgress,
} from '@mui/material';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import AutoFixHighRoundedIcon from '@mui/icons-material/AutoFixHighRounded';
import MainCard from '@/components/admin/MainCard';
import { Product } from '@/lib/types';
import { INDIAN_STATES, calculateShipping } from '@/lib/shipping';
import {
  MANUAL_ORDER_SOURCES, ORDER_SOURCES, PAYMENT_METHODS, PAYMENT_STATUSES, ORDER_STATUSES,
} from '@/lib/crm';

/**
 * Create / edit an order by hand — the WhatsApp, phone and walk-in orders.
 *
 * Every total shown here is recomputed by the server from the same formula
 * (lib/manual-orders.ts), so this form is a convenience, never the authority.
 * Only the customer's name and mobile are mandatory: an order taken on WhatsApp
 * often has no address yet, and refusing to save it would send the operator
 * back to pen and paper.
 */

export interface OrderFormLine {
  /** '' means a custom item that isn't a catalogue SKU. */
  slug: string;
  product_name: string;
  weight: string;
  price: string;
  quantity: string;
}

export interface OrderFormValues {
  source: string;
  status: string;
  customer_name: string;
  phone: string;
  email: string;
  address_line1: string;
  address_line2: string;
  city: string;
  state: string;
  pincode: string;
  landmark: string;
  items: OrderFormLine[];
  shipping: string;
  cod_charge: string;
  discount: string;
  payment_method: string;
  payment_status: string;
  amount_paid: string;
  payment_ref: string;
  notes: string;
  notify: boolean;
}

export const EMPTY_LINE: OrderFormLine = { slug: '', product_name: '', weight: '', price: '', quantity: '1' };

export const EMPTY_ORDER: OrderFormValues = {
  source: 'whatsapp',
  status: 'Confirmed',
  customer_name: '',
  phone: '',
  email: '',
  address_line1: '',
  address_line2: '',
  city: '',
  state: '',
  pincode: '',
  landmark: '',
  items: [{ ...EMPTY_LINE }],
  shipping: '',
  cod_charge: '',
  discount: '',
  payment_method: 'upi',
  payment_status: 'Unpaid',
  amount_paid: '',
  payment_ref: '',
  notes: '',
  notify: false,
};

const n = (v: string) => {
  const parsed = Number(v);
  return Number.isFinite(parsed) ? parsed : 0;
};

const money = (v: number) => `₹${v.toLocaleString('en-IN')}`;

const labelSx = { '& .MuiInputBase-input': { fontSize: 14 } } as const;

export default function OrderForm({
  mode, orderId, initial,
}: {
  mode: 'create' | 'edit';
  orderId?: string;
  initial?: OrderFormValues;
}) {
  const router = useRouter();
  const [form, setForm] = useState<OrderFormValues>(initial ?? EMPTY_ORDER);
  const [catalog, setCatalog] = useState<Product[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/products')
      .then((r) => r.json())
      .then((data: Product[]) => { if (Array.isArray(data)) setCatalog(data); })
      .catch(() => { /* custom items still work without the catalogue */ });
  }, []);

  const set = <K extends keyof OrderFormValues>(key: K, value: OrderFormValues[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const setLine = (index: number, patch: Partial<OrderFormLine>) =>
    setForm((prev) => ({
      ...prev,
      items: prev.items.map((l, i) => (i === index ? { ...l, ...patch } : l)),
    }));

  /** Picking a catalogue product fills in its name, weight and current price. */
  const pickProduct = (index: number, slug: string) => {
    const p = catalog.find((c) => c.slug === slug);
    setLine(index, p
      ? { slug, product_name: p.name, weight: p.weight, price: String(p.price) }
      : { slug: '', product_name: '', weight: '', price: '' });
  };

  const addLine = () => setForm((prev) => ({ ...prev, items: [...prev.items, { ...EMPTY_LINE }] }));
  const removeLine = (index: number) =>
    setForm((prev) => ({
      ...prev,
      items: prev.items.length === 1 ? [{ ...EMPTY_LINE }] : prev.items.filter((_, i) => i !== index),
    }));

  /* ── Totals: the same arithmetic the server does ── */
  const subtotal = form.items.reduce((s, l) => s + n(l.price) * n(l.quantity), 0);
  const shipping = n(form.shipping);
  const codCharge = n(form.cod_charge);
  const discount = n(form.discount);
  const total = Math.max(0, subtotal + shipping + codCharge - discount);
  const paid = n(form.amount_paid);
  const balance = Math.max(0, total - paid);

  /** Zone × weight quote, available only when every line is a real SKU. */
  const autoShipping = useMemo(() => {
    if (!form.state || form.items.some((l) => !l.slug)) return null;
    return calculateShipping({
      state: form.state,
      lines: form.items.map((l) => ({ slug: l.slug, quantity: n(l.quantity) })),
      subtotal,
    });
  }, [form.state, form.items, subtotal]);

  // Keep payment status and the amount received consistent as they are typed,
  // so the operator can set either one and the other follows.
  const setPaymentStatus = (status: string) => {
    setForm((prev) => ({
      ...prev,
      payment_status: status,
      amount_paid: status === 'Paid' ? String(total) : status === 'Unpaid' ? '' : prev.amount_paid,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      const payload = {
        ...form,
        items: form.items.map((l) => ({
          slug: l.slug || undefined,
          product_name: l.product_name,
          weight: l.weight,
          price: l.price,
          quantity: l.quantity,
        })),
      };
      const res = await fetch(
        mode === 'create' ? '/api/admin/orders' : `/api/admin/orders/${orderId}`,
        {
          method: mode === 'create' ? 'POST' : 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        },
      );
      if (res.status === 401) { router.push('/admin/login'); return; }
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || 'Could not save the order.');
        setSaving(false);
        return;
      }
      router.push(`/admin/orders/${data.order_id}`);
      router.refresh();
    } catch {
      setError('Network error. Please try again.');
      setSaving(false);
    }
  };

  const sourceOptions = mode === 'create' ? MANUAL_ORDER_SOURCES : ORDER_SOURCES;

  return (
    <form onSubmit={handleSubmit}>
      <Box sx={{ display: 'grid', gridTemplateColumns: { lg: '2fr 1fr' }, gap: 2.5, alignItems: 'start' }}>
        {/* ── Left column ── */}
        <Stack spacing={2.5}>
          <MainCard title="Customer">
            <Box sx={{ display: 'grid', gridTemplateColumns: { sm: '1fr 1fr' }, gap: 2 }}>
              <TextField
                label="Full name" required value={form.customer_name}
                onChange={(e) => set('customer_name', e.target.value)}
                placeholder="Lakshmi Narayanan" sx={labelSx}
              />
              <TextField
                label="Mobile number" required value={form.phone}
                onChange={(e) => set('phone', e.target.value.replace(/\D/g, '').slice(0, 10))}
                placeholder="9876543210" inputProps={{ inputMode: 'numeric' }}
                helperText="10 digits — links this order to the customer"
                sx={labelSx}
              />
              <TextField
                label="Email (optional)" type="email" value={form.email}
                onChange={(e) => set('email', e.target.value)} sx={labelSx}
              />
              <Box>
                <Typography variant="caption" color="text.secondary" fontWeight={600}>Order came from</Typography>
                <Select
                  fullWidth size="small" value={form.source}
                  onChange={(e) => set('source', e.target.value)} sx={{ mt: 0.5 }}
                >
                  {sourceOptions.map((o) => <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>)}
                </Select>
              </Box>
            </Box>
          </MainCard>

          <MainCard
            title="Delivery address"
            action={<Typography variant="caption" color="text.disabled">Optional — fill in when you have it</Typography>}
          >
            <Box sx={{ display: 'grid', gridTemplateColumns: { sm: '1fr 1fr' }, gap: 2 }}>
              <TextField
                label="House / flat no., street" value={form.address_line1}
                onChange={(e) => set('address_line1', e.target.value)}
                sx={{ gridColumn: { sm: '1 / -1' }, ...labelSx }}
              />
              <TextField
                label="Area / locality" value={form.address_line2}
                onChange={(e) => set('address_line2', e.target.value)}
                sx={{ gridColumn: { sm: '1 / -1' }, ...labelSx }}
              />
              <TextField label="City" value={form.city} onChange={(e) => set('city', e.target.value)} sx={labelSx} />
              <TextField
                label="PIN code" value={form.pincode}
                onChange={(e) => set('pincode', e.target.value.replace(/\D/g, '').slice(0, 6))}
                inputProps={{ inputMode: 'numeric' }} sx={labelSx}
              />
              <Box>
                <Typography variant="caption" color="text.secondary" fontWeight={600}>State</Typography>
                <Select
                  fullWidth size="small" displayEmpty value={form.state}
                  onChange={(e) => set('state', e.target.value)} sx={{ mt: 0.5 }}
                >
                  <MenuItem value=""><em>Not known yet</em></MenuItem>
                  {INDIAN_STATES.map((s) => <MenuItem key={s} value={s}>{s}</MenuItem>)}
                </Select>
              </Box>
              <TextField label="Landmark" value={form.landmark} onChange={(e) => set('landmark', e.target.value)} sx={labelSx} />
            </Box>
          </MainCard>

          <MainCard
            title="Items"
            action={
              <Button size="small" startIcon={<AddRoundedIcon />} onClick={addLine}>Add item</Button>
            }
          >
            <Stack spacing={2} divider={<Divider />}>
              {form.items.map((line, i) => (
                <Box key={i}>
                  <Stack direction="row" spacing={1.5} alignItems="flex-start">
                    <Box sx={{ flex: 1, display: 'grid', gridTemplateColumns: { sm: '2fr 1fr 1fr' }, gap: 1.5 }}>
                      <Box sx={{ gridColumn: { sm: '1 / -1' } }}>
                        <Select
                          fullWidth size="small" displayEmpty value={line.slug}
                          onChange={(e) => pickProduct(i, e.target.value)}
                        >
                          <MenuItem value=""><em>Custom item (type it in)</em></MenuItem>
                          {catalog.map((p) => (
                            <MenuItem key={p.slug} value={p.slug}>
                              {p.name} {p.weight} — ₹{p.price}{p.in_stock ? '' : ' (out of stock)'}
                            </MenuItem>
                          ))}
                        </Select>
                      </Box>

                      {!line.slug && (
                        <>
                          <TextField
                            size="small" label="Item name" value={line.product_name}
                            onChange={(e) => setLine(i, { product_name: e.target.value })}
                            placeholder="Erode Turmeric Powder (bulk)" sx={{ gridColumn: { sm: 'span 2' }, ...labelSx }}
                          />
                          <TextField
                            size="small" label="Weight / pack" value={line.weight}
                            onChange={(e) => setLine(i, { weight: e.target.value })}
                            placeholder="5kg" sx={labelSx}
                          />
                        </>
                      )}

                      <TextField
                        size="small" label="Unit price" value={line.price}
                        onChange={(e) => setLine(i, { price: e.target.value })}
                        InputProps={{ startAdornment: <InputAdornment position="start">₹</InputAdornment> }}
                        inputProps={{ inputMode: 'decimal' }} sx={labelSx}
                      />
                      <TextField
                        size="small" label="Qty" value={line.quantity}
                        onChange={(e) => setLine(i, { quantity: e.target.value.replace(/\D/g, '') })}
                        inputProps={{ inputMode: 'numeric' }} sx={labelSx}
                      />
                      <Stack justifyContent="center" alignItems="flex-end">
                        <Typography variant="caption" color="text.secondary">Line total</Typography>
                        <Typography variant="body1" fontWeight={700}>
                          {money(n(line.price) * n(line.quantity))}
                        </Typography>
                      </Stack>
                    </Box>
                    <Tooltip title="Remove item">
                      <IconButton onClick={() => removeLine(i)} size="small" sx={{ mt: 0.5 }}>
                        <DeleteOutlineRoundedIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Stack>
                  {line.slug !== '' && (
                    <Typography variant="caption" color="text.disabled">
                      Catalogue price prefilled — change it if you agreed something else.
                    </Typography>
                  )}
                </Box>
              ))}
            </Stack>
          </MainCard>

          <MainCard title="Payment">
            <Box sx={{ display: 'grid', gridTemplateColumns: { sm: '1fr 1fr' }, gap: 2 }}>
              <Box>
                <Typography variant="caption" color="text.secondary" fontWeight={600}>How they paid</Typography>
                <Select
                  fullWidth size="small" value={form.payment_method}
                  onChange={(e) => set('payment_method', e.target.value)} sx={{ mt: 0.5 }}
                >
                  {PAYMENT_METHODS.map((o) => <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>)}
                </Select>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary" fontWeight={600}>Payment status</Typography>
                <Select
                  fullWidth size="small" value={form.payment_status}
                  onChange={(e) => setPaymentStatus(e.target.value)} sx={{ mt: 0.5 }}
                >
                  {PAYMENT_STATUSES.map((s) => <MenuItem key={s} value={s}>{s}</MenuItem>)}
                </Select>
              </Box>
              <TextField
                label="Amount received" value={form.amount_paid}
                onChange={(e) => set('amount_paid', e.target.value)}
                InputProps={{ startAdornment: <InputAdornment position="start">₹</InputAdornment> }}
                inputProps={{ inputMode: 'decimal' }}
                helperText={balance > 0 ? `${money(balance)} still due` : 'Nothing outstanding'}
                sx={labelSx}
              />
              <TextField
                label="Reference (UPI txn / cheque no.)" value={form.payment_ref}
                onChange={(e) => set('payment_ref', e.target.value)} sx={labelSx}
              />
            </Box>
          </MainCard>

          <MainCard title="Internal notes">
            <TextField
              fullWidth multiline minRows={3} value={form.notes}
              onChange={(e) => set('notes', e.target.value)}
              placeholder="What they asked for, delivery preferences, anything to remember…"
            />
            <FormControlLabel
              sx={{ mt: 1.5 }}
              control={<Checkbox checked={form.notify} onChange={(e) => set('notify', e.target.checked)} />}
              label={
                <Typography variant="body2" color="text.secondary">
                  Also send the customer the confirmation email + WhatsApp message
                  {mode === 'edit' ? ' (ignored when editing)' : ''}
                </Typography>
              }
            />
          </MainCard>
        </Stack>

        {/* ── Right column: charges + summary ── */}
        <Stack spacing={2.5} sx={{ position: { lg: 'sticky' }, top: { lg: 88 } }}>
          <MainCard title="Charges">
            <Stack spacing={2}>
              <TextField
                label="Delivery charge" value={form.shipping}
                onChange={(e) => set('shipping', e.target.value)}
                InputProps={{
                  startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                  endAdornment: autoShipping ? (
                    <Tooltip title={`${autoShipping.zoneLabel} · ${autoShipping.slabs} × 500 g slab`}>
                      <IconButton size="small" onClick={() => set('shipping', String(autoShipping.charge))}>
                        <AutoFixHighRoundedIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  ) : null,
                }}
                inputProps={{ inputMode: 'decimal' }}
                helperText={
                  autoShipping
                    ? `Zone rate for ${autoShipping.zoneLabel}: ${money(autoShipping.charge)} — tap the wand to use it`
                    : 'Set a state and use only catalogue items to auto-calculate'
                }
                sx={labelSx}
              />
              <TextField
                label="COD charge" value={form.cod_charge}
                onChange={(e) => set('cod_charge', e.target.value)}
                InputProps={{ startAdornment: <InputAdornment position="start">₹</InputAdornment> }}
                inputProps={{ inputMode: 'decimal' }} sx={labelSx}
              />
              <TextField
                label="Discount" value={form.discount}
                onChange={(e) => set('discount', e.target.value)}
                InputProps={{ startAdornment: <InputAdornment position="start">₹</InputAdornment> }}
                inputProps={{ inputMode: 'decimal' }} sx={labelSx}
              />
              <Box>
                <Typography variant="caption" color="text.secondary" fontWeight={600}>Order status</Typography>
                <Select
                  fullWidth size="small" value={form.status}
                  onChange={(e) => set('status', e.target.value)} sx={{ mt: 0.5 }}
                >
                  {ORDER_STATUSES.map((s) => <MenuItem key={s} value={s}>{s}</MenuItem>)}
                </Select>
              </Box>
            </Stack>
          </MainCard>

          <MainCard title="Summary">
            <Stack spacing={1}>
              {[
                ['Subtotal', subtotal],
                ['Delivery', shipping],
                ...(codCharge ? [['COD charge', codCharge] as const] : []),
                ...(discount ? [['Discount', -discount] as const] : []),
              ].map(([label, value]) => (
                <Stack key={label as string} direction="row" justifyContent="space-between">
                  <Typography variant="body2" color="text.secondary">{label}</Typography>
                  <Typography variant="body2">{money(Number(value))}</Typography>
                </Stack>
              ))}
              <Divider />
              <Stack direction="row" justifyContent="space-between">
                <Typography variant="h5">Total</Typography>
                <Typography variant="h5">{money(total)}</Typography>
              </Stack>
              <Stack direction="row" justifyContent="space-between">
                <Typography variant="body2" color="text.secondary">Received</Typography>
                <Typography variant="body2">{money(paid)}</Typography>
              </Stack>
              <Stack direction="row" justifyContent="space-between">
                <Typography variant="body2" fontWeight={700} color={balance > 0 ? 'warning.dark' : 'success.main'}>
                  {balance > 0 ? 'Balance due' : 'Settled'}
                </Typography>
                <Typography variant="body2" fontWeight={700} color={balance > 0 ? 'warning.dark' : 'success.main'}>
                  {money(balance)}
                </Typography>
              </Stack>
            </Stack>

            {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}

            <Stack spacing={1} sx={{ mt: 2.5 }}>
              <Button
                type="submit" variant="contained" size="large" disabled={saving}
                startIcon={saving ? <CircularProgress size={16} color="inherit" /> : null}
              >
                {saving ? 'Saving…' : mode === 'create' ? 'Save order' : 'Save changes'}
              </Button>
              <Button
                component={Link} color="inherit"
                href={mode === 'edit' && orderId ? `/admin/orders/${orderId}` : '/admin/orders'}
                sx={{ color: 'text.secondary' }}
              >
                Cancel
              </Button>
            </Stack>
          </MainCard>
        </Stack>
      </Box>
    </form>
  );
}
