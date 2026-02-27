/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        'ceenai': {
          cyan: '#00D4D4',
          'cyan-light': '#00E5E5',
          'cyan-dark': '#00B8B8',
          blue: '#0099CC',
          'blue-light': '#33B5D9',
          'blue-dark': '#007799',
          navy: '#1E3A8A',
        }
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        }
      }
    },
  },
  plugins: [],
};
