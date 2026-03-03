/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#09090b', // dark gray/black
        surface: '#18181b', // slightly lighter
        primary: '#3b82f6', // blue
        accent: '#f59e0b', // amber
        danger: '#ef4444', // red
        success: '#10b981', // emerald
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
