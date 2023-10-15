import { defineConfig } from "astro/config";
import mdx from "@astrojs/mdx";
import nodejs from "@astrojs/node";
import tailwind from "@astrojs/tailwind";

export default defineConfig({
	site: "https://windy-radix-palette.vercel.app",
	integrations: [
		mdx(),
		tailwind({
			applyBaseStyles: false,
		}),
	],
	output: "server",
	adapter: nodejs({
		mode: "standalone",
	}),
});
