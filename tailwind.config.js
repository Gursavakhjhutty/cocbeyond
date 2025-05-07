/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        cinzel: ['Cinzel', 'serif'],
        garamond: ['EB Garamond', 'serif'],
      },
      colors: {
        parchment: '#f4e9c0',
        void: '#0d0d0d',
        ink: '#1a1a2e',
        decay: '#5e3b2e',
        glow: '#d9c97d',
        eldritch: {
          bg: '#0b0c10',
          panel: '#1a1e22',
          accent: '#8effa0',
          highlight: '#baffb9',
          link: '#00ffcc',
          danger: '#ff4d6d',
        },
      },
    },
  },
  plugins: [],
};