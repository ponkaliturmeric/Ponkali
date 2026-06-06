'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Box, Grid, Card, Stack, Typography, TextField, InputAdornment,
  IconButton, Button, Alert,
} from '@mui/material';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import PersonOutlineRoundedIcon from '@mui/icons-material/PersonOutlineRounded';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import SpaOutlinedIcon from '@mui/icons-material/SpaOutlined';
import LocalShippingOutlinedIcon from '@mui/icons-material/LocalShippingOutlined';
import VerifiedOutlinedIcon from '@mui/icons-material/VerifiedOutlined';
import { BRAND } from '@/components/admin/theme';

export default function AdminLoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [show, setShow] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      if (res.ok) router.push('/admin/dashboard');
      else setError('Invalid username or password.');
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Grid container sx={{ minHeight: '100vh' }}>
      {/* Brand panel */}
      <Grid
        item md={6}
        sx={{
          display: { xs: 'none', md: 'flex' }, flexDirection: 'column', justifyContent: 'space-between',
          p: 6, color: '#fff', position: 'relative', overflow: 'hidden',
          background: `linear-gradient(150deg, ${BRAND} 0%, #142608 60%, #0D1A06 100%)`,
        }}
      >
        <Box sx={{ position: 'absolute', width: 420, height: 420, borderRadius: '50%', bgcolor: 'rgba(255,255,255,0.05)', top: -120, right: -120 }} />
        <Box sx={{ position: 'absolute', width: 280, height: 280, borderRadius: '50%', bgcolor: 'rgba(232,149,10,0.10)', bottom: -80, left: -60 }} />
        <Typography sx={{ fontWeight: 800, fontSize: 24, letterSpacing: '0.16em', position: 'relative' }}>PONKALI</Typography>
        <Box sx={{ position: 'relative' }}>
          <Typography variant="h2" sx={{ color: '#fff', fontWeight: 800, lineHeight: 1.2 }}>
            Pure Erode turmeric,<br /> farm to doorstep.
          </Typography>
          <Typography sx={{ color: 'rgba(255,255,255,0.85)', mt: 2, maxWidth: 420 }}>
            The control center for Ponkali Masalas — orders, products, pricing and revenue in one clean corporate console.
          </Typography>
          <Stack spacing={1.5} sx={{ mt: 4 }}>
            {[
              { icon: SpaOutlinedIcon, t: 'Naturally grown, GI-tagged turmeric' },
              { icon: LocalShippingOutlinedIcon, t: 'Live order & delivery tracking' },
              { icon: VerifiedOutlinedIcon, t: 'Revenue, exports & stock at a glance' },
            ].map(f => (
              <Stack key={f.t} direction="row" spacing={1.5} alignItems="center">
                <Box sx={{ width: 34, height: 34, borderRadius: 2, bgcolor: 'rgba(255,255,255,0.16)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <f.icon fontSize="small" />
                </Box>
                <Typography sx={{ color: 'rgba(255,255,255,0.92)' }}>{f.t}</Typography>
              </Stack>
            ))}
          </Stack>
        </Box>
        <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)' }}>© 2026 Ponkali Masalas</Typography>
      </Grid>

      {/* Form panel */}
      <Grid item xs={12} md={6} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', p: { xs: 3, sm: 6 } }}>
        <Card sx={{ width: '100%', maxWidth: 420, p: { xs: 3, sm: 4.5 } }}>
          <Box sx={{ display: { xs: 'block', md: 'none' }, mb: 2 }}>
            <Typography sx={{ fontWeight: 800, fontSize: 22, letterSpacing: '0.16em', color: BRAND }}>PONKALI</Typography>
          </Box>
          <Typography variant="h3" sx={{ fontWeight: 700 }}>Welcome back</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, mb: 3 }}>
            Sign in to your Ponkali admin console.
          </Typography>

          <Stack component="form" spacing={2.5} onSubmit={handleSubmit}>
            <Box>
              <Typography variant="subtitle2" sx={{ mb: 0.75 }}>Username</Typography>
              <TextField
                fullWidth required autoComplete="username" placeholder="ponkali_admin"
                value={username} onChange={e => setUsername(e.target.value)}
                InputProps={{ startAdornment: <InputAdornment position="start"><PersonOutlineRoundedIcon fontSize="small" color="action" /></InputAdornment> }}
              />
            </Box>
            <Box>
              <Typography variant="subtitle2" sx={{ mb: 0.75 }}>Password</Typography>
              <TextField
                fullWidth required autoComplete="current-password" placeholder="Enter your password"
                type={show ? 'text' : 'password'}
                value={password} onChange={e => setPassword(e.target.value)}
                InputProps={{
                  startAdornment: <InputAdornment position="start"><LockOutlinedIcon fontSize="small" color="action" /></InputAdornment>,
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={() => setShow(s => !s)} edge="end" size="small">
                        {show ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            </Box>

            {error && <Alert severity="error">{error}</Alert>}

            <Button fullWidth size="large" variant="contained" type="submit" disabled={loading}>
              {loading ? 'Signing in…' : 'Sign In'}
            </Button>
            <Typography variant="caption" color="text.secondary" sx={{ textAlign: 'center' }}>
              Session expires after 24 hours
            </Typography>
          </Stack>
        </Card>
      </Grid>
    </Grid>
  );
}
