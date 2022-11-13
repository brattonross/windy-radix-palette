/** @type {import('tailwindcss').Config} */
module.exports = {
	content: ["./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}"],
	darkMode: "class",
	plugins: [
		require("windy-radix-palette"),
		require("@tailwindcss/typography"),
		require("windy-radix-typography"),
	],
};
