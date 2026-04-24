/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}", // important
  ],
  theme: {
    extend: {
      colors: {
        espresso: {
          DEFAULT: '#2c1810',
          light:   '#4a2c20',
        },
        cream: {
          50:  '#fdfaf5',
          100: '#f5ede0',
          200: '#e8d5b7',
        },
        gold: {
          DEFAULT: '#c9a84c',
          dark:    '#a8893a',
        },
      },
    },
  },
  plugins: [],
}