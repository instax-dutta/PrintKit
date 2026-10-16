/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        kit: {
          bg: 'rgb(15 17 21)',
          panel: 'rgb(22 26 33)',
          line: 'rgb(43 49 60)',
          dim: 'rgb(148 158 173)',
          accent: 'rgb(96 165 250)',
        },
      },
    },
  },
  plugins: [],
}
