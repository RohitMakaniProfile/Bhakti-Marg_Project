/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        deep: '#0d0500',
        maroon: '#800020',
        lotus: '#e879a0',
        saffron: {
          50: '#fff8f0',
          100: '#ffedd5',
          200: '#ffd9a0',
          300: '#ffbe6a',
          400: '#ff9d3c',
          500: '#ff7c1a',
          600: '#e05f00',
          700: '#b84d00',
          800: '#8f3c00',
          900: '#6b2e00',
        },
        gold: {
          300: '#fde68a',
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706',
        },
        lotus: '#e879a0',
        maroon: '#800020',
        deep: '#1a0a00',
      },
      fontFamily: {
        display: ['Georgia', 'serif'],
        body: ['Inter', 'sans-serif'],
      },
      backgroundImage: {
        'spiritual': 'linear-gradient(135deg, #1a0a00 0%, #3d1500 30%, #6b2e00 60%, #1a0a00 100%)',
        'gold-shimmer': 'linear-gradient(90deg, #f59e0b, #fbbf24, #fde68a, #fbbf24, #f59e0b)',
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'shimmer': 'shimmer 3s linear infinite',
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'spin-slow': 'spin 20s linear infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
    },
  },
  plugins: [],
}
