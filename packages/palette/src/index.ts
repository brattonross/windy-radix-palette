import * as radix from "@radix-ui/colors";
import plugin from "tailwindcss/plugin";

const steps = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12] as const;

export type NumberOrString<T extends number> = T | `${T}`;
export type RadixStep = NumberOrString<(typeof steps)[number]>;
export type LooseRadixColor = keyof typeof radix | (string & {});

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

export function createPlugin({
	colors = radix,
	opacitySupport = false,
	rootSelector = ":root",
}: PluginOptions = {}) {
	const wrpPlugin = plugin.withOptions<PluginOptions>(
		() => {
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

			for (const [colorName, steps] of Object.entries(colors)) {
				if (colorName.includes("Dark")) {
					continue;
				}

				const themeColor: Record<string, string> = {};
				for (const key of Object.keys(steps)) {
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

	function alias(color: LooseRadixColor): Record<string, string>;
	function alias(color: LooseRadixColor, step: RadixStep): string;
	function alias(
		color: LooseRadixColor,
		step?: RadixStep,
	): string | Record<string, string> {
		if (!opacitySupport || color.includes("A")) {
			if (step) {
				return `var(--${color}${step})`;
			} else {
				const out: Record<string, string> = {};
				for (let i = 0; i < steps.length; i++) {
					out[steps[i]] = `var(--${color}${steps[i]})`;
				}
				return out;
			}
		}

		if (color.includes("P3")) {
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
				out[
					steps[i]
				] = `rgb(var(--${color}${steps[i]}) / <alpha-value>)`;
			}
			return out;
		}
	}

	return { alias, plugin: wrpPlugin };
}

function hexToRGBChannels(hex: string): string {
	const r = hex.substring(1, 3);
	const g = hex.substring(3, 5);
	const b = hex.substring(5, 7);
	return `${parseInt(r, 16)} ${parseInt(g, 16)} ${parseInt(b, 16)}`;
}

if (import.meta.vitest) {
	const { test, expect } = import.meta.vitest;

	test(hexToRGBChannels, () => {
		expect(hexToRGBChannels("#ffffff")).toBe("255 255 255");
		expect(hexToRGBChannels("#000000")).toBe("0 0 0");
	});
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
					color = value.slice(
						value.indexOf("(") + 1,
						value.indexOf(")"),
					);
				} else {
					color = hexToRGBChannels(value);
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
					"--gray1": "252 252 252",
					"--gray2": "249 249 249",
					"--gray3": "240 240 240",
					"--gray4": "232 232 232",
					"--gray5": "224 224 224",
					"--gray6": "217 217 217",
					"--gray7": "206 206 206",
					"--gray8": "187 187 187",
					"--gray9": "141 141 141",
					"--gray10": "131 131 131",
					"--gray11": "100 100 100",
					"--gray12": "32 32 32",
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
					"--gray1": "17 17 17",
					"--gray2": "25 25 25",
					"--gray3": "34 34 34",
					"--gray4": "42 42 42",
					"--gray5": "49 49 49",
					"--gray6": "58 58 58",
					"--gray7": "72 72 72",
					"--gray8": "96 96 96",
					"--gray9": "110 110 110",
					"--gray10": "123 123 123",
					"--gray11": "180 180 180",
					"--gray12": "238 238 238",
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
					"--grayP31": "display-p3 0.988 0.988 0.988",
					"--grayP32": "display-p3 0.975 0.975 0.975",
					"--grayP33": "display-p3 0.939 0.939 0.939",
					"--grayP34": "display-p3 0.908 0.908 0.908",
					"--grayP35": "display-p3 0.88 0.88 0.88",
					"--grayP36": "display-p3 0.849 0.849 0.849",
					"--grayP37": "display-p3 0.807 0.807 0.807",
					"--grayP38": "display-p3 0.732 0.732 0.732",
					"--grayP39": "display-p3 0.553 0.553 0.553",
					"--grayP310": "display-p3 0.512 0.512 0.512",
					"--grayP311": "display-p3 0.392 0.392 0.392",
					"--grayP312": "display-p3 0.125 0.125 0.125",
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
					"--grayP31": "display-p3 0.067 0.067 0.067",
					"--grayP32": "display-p3 0.098 0.098 0.098",
					"--grayP33": "display-p3 0.135 0.135 0.135",
					"--grayP34": "display-p3 0.163 0.163 0.163",
					"--grayP35": "display-p3 0.192 0.192 0.192",
					"--grayP36": "display-p3 0.228 0.228 0.228",
					"--grayP37": "display-p3 0.283 0.283 0.283",
					"--grayP38": "display-p3 0.375 0.375 0.375",
					"--grayP39": "display-p3 0.431 0.431 0.431",
					"--grayP310": "display-p3 0.484 0.484 0.484",
					"--grayP311": "display-p3 0.706 0.706 0.706",
					"--grayP312": "display-p3 0.933 0.933 0.933",
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

	describe(generateTailwindConfig, () => {
		test("opacity support disabled", () => {
			expect(
				generateTailwindConfig({
					colors: testColors,
					opacitySupport: false,
				}),
			).toEqual({
				theme: {
					extend: {
						colors: {
							gray: {
								1: "var(--gray1)",
								2: "var(--gray2)",
								3: "var(--gray3)",
								4: "var(--gray4)",
								5: "var(--gray5)",
								6: "var(--gray6)",
								7: "var(--gray7)",
								8: "var(--gray8)",
								9: "var(--gray9)",
								10: "var(--gray10)",
								11: "var(--gray11)",
								12: "var(--gray12)",
							},
							grayA: {
								1: "var(--grayA1)",
								2: "var(--grayA2)",
								3: "var(--grayA3)",
								4: "var(--grayA4)",
								5: "var(--grayA5)",
								6: "var(--grayA6)",
								7: "var(--grayA7)",
								8: "var(--grayA8)",
								9: "var(--grayA9)",
								10: "var(--grayA10)",
								11: "var(--grayA11)",
								12: "var(--grayA12)",
							},
						},
					},
				},
			});
		});

		test("opacity support enabled", () => {
			expect(
				generateTailwindConfig({
					colors: testColors,
					opacitySupport: true,
				}),
			).toEqual({
				theme: {
					extend: {
						colors: {
							gray: {
								1: "rgb(var(--gray1) / <alpha-value>)",
								2: "rgb(var(--gray2) / <alpha-value>)",
								3: "rgb(var(--gray3) / <alpha-value>)",
								4: "rgb(var(--gray4) / <alpha-value>)",
								5: "rgb(var(--gray5) / <alpha-value>)",
								6: "rgb(var(--gray6) / <alpha-value>)",
								7: "rgb(var(--gray7) / <alpha-value>)",
								8: "rgb(var(--gray8) / <alpha-value>)",
								9: "rgb(var(--gray9) / <alpha-value>)",
								10: "rgb(var(--gray10) / <alpha-value>)",
								11: "rgb(var(--gray11) / <alpha-value>)",
								12: "rgb(var(--gray12) / <alpha-value>)",
							},
							grayA: {
								1: "var(--grayA1)",
								2: "var(--grayA2)",
								3: "var(--grayA3)",
								4: "var(--grayA4)",
								5: "var(--grayA5)",
								6: "var(--grayA6)",
								7: "var(--grayA7)",
								8: "var(--grayA8)",
								9: "var(--grayA9)",
								10: "var(--grayA10)",
								11: "var(--grayA11)",
								12: "var(--grayA12)",
							},
							grayP3: {
								1: "color(var(--grayP31) / <alpha-value>)",
								2: "color(var(--grayP32) / <alpha-value>)",
								3: "color(var(--grayP33) / <alpha-value>)",
								4: "color(var(--grayP34) / <alpha-value>)",
								5: "color(var(--grayP35) / <alpha-value>)",
								6: "color(var(--grayP36) / <alpha-value>)",
								7: "color(var(--grayP37) / <alpha-value>)",
								8: "color(var(--grayP38) / <alpha-value>)",
								9: "color(var(--grayP39) / <alpha-value>)",
								10: "color(var(--grayP310) / <alpha-value>)",
								11: "color(var(--grayP311) / <alpha-value>)",
								12: "color(var(--grayP312) / <alpha-value>)",
							},
							grayP3A: {
								1: "var(--grayP3A1)",
								2: "var(--grayP3A2)",
								3: "var(--grayP3A3)",
								4: "var(--grayP3A4)",
								5: "var(--grayP3A5)",
								6: "var(--grayP3A6)",
								7: "var(--grayP3A7)",
								8: "var(--grayP3A8)",
								9: "var(--grayP3A9)",
								10: "var(--grayP3A10)",
								11: "var(--grayP3A11)",
								12: "var(--grayP3A12)",
							},
						},
					},
				},
			});
		});
	});
}

function generateTailwindConfig({
	colors,
	opacitySupport,
}: Required<Pick<PluginOptions, "colors" | "opacitySupport">>) {
	const themeColors: Record<string, Record<string, string>> = {};

	for (const [colorName, steps] of Object.entries(colors)) {
		if (!opacitySupport && colorName.includes("P3")) {
			continue;
		}

		const themeColor: Record<string, string> = {};
		for (const key of Object.keys(steps)) {
			const stepKey = key.replace(
				colorName.replace("Dark", "").replace("P3", ""),
				"",
			);
			let value = `var(--${key})`;
			if (opacitySupport) {
				if (colorName.includes("P3")) {
					const variable = `var(--${colorName.replace(
						"Dark",
						"",
					)}${stepKey})`;
					if (colorName.includes("A")) {
						value = variable;
					} else {
						value = `color(${variable} / <alpha-value>)`;
					}
				} else if (!colorName.includes("A")) {
					value = `rgb(var(--${key}) / <alpha-value>)`;
				}
			}
			themeColor[stepKey] = value;
		}

		themeColors[colorName.replace("Dark", "")] = themeColor;
	}

	return {
		theme: {
			extend: {
				colors: themeColors,
			},
		},
	};
}

export default createPlugin;
