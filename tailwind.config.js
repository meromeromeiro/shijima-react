// tailwind.config.js
/** @type {import('tailwindcss').Config} */
export default {
    content: [
      "./index.html",
      "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
      extend: {
        colors: {
          'shijima-bg': '#ffffee', // #ffe
          'shijima-text': '#800000',
          'shijima-red-light': '#cc0000', // #c00
          'shijima-accent': '#eeaa88', // #ea8
          'shijima-title': '#cc1105',
          'shijima-name': '#117743',
          'shijima-link': '#0077dd',
          'shijima-link-hover': '#005599',
          'shijima-ivory': 'ivory', // For header links
          'shijima-dark-gray': '#333333', // For tooltips, offcanvas
          'shijima-medium-gray': '#777777',
          'shijima-light-gray': '#eeeeee',
          'shijima-reply-bg': '#f0e0d6',
          'shijima-blue-accent': '#3399ff', // For hr
        }
      },
    },
    plugins: [],
  }