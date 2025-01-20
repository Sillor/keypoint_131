import type { Config } from "tailwindcss";

export default {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        'dark-green': '#264653',
        'light-green': '#2A9D8F',
        'yellow': '#E9C46A',
        'light-orange': '#F4A261',
        'dark-orange': '#E76F51',
        'light-gray': '#F7F7F8',
      },
    },
  },
  plugins: [],
} satisfies Config;
