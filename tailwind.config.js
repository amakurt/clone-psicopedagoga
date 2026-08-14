/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: 'rgba(var(--primary-rgb), <alpha-value>)',
          dark: 'rgba(var(--primary-dark-rgb), <alpha-value>)',
          light: 'rgba(var(--primary-light-rgb), <alpha-value>)',
        },
        'on-primary': 'rgba(var(--on-primary-rgb), <alpha-value>)',
      },
      borderRadius: {
        '2xl': '1rem',
      }
    },
  },
  plugins: [],
}
