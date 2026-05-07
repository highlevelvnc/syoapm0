import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: {
          950: "#05080A",
          900: "#0A0E0A",
          800: "#0E1410",
          700: "#141A14",
          600: "#1A221A",
        },
        matrix: {
          50: "#E6FFEC",
          100: "#B6FFCB",
          200: "#7AFFA0",
          300: "#3FFF77",
          400: "#22FF55",
          500: "#00FF41",
          600: "#00CC34",
          700: "#009925",
          800: "#006619",
          900: "#00330C",
        },
        warning: "#FFB300",
        danger: "#FF3344",
      },
      fontFamily: {
        mono: ["var(--font-mono)", "ui-monospace", "SFMono-Regular", "monospace"],
        display: ["var(--font-mono)", "ui-monospace", "monospace"],
      },
      animation: {
        "blink": "blink 1s step-end infinite",
        "scan": "scan 8s linear infinite",
        "glitch": "glitch 0.3s ease-in-out infinite",
        "boot": "boot 0.4s ease-out forwards",
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
        "matrix": "0 0 20px rgba(0, 255, 65, 0.3)",
        "matrix-lg": "0 0 40px rgba(0, 255, 65, 0.4)",
      },
    },
  },
  plugins: [],
};

export default config;
