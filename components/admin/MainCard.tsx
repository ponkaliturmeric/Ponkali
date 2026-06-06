'use client';

import { Card, CardHeader, CardContent, Divider, Box } from '@mui/material';
import type { SxProps, Theme } from '@mui/material/styles';

export default function MainCard({
  title, action, children, divider = true, contentSx, sx, noPadding = false,
}: {
  title?: React.ReactNode;
  action?: React.ReactNode;
  children: React.ReactNode;
  divider?: boolean;
  contentSx?: SxProps<Theme>;
  sx?: SxProps<Theme>;
  noPadding?: boolean;
}) {
  return (
    <Card sx={sx}>
      {title && (
        <>
          <CardHeader title={title} action={action} />
          {divider && <Divider />}
        </>
      )}
      {noPadding ? <Box>{children}</Box> : <CardContent sx={contentSx}>{children}</CardContent>}
    </Card>
  );
}
