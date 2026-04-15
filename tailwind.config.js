/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        surface: {
          DEFAULT: "#f9fafb",
          muted: "#f3f4f6",
        },
        elevated: "#ffffff",
        "border-subtle": "#e5e7eb",
        "border-strong": "#d1d5db",
        accent: {
          DEFAULT: "#9333ea",
          foreground: "#ffffff",
          muted: "#faf5ff",
          subtle: "#e9d5ff",
          border: "#d8b4fe",
          ring: "#a855f7",
          hover: "#7e22ce",
        },
        danger: {
          DEFAULT: "#dc2626",
          muted: "#fef2f2",
        },
        ink: {
          DEFAULT: "#1f2937",
          muted: "#4b5563",
          subtle: "#9ca3af",
        },
      },
      borderRadius: {
        card: "0.75rem",
        "card-lg": "1rem",
      },
      boxShadow: {
        card: "0 4px 6px -1px rgb(0 0 0 / 0.07), 0 2px 4px -2px rgb(0 0 0 / 0.05)",
        "card-lg":
          "0 10px 15px -3px rgb(0 0 0 / 0.08), 0 4px 6px -4px rgb(0 0 0 / 0.05)",
      },
      fontFamily: {
        display: ['"DM Sans"', "ui-sans-serif", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
  corePlugins: {},
}
