import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./hooks/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        pilot: {
          navy: "#020617",
          card: "#0f172a",
          cyan: "#22d3ee"
        }
      }
    }
  }
};

export default config;
