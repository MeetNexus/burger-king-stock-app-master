module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'bk-red': '#eee9da',
        'bk-yellow': '#FFC72C',
        'bk-brown': '#522D24',
        'bk-beige': '#F5E1A4',
        'bk-white': '#FFFFFF',
      },
      fontFamily: {
        flame: ['Flame', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
