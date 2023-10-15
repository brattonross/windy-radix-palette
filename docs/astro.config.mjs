import { defineConfig } from "astro/config";
import mdx from "@astrojs/mdx";
import tailwind from "@astrojs/tailwind";
import vercel from "@astrojs/vercel/serverless";

export default defineConfig({
	site: "https://windy-radix-palette.vercel.app",
	integrations: [
		mdx(),
		tailwind({
			applyBaseStyles: false,
		}),
	],
	output: "server",
	adapter: vercel(),
});
