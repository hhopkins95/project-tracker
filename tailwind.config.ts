import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Custom colors for project tracker
        initiative: {
          active: "#10b981",    // emerald-500
          backlog: "#6366f1",   // indigo-500
          completed: "#6b7280", // gray-500
        },
        todo: "#f59e0b",        // amber-500
        idea: "#8b5cf6",        // violet-500
      },
    },
  },
  plugins: [],
};

export default config;
