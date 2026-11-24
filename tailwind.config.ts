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
        background: "#F5F1E8", // Off White
        foreground: "#171717", // Jet Black
        brand: {
          blue: "#3155F5",     // Electric Blue
          electric: "#3155F5", // Electric Blue
          yellow: "#E9F56A",   // Acid Yellow
          acid: "#E9F56A",     // Acid Yellow
          offwhite: "#F5F1E8", // Off White
          white: "#FFFFFF",    // Pure White
          jet: "#171717",      // Jet Black
          dark: "#171717",     // Jet Black
          orange: "#FF7043",   // Signal Orange
          signal: "#FF7043",   // Signal Orange
          lavender: "#B9A5EF", // Soft Lavender
          // Compatibility aliases
          forest: "#3155F5",   // Electric Blue
          lime: "#E9F56A",     // Acid Yellow
          pistachio: "#F5F1E8",// Off White
          cream: "#FFFFFF",    // Pure White
        },
        // Direct color aliases
        electric: {
          DEFAULT: "#3155F5",
          hover: "#2542C7",
          light: "#5B7AF7",
        },
        acid: {
          DEFAULT: "#E9F56A",
          hover: "#DAE852",
          dark: "#C5D33A",
        },
        signal: {
          DEFAULT: "#FF7043",
          hover: "#E85D30",
        },
        lavender: {
          DEFAULT: "#B9A5EF",
          hover: "#A48FE0",
        },
        offwhite: "#F5F1E8",
        jet: "#171717",
        card: {
          DEFAULT: "#FFFFFF", // Pure White
          electric: "#3155F5",
          acid: "#E9F56A",
          orange: "#FF7043",
          lavender: "#B9A5EF",
          border: "#171717",
        },
        border: "#171717",
        input: "#FFFFFF",
        ring: "#3155F5",
      },
      fontFamily: {
        heading: ["var(--font-space-grotesk)", "sans-serif"],
        sans: ["var(--font-dm-sans)", "sans-serif"],
        mono: ["var(--font-ibm-plex-mono)", "monospace"],
      },
      boxShadow: {
        "neo-sm": "2px 2px 0px 0px #171717",
        neo: "4px 4px 0px 0px #171717",
        "neo-lg": "6px 6px 0px 0px #171717",
        "neo-xl": "8px 8px 0px 0px #171717",
        "neo-blue": "4px 4px 0px 0px #3155F5",
        "neo-yellow": "4px 4px 0px 0px #E9F56A",
        "neo-orange": "4px 4px 0px 0px #FF7043",
        "neo-lavender": "4px 4px 0px 0px #B9A5EF",
      },
      borderRadius: {
        xl: "0.75rem",  // 12px
        lg: "0.5rem",   // 8px
        md: "0.375rem", // 6px
        sm: "0.25rem",  // 4px
      },
    },
  },
  plugins: [],
};

export default config;
