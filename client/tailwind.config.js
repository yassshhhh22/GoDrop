/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          50: "#EBFFD7",
          100: "#EBFFD7",
          200: "#d4f7b8",
          300: "#c2f09f",
          400: "#c0e89a",
          500: "#AEDC81", // Main brand green
          600: "#6CC51D",
          700: "#5aa617",
          800: "#478612",
          900: "#35670d",
        },
        secondary: {
          50: "#F4F5F9",
          100: "#e8e9f0",
          200: "#d1d3e1",
          300: "#b9bdd2",
          400: "#a2a7c3",
          500: "#868889", // Text secondary
          600: "#6b6d6e",
          700: "#505253",
          800: "#363637",
          900: "#1b1b1c",
        },
        grey: {
          50: "#FFFFFF",
          100: "#F5F5F5",
          200: "#EBEBEB",
          300: "#d1d1d1",
          400: "#a8a8a8",
          500: "#868889",
          600: "#6b6d6e",
          700: "#505253",
          800: "#363637",
          900: "#000000",
        },
        success: "#10b981",
        warning: "#f59e0b",
        error: "#ef4444",
        info: "#3b82f6",
      },
      fontFamily: {
        sans: ["Commissioner", "system-ui", "-apple-system", "sans-serif"],
        mono: ["Fira Code", "monospace"],
      },
    },
  },
  plugins: [],
};
