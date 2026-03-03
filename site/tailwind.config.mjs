import defaultTheme from "tailwindcss/defaultTheme";

/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: [
    "./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Satoshi", ...defaultTheme.fontFamily.sans],
      },
      colors: {
        accent: "#1a8fe3",
      },
      typography: {
        DEFAULT: {
          css: {
            fontSize: "1.3rem",
            lineHeight: "1.7",
            maxWidth: "65ch",
          },
        },
      },
    },
  },
  plugins: [require("@tailwindcss/typography")],
};
