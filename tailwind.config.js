/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        bg: '#0a0a0f',
        card: '#12121a',
        'card-hover': '#1a1a2e',
        accent: '#00d4aa',
        'accent-dim': '#00d4aa22',
        secondary: '#7c3aed',
        'secondary-dim': '#7c3aed22',
        border: '#1e1e2e',
        muted: '#6b7280',
        'muted-light': '#9ca3af',
        danger: '#ef4444',
        warning: '#f59e0b',
        success: '#10b981',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        glow: '0 0 20px rgba(0, 212, 170, 0.15)',
        'glow-purple': '0 0 20px rgba(124, 58, 237, 0.15)',
      },
      keyframes: {
        'fade-in': {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'slide-in': {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(0)' },
        },
        'confetti-fall': {
          '0%': { transform: 'translateY(-100%) rotate(0deg)', opacity: '1' },
          '100%': { transform: 'translateY(100vh) rotate(720deg)', opacity: '0' },
        },
        'count-up': {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        'fade-in': 'fade-in 0.4s ease-out forwards',
        'slide-in': 'slide-in 0.3s ease-out',
        'confetti': 'confetti-fall 1.5s ease-in forwards',
        'count-up': 'count-up 0.6s ease-out forwards',
      },
    },
  },
  plugins: [],
}
