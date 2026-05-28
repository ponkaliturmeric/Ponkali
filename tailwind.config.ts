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
        gold: '#D4960A',
        'dark-brown': '#2C1000',
        cream: '#FDF3DC',
        'dark-green': '#1A3A0A',
        'light-gold': '#FAE8A0',
      },
      fontFamily: {
        sans: ['var(--font-madefor)', 'Helvetica Neue', 'Arial', 'sans-serif'],
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
