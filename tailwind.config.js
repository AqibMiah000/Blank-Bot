/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: 'var(--accent-50, #ecfeff)',
          100: 'var(--accent-100, #cffafe)',
          200: 'var(--accent-200, #a5f3fc)',
          300: 'var(--accent-300, #67e8f9)',
          400: 'var(--accent-400, #22d3ee)',
          500: 'var(--accent-color, #06b6d4)',
          600: 'var(--accent-600, #0891b2)',
          700: 'var(--accent-700, #0e7490)',
          800: 'var(--accent-800, #155e75)',
          900: 'var(--accent-900, #164e63)',
          950: 'var(--accent-950, #083344)',
          DEFAULT: 'var(--accent-color, #06b6d4)',
        },
        surface: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: 'var(--border-hover, #334155)',
          800: 'var(--border-color, #1e293b)',
          850: 'var(--bg-subtle, #172033)',
          900: 'var(--bg-surface, #0f172a)',
          950: 'var(--bg-primary, #090d16)',
        }
      },
      fontFamily: {
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'Liberation Mono', 'Courier New', 'monospace'],
      }
    },
  },
  plugins: [],
}
