/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ['class'],
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#57f1db',
          dark: '#3cddc7',
          light: '#62fae3'
        },
        background: '#131313',
        surface: '#131313',
        'surface-dim': '#131313',
        'surface-lowest': '#0e0e0e',
        'surface-highest': '#353534',
        onsurface: '#e5e2e1',
        'onsurface-variant': '#bacac5',
        'secondary-container': '#00a572',
        'on-secondary': '#003824',
        tertiary: '#ffb875',
        'tertiary-fixed-dim': '#ffb875',
        'on-tertiary-container': '#744000',
        error: '#ffb4ab',
        outline: '#859490',
        card: '#131313',
        border: '#2a2a2a'
      },
      boxShadow: {
        card: '0 14px 30px rgba(0,0,0,0.24)',
        'card-hover': '0 18px 40px rgba(0,0,0,0.30)'
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        heading: ['Manrope', 'Inter', 'system-ui', 'sans-serif']
      },
      backgroundImage: {
        'emerald-panel': 'linear-gradient(135deg, rgba(87, 241, 219, 0.18), rgba(0, 165, 114, 0.06) 45%, rgba(255, 184, 117, 0.08))',
        'emerald-soft': 'linear-gradient(180deg, rgba(18, 18, 18, 0.96), rgba(14, 14, 14, 1))'
      }
    }
  },
  plugins: []
}
