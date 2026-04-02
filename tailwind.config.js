/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        bg: '#0e0d0b',
        surface: '#141310',
        'surface-2': '#1a1916',
        'surface-3': '#211f1c',
        border: 'rgba(255,255,255,0.07)',
        'border-hi': 'rgba(255,255,255,0.12)',
        text: '#e8e4dc',
        'text-muted': '#7a776f',
        'text-faint': '#47453f',
        accent: '#4f98a3',
        'accent-dim': 'rgba(79,152,163,0.15)',
        gold: '#e8af34',
        'gold-dim': 'rgba(232,175,52,0.15)',
        green: '#6daa45',
        'green-dim': 'rgba(109,170,69,0.15)',
        red: '#dd6974',
        'red-dim': 'rgba(221,105,116,0.15)',
        purple: '#a86fdf',
        'purple-dim': 'rgba(168,111,223,0.15)',
        orange: '#fdab43',
        'orange-dim': 'rgba(253,171,67,0.15)',
        // Keep old names as aliases for subpages
        card: '#141310',
        secondary: '#a86fdf',
        'secondary-dim': 'rgba(168,111,223,0.15)',
        danger: '#dd6974',
        warning: '#e8af34',
        success: '#6daa45',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        serif: ['Instrument Serif', 'Georgia', 'serif'],
      },
      borderRadius: {
        sm: '8px',
        md: '12px',
        lg: '16px',
        xl: '20px',
      },
      keyframes: {
        'fade-in': {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'count-up': {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'pulse-dot': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.3' },
        },
        'confetti-fall': {
          '0%': { transform: 'translateY(-10px) rotate(0deg)', opacity: '1' },
          '100%': { transform: 'translateY(100vh) rotate(720deg)', opacity: '0' },
        },
      },
      animation: {
        'fade-in': 'fade-in 0.4s cubic-bezier(0.16,1,0.3,1) forwards',
        'count-up': 'count-up 0.6s cubic-bezier(0.16,1,0.3,1) both',
        'pulse-dot': 'pulse-dot 2s ease-in-out infinite',
        'confetti': 'confetti-fall 1.5s ease-in forwards',
      },
    },
  },
  plugins: [],
}
