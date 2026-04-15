import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        tesla: {
          red: "#E31937",
          black: "#171A20",
          dark: "#0F1115", // a bit darker for backgrounds
          gray: "#393C41", // tesla UI standard gray
          light: "#E2E3E3",
        },
      },
    },
  },
  plugins: [],
};
export default config;
