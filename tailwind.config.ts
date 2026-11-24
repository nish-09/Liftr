import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    container: {
      center: true,
      padding: "1.5rem",
      screens: {
        "2xl": "1440px",
      },
    },
    extend: {
      colors: {
        background: "#EBCBF7", // Pastel Lavender outer shell
        foreground: "#142746", // Deep Navy primary ink
        navy: "#142746",
        slate: {
          muted: "#8993A5",
        },
        pastel: {
          lavender: "#EBCBF7",
          green: "#BDF7B6",
          lime: "#E9FF91",
          yellow: "#F2FA91",
          coral: "#F8C3B5",
          white: "#FFFFFF",
          surface: "#FAF9FD",
        },
        // Semantic aliases mapped strictly to the Pastel Neo-Brutalist palette
        brand: {
          navy: "#142746",
          lavender: "#EBCBF7",
          green: "#BDF7B6",
          lime: "#E9FF91",
          yellow: "#F2FA91",
          coral: "#F8C3B5",
          white: "#FFFFFF",
          muted: "#8993A5",
        },
        // Compatibility aliases so existing semantic utility classes inherit the new palette
        forest: {
          DEFAULT: "#142746",
          dark: "#0E1C33",
        },
        lime: "#E9FF91",
        cream: "#FFFFFF",
        pistachio: "#EBCBF7",
        dark: "#142746",
        orange: "#F8C3B5",
        lavender: "#EBCBF7",
        border: "#142746",
        input: "#FFFFFF",
        ring: "#142746",
      },
      fontFamily: {
        heading: ["var(--font-plus-jakarta)", "sans-serif"],
        sans: ["var(--font-inter)", "sans-serif"],
        mono: ["var(--font-inter)", "sans-serif"],
      },
      boxShadow: {
        "neo-sm": "2px 2px 0px 0px #142746",
        neo: "3px 3px 0px 0px #142746",
        "neo-lg": "5px 5px 0px 0px #142746",
        "neo-xl": "6px 6px 0px 0px #142746",
        shell: "0 20px 50px -12px rgba(20, 39, 70, 0.14)",
      },
      borderRadius: {
        "2xl": "1.25rem",
        xl: "1rem",
        lg: "0.75rem",
        md: "0.5rem",
        sm: "0.375rem",
      },
    },
  },
  plugins: [],
};

export default config;
