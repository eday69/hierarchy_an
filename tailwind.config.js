/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './public/**/*.html',
    './src/**/*.{js,jsx,ts,tsx,vue}',
  ],
  theme: {
    extend: {},
  },
  safelist: [
    {
      pattern: /bg-(gray|stone|red|amber|yellow|lime|green|orange|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose|zinc)-(50|100|200)/,
      variants: ['group-hover'],
    }
  ],
  plugins: [require('tailwindcss-animated')],
}
