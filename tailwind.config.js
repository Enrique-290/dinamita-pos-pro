/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        dinamita: {
          bg: "#090a0f",
          panel: "#10131c",
          panel2: "#171b26",
          line: "#2a3040",
          red: "#cf1124",
          red2: "#ff4d5d",
          text: "#f5f7fb",
          muted: "#98a2b3",
          green: "#2db37c",
          blue: "#6d87ff",
          purple: "#b14fdf",
          amber: "#f59e0b"
        }
      },
      boxShadow: {
        soft: "0 16px 40px rgba(0,0,0,.22)",
        glow: "0 8px 32px rgba(207,17,36,.18)"
      }
    },
  },
  plugins: [],
};
