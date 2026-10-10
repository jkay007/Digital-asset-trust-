import type { Config } from 'tailwindcss';
import typography from '@tailwindcss/typography';

/**
 * Global Financial Assets design system.
 * Core palette: deep navy #0B1F35, white, slate, champagne gold #D9B36C.
 * Gold is an accent: on white backgrounds use gold-700/800 for text to keep
 * WCAG AA contrast; gold-400 (the brand champagne) is reserved for navy surfaces,
 * rules, icons and fills.
 */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    container: {
      center: true,
      padding: { DEFAULT: '1rem', sm: '1.5rem', lg: '2rem' },
      screens: { '2xl': '1320px' },
    },
    extend: {
      colors: {
        navy: {
          50: '#F1F4F8',
          100: '#DDE4EE',
          200: '#B9C7D9',
          300: '#8CA2BF',
          400: '#5B7698',
          500: '#3B5679',
          600: '#26405F',
          700: '#183150',
          800: '#102842',
          900: '#0B1F35',
          950: '#06121F',
          DEFAULT: '#0B1F35',
        },
        gold: {
          50: '#FBF7EF',
          100: '#F6ECD8',
          200: '#EEDAB2',
          300: '#E5C78F',
          400: '#D9B36C',
          500: '#C99B4B',
          600: '#AE8139',
          700: '#8A642B',
          800: '#6E4F24',
          900: '#4F3A1C',
          DEFAULT: '#D9B36C',
        },
      },
      fontFamily: {
        sans: ['"Inter Variable"', 'Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        display: ['"Source Serif 4 Variable"', '"Source Serif 4"', 'Georgia', 'ui-serif', 'serif'],
      },
      fontSize: {
        eyebrow: ['0.75rem', { lineHeight: '1rem', letterSpacing: '0.18em', fontWeight: '600' }],
      },
      boxShadow: {
        card: '0 1px 2px rgba(11,31,53,0.04), 0 8px 24px -12px rgba(11,31,53,0.18)',
        lift: '0 2px 4px rgba(11,31,53,0.06), 0 18px 40px -16px rgba(11,31,53,0.28)',
      },
      maxWidth: {
        prose: '68ch',
      },
      backgroundImage: {
        'gold-rule': 'linear-gradient(90deg, rgba(217,179,108,0) 0%, #D9B36C 50%, rgba(217,179,108,0) 100%)',
      },
      keyframes: {
        'fade-up': {
          from: { opacity: '0', transform: 'translateY(8px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        shimmer: {
          '100%': { transform: 'translateX(100%)' },
        },
      },
      animation: {
        'fade-up': 'fade-up 0.5s ease-out both',
      },
    },
  },
  plugins: [typography],
} satisfies Config;
