/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        exaltNavy: "#0A0F5C",
        exaltNavyLight: "#1B2290",
        exaltPink: "#F0047F",
        exaltYellow: "#FFD600",
        exaltCream: "#F6F5FB",
      },
      fontFamily: {
        sans: ["Inter", "sans-serif"],
        display: ["'Space Grotesk'", "Inter", "sans-serif"],
      },
    },
  },
  plugins: ["@tailwindcss/forms"],
};
