'use client';

import { Chip } from '@mui/material';
import type { SxProps, Theme } from '@mui/material/styles';

/** Soft-filled status chips used across orders + products. */
const MAP: Record<string, { tone: keyof typeof TONE; label: string }> = {
  // order statuses
  pending: { tone: 'warning', label: 'Pending' },
  confirmed: { tone: 'info', label: 'Confirmed' },
  packed: { tone: 'primary', label: 'Packed' },
  shipped: { tone: 'info', label: 'Shipped' },
  delivered: { tone: 'success', label: 'Delivered' },
  cancelled: { tone: 'error', label: 'Cancelled' },
  // payment / stock
  cod: { tone: 'warning', label: 'COD' },
  upi: { tone: 'success', label: 'UPI' },
  razorpay: { tone: 'success', label: 'Online' },
  'in-stock': { tone: 'success', label: 'In Stock' },
  'out-of-stock': { tone: 'error', label: 'Out of Stock' },
};

const TONE = {
  success: { bg: '#E3F6EC', fg: '#00773B' },
  warning: { bg: '#FFF7E0', fg: '#8A6500' },
  info: { bg: '#E0F7F8', fg: '#00727B' },
  error: { bg: '#FEEAE9', fg: '#A82216' },
  primary: { bg: '#E9F0E4', fg: '#1C3311' },
  default: { bg: '#F0F0F0', fg: '#595959' },
};

export default function StatusChip({
  status, size = 'small', label, sx,
}: {
  status: string;
  size?: 'small' | 'medium';
  label?: string;
  sx?: SxProps<Theme>;
}) {
  const key = String(status || '').toLowerCase().replace(/\s+/g, '-');
  const cfg = MAP[key] || { tone: 'default' as const, label: status };
  const tone = TONE[cfg.tone] || TONE.default;
  return <Chip size={size} label={label || cfg.label} sx={{ bgcolor: tone.bg, color: tone.fg, border: 'none', ...sx }} />;
}
