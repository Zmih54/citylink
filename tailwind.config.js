/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        ink: {
          950: '#070b16',
          900: '#0b1120',
          850: '#0f172a',
          800: '#131c33',
          700: '#1c2742',
        },
        brand: {
          50: '#ecfeff',
          100: '#cffafe',
          200: '#a5f3fc',
          300: '#67e8f9',
          400: '#22d3ee',
          500: '#06b6d4',
          600: '#0891b2',
          700: '#0e7490',
        },
        accent: {
          400: '#818cf8',
          500: '#6366f1',
          600: '#4f46e5',
        },
      },
      fontFamily: {
        sans: ['Manrope', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        glow: '0 0 0 1px rgba(34,211,238,0.18), 0 18px 50px -12px rgba(6,182,212,0.45)',
      },
      keyframes: {
        floaty: {
          '0%,100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-12px)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '0% 50%' },
          '100%': { backgroundPosition: '200% 50%' },
        },
      },
      animation: {
        floaty: 'floaty 6s ease-in-out infinite',
        shimmer: 'shimmer 6s linear infinite',
      },
    },
  },
  plugins: [],
}
