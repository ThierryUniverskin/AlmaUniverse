import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Premium neutral palette - warm ivories and stones
        ivory: {
          50: '#FEFDFB',
          100: '#FDFBF7',
          200: '#FAF7F2',
          300: '#F5F1EA',
          400: '#EDE8DF',
          500: '#E3DDD2',
        },
        stone: {
          50: '#FAFAF9',
          100: '#F5F5F4',
          200: '#E8E5E0',
          300: '#D6D3CD',
          400: '#A8A39A',
          500: '#78726A',
          600: '#57534E',
          700: '#44403C',
          800: '#292524',
          900: '#1C1917',
          950: '#0C0A09',
        },
        // Refined sage accent - medical luxury
        sage: {
          50: '#F6F7F5',
          100: '#E8EBE6',
          200: '#D4D9D0',
          300: '#B5BEB0',
          400: '#94A08C',
          500: '#7B917B',
          600: '#5F7360',
          700: '#4D5D4E',
          800: '#414D42',
          900: '#384039',
          950: '#1D211E',
        },
        // Muted rose for subtle accents
        rose: {
          50: '#FBF7F6',
          100: '#F5EDEB',
          200: '#EAD9D5',
          300: '#DBBDB6',
          400: '#C89B91',
          500: '#B07D72',
          600: '#9A6559',
          700: '#7F5349',
          800: '#6B4740',
          900: '#5B3E39',
        },
        // Semantic colors - muted and sophisticated
        success: {
          50: '#F4F9F4',
          100: '#E6F2E6',
          200: '#C7E2C7',
          500: '#6B9B6B',
          600: '#558455',
          700: '#466D46',
        },
        warning: {
          50: '#FBF9F2',
          100: '#F5F0E0',
          500: '#C4A55A',
          600: '#A88C3D',
        },
        error: {
          50: '#FCF5F5',
          100: '#F9EBEB',
          200: '#F0D1D1',
          500: '#C06464',
          600: '#A34D4D',
          700: '#8B4141',
        },
      },
      fontFamily: {
        display: ['var(--font-fraunces)', 'Georgia', 'serif'],
        sans: ['var(--font-dm-sans)', 'system-ui', 'sans-serif'],
        mono: ['SF Mono', 'Monaco', 'Consolas', 'monospace'],
      },
      fontSize: {
        '2xs': ['0.6875rem', { lineHeight: '1rem' }],
      },
      letterSpacing: {
        'tighter': '-0.03em',
        'tight': '-0.02em',
        'snug': '-0.01em',
      },
      boxShadow: {
        'soft': '0 1px 3px -1px rgba(28, 25, 23, 0.04), 0 2px 8px -2px rgba(28, 25, 23, 0.03)',
        'medium': '0 2px 6px -1px rgba(28, 25, 23, 0.06), 0 6px 18px -3px rgba(28, 25, 23, 0.04)',
        'elevated': '0 4px 12px -2px rgba(28, 25, 23, 0.08), 0 12px 36px -6px rgba(28, 25, 23, 0.06)',
        'inner-soft': 'inset 0 1px 2px rgba(28, 25, 23, 0.04)',
      },
      borderRadius: {
        'xl': '0.875rem',
        '2xl': '1rem',
        '3xl': '1.25rem',
      },
      spacing: {
        '18': '4.5rem',
        '22': '5.5rem',
        '88': '22rem',
        '128': '32rem',
      },
      transitionDuration: {
        '250': '250ms',
        '350': '350ms',
        '400': '400ms',
      },
      transitionTimingFunction: {
        'smooth': 'cubic-bezier(0.4, 0, 0.2, 1)',
        'gentle': 'cubic-bezier(0.25, 0.1, 0.25, 1)',
      },
      animation: {
        'fade-in': 'fadeIn 0.4s ease-out',
        'slide-up': 'slideUp 0.4s ease-out',
        'slide-in-right': 'slideInRight 0.35s ease-out',
        'pulse-subtle': 'pulseSubtle 2s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideInRight: {
          '0%': { opacity: '0', transform: 'translateX(12px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        pulseSubtle: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.7' },
        },
      },
    },
  },
  plugins: [],
}
export default config
