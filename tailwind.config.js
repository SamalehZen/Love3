/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './App.tsx',
    './index.tsx',
    './components/**/*.{js,ts,jsx,tsx}',
    './contexts/**/*.{js,ts,jsx,tsx}',
    './hooks/**/*.{js,ts,jsx,tsx}',
    './services/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        background: '#121214',
        surface: '#1C1C1E',
        primary: {
          orange: '#FF6B3C',
          red: '#FF3A1F',
        },
        action: {
          red: '#E84B3C',
          purple: '#7B4CF6',
          green: '#32D583',
        },
        chip: '#26282B',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      animation: {
        'shimmer': 'shimmer 2.5s infinite',
        'shimmer-wave': 'shimmer-wave 5.5s infinite ease-in-out',
        'shimmer-text': 'shimmer-text 3s linear infinite',
        'shimmer-continuous': 'shimmer-continuous 3s infinite linear',
        'float-back': 'float-back 4s ease-in-out infinite',
        'float-front': 'float-front 5s ease-in-out infinite',
        'pop-in': 'popIn 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) forwards',
        'pulse-ring': 'pulse-ring 1s cubic-bezier(0.215, 0.61, 0.355, 1) infinite',
        'heart-pop': 'heartPop 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) forwards',
        'confetti': 'confetti 3s ease-out forwards',
      },
    },
  },
  plugins: [],
}
