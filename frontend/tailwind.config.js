/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      screens: {
        'xs': '480px', // Extra small devices
        '3xl': '1920px', // Ultra-wide screens
      },
      spacing: {
        '128': '32rem', // Custom large spacing
        '144': '36rem',
      },
      colors: {
        border: '#2a2a2a',
        background: {
          DEFAULT: '#0a0a0a',
          '50': 'rgba(10, 10, 10, 0.5)',
          '70': 'rgba(10, 10, 10, 0.7)',
        },
        foreground: '#ffffff',
        primary: '#ffffff',
        accent: {
          DEFAULT: '#ffffff',
          '20': 'rgba(255, 255, 255, 0.2)',
          '40': 'rgba(255, 255, 255, 0.4)',
          foreground: '#000000',
        },
        card: {
          DEFAULT: '#111111',
          foreground: '#ffffff',
        },
        popover: {
          DEFAULT: '#111111',
          foreground: '#ffffff',
        },
        muted: {
          DEFAULT: '#2a2a2a',
          foreground: '#a1a1aa',
        },
        destructive: {
          DEFAULT: '#ef4444',
          foreground: '#ffffff',
        },
      },
      borderRadius: {
        DEFAULT: '0.5rem',
      },
    },
  },
  plugins: [],
};