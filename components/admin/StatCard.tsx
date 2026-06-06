'use client';

import { Card, CardContent, Box, Typography, Avatar, Stack } from '@mui/material';
import ArrowUpwardRoundedIcon from '@mui/icons-material/ArrowUpwardRounded';
import ArrowDownwardRoundedIcon from '@mui/icons-material/ArrowDownwardRounded';

type ColorKey = 'primary' | 'secondary' | 'success' | 'warning' | 'info' | 'error';

export default function StatCard({
  title, value, icon: Icon, color = 'primary', trend, caption,
}: {
  title: string;
  value: string | number;
  icon?: React.ElementType;
  color?: ColorKey;
  trend?: number;
  caption?: string;
}) {
  const trendUp = typeof trend === 'number' ? trend >= 0 : null;

  return (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
          <Box>
            <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>{title}</Typography>
            <Typography variant="h3" sx={{ mt: 0.75, fontWeight: 700, color: 'grey.800' }}>{value}</Typography>
          </Box>
          {Icon && (
            <Avatar variant="rounded" sx={{ bgcolor: `${color}.lighter`, color: `${color}.main`, width: 44, height: 44 }}>
              <Icon fontSize="small" />
            </Avatar>
          )}
        </Stack>
        {(trendUp !== null || caption) && (
          <Stack direction="row" spacing={0.5} alignItems="center" sx={{ mt: 1.5 }}>
            {trendUp !== null && (
              <>
                {trendUp
                  ? <ArrowUpwardRoundedIcon sx={{ fontSize: 16, color: 'success.main' }} />
                  : <ArrowDownwardRoundedIcon sx={{ fontSize: 16, color: 'error.main' }} />}
                <Typography variant="caption" sx={{ fontWeight: 600, color: trendUp ? 'success.main' : 'error.main' }}>
                  {Math.abs(trend as number)}%
                </Typography>
              </>
            )}
            {caption && <Typography variant="caption" color="text.secondary">{caption}</Typography>}
          </Stack>
        )}
      </CardContent>
    </Card>
  );
}
