'use client';

import { Box, Typography, Breadcrumbs, Stack } from '@mui/material';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import Link from 'next/link';

interface Crumb { label: string; href?: string }

export default function PageHeader({
  title, subtitle, breadcrumbs = [], action,
}: {
  title: string;
  subtitle?: string;
  breadcrumbs?: Crumb[];
  action?: React.ReactNode;
}) {
  return (
    <Stack
      direction={{ xs: 'column', sm: 'row' }}
      justifyContent="space-between"
      alignItems={{ xs: 'flex-start', sm: 'center' }}
      spacing={1.5}
      sx={{ mb: 3 }}
    >
      <Box>
        <Typography variant="h3" sx={{ fontWeight: 700, color: 'grey.800' }}>{title}</Typography>
        {subtitle && <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>{subtitle}</Typography>}
        {breadcrumbs.length > 0 && (
          <Breadcrumbs separator={<NavigateNextIcon fontSize="small" />} sx={{ mt: 0.5 }}>
            <Typography component={Link} href="/admin/dashboard" variant="caption" color="text.secondary" sx={{ textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}>
              Home
            </Typography>
            {breadcrumbs.map((b, i) =>
              b.href && i < breadcrumbs.length - 1 ? (
                <Typography key={i} component={Link} href={b.href} variant="caption" color="text.secondary" sx={{ textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}>
                  {b.label}
                </Typography>
              ) : (
                <Typography key={i} variant="caption" color="primary.main" sx={{ fontWeight: 600 }}>{b.label}</Typography>
              )
            )}
          </Breadcrumbs>
        )}
      </Box>
      {action && <Box>{action}</Box>}
    </Stack>
  );
}
