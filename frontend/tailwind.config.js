/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        cinema: {
          bg: "#080c16",
          surface: "#0f172a",
          card: "#141e33",
          cardHover: "#1a2744",
          border: "#1e293b",
          red: "#e50914",
          redHover: "#ff1a26",
          gold: "#f59e0b",
          cyan: "#06b6d4",
          purple: "#8b5cf6",
          text: "#f8fafc",
          muted: "#94a3b8",
        }
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "-apple-system", "sans-serif"],
      },
      boxShadow: {
        glow: "0 0 25px rgba(229, 9, 20, 0.35)",
        goldGlow: "0 0 25px rgba(245, 158, 11, 0.35)",
        cyanGlow: "0 0 25px rgba(6, 182, 212, 0.35)",
        screenGlow: "0 10px 40px rgba(6, 182, 212, 0.4)",
      }
    },
  },
  plugins: [],
}
