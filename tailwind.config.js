/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      // Add custom theme settings here ONLY if truly necessary
      // and not achievable with standard Tailwind or JIT.
      // For example, if you absolutely need a very specific color
      // not in Tailwind's palette that's used repeatedly.
      // colors: {
      //   'brand-blue': '#007bff',
      // }
    },
  },
  plugins: [],
}