'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Box, Typography, Button, Stack, TextField, Chip, Table, TableHead, TableBody,
  TableRow, TableCell, TableContainer, Select, MenuItem, InputAdornment,
  Pagination, CircularProgress, Dialog, DialogTitle, DialogContent, DialogActions,
  IconButton, Tooltip, Alert, Divider,
} from '@mui/material';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import SearchIcon from '@mui/icons-material/Search';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined';
import AdminLayout from '@/components/AdminLayout';
import PageHeader from '@/components/admin/PageHeader';
import MainCard from '@/components/admin/MainCard';
import StatusChip from '@/components/admin/StatusChip';
import { INDIAN_STATES } from '@/lib/shipping';
import { ENQUIRY_SOURCES, ENQUIRY_STATUSES, labelFor } from '@/lib/crm';
import type { BulkEnquiry } from '@/lib/types';

/**
 * Bulk / wholesale enquiries — the "someone asked for a quote on 50 kg" pipeline.
 *
 * Separate from Orders on purpose: an enquiry has no items, no total and no
 * fulfilment, just a requirement and a stage. Everything is entered by hand
 * from a WhatsApp conversation, so the whole page is built around fast manual
 * entry: one dialog for add and edit, and an inline status dropdown in the
 * table so moving a deal along is a single click.
 */

interface Summary {
  total: number; open: number; won: number; lost: number;
  pipeline_value: number; won_value: number; due: number;
}

const EMPTY_SUMMARY: Summary = {
  total: 0, open: 0, won: 0, lost: 0, pipeline_value: 0, won_value: 0, due: 0,
};

type FormState = Record<string, string>;

const EMPTY_FORM: FormState = {
  customer_name: '', phone: '', email: '', company: '', city: '', state: '',
  source: 'whatsapp', product: '', quantity: '', quantity_kg: '',
  target_price: '', quoted_price: '', requirement: '', status: 'New',
  follow_up_on: '', notes: '',
};

const STATUS_FILTERS = ['All', 'open', ...ENQUIRY_STATUSES] as const;

const SORT_OPTIONS = [
  { value: 'recent', label: 'Newest first' },
  { value: 'followup', label: 'Follow-up date' },
  { value: 'value', label: 'Highest value' },
  { value: 'name', label: 'Name A–Z' },
  { value: 'oldest', label: 'Oldest first' },
];

const money = (v: number | null | undefined) =>
  v == null ? '—' : `₹${Number(v).toLocaleString('en-IN')}`;

const asDate = (v: string | null | undefined) => (v ? String(v).slice(0, 10) : '');

const prettyDate = (v: string | null | undefined) => {
  if (!v) return '—';
  const d = new Date(v);
  return Number.isNaN(d.getTime())
    ? '—'
    : d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: '2-digit' });
};

/** A follow-up that is today or earlier, on a deal still in play. */
const isDue = (e: BulkEnquiry) =>
  !!e.follow_up_on &&
  asDate(e.follow_up_on) <= new Date().toISOString().slice(0, 10) &&
  e.status !== 'Won' && e.status !== 'Lost';

const waLink = (phone: string) => {
  const d = String(phone || '').replace(/\D/g, '');
  return d.length === 10 ? `https://wa.me/91${d}` : d ? `https://wa.me/${d}` : null;
};

