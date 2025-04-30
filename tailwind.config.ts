/** @type {import('tailwindcss').Config} */
module.exports = {
    darkMode: ['class'],
    content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'luma-red': '#f27676',
        'luma-blue': '#7195e8',
        'luma-light-green': '#d7f4e9',
        'luma-dark-green': '#70c8a3',
      },
    },
  },
  plugins: [],
};
