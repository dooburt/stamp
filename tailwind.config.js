/* eslint-disable global-require */
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{html,js,ts,tsx}'],
  theme: {
    fontFamily: {
      mono: ['Red Hat Mono', 'SFMono-Regular'],
    },
    extend: {
      keyframes: {
        wiggle: {
          '0%, 100%': {
            transform: 'rotate(-3deg)',
          },
          '50%': {
            transform: 'rotate(3deg)',
          },
        },
      },
      animation: {
        wiggle: 'wiggle 0.2s ease-in-out',
      },
      spacing: {
        128: '28rem',
      },
    },
  },
  plugins: [require('tailwind-scrollbar')],
};
