import starlight from "@astrojs/starlight-tailwind";
import { createPlugin } from "windy-radix-palette";

const radix = createPlugin();

/** @type {import('tailwindcss').Config} */
export default {
	content: ["./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}"],
	darkMode: "class",
	theme: {
		extend: {
			colors: {
				"hi-contrast": radix.alias("mauve", 12),
				"lo-contrast": radix.alias("mauve", 11),
				neutral: radix.alias("mauve"),
			},
		},
	},
	safelist: [
		{
			pattern:
				/bg-(gray|mauve|slate|sage|olive|sand|tomato|red|ruby|crimson|pink|plum|purple|violet|iris|indigo|blue|cyan|teal|jade|green|grass|bronze|gold|brown|orange|amber|yellow|lime|mint|sky)-(1|2|3|4|5|6|7|8|9|10|11|12)/,
		},
	],
	plugins: [
		radix.plugin,
		require("@tailwindcss/typography"),
		require("windy-radix-typography"),
		starlight(),
	],
};
