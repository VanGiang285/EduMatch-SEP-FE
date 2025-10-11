import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        teal: {
          DEFAULT: '#257180',
          50: '#f0f9fa',
          100: '#ccf2f5',
          200: '#99e5eb',
          300: '#66d8e1',
          400: '#33cbd7',
          500: '#257180',
          600: '#1e5a66',
          700: '#17434c',
          800: '#102c33',
          900: '#091519',
        },
        cream: {
          DEFAULT: '#F2E5BF',
          50: '#fdfbf5',
          100: '#faf5e6',
          200: '#f5ebcd',
          300: '#f0e1b4',
          400: '#ebd79b',
          500: '#F2E5BF',
          600: '#c2b899',
          700: '#928b73',
          800: '#625e4d',
          900: '#323127',
        },
        orange: {
          DEFAULT: '#FD8B51',
          50: '#fff5f0',
          100: '#ffebe0',
          200: '#ffd7c1',
          300: '#ffc3a2',
          400: '#ffaf83',
          500: '#FD8B51',
          600: '#ca6f41',
          700: '#975331',
          800: '#643721',
          900: '#321b11',
        },
        terracotta: {
          DEFAULT: '#CB6040',
          50: '#f9f2f0',
          100: '#f3e5e1',
          200: '#e7cbc3',
          300: '#dbb1a5',
          400: '#cf9787',
          500: '#CB6040',
          600: '#a24d33',
          700: '#793a26',
          800: '#502719',
          900: '#27140d',
        },
      },
    },
  },
  plugins: [],
};

export default config;
