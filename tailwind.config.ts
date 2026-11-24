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
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        background: "#090909",
        foreground: "#F5F3EB",
        card: {
          DEFAULT: "#121212",
          elevated: "#181818",
          border: "#232323",
          hover: "#1D1D1D",
        },
        liftr: {
          purple: "#8957DC",
          "purple-light": "#A279E5",
          "purple-dark": "#6C3BBF",
          yellow: "#E9D65B",
          "yellow-light": "#F2E385",
          coral: "#E97860",
          "coral-light": "#F09884",
          green: "#60C27D",
          "green-light": "#83D19B",
          grey: "#A1A9A8",
          "grey-dark": "#363C3B",
          white: "#F5F3EB",
          black: "#090909",
        },
        border: "#232323",
        input: "#1E1E1E",
        ring: "#8957DC",
      },
      fontFamily: {
        sans: ["var(--font-dm-sans)", "sans-serif"],
        serif: ["var(--font-instrument-serif)", "serif"],
        mono: ["var(--font-jetbrains-mono)", "monospace"],
      },
      boxShadow: {
        "neo-sm": "2px 2px 0px 0px #000000",
        neo: "4px 4px 0px 0px #000000",
        "neo-lg": "6px 6px 0px 0px #000000",
        "neo-purple": "4px 4px 0px 0px #8957DC",
        "neo-yellow": "4px 4px 0px 0px #E9D65B",
        "neo-coral": "4px 4px 0px 0px #E97860",
        "neo-green": "4px 4px 0px 0px #60C27D",
      },
      borderRadius: {
        lg: "0.75rem",
        md: "0.5rem",
        sm: "0.25rem",
      },
    },
  },
  plugins: [],
};

export default config;
