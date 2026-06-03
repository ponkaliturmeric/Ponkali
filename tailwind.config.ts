import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        gold: '#E8950A',          // vibrant turmeric-yellow (was brownish #D4960A)
        'dark-brown': '#1C3311',
        cream: '#E5D6C2',
        terracotta: '#C04A1C',    // Tamil Nadu red-earth — warmth + authenticity
        'pkg-yellow': '#F5C418',  // Matches physical packaging background
        'dark-green': '#2A6B1A',
        'light-gold': '#FAE8A0',
        'warm-white': 'rgb(251, 248, 242)',
      },
      fontFamily: {
        sans:    ['var(--font-madefor)', 'helveticaneuew01-45ligh', 'Helvetica Neue', 'Arial', 'sans-serif'],
        display: ['var(--font-playfair)', 'Georgia', 'serif'],
        hero:    ['var(--font-jakarta)', 'var(--font-madefor)', 'sans-serif'],
      },
      fontSize: {
        base: ['18px', '27px'],
      },
      transitionTimingFunction: {
        smooth: 'cubic-bezier(0.4, 0, 0.2, 1)',
      },
    },
  },
  plugins: [],
};
export default config;
