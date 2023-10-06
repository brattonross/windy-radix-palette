import * as radix from "@radix-ui/colors";
import plugin from "tailwindcss/plugin";

export type PluginOptions = {
	/**
	 * Radix Colors that should have Tailwind classes generated.
	 */
	colors?: Partial<typeof radix>;
	/**
	 * Generates Tailwind configuration that supports use with the opacity modifier.
	 *
	 * **Note:** Enabling this option will mean that P3 colors cannot be automatically
	 * supported when support is detected, and you will instead need to manually add
	 * classes for them to your markup.
	 * @see https://tailwindcss.com/docs/background-color#changing-the-opacity
	 * @default false
	 */
	opacitySupport?: boolean;
	/**
	 * The root selector to use for the generated CSS variables.
	 * @default ":root"
	 */
	rootSelector?: string;
};

const wrpPlugin = plugin.withOptions<PluginOptions>(
	({
		colors = radix,
		opacitySupport = false,
		rootSelector = ":root",
	} = {}) => {
		const baseStyles = generateBaseStyles({ colors, opacitySupport });
		return ({ addBase, config }) => {
			const [darkMode, className = ".dark"] = [
				config("darkMode", "media"),
			];

			if (darkMode === "class") {
				addBase({
					[rootSelector]: baseStyles.light,
					[className]: baseStyles.dark,
					"@supports (color: color(display-p3 1 1 1))": {
						"@media (color-gamut: p3)": {
							[rootSelector]: baseStyles.lightP3,
							[className]: baseStyles.darkP3,
						},
					},
				});
			} else {
				addBase({
					[rootSelector]: baseStyles.light,
					"@media (prefers-color-scheme: dark)": {
						[rootSelector]: baseStyles.dark,
					},
					"@supports (color: color(display-p3 1 1 1))": {
						"@media (color-gamut: p3)": {
							[rootSelector]: baseStyles.lightP3,
							"@media (prefers-color-scheme: dark)": {
								[rootSelector]: baseStyles.darkP3,
							},
						},
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
				} else if (colorName.includes("P3")) {
					themeColor[scale] = `var(--${colorName.replace(
						"P3",
						"",
					)}${scale})`;
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
export type RadixStep = NumberOrString<(typeof steps)[number]>;
export type LooseRadixColor = keyof typeof radix | (string & {});

export function alias(color: LooseRadixColor): Record<string, string>;
export function alias(color: LooseRadixColor, step: RadixStep): string;
export function alias(
	color: LooseRadixColor,
	step?: RadixStep,
): string | Record<string, string> {
	if (color.includes("A")) {
		if (step) {
			return `var(--${color}${step})`;
		} else {
			const out: Record<string, string> = {};
			for (let i = 0; i < steps.length; i++) {
				out[steps[i]] = `var(--${color}${steps[i]})`;
			}
			return out;
		}
	} else if (color.includes("P3")) {
		const colorName = color.replace("P3", "");
		if (step) {
			return `var(--${colorName}${step})`;
		} else {
			const out: Record<string, string> = {};
			for (let i = 0; i < steps.length; i++) {
				out[steps[i]] = `var(--${colorName}${steps[i]})`;
			}
			return out;
		}
	} else if (step) {
		return `rgb(var(--${color}${step}) / <alpha-value>)`;
	} else {
		const out: Record<string, string> = {};
		for (let i = 0; i < steps.length; i++) {
			out[steps[i]] = `rgb(var(--${color}${steps[i]}) / <alpha-value>)`;
		}
		return out;
	}
}

function generateBaseStyles(options: {
	colors: Partial<typeof radix>;
	opacitySupport: boolean;
}): {
	light: Record<string, string>;
	dark: Record<string, string>;
	lightP3: Record<string, string>;
	darkP3: Record<string, string>;
} {
	const mappings: Record<
		"light" | "dark" | "lightP3" | "darkP3",
		Record<string, string>
	> = {
		light: {},
		dark: {},
		lightP3: {},
		darkP3: {},
	};

	for (const [colorName, steps] of Object.entries(options.colors)) {
		let map = mappings.light;
		if (colorName.includes("P3")) {
			map = colorName.includes("Dark")
				? mappings.darkP3
				: mappings.lightP3;
		} else if (colorName.includes("Dark")) {
			map = mappings.dark;
		}

		for (const [key, value] of Object.entries(steps)) {
			let color = value;
			if (options.opacitySupport && !key.includes("A")) {
				if (colorName.includes("P3")) {
					color = value.replace(")", " / <alpha-value>)");
				} else {
					color = `rgb(${hexToRGBChannels(value)} / <alpha-value>)`;
				}
			}

			let varName = key;
			// When opacity support is enabled, P3 colors will have "P3" in the name,
			// in order to avoid conflicts with the non-P3 colors.
			if (options.opacitySupport && colorName.includes("P3")) {
				const normalizedColorName = colorName.replace("Dark", "");
				varName = `${normalizedColorName}${key.slice(
					normalizedColorName.length - "P3".length,
				)}`;
			}

			map[`--${varName}`] = color;
		}
	}

	return mappings;
}

if (import.meta.vitest) {
	const { describe, test, expect } = import.meta.vitest;

	const testColors = {
		gray: {
			gray1: "#fcfcfc",
			gray2: "#f9f9f9",
			gray3: "#f0f0f0",
			gray4: "#e8e8e8",
			gray5: "#e0e0e0",
			gray6: "#d9d9d9",
			gray7: "#cecece",
			gray8: "#bbbbbb",
			gray9: "#8d8d8d",
			gray10: "#838383",
			gray11: "#646464",
			gray12: "#202020",
		},
		grayA: {
			grayA1: "#00000003",
			grayA2: "#00000006",
			grayA3: "#0000000f",
			grayA4: "#00000017",
			grayA5: "#0000001f",
			grayA6: "#00000026",
			grayA7: "#00000031",
			grayA8: "#00000044",
			grayA9: "#00000072",
			grayA10: "#0000007c",
			grayA11: "#0000009b",
			grayA12: "#000000df",
		},
		grayP3: {
			gray1: "color(display-p3 0.988 0.988 0.988)",
			gray2: "color(display-p3 0.975 0.975 0.975)",
			gray3: "color(display-p3 0.939 0.939 0.939)",
			gray4: "color(display-p3 0.908 0.908 0.908)",
			gray5: "color(display-p3 0.88 0.88 0.88)",
			gray6: "color(display-p3 0.849 0.849 0.849)",
			gray7: "color(display-p3 0.807 0.807 0.807)",
			gray8: "color(display-p3 0.732 0.732 0.732)",
			gray9: "color(display-p3 0.553 0.553 0.553)",
			gray10: "color(display-p3 0.512 0.512 0.512)",
			gray11: "color(display-p3 0.392 0.392 0.392)",
			gray12: "color(display-p3 0.125 0.125 0.125)",
		},
		grayP3A: {
			grayA1: "color(display-p3 0 0 0 / 0.012)",
			grayA2: "color(display-p3 0 0 0 / 0.024)",
			grayA3: "color(display-p3 0 0 0 / 0.063)",
			grayA4: "color(display-p3 0 0 0 / 0.09)",
			grayA5: "color(display-p3 0 0 0 / 0.122)",
			grayA6: "color(display-p3 0 0 0 / 0.153)",
			grayA7: "color(display-p3 0 0 0 / 0.192)",
			grayA8: "color(display-p3 0 0 0 / 0.267)",
			grayA9: "color(display-p3 0 0 0 / 0.447)",
			grayA10: "color(display-p3 0 0 0 / 0.486)",
			grayA11: "color(display-p3 0 0 0 / 0.608)",
			grayA12: "color(display-p3 0 0 0 / 0.875)",
		},
		grayDark: {
			gray1: "#111111",
			gray2: "#191919",
			gray3: "#222222",
			gray4: "#2a2a2a",
			gray5: "#313131",
			gray6: "#3a3a3a",
			gray7: "#484848",
			gray8: "#606060",
			gray9: "#6e6e6e",
			gray10: "#7b7b7b",
			gray11: "#b4b4b4",
			gray12: "#eeeeee",
		},
		grayDarkA: {
			grayA1: "#00000000",
			grayA2: "#ffffff09",
			grayA3: "#ffffff12",
			grayA4: "#ffffff1b",
			grayA5: "#ffffff22",
			grayA6: "#ffffff2c",
			grayA7: "#ffffff3b",
			grayA8: "#ffffff55",
			grayA9: "#ffffff64",
			grayA10: "#ffffff72",
			grayA11: "#ffffffaf",
			grayA12: "#ffffffed",
		},
		grayDarkP3: {
			gray1: "color(display-p3 0.067 0.067 0.067)",
			gray2: "color(display-p3 0.098 0.098 0.098)",
			gray3: "color(display-p3 0.135 0.135 0.135)",
			gray4: "color(display-p3 0.163 0.163 0.163)",
			gray5: "color(display-p3 0.192 0.192 0.192)",
			gray6: "color(display-p3 0.228 0.228 0.228)",
			gray7: "color(display-p3 0.283 0.283 0.283)",
			gray8: "color(display-p3 0.375 0.375 0.375)",
			gray9: "color(display-p3 0.431 0.431 0.431)",
			gray10: "color(display-p3 0.484 0.484 0.484)",
			gray11: "color(display-p3 0.706 0.706 0.706)",
			gray12: "color(display-p3 0.933 0.933 0.933)",
		},
		grayDarkP3A: {
			grayA1: "color(display-p3 0 0 0 / 0)",
			grayA2: "color(display-p3 1 1 1 / 0.034)",
			grayA3: "color(display-p3 1 1 1 / 0.071)",
			grayA4: "color(display-p3 1 1 1 / 0.105)",
			grayA5: "color(display-p3 1 1 1 / 0.134)",
			grayA6: "color(display-p3 1 1 1 / 0.172)",
			grayA7: "color(display-p3 1 1 1 / 0.231)",
			grayA8: "color(display-p3 1 1 1 / 0.332)",
			grayA9: "color(display-p3 1 1 1 / 0.391)",
			grayA10: "color(display-p3 1 1 1 / 0.445)",
			grayA11: "color(display-p3 1 1 1 / 0.685)",
			grayA12: "color(display-p3 1 1 1 / 0.929)",
		},
	};

	describe(generateBaseStyles, () => {
		test("opacity support disabled", () => {
			expect(
				generateBaseStyles({
					colors: testColors,
					opacitySupport: false,
				}),
			).toEqual({
				light: {
					"--gray1": "#fcfcfc",
					"--gray2": "#f9f9f9",
					"--gray3": "#f0f0f0",
					"--gray4": "#e8e8e8",
					"--gray5": "#e0e0e0",
					"--gray6": "#d9d9d9",
					"--gray7": "#cecece",
					"--gray8": "#bbbbbb",
					"--gray9": "#8d8d8d",
					"--gray10": "#838383",
					"--gray11": "#646464",
					"--gray12": "#202020",
					"--grayA1": "#00000003",
					"--grayA2": "#00000006",
					"--grayA3": "#0000000f",
					"--grayA4": "#00000017",
					"--grayA5": "#0000001f",
					"--grayA6": "#00000026",
					"--grayA7": "#00000031",
					"--grayA8": "#00000044",
					"--grayA9": "#00000072",
					"--grayA10": "#0000007c",
					"--grayA11": "#0000009b",
					"--grayA12": "#000000df",
				},
				dark: {
					"--gray1": "#111111",
					"--gray2": "#191919",
					"--gray3": "#222222",
					"--gray4": "#2a2a2a",
					"--gray5": "#313131",
					"--gray6": "#3a3a3a",
					"--gray7": "#484848",
					"--gray8": "#606060",
					"--gray9": "#6e6e6e",
					"--gray10": "#7b7b7b",
					"--gray11": "#b4b4b4",
					"--gray12": "#eeeeee",
					"--grayA1": "#00000000",
					"--grayA2": "#ffffff09",
					"--grayA3": "#ffffff12",
					"--grayA4": "#ffffff1b",
					"--grayA5": "#ffffff22",
					"--grayA6": "#ffffff2c",
					"--grayA7": "#ffffff3b",
					"--grayA8": "#ffffff55",
					"--grayA9": "#ffffff64",
					"--grayA10": "#ffffff72",
					"--grayA11": "#ffffffaf",
					"--grayA12": "#ffffffed",
				},
				lightP3: {
					"--gray1": "color(display-p3 0.988 0.988 0.988)",
					"--gray2": "color(display-p3 0.975 0.975 0.975)",
					"--gray3": "color(display-p3 0.939 0.939 0.939)",
					"--gray4": "color(display-p3 0.908 0.908 0.908)",
					"--gray5": "color(display-p3 0.88 0.88 0.88)",
					"--gray6": "color(display-p3 0.849 0.849 0.849)",
					"--gray7": "color(display-p3 0.807 0.807 0.807)",
					"--gray8": "color(display-p3 0.732 0.732 0.732)",
					"--gray9": "color(display-p3 0.553 0.553 0.553)",
					"--gray10": "color(display-p3 0.512 0.512 0.512)",
					"--gray11": "color(display-p3 0.392 0.392 0.392)",
					"--gray12": "color(display-p3 0.125 0.125 0.125)",
					"--grayA1": "color(display-p3 0 0 0 / 0.012)",
					"--grayA2": "color(display-p3 0 0 0 / 0.024)",
					"--grayA3": "color(display-p3 0 0 0 / 0.063)",
					"--grayA4": "color(display-p3 0 0 0 / 0.09)",
					"--grayA5": "color(display-p3 0 0 0 / 0.122)",
					"--grayA6": "color(display-p3 0 0 0 / 0.153)",
					"--grayA7": "color(display-p3 0 0 0 / 0.192)",
					"--grayA8": "color(display-p3 0 0 0 / 0.267)",
					"--grayA9": "color(display-p3 0 0 0 / 0.447)",
					"--grayA10": "color(display-p3 0 0 0 / 0.486)",
					"--grayA11": "color(display-p3 0 0 0 / 0.608)",
					"--grayA12": "color(display-p3 0 0 0 / 0.875)",
				},
				darkP3: {
					"--gray1": "color(display-p3 0.067 0.067 0.067)",
					"--gray2": "color(display-p3 0.098 0.098 0.098)",
					"--gray3": "color(display-p3 0.135 0.135 0.135)",
					"--gray4": "color(display-p3 0.163 0.163 0.163)",
					"--gray5": "color(display-p3 0.192 0.192 0.192)",
					"--gray6": "color(display-p3 0.228 0.228 0.228)",
					"--gray7": "color(display-p3 0.283 0.283 0.283)",
					"--gray8": "color(display-p3 0.375 0.375 0.375)",
					"--gray9": "color(display-p3 0.431 0.431 0.431)",
					"--gray10": "color(display-p3 0.484 0.484 0.484)",
					"--gray11": "color(display-p3 0.706 0.706 0.706)",
					"--gray12": "color(display-p3 0.933 0.933 0.933)",
					"--grayA1": "color(display-p3 0 0 0 / 0)",
					"--grayA2": "color(display-p3 1 1 1 / 0.034)",
					"--grayA3": "color(display-p3 1 1 1 / 0.071)",
					"--grayA4": "color(display-p3 1 1 1 / 0.105)",
					"--grayA5": "color(display-p3 1 1 1 / 0.134)",
					"--grayA6": "color(display-p3 1 1 1 / 0.172)",
					"--grayA7": "color(display-p3 1 1 1 / 0.231)",
					"--grayA8": "color(display-p3 1 1 1 / 0.332)",
					"--grayA9": "color(display-p3 1 1 1 / 0.391)",
					"--grayA10": "color(display-p3 1 1 1 / 0.445)",
					"--grayA11": "color(display-p3 1 1 1 / 0.685)",
					"--grayA12": "color(display-p3 1 1 1 / 0.929)",
				},
			});
		});

		test("opacity support enabled", () => {
			expect(
				generateBaseStyles({
					colors: testColors,
					opacitySupport: true,
				}),
			).toEqual({
				light: {
					"--gray1": "rgb(252 252 252 / <alpha-value>)",
					"--gray2": "rgb(249 249 249 / <alpha-value>)",
					"--gray3": "rgb(240 240 240 / <alpha-value>)",
					"--gray4": "rgb(232 232 232 / <alpha-value>)",
					"--gray5": "rgb(224 224 224 / <alpha-value>)",
					"--gray6": "rgb(217 217 217 / <alpha-value>)",
					"--gray7": "rgb(206 206 206 / <alpha-value>)",
					"--gray8": "rgb(187 187 187 / <alpha-value>)",
					"--gray9": "rgb(141 141 141 / <alpha-value>)",
					"--gray10": "rgb(131 131 131 / <alpha-value>)",
					"--gray11": "rgb(100 100 100 / <alpha-value>)",
					"--gray12": "rgb(32 32 32 / <alpha-value>)",
					"--grayA1": "#00000003",
					"--grayA2": "#00000006",
					"--grayA3": "#0000000f",
					"--grayA4": "#00000017",
					"--grayA5": "#0000001f",
					"--grayA6": "#00000026",
					"--grayA7": "#00000031",
					"--grayA8": "#00000044",
					"--grayA9": "#00000072",
					"--grayA10": "#0000007c",
					"--grayA11": "#0000009b",
					"--grayA12": "#000000df",
				},
				dark: {
					"--gray1": "rgb(17 17 17 / <alpha-value>)",
					"--gray2": "rgb(25 25 25 / <alpha-value>)",
					"--gray3": "rgb(34 34 34 / <alpha-value>)",
					"--gray4": "rgb(42 42 42 / <alpha-value>)",
					"--gray5": "rgb(49 49 49 / <alpha-value>)",
					"--gray6": "rgb(58 58 58 / <alpha-value>)",
					"--gray7": "rgb(72 72 72 / <alpha-value>)",
					"--gray8": "rgb(96 96 96 / <alpha-value>)",
					"--gray9": "rgb(110 110 110 / <alpha-value>)",
					"--gray10": "rgb(123 123 123 / <alpha-value>)",
					"--gray11": "rgb(180 180 180 / <alpha-value>)",
					"--gray12": "rgb(238 238 238 / <alpha-value>)",
					"--grayA1": "#00000000",
					"--grayA2": "#ffffff09",
					"--grayA3": "#ffffff12",
					"--grayA4": "#ffffff1b",
					"--grayA5": "#ffffff22",
					"--grayA6": "#ffffff2c",
					"--grayA7": "#ffffff3b",
					"--grayA8": "#ffffff55",
					"--grayA9": "#ffffff64",
					"--grayA10": "#ffffff72",
					"--grayA11": "#ffffffaf",
					"--grayA12": "#ffffffed",
				},
				lightP3: {
					"--grayP31":
						"color(display-p3 0.988 0.988 0.988 / <alpha-value>)",
					"--grayP32":
						"color(display-p3 0.975 0.975 0.975 / <alpha-value>)",
					"--grayP33":
						"color(display-p3 0.939 0.939 0.939 / <alpha-value>)",
					"--grayP34":
						"color(display-p3 0.908 0.908 0.908 / <alpha-value>)",
					"--grayP35":
						"color(display-p3 0.88 0.88 0.88 / <alpha-value>)",
					"--grayP36":
						"color(display-p3 0.849 0.849 0.849 / <alpha-value>)",
					"--grayP37":
						"color(display-p3 0.807 0.807 0.807 / <alpha-value>)",
					"--grayP38":
						"color(display-p3 0.732 0.732 0.732 / <alpha-value>)",
					"--grayP39":
						"color(display-p3 0.553 0.553 0.553 / <alpha-value>)",
					"--grayP310":
						"color(display-p3 0.512 0.512 0.512 / <alpha-value>)",
					"--grayP311":
						"color(display-p3 0.392 0.392 0.392 / <alpha-value>)",
					"--grayP312":
						"color(display-p3 0.125 0.125 0.125 / <alpha-value>)",
					"--grayP3A1": "color(display-p3 0 0 0 / 0.012)",
					"--grayP3A2": "color(display-p3 0 0 0 / 0.024)",
					"--grayP3A3": "color(display-p3 0 0 0 / 0.063)",
					"--grayP3A4": "color(display-p3 0 0 0 / 0.09)",
					"--grayP3A5": "color(display-p3 0 0 0 / 0.122)",
					"--grayP3A6": "color(display-p3 0 0 0 / 0.153)",
					"--grayP3A7": "color(display-p3 0 0 0 / 0.192)",
					"--grayP3A8": "color(display-p3 0 0 0 / 0.267)",
					"--grayP3A9": "color(display-p3 0 0 0 / 0.447)",
					"--grayP3A10": "color(display-p3 0 0 0 / 0.486)",
					"--grayP3A11": "color(display-p3 0 0 0 / 0.608)",
					"--grayP3A12": "color(display-p3 0 0 0 / 0.875)",
				},
				darkP3: {
					"--grayP31":
						"color(display-p3 0.067 0.067 0.067 / <alpha-value>)",
					"--grayP32":
						"color(display-p3 0.098 0.098 0.098 / <alpha-value>)",
					"--grayP33":
						"color(display-p3 0.135 0.135 0.135 / <alpha-value>)",
					"--grayP34":
						"color(display-p3 0.163 0.163 0.163 / <alpha-value>)",
					"--grayP35":
						"color(display-p3 0.192 0.192 0.192 / <alpha-value>)",
					"--grayP36":
						"color(display-p3 0.228 0.228 0.228 / <alpha-value>)",
					"--grayP37":
						"color(display-p3 0.283 0.283 0.283 / <alpha-value>)",
					"--grayP38":
						"color(display-p3 0.375 0.375 0.375 / <alpha-value>)",
					"--grayP39":
						"color(display-p3 0.431 0.431 0.431 / <alpha-value>)",
					"--grayP310":
						"color(display-p3 0.484 0.484 0.484 / <alpha-value>)",
					"--grayP311":
						"color(display-p3 0.706 0.706 0.706 / <alpha-value>)",
					"--grayP312":
						"color(display-p3 0.933 0.933 0.933 / <alpha-value>)",
					"--grayP3A1": "color(display-p3 0 0 0 / 0)",
					"--grayP3A2": "color(display-p3 1 1 1 / 0.034)",
					"--grayP3A3": "color(display-p3 1 1 1 / 0.071)",
					"--grayP3A4": "color(display-p3 1 1 1 / 0.105)",
					"--grayP3A5": "color(display-p3 1 1 1 / 0.134)",
					"--grayP3A6": "color(display-p3 1 1 1 / 0.172)",
					"--grayP3A7": "color(display-p3 1 1 1 / 0.231)",
					"--grayP3A8": "color(display-p3 1 1 1 / 0.332)",
					"--grayP3A9": "color(display-p3 1 1 1 / 0.391)",
					"--grayP3A10": "color(display-p3 1 1 1 / 0.445)",
					"--grayP3A11": "color(display-p3 1 1 1 / 0.685)",
					"--grayP3A12": "color(display-p3 1 1 1 / 0.929)",
				},
			});
		});
	});
}

export default wrpPlugin;
