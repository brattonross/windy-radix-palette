import * as radix from "@radix-ui/colors";
import plugin from "tailwindcss/plugin";

export type PluginOptions = {
	colors?: typeof radix;
	rootSelector?: string;
};

const wrpPlugin = plugin.withOptions<PluginOptions>(
	({ colors = radix, rootSelector = ":root" } = {}) => {
		const lightColors: Record<string, string> = {};
		const darkColors: Record<string, string> = {};

		for (const [colorName, steps] of Object.entries(colors)) {
			const map = colorName.includes("Dark") ? darkColors : lightColors;
			for (const [key, value] of Object.entries(steps)) {
				const color = key.includes("A") ? value : hexToRGBChannels(value);
				map[`--${key}`] = color;
			}
		}

		return ({ addBase, config }) => {
			const [darkMode, className = ".dark"] = [config("darkMode", "media")];

			if (darkMode === "class") {
				addBase({
					[rootSelector]: lightColors,
					[className]: darkColors,
				});
			} else {
				addBase({
					[rootSelector]: lightColors,
					"@media (prefers-color-scheme: dark)": {
						[rootSelector]: darkColors,
					},
				});
			}
		};
	},
	({ colors = radix } = {}) => {
		const themeColors: Record<string, Record<string, string>> = {};

		for (const [colorName, colorObj] of Object.entries(colors)) {
			if (colorName.includes("Dark")) {
				continue;
			}

			const themeColor: Record<string, string> = {};
			for (const key of Object.keys(colorObj)) {
				const scale = key.replace(colorName, "");
				if (key.includes("A")) {
					themeColor[scale] = `var(--${colorName}${scale})`;
				} else {
					themeColor[
						scale
					] = `rgb(var(--${colorName}${scale}) / <alpha-value>)`;
				}
			}

			themeColors[colorName] = themeColor;
		}

		return {
			theme: {
				extend: {
					colors: themeColors,
				},
			},
		};
	},
);

function hexToRGBChannels(hex: string): string {
	const r = hex.substring(1, 3);
	const g = hex.substring(3, 5);
	const b = hex.substring(5, 7);
	return `${parseInt(r, 16)} ${parseInt(g, 16)} ${parseInt(b, 16)}`;
}

const steps = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12] as const;

export type NumberOrString<T extends number> = T | `${T}`;
export type RadixStep = NumberOrString<typeof steps[number]>;
export type LooseRadixColor = keyof typeof radix | (string & {});

export function alias(color: LooseRadixColor): Record<string, string>;
export function alias(color: LooseRadixColor, step: RadixStep): string;
export function alias(
	color: LooseRadixColor,
	step?: RadixStep,
): string | Record<string, string> {
	if (step) {
		return `rgb(var(--${color}${step}) / <alpha-value>)`;
	}

	const out: Record<string, string> = {};
	for (let i = 0; i < steps.length; i++) {
		out[steps[i]] = `rgb(var(--${color}${steps[i]}) / <alpha-value>)`;
	}
	return out;
}

export default wrpPlugin;
