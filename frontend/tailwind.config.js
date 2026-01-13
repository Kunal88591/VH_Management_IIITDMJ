/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#0F2027',
          light: '#203A43',
          dark: '#0a1519',
        },
        secondary: {
          DEFAULT: '#2C5364',
          light: '#3d6b7d',
          dark: '#1e3a45',
        },
        accent: {
          DEFAULT: '#C9A227',
          light: '#d4b44a',
          dark: '#a8871f',
        },
        slate: {
          primary: '#1F2933',
          secondary: '#6B7280',
        }
      },
      fontFamily: {
        poppins: ['Poppins', 'sans-serif'],
        inter: ['Inter', 'sans-serif'],
      },
      backgroundImage: {
        'gradient-primary': 'linear-gradient(135deg, #0F2027, #203A43, #2C5364)',
        'gradient-hero': 'linear-gradient(135deg, rgba(15,32,39,0.9), rgba(32,58,67,0.9), rgba(44,83,100,0.9))',
      },
      boxShadow: {
        'card': '0 10px 25px rgba(0,0,0,0.06)',
        'card-hover': '0 15px 35px rgba(0,0,0,0.1)',
      }
    },
  },
  plugins: [],
}
