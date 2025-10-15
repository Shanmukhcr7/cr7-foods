/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
    colors: {
      primary: '#cb202d', // Swiggy orange/red
      secondary: '#fc8019', // Swiggy orange
      accent: '#60b246', // Green accent
      dark: '#1c1c1c',
      light: '#f5f5f5',
    },
      fontFamily: {
        'poppins': ['Poppins', 'Arial', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 1s ease-out forwards',
        'slide-up': 'slideUp 0.8s ease-out forwards',
        'bounce-in': 'bounceIn 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55) forwards',
      },
      keyframes: {
        fadeIn: {
          'from': { opacity: '0', transform: 'translateY(30px)' },
          'to': { opacity: '1', transform: 'translateY(0)' },
        },
        slideUp: {
          'from': { opacity: '0', transform: 'translateY(50px)' },
          'to': { opacity: '1', transform: 'translateY(0)' },
        },
        bounceIn: {
          '0%, 20%, 50%, 80%, 100%': {
            transform: 'translate3d(0,0,0)',
          },
          '40%': {
            transform: 'translate3d(0, -30px, 0)',
          },
          '70%': {
            transform: 'translate3d(0, -15px, 0)',
          },
        },
      },
    },
  },
  plugins: [],
}
