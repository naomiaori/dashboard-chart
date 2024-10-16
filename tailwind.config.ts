/* eslint-disable global-require */
import { Config } from "tailwindcss";

const tailwindConfig = {
  darkMode: "class",
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    screens: {
      desktop: { max: "1440px" },
      tablet: { max: "1280px" },
      mobile: { max: "720px" },
    },
    extend: {
      fontFamily: {
        sans: ["var(--font-outfit)"],
        mono: ["var(--font-fira-mono)"],
      },
      colors: {
        current: "currentColor",
        transparent: "transparent",
        default: "rgb(var(--colors-default) / <alpha-value>)",
        overlay: "rgba(0, 0, 0, 0.34)",
        background: "rgb(var(--colors-background) / <alpha-value>)",
        red: {
          100: "rgb(var(--colors-red-100) / <alpha-value>)",
          200: "rgb(var(--colors-red-200) / <alpha-value>)",
        },
        green: {
          100: "rgb(var(--colors-green-100) / <alpha-value>)",
          200: "rgb(var(--colors-green-200) / <alpha-value>)",
          300: "rgb(var(--colors-green-300) / <alpha-value>)",
        },
        yellow: "rgb(var(--colors-yellow) / <alpha-value>)",
        blue: "rgb(var(--colors-blue) / <alpha-value>)",
        black: "rgb(var(--colors-black) / <alpha-value>)",
        gray: {
          100: "rgb(var(--colors-gray-100) / <alpha-value>)",
          200: "rgb(var(--colors-gray-200) / <alpha-value>)",
          300: "rgb(var(--colors-gray-300) / <alpha-value>)",
          400: "rgb(var(--colors-gray-400) / <alpha-value>)",
          500: "rgb(var(--colors-gray-500) / <alpha-value>)",
          600: "rgb(var(--colors-gray-600) / <alpha-value>)",
          700: "rgb(var(--colors-gray-700) / <alpha-value>)",
          800: "rgb(var(--colors-gray-800) / <alpha-value>)",
          900: "rgb(var(--colors-gray-900) / <alpha-value>)",
          1000: "rgb(var(--colors-gray-1000) / <alpha-value>)",
          1100: "rgb(var(--colors-gray-1100) / <alpha-value>)",
          1200: "rgb(var(--colors-gray-1200) / <alpha-value>)",
          1300: "rgb(var(--colors-gray-1300) / <alpha-value>)",
        },
      },
      backgroundImage: {
        "custom-gradient": "linear-gradient(92deg, #fff21 1.07%, #000136 75%)",
      },
      fontSize: {
        xxxs: ["9px", "150%"],
        xxs: ["11px", "150%"],
        xs: ["12px", "150%"],
        sm: ["14px", "150%"],
        base: ["16px", "150%"],
        lg: ["18px", "150%"],
        xl: ["20px", "150%"],
        "2xl": ["24px", "150%"],
        "3xl": ["30px", "150%"],
        "4xl": ["36px", "150%"],
      },
      zIndex: {
        menu: "200",
        topModal: "150",
        alert: "100",
        modal: "100",
        select: "90",
      },
      boxShadow: {
        custom: "0px 0px 8px 5px rgba(0, 0, 0, 0.25)",
      },
      opacity: {
        79: "0.79",
      },
    },
  },
  plugins: [
    require("@tailwindcss/typography"),
    require("tailwind-scrollbar")({ nocompatible: true }),
    require("tailwind-scrollbar-hide"),
  ],
} satisfies Config;

export default tailwindConfig;
