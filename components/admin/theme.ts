'use client';

import { createTheme } from '@mui/material/styles';

/**
 * Ponkali admin theme — modelled on the Doormile corporate console.
 * Deep turmeric-farm green brand surfaces (AppBar + sidebar), turmeric-gold
 * accents, neutral grey canvas, soft elevation and a branded CTA glow.
 */

// Extend MUI's PaletteColor so `.lighter` / `.darker` are typed.
declare module '@mui/material/styles' {
  interface PaletteColor { lighter?: string; darker?: string }
  interface SimplePaletteColorOptions { lighter?: string; darker?: string }
}

export const grey = {
  50: '#FAFAFA',
  100: '#F5F5F5',
  200: '#F0F0F0',
  300: '#D9D9D9',
  400: '#BFBFBF',
  500: '#8C8C8C',
  600: '#595959',
  700: '#434343',
  800: '#262626',
  900: '#141414',
};

// Branded soft shadows (exported for layout/components that need the glow).
export const shadows = {
  card: '0px 1px 4px rgba(0, 0, 0, 0.08)',
  cardHover: '0px 4px 16px rgba(0, 0, 0, 0.10)',
  widget: '0px 2px 14px rgba(38, 38, 38, 0.06)',
  dropdown: '0px 8px 24px rgba(38, 38, 38, 0.12)',
  primaryGlow: '0px 6px 16px rgba(28, 51, 17, 0.26)',
  primaryGlowHover: '0px 8px 20px rgba(28, 51, 17, 0.34)',
  header: '0px 1px 0px rgba(0, 0, 0, 0.06)',
};

export const BRAND = '#1C3311';   // deep farm green — AppBar + sidebar
export const BRAND_DARK = '#142608';
export const GOLD = '#E8950A';

