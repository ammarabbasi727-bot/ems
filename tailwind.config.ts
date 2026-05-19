import type { Config } from "tailwindcss";

export default {
  darkMode: "class",
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: "#070716",
        panel: "rgba(255,255,255,0.04)",
        border: "rgba(255,255,255,0.08)",
        neon: { cyan: "#22d3ee", violet: "#a78bfa", pink: "#f472b6", lime: "#a3e635" },
      },
      boxShadow: {
        glow: "0 0 30px rgba(167,139,250,.35), 0 0 60px rgba(34,211,238,.25)",
        soft: "0 10px 40px -10px rgba(0,0,0,.6)",
      },
      backgroundImage: {
        "grid-fade":
          "radial-gradient(ellipse at top, rgba(167,139,250,.18), transparent 60%), radial-gradient(ellipse at bottom, rgba(34,211,238,.12), transparent 60%)",
      },
      animation: {
        "gradient-x": "gradient-x 8s ease infinite",
        float: "float 6s ease-in-out infinite",
      },
      keyframes: {
        "gradient-x": {
          "0%,100%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
        },
        float: { "0%,100%": { transform: "translateY(0)" }, "50%": { transform: "translateY(-6px)" } },
      },
    },
  },
  plugins: [],
} satisfies Config;
