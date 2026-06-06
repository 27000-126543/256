/** @type {import('tailwindcss').Config} */

export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    container: {
      center: true,
    },
    extend: {
      colors: {
        primary: {
          50: "#E8F3FF",
          100: "#B9DCFF",
          200: "#8CC5FF",
          300: "#5AA3FF",
          400: "#2F7CF6",
          500: "#165DFF",
          600: "#0E42D2",
          700: "#0A369D",
          800: "#0B2B7A",
          900: "#08205C",
        },
        success: {
          50: "#E8FFEA",
          100: "#B7F4C0",
          200: "#86E597",
          300: "#57D56F",
          400: "#2FC44D",
          500: "#00B42A",
          600: "#009A23",
          700: "#007E1C",
          800: "#006419",
          900: "#004A12",
        },
        warning: {
          50: "#FFF3E0",
          100: "#FFDFB0",
          200: "#FFCB80",
          300: "#FFB750",
          400: "#FFA32A",
          500: "#FF7D00",
          600: "#E06C00",
          700: "#B85700",
          800: "#8C4200",
          900: "#663000",
        },
        danger: {
          50: "#FFECE8",
          100: "#FCC5BD",
          200: "#F89E94",
          300: "#F37A6D",
          400: "#EB5A4C",
          500: "#F53F3F",
          600: "#D93030",
          700: "#B92323",
          800: "#971818",
          900: "#701111",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      boxShadow: {
        card: "0 2px 14px 0 rgba(0, 0, 0, 0.06)",
        "card-hover": "0 6px 16px 0 rgba(0, 0, 0, 0.1)",
      },
    },
  },
  plugins: [],
};
