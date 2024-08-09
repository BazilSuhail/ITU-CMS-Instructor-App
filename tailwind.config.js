/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./App.{js,jsx,ts,tsx}", "./AppNavigator.{js,jsx,ts,tsx}", "./Components/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        'custom-back-grey':'#6d5700e7', 
        'custom-blue': '#001433',
        'custom-card-blue': '#012459',
      },

    },
  },
  plugins: [],
}

