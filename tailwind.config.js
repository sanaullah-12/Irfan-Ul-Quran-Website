/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        primary: {
          50: "#e8f5f1",
          100: "#c8e6dc",
          200: "#9cc5a1",
          300: "#76b28e",
          400: "#5fa385",
          500: "#49a078",
          600: "#3d8a65",
          700: "#317352",
          800: "#255d3f",
          900: "#1a462d",
          950: "#0e2f1c",
        },
        secondary: {
          50: "#e7f2f2",
          100: "#c4dfe0",
          200: "#9fcbcc",
          300: "#79b6b8",
          400: "#5da7a9",
          500: "#216869",
          600: "#1c5a5b",
          700: "#174c4d",
          800: "#123e3f",
          900: "#0d2f30",
        },
        accent: {
          50: "#f8faf9",
          100: "#f0f3f1",
          200: "#dce1de",
          300: "#c8cfcb",
          400: "#b4bdb8",
          500: "#9faaa5",
          600: "#8a9892",
          700: "#75867f",
          800: "#60746c",
          900: "#4b6259",
        },
        gold: {
          DEFAULT: "#D4AF37",
          light: "#E8C870",
          dark: "#B8941F",
        },
        dark: {
          bg: "#1f2421",
          card: "#2a302d",
          border: "#3a4540",
          text: "#dce1de",
        },
      },
      fontFamily: {
        sans: ["Poppins", "Inter", "system-ui", "sans-serif"],
        arabic: ["Amiri", "serif"],
        display: ["Poppins", "sans-serif"],
      },
      fontSize: {
        "display-1": ["4.5rem", { lineHeight: "1.1", fontWeight: "700" }],
        "display-2": ["3.75rem", { lineHeight: "1.2", fontWeight: "700" }],
        "display-3": ["3rem", { lineHeight: "1.2", fontWeight: "600" }],
      },
      letterSpacing: {
        tighter: "-0.05em",
        tight: "-0.025em",
        normal: "0",
        wide: "0.025em",
        wider: "0.05em",
        widest: "0.1em",
      },
      boxShadow: {
        soft: "0 2px 15px rgba(0, 0, 0, 0.08)",
        "soft-lg": "0 10px 40px rgba(0, 0, 0, 0.1)",
        glow: "0 0 20px rgba(212, 175, 55, 0.3)",
        "glow-lg": "0 0 30px rgba(212, 175, 55, 0.4)",
      },
      animation: {
        "fade-in": "fadeIn 0.6s ease-out",
        "slide-up": "slideUp 0.8s ease-out",
        "slide-down": "slideDown 0.8s ease-out",
        float: "float 3s ease-in-out infinite",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(30px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        slideDown: {
          "0%": { opacity: "0", transform: "translateY(-30px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-20px)" },
        },
      },
    },
  },
  plugins: [],
};