const adminTheme = createTheme({
  palette: {
    mode: 'light',
    common: { black: '#000000', white: '#FFFFFF' },
    primary: {
      lighter: '#E9F0E4',
      light: '#4A7A3A',
      main: BRAND,
      dark: BRAND_DARK,
      darker: '#0D1A06',
      contrastText: '#FFFFFF',
    },
    secondary: {
      lighter: '#FCE7C7',
      light: '#F2B24D',
      main: GOLD,
      dark: '#B5740A',
      darker: '#7E5207',
      contrastText: '#FFFFFF',
    },
    error: { lighter: '#FEEAE9', light: '#F88078', main: '#F04134', dark: '#A82216', darker: '#7A150C', contrastText: '#FFFFFF' },
    warning: { lighter: '#FFF7E0', light: '#FFD666', main: '#FFBF00', dark: '#B38600', darker: '#805F00', contrastText: '#262626' },
    info: { lighter: '#E0F7F8', light: '#66CBD2', main: '#00A2AE', dark: '#00727B', darker: '#005159', contrastText: '#FFFFFF' },
    success: { lighter: '#E3F6EC', light: '#5CC98C', main: '#00A854', dark: '#00773B', darker: '#00552A', contrastText: '#FFFFFF' },
    grey,
    text: { primary: grey[800], secondary: grey[600], disabled: grey[400] },
    action: {
      hover: 'rgba(28, 51, 17, 0.04)',
      selected: 'rgba(28, 51, 17, 0.08)',
    },
    divider: grey[200],
    background: { paper: '#FFFFFF', default: '#FAFAFB' },
  },
  shape: { borderRadius: 6 },
  mixins: { toolbar: { minHeight: 64 } },
  typography: {
    fontFamily: 'var(--font-public-sans), var(--font-jakarta), "Helvetica", "Arial", sans-serif',
    htmlFontSize: 16,
    fontWeightLight: 300,
    fontWeightRegular: 400,
    fontWeightMedium: 500,
    fontWeightBold: 600,
    h1: { fontWeight: 700, fontSize: '2.375rem', lineHeight: 1.21 },
    h2: { fontWeight: 700, fontSize: '1.875rem', lineHeight: 1.27 },
    h3: { fontWeight: 600, fontSize: '1.5rem', lineHeight: 1.33 },
    h4: { fontWeight: 600, fontSize: '1.25rem', lineHeight: 1.4 },
    h5: { fontWeight: 600, fontSize: '1rem', lineHeight: 1.5 },
    h6: { fontWeight: 500, fontSize: '0.875rem', lineHeight: 1.57 },
    caption: { fontWeight: 400, fontSize: '0.75rem', lineHeight: 1.66 },
    body1: { fontSize: '0.875rem', lineHeight: 1.57 },
    body2: { fontSize: '0.75rem', lineHeight: 1.66 },
    subtitle1: { fontSize: '0.875rem', fontWeight: 600, lineHeight: 1.57 },
    subtitle2: { fontSize: '0.75rem', fontWeight: 500, lineHeight: 1.66 },
    overline: { fontSize: '0.6875rem', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase' },
    button: { textTransform: 'capitalize', fontWeight: 600 },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: { backgroundColor: '#FAFAFB' },
        '*::-webkit-scrollbar': { width: 8, height: 8 },
        '*::-webkit-scrollbar-thumb': { background: grey[300], borderRadius: 8 },
        '*::-webkit-scrollbar-thumb:hover': { background: grey[400] },
      },
    },
    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: {
        root: { borderRadius: 6, fontWeight: 600, padding: '7px 18px' },
        containedPrimary: {
          boxShadow: shadows.primaryGlow,
          '&:hover': { boxShadow: shadows.primaryGlowHover, backgroundColor: BRAND_DARK },
        },
        outlined: { borderColor: grey[300] },
        sizeLarge: { padding: '10px 22px', fontSize: '0.9375rem' },
      },
    },
    MuiIconButton: { styleOverrides: { root: { borderRadius: 8 } } },
    MuiCard: {
      styleOverrides: {
        root: { borderRadius: 10, border: `1px solid ${grey[200]}`, boxShadow: shadows.card, backgroundImage: 'none' },
      },
    },
    MuiCardHeader: {
      defaultProps: { titleTypographyProps: { variant: 'h5' }, subheaderTypographyProps: { variant: 'caption' } },
      styleOverrides: { root: { padding: 20 } },
    },
    MuiCardContent: { styleOverrides: { root: { padding: 20, '&:last-child': { paddingBottom: 20 } } } },
    MuiPaper: { defaultProps: { elevation: 0 }, styleOverrides: { rounded: { borderRadius: 10 } } },
    MuiChip: {
      styleOverrides: {
        root: { borderRadius: 6, fontWeight: 600, fontSize: '0.75rem' },
        sizeSmall: { height: 22 },
        label: { paddingLeft: 8, paddingRight: 8 },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: { borderColor: grey[200], padding: '12px 16px', fontSize: '0.8125rem' },
        head: { fontWeight: 600, color: grey[600], backgroundColor: grey[50], textTransform: 'none', whiteSpace: 'nowrap' },
      },
    },
    MuiTableRow: { styleOverrides: { root: { '&:hover': { backgroundColor: 'rgba(28,51,17,0.035)' } } } },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          backgroundColor: '#FFFFFF',
          '& .MuiOutlinedInput-notchedOutline': { borderColor: grey[300] },
          '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: grey[400] },
        },
        input: { padding: '11px 14px' },
      },
    },
    MuiInputLabel: { styleOverrides: { root: { color: grey[600], fontSize: '0.875rem' } } },
    MuiTab: { styleOverrides: { root: { textTransform: 'none', fontWeight: 600, minHeight: 46, fontSize: '0.875rem' } } },
    MuiTabs: { styleOverrides: { indicator: { height: 3, borderRadius: 3 } } },
    MuiTooltip: { styleOverrides: { tooltip: { backgroundColor: grey[800], borderRadius: 6, fontSize: '0.75rem', padding: '6px 10px' } } },
    MuiAvatar: { styleOverrides: { root: { fontWeight: 600, fontSize: '0.875rem' } } },
    MuiListItemButton: { styleOverrides: { root: { borderRadius: 8 } } },
    MuiLinearProgress: { styleOverrides: { root: { borderRadius: 8, height: 6, backgroundColor: grey[200] } } },
    MuiMenu: { styleOverrides: { paper: { borderRadius: 10, boxShadow: shadows.dropdown, marginTop: 4 } } },
    MuiAppBar: { defaultProps: { elevation: 0 } },
  },
});

export default adminTheme;
