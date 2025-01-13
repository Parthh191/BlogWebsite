/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      keyframes: {
        glow: {
          '0%': {
            textShadow: '0 0 5px #fff, 0 0 10px #6a11cb, 0 0 20px #2575fc'
          },
          '100%': {
            textShadow: '0 0 10px #fff, 0 0 20px #6a11cb, 0 0 30px #2575fc'
          }
        },
        'glow-bw': {
          '0%': {
            textShadow: '0 0 5px #fff, 0 0 10px #fff, 0 0 15px #fff'
          },
          '100%': {
            textShadow: '0 0 10px #fff, 0 0 20px #fff, 0 0 30px #fff'
          }
        },
        'gradient-x': {
          '0%, 100%': {
            'background-size': '200% 200%',
            'background-position': 'left center'
          },
          '50%': {
            'background-size': '200% 200%',
            'background-position': 'right center'
          }
        }
      },
      animation: {
        glow: 'glow 2.5s infinite alternate',
        'glow-bw': 'glow-bw 2.5s infinite alternate',
        'gradient-x': 'gradient-x 15s ease infinite'
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
      }
    }
  },
  plugins: [],
}