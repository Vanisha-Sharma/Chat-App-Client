/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}", // ✅ ensures all components are scanned
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
