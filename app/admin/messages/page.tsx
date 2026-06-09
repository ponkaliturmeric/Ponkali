'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  Box, Typography, Button, Stack, Chip, Pagination, CircularProgress, Avatar, Divider,
} from '@mui/material';
import MarkEmailReadOutlinedIcon from '@mui/icons-material/MarkEmailReadOutlined';
import ReplyOutlinedIcon from '@mui/icons-material/ReplyOutlined';
import DoneAllRoundedIcon from '@mui/icons-material/DoneAllRounded';
import MailOutlineRoundedIcon from '@mui/icons-material/MailOutlineRounded';
import AdminLayout from '@/components/AdminLayout';
import PageHeader from '@/components/admin/PageHeader';
import MainCard from '@/components/admin/MainCard';
import { BRAND, GOLD } from '@/components/admin/theme';

interface Message {
  id: number;
  name: string;
  email: string | null;
  message: string;
  created_at: string;
  is_read: boolean;
}

const initials = (name: string) =>
  name.trim().split(/\s+/).slice(0, 2).map(w => w[0]?.toUpperCase() ?? '').join('') || '?';

export default function AdminMessagesPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [total, setTotal] = useState(0);
  const [unread, setUnread] = useState(0);
  const [page, setPage] = useState(1);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const fetchMessages = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page) });
      if (filter === 'unread') params.set('filter', 'unread');
      const res = await fetch(`/api/admin/messages?${params}`);
      if (res.status === 401) { router.push('/admin/login'); return; }
      const data = await res.json().catch(() => ({}));
      setMessages(data.messages || []);
      setTotal(data.total || 0);
      setUnread(data.unread || 0);
    } catch {
      setMessages([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [page, filter, router]);

  useEffect(() => { fetchMessages(); }, [fetchMessages]);

  const setRead = async (id: number, is_read: boolean) => {
    setMessages(prev => prev.map(m => m.id === id ? { ...m, is_read } : m));
    setUnread(u => Math.max(0, u + (is_read ? -1 : 1)));
    await fetch('/api/admin/messages', {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, is_read }),
    });
    if (filter === 'unread') fetchMessages();
  };

  const markAllRead = async () => {
    setUnread(0);
    setMessages(prev => prev.map(m => ({ ...m, is_read: true })));
    await fetch('/api/admin/messages', {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ markAllRead: true }),
    });
    fetchMessages();
  };

  const totalPages = Math.ceil(total / 20);

  return (
    <AdminLayout>
      <PageHeader
        title="Messages"
        subtitle={unread > 0 ? `${unread} unread message${unread === 1 ? '' : 's'}` : 'Contact form submissions'}
        breadcrumbs={[{ label: 'Messages' }]}
        action={unread > 0 ? (
          <Button variant="outlined" color="inherit" startIcon={<DoneAllRoundedIcon />} onClick={markAllRead} sx={{ color: 'text.secondary' }}>
            Mark all read
          </Button>
        ) : undefined}
      />

      <Stack direction="row" spacing={1} sx={{ mb: 2.5 }}>
        {([['all', 'All'], ['unread', `Unread${unread > 0 ? ` (${unread})` : ''}`]] as const).map(([val, label]) => (
          <Chip
            key={val} label={label}
            onClick={() => { setFilter(val); setPage(1); }}
            color={filter === val ? 'primary' : 'default'}
            variant={filter === val ? 'filled' : 'outlined'}
          />
        ))}
      </Stack>

      {loading ? (
        <Stack alignItems="center" sx={{ py: 8 }}><CircularProgress /></Stack>
      ) : messages.length === 0 ? (
        <MainCard>
          <Stack alignItems="center" spacing={1.5} sx={{ py: 6, color: 'text.disabled' }}>
            <MailOutlineRoundedIcon sx={{ fontSize: 40 }} />
            <Typography color="text.secondary">{filter === 'unread' ? 'No unread messages.' : 'No messages yet.'}</Typography>
          </Stack>
        </MainCard>
      ) : (
        <Stack spacing={2}>
          {messages.map(m => (
            <MainCard key={m.id} sx={{ borderColor: m.is_read ? 'divider' : GOLD, borderWidth: m.is_read ? 1 : 1.5 }} contentSx={{ p: 2.5 }}>
              <Stack direction="row" spacing={2}>
                <Avatar sx={{ width: 42, height: 42, fontSize: 14, fontWeight: 700, background: `linear-gradient(135deg, ${GOLD}, ${BRAND})` }}>
                  {initials(m.name)}
                </Avatar>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Stack direction="row" alignItems="center" spacing={1} flexWrap="wrap" useFlexGap>
                    <Typography variant="body1" fontWeight={700}>{m.name || 'Anonymous'}</Typography>
                    {!m.is_read && <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: 'secondary.main' }} />}
                    {m.email && <Typography variant="caption" color="text.disabled">{m.email}</Typography>}
                    <Box sx={{ flexGrow: 1 }} />
                    <Typography variant="caption" color="text.disabled">{new Date(m.created_at).toLocaleString('en-IN')}</Typography>
                  </Stack>
                  <Typography variant="body1" color="text.secondary" sx={{ mt: 1, whiteSpace: 'pre-wrap' }}>{m.message}</Typography>
                  <Divider sx={{ my: 1.5 }} />
                  <Stack direction="row" spacing={1}>
                    {m.email && (
                      <Button size="small" variant="outlined" color="inherit" startIcon={<ReplyOutlinedIcon sx={{ fontSize: 16 }} />}
                        href={`mailto:${m.email}?subject=Re: Your message to Ponkali Masalas`} sx={{ color: 'text.secondary' }}>
                        Reply
                      </Button>
                    )}
                    <Button size="small" startIcon={<MarkEmailReadOutlinedIcon sx={{ fontSize: 16 }} />} onClick={() => setRead(m.id, !m.is_read)}>
                      {m.is_read ? 'Mark unread' : 'Mark read'}
                    </Button>
                  </Stack>
                </Box>
              </Stack>
            </MainCard>
          ))}
        </Stack>
      )}

      {totalPages > 1 && (
        <Stack direction="row" justifyContent="center" sx={{ mt: 3 }}>
          <Pagination count={totalPages} page={page} onChange={(_, p) => setPage(p)} shape="rounded" color="primary" />
        </Stack>
      )}
    </AdminLayout>
  );
}
