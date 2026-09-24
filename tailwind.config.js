/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        heading: ['Newsreader', 'Georgia', 'serif'],
        body: ['"Libre Franklin"', 'system-ui', 'sans-serif'],
      },
      colors: {
        cream: '#faf8f3',
        paper: '#f3f4f6',
        navy: '#00458c',
        'navy-deep': '#062B57',
        gold: '#f2b600',
        'gold-dark': '#8a6400',
        dark: '#071B33',
        ink: '#101E30',
        line: '#e5e9ef',
        muted: '#5b6b7d',
        faint: '#8b98a8',
      },
      borderRadius: {
        DEFAULT: '6px',
        md: '8px',
        lg: '10px',
        xl: '12px',
      },
      letterSpacing: {
        caps: '0.12em',
      },
    },
  },
  plugins: [],
}
