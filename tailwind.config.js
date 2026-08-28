/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        heading: ['Montserrat', 'system-ui', 'sans-serif'],
        body: ['Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        navy: '#00458c',
        gold: '#ffb700',
        'gold-dark': '#9a6e00',
        dark: '#0b1026',
      },
    },
  },
  plugins: [],
}
