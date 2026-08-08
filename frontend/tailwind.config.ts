import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Premium Black & Gray Dark Theme
        bg: {
          base:      "#090909",
          secondary: "#111111",
          card:      "#181818",
          hover:     "#242424",
        },
        border: {
          DEFAULT: "#2E2E2E",
          bright:  "#3D3D3D",
        },
        text: {
          primary:   "#FFFFFF",
          secondary: "#BDBDBD",
          muted:     "#808080",
        },
        accent: "#E5E5E5",
        // Keep semantic colors
        success: "#22C55E",
        warning: "#EAB308",
        error:   "#EF4444",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      backgroundImage: {
        "grid-pattern":
          "linear-gradient(rgba(255,255,255,.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.03) 1px, transparent 1px)",
      },
      backgroundSize: {
        "grid-sm": "40px 40px",
      },
      animation: {
        "fade-in":    "fadeIn .5s ease both",
        "slide-up":   "slideUp .5s ease both",
        "pulse-slow": "pulse 4s cubic-bezier(0.4,0,0.6,1) infinite",
        "spin-slow":  "spin 12s linear infinite",
        "float":      "float 6s ease-in-out infinite",
        "glow":       "glow 3s ease-in-out infinite alternate",
      },
      keyframes: {
        fadeIn: {
          from: { opacity: "0" },
          to:   { opacity: "1" },
        },
        slideUp: {
          from: { opacity: "0", transform: "translateY(20px)" },
          to:   { opacity: "1", transform: "translateY(0)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%":      { transform: "translateY(-12px)" },
        },
        glow: {
          from: { boxShadow: "0 0 20px rgba(229,229,229,0.1)" },
          to:   { boxShadow: "0 0 40px rgba(229,229,229,0.25)" },
        },
      },
      boxShadow: {
        "card":   "0 0 0 1px rgba(255,255,255,0.06), 0 8px 32px rgba(0,0,0,0.4)",
        "card-hover": "0 0 0 1px rgba(255,255,255,0.12), 0 16px 48px rgba(0,0,0,0.6)",
        "glow-sm": "0 0 24px rgba(229,229,229,0.12)",
        "glow-md": "0 0 48px rgba(229,229,229,0.18)",
      },
      backdropBlur: {
        xs: "2px",
      },
    },
  },
  plugins: [],
};
export default config;