export default function AdminEnquiriesPage() {
  const router = useRouter();
  const [enquiries, setEnquiries] = useState<BulkEnquiry[]>([]);
  const [summary, setSummary] = useState<Summary>(EMPTY_SUMMARY);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState<string>('All');
  const [sort, setSort] = useState('recent');
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const firstRun = useRef(true);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [confirmDelete, setConfirmDelete] = useState<BulkEnquiry | null>(null);

  // Debounce the search box, same as the orders list.
  useEffect(() => {
    if (firstRun.current) { firstRun.current = false; return; }
    const t = setTimeout(() => { setSearch(searchInput.trim()); setPage(1); }, 350);
    return () => clearTimeout(t);
  }, [searchInput]);

  const fetchEnquiries = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), sort });
      if (status !== 'All') params.set('status', status);
      if (search) params.set('search', search);
      const res = await fetch(`/api/admin/enquiries?${params}`);
      if (res.status === 401) { router.push('/admin/login'); return; }
      const data = await res.json().catch(() => ({}));
      setEnquiries(data.enquiries || []);
      setTotal(data.total || 0);
      setSummary(data.summary || EMPTY_SUMMARY);
    } catch {
      setEnquiries([]);
      setTotal(0);
      setSummary(EMPTY_SUMMARY);
    } finally {
      setLoading(false);
    }
  }, [page, status, search, sort, router]);

  useEffect(() => { fetchEnquiries(); }, [fetchEnquiries]);

  const openNew = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setError('');
    setDialogOpen(true);
  };

  const openEdit = (e: BulkEnquiry) => {
    setEditingId(e.id);
    setForm({
      customer_name: e.customer_name ?? '',
      phone: e.phone ?? '',
      email: e.email ?? '',
      company: e.company ?? '',
      city: e.city ?? '',
      state: e.state ?? '',
      source: e.source ?? 'whatsapp',
      product: e.product ?? '',
      quantity: e.quantity ?? '',
      quantity_kg: e.quantity_kg == null ? '' : String(e.quantity_kg),
      target_price: e.target_price == null ? '' : String(e.target_price),
      quoted_price: e.quoted_price == null ? '' : String(e.quoted_price),
      requirement: e.requirement ?? '',
      status: e.status ?? 'New',
      follow_up_on: asDate(e.follow_up_on),
      notes: e.notes ?? '',
    });
    setError('');
    setDialogOpen(true);
  };

  const set = (key: string, value: string) => setForm((prev) => ({ ...prev, [key]: value }));

  const save = async () => {
    setSaving(true);
    setError('');
    try {
      const res = await fetch(
        editingId ? `/api/admin/enquiries/${editingId}` : '/api/admin/enquiries',
        {
          method: editingId ? 'PATCH' : 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form),
        },
      );
      if (res.status === 401) { router.push('/admin/login'); return; }
      const data = await res.json().catch(() => ({}));
      if (!res.ok) { setError(data.error || 'Could not save.'); return; }
      setDialogOpen(false);
      fetchEnquiries();
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  /** Inline stage change from the table — sends only the status. */
  const changeStatus = async (id: number, next: string) => {
    setEnquiries((prev) => prev.map((e) => (e.id === id ? { ...e, status: next } : e)));
    await fetch(`/api/admin/enquiries/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: next }),
    });
    fetchEnquiries();
  };

  const doDelete = async () => {
    if (!confirmDelete) return;
    await fetch(`/api/admin/enquiries/${confirmDelete.id}`, { method: 'DELETE' });
    setConfirmDelete(null);
    fetchEnquiries();
  };

  const totalPages = Math.ceil(total / 20);
  const hasFilters = status !== 'All' || search !== '';

  const field = (key: string, label: string, extra: Record<string, unknown> = {}) => (
    <TextField
      size="small" label={label} value={form[key]}
      onChange={(e) => set(key, e.target.value)}
      {...extra}
    />
  );

  return (
    <AdminLayout>
      <PageHeader
        title="Bulk Enquiries"
        subtitle="Wholesale and bulk quote requests — add and update them by hand"
        breadcrumbs={[{ label: 'Bulk Enquiries' }]}
        action={
          <Button variant="contained" startIcon={<AddRoundedIcon />} onClick={openNew}>
            Add enquiry
          </Button>
        }
      />

      {/* KPI strip */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr 1fr', md: 'repeat(4, 1fr)' }, gap: 2, mb: 2.5 }}>
        {[
          { label: 'Open enquiries', value: summary.open.toLocaleString('en-IN'), caption: `${summary.total} in total` },
          { label: 'Pipeline value', value: money(summary.pipeline_value), caption: 'Quoted, not yet won' },
          { label: 'Won', value: summary.won.toLocaleString('en-IN'), caption: `${money(summary.won_value)} value` },
          { label: 'Follow-ups due', value: summary.due.toLocaleString('en-IN'), caption: 'Today or overdue' },
        ].map((s) => (
          <MainCard key={s.label} contentSx={{ py: 1.75 }}>
            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>{s.label}</Typography>
            <Typography variant="h4" sx={{ fontWeight: 700, mt: 0.25 }}>{s.value}</Typography>
            <Typography variant="caption" color="text.disabled">{s.caption}</Typography>
          </MainCard>
        ))}
      </Box>

      {/* Filters */}
      <Box sx={{ mb: 2.5 }}>
        <MainCard contentSx={{ py: 2.5 }}>
          <Stack spacing={2}>
            <TextField
              fullWidth placeholder="Search by name, company, phone, email or what they asked for…"
              value={searchInput} onChange={(e) => setSearchInput(e.target.value)}
              InputProps={{
                startAdornment: <InputAdornment position="start"><SearchIcon fontSize="small" color="action" /></InputAdornment>,
                endAdornment: searchInput ? (
                  <InputAdornment position="end">
                    <CloseRoundedIcon fontSize="small" sx={{ cursor: 'pointer', color: 'text.disabled' }} onClick={() => setSearchInput('')} />
                  </InputAdornment>
                ) : null,
              }}
            />
            <Stack direction={{ xs: 'column', lg: 'row' }} spacing={2} justifyContent="space-between" alignItems={{ lg: 'center' }}>
              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                {STATUS_FILTERS.map((s) => (
                  <Chip
                    key={s}
                    label={s === 'open' ? 'Open' : s}
                    onClick={() => { setStatus(s); setPage(1); }}
                    color={status === s ? 'primary' : 'default'}
                    variant={status === s ? 'filled' : 'outlined'}
                  />
                ))}
              </Stack>
              <Select size="small" value={sort} onChange={(e) => { setSort(e.target.value); setPage(1); }} sx={{ minWidth: 170, bgcolor: '#fff' }}>
                {SORT_OPTIONS.map((o) => <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>)}
              </Select>
            </Stack>
          </Stack>
        </MainCard>
      </Box>

      {/* Table */}
      <MainCard noPadding>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                {['Customer', 'Contact', 'Asked for', 'Quantity', 'Value', 'Follow-up', 'Stage', ''].map((h, i) => (
                  <TableCell key={i}>{h}</TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={8} align="center" sx={{ py: 6 }}><CircularProgress size={26} /></TableCell></TableRow>
              ) : enquiries.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} align="center" sx={{ py: 7, color: 'text.disabled' }}>
                    <Stack alignItems="center" spacing={1.5}>
                      <Inventory2OutlinedIcon sx={{ fontSize: 38 }} />
                      <Typography color="text.secondary">
                        {hasFilters ? 'No enquiries match these filters.' : 'No bulk enquiries yet.'}
                      </Typography>
                      {!hasFilters && (
                        <Button size="small" startIcon={<AddRoundedIcon />} onClick={openNew}>Add the first one</Button>
                      )}
                    </Stack>
                  </TableCell>
                </TableRow>
              ) : enquiries.map((e) => {
                const wa = waLink(e.phone);
                return (
                  <TableRow key={e.id} hover>
                    <TableCell>
                      <Typography variant="body2" fontWeight={700}>{e.customer_name}</Typography>
                      {e.company && <Typography variant="caption" color="text.secondary">{e.company}</Typography>}
                      {(e.city || e.state) && (
                        <Typography variant="caption" color="text.disabled" display="block">
                          {[e.city, e.state].filter(Boolean).join(', ')}
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      <Stack direction="row" spacing={0.5} alignItems="center">
                        <Typography variant="body2" color="text.secondary">{e.phone || '—'}</Typography>
                        {wa && (
                          <Tooltip title="Open WhatsApp">
                            <IconButton size="small" href={wa} target="_blank" rel="noopener noreferrer" sx={{ color: '#25D366' }}>
                              <WhatsAppIcon sx={{ fontSize: 16 }} />
                            </IconButton>
                          </Tooltip>
                        )}
                      </Stack>
                      {e.email && <Typography variant="caption" color="text.disabled">{e.email}</Typography>}
                      <Typography variant="caption" color="text.disabled" display="block">
                        via {labelFor(ENQUIRY_SOURCES, e.source)}
                      </Typography>
                    </TableCell>
                    <TableCell sx={{ maxWidth: 240 }}>
                      <Typography variant="body2">{e.product || '—'}</Typography>
                      {e.requirement && (
                        <Tooltip title={e.requirement}>
                          <Typography variant="caption" color="text.disabled" sx={{ display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {e.requirement}
                          </Typography>
                        </Tooltip>
                      )}
                    </TableCell>
                    <TableCell sx={{ color: 'text.secondary' }}>
                      {e.quantity || (e.quantity_kg != null ? `${e.quantity_kg} kg` : '—')}
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight={700}>{money(e.quoted_price)}</Typography>
                      {e.target_price != null && (
                        <Typography variant="caption" color="text.disabled">asked {money(e.target_price)}</Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color={isDue(e) ? 'warning.dark' : 'text.secondary'} fontWeight={isDue(e) ? 700 : 400}>
                        {prettyDate(e.follow_up_on)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Select
                        value={e.status}
                        onChange={(ev) => changeStatus(e.id, ev.target.value)}
                        size="small" sx={{ minWidth: 140, '& .MuiSelect-select': { py: 0.75 } }}
                        renderValue={(v) => <StatusChip status={String(v)} />}
                      >
                        {ENQUIRY_STATUSES.map((s) => <MenuItem key={s} value={s}>{s}</MenuItem>)}
                      </Select>
                    </TableCell>
                    <TableCell align="right">
                      <Stack direction="row" spacing={0.5} justifyContent="flex-end">
                        <Tooltip title="Edit">
                          <IconButton size="small" onClick={() => openEdit(e)}>
                            <EditOutlinedIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete">
                          <IconButton size="small" onClick={() => setConfirmDelete(e)}>
                            <DeleteOutlineRoundedIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Stack>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>

        {totalPages > 1 && (
          <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ p: 2, borderTop: '1px solid', borderColor: 'divider' }}>
            <Typography variant="body1" color="text.secondary">Page {page} of {totalPages} · {total} enquiries</Typography>
            <Pagination count={totalPages} page={page} onChange={(_, p) => setPage(p)} shape="rounded" color="primary" />
          </Stack>
        )}
      </MainCard>

      {/* Add / edit dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>
          {editingId ? 'Edit enquiry' : 'New bulk enquiry'}
        </DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2.5} sx={{ pt: 1 }}>
            <Box>
              <Typography variant="caption" color="text.secondary" fontWeight={700}>WHO</Typography>
              <Box sx={{ display: 'grid', gridTemplateColumns: { sm: '1fr 1fr' }, gap: 2, mt: 1 }}>
                {field('customer_name', 'Customer name', { required: true, autoFocus: true })}
                {field('company', 'Company / shop')}
                {field('phone', 'Phone', { helperText: 'Mobile or landline' })}
                {field('email', 'Email', { type: 'email' })}
                {field('city', 'City')}
                <Box>
                  <Typography variant="caption" color="text.secondary" fontWeight={600}>State</Typography>
                  <Select fullWidth size="small" displayEmpty value={form.state} onChange={(e) => set('state', e.target.value)} sx={{ mt: 0.5 }}>
                    <MenuItem value=""><em>Not known</em></MenuItem>
                    {INDIAN_STATES.map((s) => <MenuItem key={s} value={s}>{s}</MenuItem>)}
                  </Select>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary" fontWeight={600}>Came in via</Typography>
                  <Select fullWidth size="small" value={form.source} onChange={(e) => set('source', e.target.value)} sx={{ mt: 0.5 }}>
                    {ENQUIRY_SOURCES.map((o) => <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>)}
                  </Select>
                </Box>
              </Box>
            </Box>

            <Divider />

            <Box>
              <Typography variant="caption" color="text.secondary" fontWeight={700}>WHAT THEY ASKED FOR</Typography>
              <Box sx={{ display: 'grid', gridTemplateColumns: { sm: '1fr 1fr' }, gap: 2, mt: 1 }}>
                {field('product', 'Product', { placeholder: 'Turmeric powder, unlabelled 1kg packs', sx: { gridColumn: { sm: '1 / -1' } } })}
                {field('quantity', 'Quantity (as they said it)', { placeholder: '50 kg / month' })}
                {field('quantity_kg', 'Quantity in kg', { placeholder: '50', inputProps: { inputMode: 'decimal' } })}
                {field('target_price', 'Their target price', {
                  InputProps: { startAdornment: <InputAdornment position="start">₹</InputAdornment> },
                  inputProps: { inputMode: 'decimal' },
                })}
                {field('quoted_price', 'Price we quoted', {
                  InputProps: { startAdornment: <InputAdornment position="start">₹</InputAdornment> },
                  inputProps: { inputMode: 'decimal' },
                })}
                {field('requirement', 'Full requirement', {
                  multiline: true, minRows: 3, sx: { gridColumn: { sm: '1 / -1' } },
                  placeholder: 'Everything they asked for — packing, labelling, invoice and delivery needs…',
                })}
              </Box>
            </Box>

            <Divider />

            <Box>
              <Typography variant="caption" color="text.secondary" fontWeight={700}>WHERE IT STANDS</Typography>
              <Box sx={{ display: 'grid', gridTemplateColumns: { sm: '1fr 1fr' }, gap: 2, mt: 1 }}>
                <Box>
                  <Typography variant="caption" color="text.secondary" fontWeight={600}>Stage</Typography>
                  <Select fullWidth size="small" value={form.status} onChange={(e) => set('status', e.target.value)} sx={{ mt: 0.5 }}>
                    {ENQUIRY_STATUSES.map((s) => <MenuItem key={s} value={s}>{s}</MenuItem>)}
                  </Select>
                </Box>
                {field('follow_up_on', 'Follow up on', { type: 'date', InputLabelProps: { shrink: true } })}
                {field('notes', 'Internal notes', {
                  multiline: true, minRows: 2, sx: { gridColumn: { sm: '1 / -1' } },
                  placeholder: 'Call after 6pm, wants GST invoice, negotiating…',
                })}
              </Box>
            </Box>

            {error && <Alert severity="error">{error}</Alert>}
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button color="inherit" onClick={() => setDialogOpen(false)} sx={{ color: 'text.secondary' }}>Cancel</Button>
          <Button variant="contained" onClick={save} disabled={saving}>
            {saving ? 'Saving…' : editingId ? 'Save changes' : 'Add enquiry'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete confirmation */}
      <Dialog open={!!confirmDelete} onClose={() => setConfirmDelete(null)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>Delete this enquiry?</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary">
            {confirmDelete?.customer_name}
            {confirmDelete?.company ? ` · ${confirmDelete.company}` : ''}
            {' '}will be removed permanently. This cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button color="inherit" onClick={() => setConfirmDelete(null)} sx={{ color: 'text.secondary' }}>Keep it</Button>
          <Button variant="contained" color="error" onClick={doDelete}>Delete</Button>
        </DialogActions>
      </Dialog>
    </AdminLayout>
  );
}
