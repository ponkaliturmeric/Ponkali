'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { Box, IconButton, Tooltip, Typography } from '@mui/material';
import ContentCopyRoundedIcon from '@mui/icons-material/ContentCopyRounded';
import CheckRoundedIcon from '@mui/icons-material/CheckRounded';

/**
 * A value you can copy with one click — order IDs, tracking numbers, phone
 * numbers. The point is the courier's website: an admin pasting a tracking
 * number into a courier form should never have to select it by hand and risk
 * dropping a character.
 *
 * navigator.clipboard needs a secure context, so it is missing over plain
 * http (a LAN IP, for instance). The hidden-textarea fallback keeps copying
 * working there, because "copy silently did nothing" is a horrible bug to
 * chase in an admin console.
 */

async function writeToClipboard(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    // Permission denied or insecure context — fall through to the legacy path.
  }
  try {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.setAttribute('readonly', '');
    // Keep it off-screen so the page doesn't scroll or flicker.
    ta.style.position = 'fixed';
    ta.style.top = '-1000px';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    const ok = document.execCommand('copy');
    document.body.removeChild(ta);
    return ok;
  } catch {
    return false;
  }
}

interface CopyTextProps {
  value: string;
  /** Rendered instead of the raw value (e.g. a shortened form). */
  display?: React.ReactNode;
  mono?: boolean;
  /** Visual weight of the text itself. */
  bold?: boolean;
  color?: string;
  /** What the tooltip calls this, e.g. "Copy tracking number". */
  label?: string;
  fontSize?: number | string;
}

export default function CopyText({
  value,
  display,
  mono = true,
  bold = true,
  color,
  label = 'Copy',
  fontSize,
}: CopyTextProps) {
  const [copied, setCopied] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Without this, the "Copied" reset fires on an unmounted row after the table
  // refetches and React warns about setting state on a dead component.
  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);

  const onCopy = useCallback(
    async (e: React.MouseEvent) => {
      // Rows are often clickable; copying should not also open the order.
      e.stopPropagation();
      e.preventDefault();
      const ok = await writeToClipboard(value);
      if (!ok) return;
      setCopied(true);
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => setCopied(false), 1600);
    },
    [value],
  );

  if (!value) return <Typography variant="body2" color="text.disabled">—</Typography>;

  return (
    <Box
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 0.25,
        // The button only appears on hover/focus so the table stays calm, but it
        // is always in the DOM and reachable by keyboard.
        '& .copy-btn': { opacity: 0, transition: 'opacity 120ms' },
        '&:hover .copy-btn, & .copy-btn:focus-visible': { opacity: 1 },
      }}
    >
      <Typography
        component="span"
        sx={{
          fontFamily: mono ? 'monospace' : undefined,
          fontWeight: bold ? 700 : 500,
          color,
          fontSize: fontSize ?? '0.875rem',
          whiteSpace: 'nowrap',
        }}
      >
        {display ?? value}
      </Typography>
      <Tooltip title={copied ? 'Copied' : label} placement="top" arrow>
        <IconButton
          className="copy-btn"
          size="small"
          onClick={onCopy}
          aria-label={`${label}: ${value}`}
          sx={{ p: 0.375, color: copied ? 'success.main' : 'text.disabled', '&:hover': { color: copied ? 'success.main' : 'primary.main' } }}
        >
          {copied ? <CheckRoundedIcon sx={{ fontSize: 15 }} /> : <ContentCopyRoundedIcon sx={{ fontSize: 15 }} />}
        </IconButton>
      </Tooltip>
    </Box>
  );
}
