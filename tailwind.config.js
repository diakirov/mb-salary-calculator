/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        surface: {
          DEFAULT: '#ffffff',
          secondary: '#f8fafc',
          dark: '#0d1322',
          'dark-secondary': '#131b2e',
          'dark-tertiary': '#1a2340',
        },
        accent: {
          DEFAULT: '#22c55e',
          muted: '#4ade80',
          dim: 'rgba(34,197,94,0.14)',
        },
        border: {
          light: 'rgba(15, 23, 42, 0.08)',
          dark: 'rgba(255, 255, 255, 0.06)',
          'light-active': 'rgba(34, 197, 94, 0.3)',
          'dark-active': 'rgba(34, 197, 94, 0.35)',
        },
      },
      maxWidth: {
        'app': '1700px',
      },
      fontSize: {
        '2xs': ['0.6875rem', '1rem'],
      },
    },
  },
  plugins: [],
}
