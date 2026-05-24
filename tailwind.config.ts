import type { Config } from "tailwindcss";

export default {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        cream: "#FAF7F2",
        "warm-brown": "#2C2418",
        terra: "#C9956A",
        "terra-dark": "#A8744A",
        "warm-beige": "#E8DDD0",
        "muted-brown": "#9B8070",
      },
      fontFamily: {
        serif: ["Helvetica", "Arial", "sans-serif"],
        sans: ["Helvetica", "Arial", "sans-serif"],
      },
    },
  },
  plugins: [],
} satisfies Config;
