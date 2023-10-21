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
	const wrpPlugin = plugin(({ addBase, addVariant, config }) => {
		const baseStyles = generateBaseStyles({ colors, opacitySupport });
		const [darkMode, className = ".dark"] = ([] as Array<string>).concat(
			config("darkMode", "media"),
		);

		addVariant(
			"p3",
			"@supports (color: color(display-p3 1 1 1)) { @media (color-gamut: p3) }",
		);

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
	}, generateTailwindConfig({ colors, opacitySupport }));

	function alias(
		color: LooseRadixColor,
		step?: RadixStep,
	): string | Record<string, string> {
		if (!opacitySupport || color.includes("A")) {
			// When opacity support is disabled, P3 colors do not have "P3" in the variable name.
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
		}

		if (color.includes("P3")) {
			if (step) {
				return `color(var(--${color}${step}) / <alpha-value>)`;
			} else {
				const out: Record<string, string> = {};
				for (let i = 0; i < steps.length; i++) {
					out[
						steps[i]
					] = `color(var(--${color}${steps[i]}) / <alpha-value>)`;
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

export function hexToRGBChannels(hex: string): string {
	const r = hex.substring(1, 3);
	const g = hex.substring(3, 5);
	const b = hex.substring(5, 7);
	return `${parseInt(r, 16)} ${parseInt(g, 16)} ${parseInt(b, 16)}`;
}

export function generateBaseStyles(options: {
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

export function generateTailwindConfig({
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
