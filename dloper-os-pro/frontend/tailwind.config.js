/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Space Grotesk"', '"Segoe UI"', 'system-ui', 'sans-serif'],
      },
      colors: {
        midnight: '#0b1021',
        lagoon: '#1c3b57',
        mint: '#64ffd3',
        sand: '#f5ede1',
        coral: '#f45b69',
      },
      boxShadow: {
        glow: '0 10px 50px rgba(100, 255, 211, 0.15)',
      },
    },
  },
  plugins: [],
};
