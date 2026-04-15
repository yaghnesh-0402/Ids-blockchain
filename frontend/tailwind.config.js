/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      fontFamily: {
        display: ["Space Grotesk", "ui-sans-serif", "sans-serif"],
        body: ["Manrope", "ui-sans-serif", "sans-serif"]
      },
      colors: {
        obsidian: "#061014",
        grid: "#10252b",
        signal: "#00f0b5",
        amber: "#f4b942",
        danger: "#ff4d6d"
      },
      boxShadow: {
        glow: "0 0 40px rgba(0, 240, 181, 0.16)"
      }
    }
  },
  plugins: []
};
