// This file is kept for backward compatibility but is NOT used by Tailwind CSS v4.
// Tailwind v4 uses the @theme directive in globals.css instead.
// All color definitions and theme extensions are in src/app/globals.css.

import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};
export default config;
