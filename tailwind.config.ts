import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        // Primary Colors
        oxford: {
          DEFAULT: "#002147",
          light: "#003366",
        },
        gold: {
          DEFAULT: "#CFB53B",
          light: "#E8D48A",
        },
        // Neutrals
        cream: "#FAF9F6",
        "blue-light": "#EEF4FF",
        silver: "#8A9AA9",
        border: "#E8E8E8",
        // Semantic
        success: "#22C55E",
        star: "#F59E0B",
        error: "#EF4444",
        info: "#3B82F6",
      },
      fontFamily: {
        sans: ["Inter", "Tajawal", "system-ui", "sans-serif"],
        inter: ["Inter", "system-ui", "sans-serif"],
        tajawal: ["Tajawal", "system-ui", "sans-serif"],
      },
      backgroundImage: {
        "gradient-oxford": "linear-gradient(135deg, #002147, #003366)",
        "gradient-gold": "linear-gradient(135deg, #CFB53B, #E8D48A)",
        "gradient-purple": "linear-gradient(135deg, #667EEA, #764BA2)",
        "gradient-pink": "linear-gradient(135deg, #F093FB, #F5576C)",
        "gradient-cyan": "linear-gradient(135deg, #4FACFE, #00F2FE)",
        "gradient-green": "linear-gradient(135deg, #43E97B, #38F9D7)",
        "gradient-dark": "linear-gradient(135deg, #1A1A2E, #16213E)",
      },
    },
  },
  plugins: [],
};

export default config;
