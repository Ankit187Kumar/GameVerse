/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          light: '#c084fc', // purple-400
          DEFAULT: '#a855f7', // purple-500
          dark: '#7e22ce', // purple-700
          pink: '#ec4899', // pink-500
          blue: '#3b82f6', // blue-500
        }
      },
      aspectRatio: {
        'portrait': '9/16',
      }
    },
  },
  plugins: [],
}
