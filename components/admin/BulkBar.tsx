'use client';

import { Box, Button, Stack, Typography } from '@mui/material';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';

/**
 * The bar that appears once rows are ticked.
 *
 * Deliberately plain and loud rather than a floating overlay: it sits directly
 * above the table it acts on, so there is never a question of WHICH rows a
 * "Delete selected" applies to.
 *
 * It only renders when something is selected, so the page is unchanged for the
 * ordinary case of just reading the table.
 */
export default function BulkBar({
  count,
  noun,
  onClear,
  onDelete,
  busy = false,
}: {
  count: number;
  /** Singular noun — "order", "customer", "enquiry". Pluralised here. */
  noun: string;
  onClear: () => void;
  onDelete: () => void;
  busy?: boolean;
}) {
  if (count === 0) return null;

  return (
    <Box
      sx={{
        mb: 2,
        px: 2.5,
        py: 1.5,
        borderRadius: 2,
        bgcolor: 'primary.main',
        color: '#fff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 2,
        flexWrap: 'wrap',
      }}
      role="status"
      aria-live="polite"
    >
      <Typography sx={{ fontWeight: 700, fontSize: '0.9375rem' }}>
        {count} {noun}
        {count === 1 ? '' : 's'} selected
      </Typography>
      <Stack direction="row" spacing={1}>
        <Button
          size="small"
          onClick={onClear}
          startIcon={<CloseRoundedIcon sx={{ fontSize: 16 }} />}
          sx={{ color: 'rgba(255,255,255,0.85)', '&:hover': { bgcolor: 'rgba(255,255,255,0.14)', color: '#fff' } }}
        >
          Clear
        </Button>
        <Button
          size="small"
          variant="contained"
          color="error"
          onClick={onDelete}
          disabled={busy}
          startIcon={<DeleteOutlineRoundedIcon sx={{ fontSize: 16 }} />}
        >
          {busy ? 'Deleting…' : 'Delete selected'}
        </Button>
      </Stack>
    </Box>
  );
}
