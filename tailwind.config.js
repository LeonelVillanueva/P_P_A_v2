/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
  // Utilidades de accesibilidad
  corePlugins: {
    // Asegurar que sr-only esté disponible
  }
}

