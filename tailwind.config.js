/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      // You can add custom theme settings here if needed
      colors: {
        'h-navbar-bg': '#f8f8f8', // Example, adjust to match UI Kit's default
        'h-navbar-border': '#e7e7e7',
        'h-link': '#007bff', // A generic link color
        'h-text-secondary': '#707070',
        'h-badge-warning-bg': '#f0ad4e', // approx uk-badge-warning
        'h-badge-warning-text': '#fff',
      }
    },
  },
  plugins: [],
}