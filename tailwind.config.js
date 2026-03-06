/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ['class'],
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        background: '#0A0F1E',
        card: '#111827',
        'card-hover': '#1a2235',
        border: '#1E2A3A',
        primary: '#14b8a6',
        accent: '#10b981',
        muted: '#6B7280',
        'muted-light': '#9CA3AF',
      },
      boxShadow: {
        'card': '0 1px 3px 0 rgba(0, 0, 0, 0.3)',
        'card-hover': '0 4px 12px 0 rgba(0, 0, 0, 0.4)',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif']
      }
    }
  },
  plugins: []
}
