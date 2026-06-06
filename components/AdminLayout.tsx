'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';
import {
  Box, Drawer, AppBar, Toolbar, List, ListItemButton, ListItemIcon,
  ListItemText, Typography, IconButton, Tooltip, InputBase, Avatar,
  Menu, MenuItem, Divider, useMediaQuery, alpha,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import MenuIcon from '@mui/icons-material/Menu';
import SearchIcon from '@mui/icons-material/Search';
import SpaceDashboardOutlinedIcon from '@mui/icons-material/SpaceDashboardOutlined';
import ReceiptLongOutlinedIcon from '@mui/icons-material/ReceiptLongOutlined';
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined';
import OpenInNewRoundedIcon from '@mui/icons-material/OpenInNewRounded';
import LogoutIcon from '@mui/icons-material/Logout';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import { BRAND } from '@/components/admin/theme';

export const DRAWER_WIDTH = 264;
export const MINI_WIDTH = 78;

const NAV_GROUPS = [
  {
    group: 'Overview',
    items: [{ title: 'Dashboard', url: '/admin/dashboard', icon: SpaceDashboardOutlinedIcon }],
  },
  {
    group: 'Manage',
    items: [
      { title: 'Orders', url: '/admin/orders', icon: ReceiptLongOutlinedIcon },
      { title: 'Products', url: '/admin/products', icon: Inventory2OutlinedIcon },
    ],
  },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('lg'));
  const [open, setOpen] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [account, setAccount] = useState<null | HTMLElement>(null);
  const [search, setSearch] = useState('');
  const [loggingOut, setLoggingOut] = useState(false);

  const expanded = open || isMobile;
  const drawerWidth = isMobile ? DRAWER_WIDTH : open ? DRAWER_WIDTH : MINI_WIDTH;

  const toggle = () => (isMobile ? setMobileOpen(p => !p) : setOpen(p => !p));
  const isActive = (url: string) =>
    pathname === url || (url !== '/admin/dashboard' && pathname.startsWith(url));

  const go = (url: string) => { router.push(url); if (isMobile) setMobileOpen(false); };

  const handleLogout = async () => {
    setLoggingOut(true);
    await fetch('/api/admin/logout', { method: 'POST' });
    router.push('/admin/login');
  };

  const submitSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const q = search.trim();
    go(q ? `/admin/orders?search=${encodeURIComponent(q)}` : '/admin/orders');
  };

  const drawerContent = (
    <Box sx={{ bgcolor: BRAND, height: '100%', color: '#fff', display: 'flex', flexDirection: 'column' }}>
      <Toolbar sx={{ px: expanded ? 2.5 : 0, justifyContent: expanded ? 'flex-start' : 'center', minHeight: 64 }}>
        {expanded ? (
          <Box component={Link} href="/admin/dashboard" sx={{ textDecoration: 'none' }}>
            <Typography sx={{ fontWeight: 800, fontSize: 18, letterSpacing: '0.16em', color: '#fff', lineHeight: 1 }}>PONKALI</Typography>
            <Typography sx={{ fontSize: 10, letterSpacing: '0.22em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.55)', mt: 0.5 }}>Admin Console</Typography>
          </Box>
        ) : (
          <Avatar variant="rounded" sx={{ bgcolor: '#fff', color: BRAND, width: 36, height: 36, fontWeight: 800 }}>P</Avatar>
        )}
      </Toolbar>

      <Box sx={{ overflowY: 'auto', overflowX: 'hidden', flexGrow: 1, pb: 2 }}>
        {NAV_GROUPS.map(grp => (
          <Box key={grp.group} sx={{ mt: 1 }}>
            {expanded && (
              <Typography variant="overline" sx={{ px: 2.5, color: 'rgba(255,255,255,0.55)', fontSize: '0.6875rem', letterSpacing: '0.08em' }}>
                {grp.group}
              </Typography>
            )}
            <List disablePadding sx={{ mt: 0.5 }}>
              {grp.items.map(item => {
                const active = isActive(item.url);
                const Icon = item.icon;
                const button = (
                  <ListItemButton
                    key={item.url}
                    selected={active}
                    onClick={() => go(item.url)}
                    sx={{
                      minHeight: 44, my: 0.25, mx: expanded ? 1 : 0.75,
                      px: expanded ? 1.5 : 0,
                      justifyContent: expanded ? 'flex-start' : 'center',
                      borderRadius: 2, color: 'rgba(255,255,255,0.78)',
                      '& .MuiListItemIcon-root': { color: 'inherit' },
                      '&:hover': { bgcolor: 'rgba(255,255,255,0.12)', color: '#fff' },
                      '&.Mui-selected': { bgcolor: 'rgba(255,255,255,0.18)', color: '#fff', '&:hover': { bgcolor: 'rgba(255,255,255,0.22)' } },
                    }}
                  >
                    <ListItemIcon sx={{ minWidth: expanded ? 34 : 'auto', justifyContent: 'center' }}>
                      <Icon fontSize="small" />
                    </ListItemIcon>
                    {expanded && <ListItemText primary={item.title} primaryTypographyProps={{ fontSize: '0.875rem', fontWeight: active ? 700 : 500 }} />}
                  </ListItemButton>
                );
                return expanded ? button : (
                  <Tooltip key={item.url} title={item.title} placement="right">{button}</Tooltip>
                );
              })}
            </List>
          </Box>
        ))}
      </Box>

      {expanded && (
        <Box sx={{ p: 2, borderTop: '1px solid rgba(255,255,255,0.12)' }}>
          <ListItemButton component={Link} href="/" target="_blank" sx={{ borderRadius: 2, color: 'rgba(255,255,255,0.78)', mb: 0.5, '&:hover': { bgcolor: 'rgba(255,255,255,0.12)', color: '#fff' } }}>
            <ListItemIcon sx={{ minWidth: 34, color: 'inherit' }}><OpenInNewRoundedIcon fontSize="small" /></ListItemIcon>
            <ListItemText primary="View Store" primaryTypographyProps={{ fontSize: '0.875rem', fontWeight: 500 }} />
          </ListItemButton>
          <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.45)', px: 1 }}>Ponkali Console v1.0</Typography>
        </Box>
      )}
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', bgcolor: 'background.default', minHeight: '100vh' }}>
      {/* Top AppBar */}
      <AppBar position="fixed" elevation={0} sx={{ bgcolor: BRAND, color: '#fff', zIndex: t => t.zIndex.drawer + 1, boxShadow: '0 1px 0 rgba(0,0,0,0.06)' }}>
        <Toolbar sx={{ minHeight: 64, px: { xs: 1.5, sm: 2.5 }, gap: 1 }}>
          <IconButton color="inherit" edge="start" onClick={toggle} sx={{ mr: 0.5 }}>
            <MenuIcon />
          </IconButton>
          <Box component={Link} href="/admin/dashboard" sx={{ display: { xs: 'none', sm: 'flex' }, alignItems: 'center', textDecoration: 'none' }}>
            <Typography sx={{ fontWeight: 800, fontSize: 17, letterSpacing: '0.16em', color: '#fff' }}>PONKALI</Typography>
            <Typography sx={{ ml: 1, fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.6)' }}>Admin</Typography>
          </Box>

          <Box sx={{ flexGrow: 1 }} />

          {/* Search */}
          <Box
            component="form"
            onSubmit={submitSearch}
            sx={{
              display: { xs: 'none', sm: 'flex' }, alignItems: 'center',
              bgcolor: alpha('#fff', 0.16), borderRadius: 2, px: 1.5, py: 0.5,
              width: { sm: 220, md: 300 },
              '&:hover': { bgcolor: alpha('#fff', 0.22) },
              '&:focus-within': { bgcolor: alpha('#fff', 0.26) },
            }}
          >
            <SearchIcon sx={{ fontSize: 20, mr: 1, opacity: 0.9 }} />
            <InputBase
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search orders, customers…"
              sx={{ color: '#fff', fontSize: '0.875rem', flex: 1, '& input::placeholder': { color: '#fff', opacity: 0.8 } }}
              inputProps={{ 'aria-label': 'search' }}
            />
          </Box>

          {/* Account */}
          <Box
            onClick={e => setAccount(e.currentTarget)}
            sx={{ display: 'flex', alignItems: 'center', gap: 1, ml: 0.5, cursor: 'pointer', py: 0.5, px: 0.5, borderRadius: 2, '&:hover': { bgcolor: alpha('#fff', 0.14) } }}
          >
            <Avatar sx={{ width: 34, height: 34, bgcolor: '#fff', color: BRAND, fontWeight: 700 }}>AD</Avatar>
            <Box sx={{ display: { xs: 'none', md: 'block' }, lineHeight: 1.1 }}>
              <Typography variant="subtitle2" sx={{ color: '#fff', fontWeight: 600 }}>Administrator</Typography>
              <Typography variant="caption" sx={{ color: alpha('#fff', 0.8) }}>Ponkali Masalas</Typography>
            </Box>
          </Box>

          <Menu
            anchorEl={account}
            open={Boolean(account)}
            onClose={() => setAccount(null)}
            transformOrigin={{ horizontal: 'right', vertical: 'top' }}
            anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
            PaperProps={{ sx: { mt: 1, minWidth: 200 } }}
          >
            <MenuItem component={Link} href="/admin/dashboard" onClick={() => setAccount(null)}>
              <ListItemIcon><PersonOutlineIcon fontSize="small" /></ListItemIcon>Dashboard
            </MenuItem>
            <MenuItem component={Link} href="/" target="_blank" onClick={() => setAccount(null)}>
              <ListItemIcon><OpenInNewRoundedIcon fontSize="small" /></ListItemIcon>View Store
            </MenuItem>
            <Divider />
            <MenuItem onClick={() => { setAccount(null); handleLogout(); }} disabled={loggingOut} sx={{ color: 'error.main' }}>
              <ListItemIcon><LogoutIcon fontSize="small" color="error" /></ListItemIcon>
              {loggingOut ? 'Signing out…' : 'Logout'}
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>

      {/* Sidebar */}
      {isMobile ? (
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={() => setMobileOpen(false)}
          ModalProps={{ keepMounted: true }}
          sx={{ '& .MuiDrawer-paper': { width: DRAWER_WIDTH, border: 'none' } }}
        >
          {drawerContent}
        </Drawer>
      ) : (
        <Drawer
          variant="permanent"
          open={open}
          sx={{
            width: drawerWidth, flexShrink: 0, whiteSpace: 'nowrap',
            '& .MuiDrawer-paper': {
              width: drawerWidth, border: 'none', overflowX: 'hidden',
              transition: t => t.transitions.create('width', { duration: t.transitions.duration.standard }),
            },
          }}
        >
          {drawerContent}
        </Drawer>
      )}

      {/* Main content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1, minWidth: 0,
          width: { lg: `calc(100% - ${drawerWidth}px)` },
          minHeight: '100vh',
          transition: theme.transitions.create('width', { duration: theme.transitions.duration.standard }),
        }}
      >
        <Toolbar sx={{ minHeight: 64 }} />
        <Box sx={{ p: { xs: 2, sm: 3 }, maxWidth: 1400, mx: 'auto' }}>
          {children}
        </Box>
      </Box>
    </Box>
  );
}
