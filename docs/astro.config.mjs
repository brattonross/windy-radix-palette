import { defineConfig } from "astro/config";
import tailwind from "@astrojs/tailwind";

export default defineConfig({
	site: "https://windy-radix-palette.vercel.app",
	integrations: [
		tailwind({
			applyBaseStyles: false,
		}),
	],
});
