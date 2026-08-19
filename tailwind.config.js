// tailwind.config.js
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#3d2b1f',
        secondary: '#8b7355',
        accent: '#d4c4b0',
        'dark-brown': '#2c2420',
        'light-brown': '#6b5b4f',
        'bg-gray': '#f5f5f5',
        'bg-dark': '#1a1614',
      },
      fontFamily: {
        serif: ['Playfair Display', 'Georgia', 'serif'],
        sans: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
