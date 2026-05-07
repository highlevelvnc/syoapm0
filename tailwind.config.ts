import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: {
          950: "#06080a",
          900: "#0a0e13",
          800: "#131820",
          700: "#1c2330",
          600: "#2a3340",
          500: "#4a5462",
          400: "#6b7588",
          300: "#99a3b5",
          200: "#c9d0db",
          100: "#e6eaf0",
          50:  "#f5f7fa",
        },
        matrix: {
          50:  "#ecfdf5",
          100: "#d1fae5",
          200: "#a7f3d0",
          300: "#6ee7b7",
          400: "#34d399",
          500: "#10b981",
          600: "#059669",
          700: "#047857",
          800: "#065f46",
          900: "#1a2f29",
        },
        warning: "#f59e0b",
        danger: "#ef4444",
        info: "#06b6d4",
      },
      fontFamily: {
        mono: ["var(--font-mono)", "ui-monospace", "SFMono-Regular", "monospace"],
        display: ["var(--font-mono)", "ui-monospace", "monospace"],
      },
      animation: {
        blink: "blink 1s step-end infinite",
        scan: "scan 12s linear infinite",
        glitch: "glitch 0.3s ease-in-out infinite",
        boot: "boot 0.4s ease-out forwards",
      },
      keyframes: {
        blink: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0" },
        },
        scan: {
          "0%": { transform: "translateY(-100%)" },
          "100%": { transform: "translateY(100vh)" },
        },
        glitch: {
          "0%, 100%": { transform: "translate(0)" },
          "20%": { transform: "translate(-1px, 1px)" },
          "40%": { transform: "translate(1px, -1px)" },
          "60%": { transform: "translate(-1px, -1px)" },
          "80%": { transform: "translate(1px, 1px)" },
        },
        boot: {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      boxShadow: {
        matrix: "0 0 0 1px rgba(16, 185, 129, 0.15), 0 0 12px rgba(16, 185, 129, 0.12)",
        "matrix-lg": "0 0 0 1px rgba(16, 185, 129, 0.25), 0 0 24px rgba(16, 185, 129, 0.15)",
        card: "0 1px 3px rgba(0, 0, 0, 0.4), 0 4px 12px rgba(0, 0, 0, 0.2)",
      },
    },
  },
  plugins: [],
};

export default config;
