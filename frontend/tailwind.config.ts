import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/**/*.{js,ts,jsx,tsx,mdx}", // Add this line to be safe
  ],
  theme: {
    extend: {
      colors: {
        primary: "#2563eb",
        background: "#f8fafc",
      },
    },
  },
  plugins: [],
};
export default config;