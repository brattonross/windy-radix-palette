import * as colors from "@radix-ui/colors";
import type { Config } from "tailwindcss";

const colorNames = Object.keys(colors).filter(
	(color) => !color.includes("Dark"),
);

export const preset = {
	content: [],
	theme: {
		extend: {
			typography: ({ theme }: { theme: (key: string) => string }) => {
				const config: Record<string, { css: Record<string, string> }> =
					{};
				for (let i = 0; i < colorNames.length; i++) {
					const color = colorNames[i];
					config[color] = {
						css: {
							"--tw-prose-body": theme(`colors.${color}.12`),
							"--tw-prose-headings": theme(`colors.${color}.12`),
							"--tw-prose-lead": theme(`colors.${color}.11`),
							"--tw-prose-links": theme(`colors.${color}.12`),
							"--tw-prose-bold": theme(`colors.${color}.12`),
							"--tw-prose-counters": theme(`colors.${color}.10`),
							"--tw-prose-bullets": theme(`colors.${color}.8`),
							"--tw-prose-hr": theme(`colors.${color}.6`),
							"--tw-prose-quotes": theme(`colors.${color}.11`),
							"--tw-prose-quote-borders": theme(
								`colors.${color}.6`,
							),
							"--tw-prose-captions": theme(`colors.${color}.11`),
							"--tw-prose-code": theme(`colors.${color}.12`),
							"--tw-prose-pre-code": theme(`colors.${color}.12`),
							"--tw-prose-pre-bg": theme(`colors.${color}.2`),
							"--tw-prose-th-borders": theme(`colors.${color}.6`),
							"--tw-prose-td-borders": theme(`colors.${color}.6`),
							"--tw-prose-invert-body": theme(
								`colors.${color}.12`,
							),
							"--tw-prose-invert-headings": theme(
								`colors.${color}.12`,
							),
							"--tw-prose-invert-lead": theme(
								`colors.${color}.11`,
							),
							"--tw-prose-invert-links": theme(
								`colors.${color}.12`,
							),
							"--tw-prose-invert-bold": theme(
								`colors.${color}.12`,
							),
							"--tw-prose-invert-counters": theme(
								`colors.${color}.10`,
							),
							"--tw-prose-invert-bullets": theme(
								`colors.${color}.8`,
							),
							"--tw-prose-invert-hr": theme(`colors.${color}.6`),
							"--tw-prose-invert-quotes": theme(
								`colors.${color}.11`,
							),
							"--tw-prose-invert-quote-borders": theme(
								`colors.${color}.6`,
							),
							"--tw-prose-invert-captions": theme(
								`colors.${color}.11`,
							),
							"--tw-prose-invert-code": theme(
								`colors.${color}.12`,
							),
							"--tw-prose-invert-pre-code": theme(
								`colors.${color}.12`,
							),
							"--tw-prose-invert-pre-bg": theme(
								`colors.${color}.2`,
							),
							"--tw-prose-invert-th-borders": theme(
								`colors.${color}.6`,
							),
							"--tw-prose-invert-td-borders": theme(
								`colors.${color}.6`,
							),
						},
					};
				}
				return config;
			},
		},
	},
} satisfies Config;

export default preset;
