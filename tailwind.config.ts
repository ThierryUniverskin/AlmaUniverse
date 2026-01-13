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
        // Primary purple/violet - brand color (#905CFF)
        purple: {
          50: '#F8F5FF',
          100: '#F0EAFF',
          200: '#E2D6FF',
          300: '#CBB8FF',
          400: '#AD8AFF',
          500: '#905CFF',
          600: '#7C4AE6',
          700: '#6A3BCC',
          800: '#5730A8',
          900: '#472788',
          950: '#2D1A5C',
        },
        // SkinXS orange palette - for Skin Wellness Mode (#FF8447 primary)
        skinxs: {
          50: '#FFF7F3',
          100: '#FFEDE5',
          200: '#FFD9CC',
          300: '#FFC0A6',
          400: '#FFA07A',
          500: '#FF8447',  // Primary brand color
          600: '#E66A2C',
          700: '#CC5218',
          800: '#A64012',
          900: '#80300D',
          950: '#4D1D08',
        },
        // Teal palette - for Skin Wellness Mode UI elements
        teal: {
          50: '#F0FDFA',
          100: '#CCFBF1',
          200: '#99F6E4',
          300: '#5EEAD4',
          400: '#2DD4BF',
          500: '#14B8A6',  // Primary
          600: '#0D9488',
          700: '#0F766E',
          800: '#115E59',
          900: '#134E4A',
          950: '#042F2E',
        },
        // Sky blue palette - for Skin Wellness Mode UI elements
        sky: {
          50: '#F0F9FF',
          100: '#E0F2FE',
          200: '#BAE6FD',
          300: '#7DD3FC',
          400: '#38BDF8',
          500: '#0EA5E9',  // Primary
          600: '#0284C7',
          700: '#0369A1',
          800: '#075985',
          900: '#0C4A6E',
          950: '#082F49',
        },
        // Legacy orange accent (kept for backwards compatibility)
        orange: {
          50: '#FFF8F3',
          100: '#FFEDD9',
          200: '#FFD9B3',
          300: '#FFBF80',
          400: '#FFA04D',
          500: '#F58220',
          600: '#D96B0A',
          700: '#B35608',
          800: '#8C4307',
          900: '#663205',
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
        display: ['var(--font-inter)', 'system-ui', 'sans-serif'],
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
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
        modalEnter: {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
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
