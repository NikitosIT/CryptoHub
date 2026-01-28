// tailwind.config.ts
import typography from "@tailwindcss/typography";

export default {
  content: ["index.html", "src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        inter: [
          "Inter",
          "system-ui",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "Roboto",
          "sans-serif",
        ],
        montserrat: [
          "Montserrat",
          "system-ui",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "Roboto",
          "sans-serif",
        ],
      },
    },
  },
  plugins: [typography],
};
