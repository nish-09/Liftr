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
        background: "#B8D99A", // Pistachio Green
        foreground: "#171B16", // Almost Black
        brand: {
          pistachio: "#B8D99A",
          forest: "#183D2A",
          lime: "#D5F36A",
          orange: "#F07845",
          lavender: "#B9A4E8",
          cream: "#F5F0DF",
          dark: "#171B16",
          white: "#FFFFFF",
        },
        card: {
          DEFAULT: "#F5F0DF", // Warm Cream
          forest: "#183D2A", // Deep Forest Green
          lime: "#D5F36A", // Acid Lime
          cream: "#F5F0DF", // Warm Cream
          border: "#171B16",
        },
        border: "#171B16",
        input: "#F5F0DF",
        ring: "#183D2A",
      },
      fontFamily: {
        heading: ["var(--font-space-grotesk)", "sans-serif"],
        sans: ["var(--font-dm-sans)", "sans-serif"],
        mono: ["var(--font-ibm-plex-mono)", "monospace"],
      },
      boxShadow: {
        "neo-sm": "2px 2px 0px 0px #171B16",
        neo: "3px 3px 0px 0px #171B16",
        "neo-lg": "5px 5px 0px 0px #171B16",
        "neo-xl": "7px 7px 0px 0px #171B16",
        "neo-forest": "3px 3px 0px 0px #183D2A",
        "neo-lime": "3px 3px 0px 0px #D5F36A",
        "neo-orange": "3px 3px 0px 0px #F07845",
        "neo-lavender": "3px 3px 0px 0px #B9A4E8",
        "neo-cream": "3px 3px 0px 0px #F5F0DF",
      },
      borderRadius: {
        xl: "0.625rem", // ~10px
        lg: "0.5rem",   // 8px
        md: "0.375rem", // 6px
        sm: "0.25rem",  // 4px
      },
    },
  },
  plugins: [],
};

export default config;
