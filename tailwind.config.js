/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './pages/**/*.{ts,tsx}',
    './lib/**/*.{ts,tsx}'
  ],
  theme: {
    extend: {
      colors: {
        ink: {
          900: '#07090c',
          800: '#0b0f10',
          700: '#0f1316'
        },
        neon: {
          500: '#00c853',
          400: '#2ee77a',
          300: '#6bf5a1'
        }
      },
      boxShadow: {
        glow: '0 0 0 1px rgba(0,200,83,0.25), 0 10px 40px rgba(0,200,83,0.08)'
      }
    }
  },
  plugins: []
};
