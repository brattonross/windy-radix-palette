/** @type {import('tailwindcss').Config} */
module.exports = {
  presets: [require('windy-radix-palette')],
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {},
  },
  plugins: [],
};
