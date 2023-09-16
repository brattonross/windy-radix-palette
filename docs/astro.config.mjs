import { defineConfig } from "astro/config";
import starlight from "@astrojs/starlight";
import tailwind from "@astrojs/tailwind";

export default defineConfig({
	site: "https://windy-radix-palette.vercel.app",
	integrations: [
		starlight({
			title: "windy-radix-palette",
			customCss: ["./src/tailwind.css"],
			sidebar: [
				{
					label: "Palette",
					items: [
						{
							label: "Getting started",
							link: "/palette/getting-started",
						},
						{
							label: "Aliasing",
							link: "/palette/aliasing",
						},
						{
							label: "Options",
							link: "/palette/options",
						},
					],
				},
				{
					label: "Typography",
					items: [
						{
							label: "Getting started",
							link: "/typography/getting-started",
						},
					],
				},
			],
		}),
		tailwind({
			applyBaseStyles: false,
		}),
	],
});
