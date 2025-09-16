/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          50: "#eff6ff",
          100: "#dbeafe",
          200: "#bfdbfe",
          300: "#93c5fd",
          400: "#60a5fa",
          500: "#3b82f6",
          600: "#2563eb",
          700: "#1d4ed8",
          800: "#1e40af",
          900: "#1e3a8a",
        },
        cargo: {
          50: "#fdfbf3",
          100: "#faefd8",
          200: "#f3d9ab",
          300: "#e5bf7d",
          400: "#d0a765",
          500: "#b58c4d",
          600: "#8a4fb1",
          700: "#6d3695",
          800: "#512378",
          900: "#38165a",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};
