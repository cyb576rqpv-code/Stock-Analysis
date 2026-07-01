/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        market: {
          bg: '#0a0e17',
          card: '#111827',
          border: '#1f2937',
          up: '#22c55e',
          down: '#ef4444',
          accent: '#3b82f6',
        },
      },
    },
  },
  plugins: [],
}
