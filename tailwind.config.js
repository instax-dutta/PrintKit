/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        kit: {
          bg: 'var(--kit-bg)',
          panel: 'var(--kit-panel)',
          inset: 'var(--kit-inset)',
          panelBorder: 'var(--kit-panel-border)',
          line: 'var(--kit-line)',
          dim: 'var(--kit-dim)',
          text: 'var(--kit-text)',
          accent: 'var(--kit-accent)',
          pink: 'var(--kit-pink)',
        },
      },
    },
  },
  plugins: [],
}
