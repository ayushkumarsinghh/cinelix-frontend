/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        inter: ['Inter', 'sans-serif'],
        outfit: ['Outfit', 'sans-serif'],
        jakarta: ['"Plus Jakarta Sans"', 'sans-serif'],
        instrument: ['"Instrument Serif"', 'serif'],
        cinematic: ['"Playfair Display"', 'serif'],
      },
      colors: {
        primary: {
          DEFAULT: '#E50914',
          hover: '#C10712',
        },
        accent: {
          DEFAULT: '#D4AF37', // Premium Gold
          dark: '#070b0a'
        },
        surface: {
          DEFAULT: '#141414',
          alt: '#1F1F1F',
        }
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out forwards',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        }
      }
    },
  },
  plugins: [],
}
