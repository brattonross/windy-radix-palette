const radix = require("@radix-ui/colors");
const plugin = require("tailwindcss/plugin");

/**
 * Converts a valid CSS HSL string to an object with hue, saturation, and lightness values.
 * @param {string} hslString - A valid CSS HSL string in the format 'hsl(hue, saturation%, lightness%)'.
 * @returns {{ hue: number, saturation: number, lightness: number }} An object with hue, saturation, and lightness values.
 */
const parseHSL = (hslString) => {
	/**
	 * A regular expression that matches a valid CSS HSL string.
	 * `^hsl\(` matches the beginning of the string and the literal characters "hsl("
	 * `(\d+(?:\.\d+)?)` captures a number with optional decimal places (i.e., a floating point number) for the hue value.
	 * `,\s*` matches a comma and any number of whitespace characters (e.g., spaces, tabs) between the hue and saturation values.
	 * `(\d+(?:\.\d+)?)%` captures a number with optional decimal places followed by a percent sign for the saturation and lightness values.
	 * `,\s*` matches a comma and any number of whitespace characters between the saturation and lightness values.
	 * `(\d+(?:\.\d+)?)%` captures a number with optional decimal places followed by a percent sign for the lightness value.
	 * `\)$` matches the end of the string and the literal character ")".
	 * @type {RegExp}
	 */
	const hslRegex =
		/^hsl\((\d+(?:\.\d+)?),\s*(\d+(?:\.\d+)?)%,\s*(\d+(?:\.\d+)?)%\)$/;

	const matches = hslString.match(hslRegex);
	if (!matches) {
		throw new Error(`Invalid CSS HSL string: ${hslString}`);
	}

	const hue = parseFloat(matches[1]);
	const saturation = parseFloat(matches[2]);
	const lightness = parseFloat(matches[3]);

	return { hue, saturation, lightness };
};

const windyRadixPalette = plugin.withOptions(
	({ colors = radix, rootSelector = ":root" } = {}) => {
		let rootColors = {};
		let darkModeColors = {};

		for (const [colorName, colorObj] of Object.entries(colors)) {
			const colorMap = colorName.includes("Dark") ? darkModeColors : rootColors;
			for (const [key, value] of Object.entries(colorObj)) {
				if (key.includes("A")) {
					colorMap[`--${key}`] = value;
				} else {
					const { hue, saturation, lightness } = parseHSL(value);
					colorMap[`--${key}`] = `${hue}deg ${saturation}% ${lightness}%`;
				}
			}
		}

		return ({ addBase, config }) => {
			const [darkMode, className = ".dark"] = [].concat(
				config("darkMode", "media")
			);

			if (darkMode === "class") {
				addBase({
					[rootSelector]: rootColors,
					[className]: darkModeColors,
				});
			} else {
				addBase({
					[rootSelector]: rootColors,
					"@media (prefers-color-scheme: dark)": {
						[rootSelector]: darkModeColors,
					},
				});
			}
		};
	},
	({ colors = radix } = {}) => {
		const themeColors = {};

		for (const [colorName, colorObj] of Object.entries(colors)) {
			if (colorName.includes("Dark")) {
				continue;
			}

			const themeColor = {};
			for (const key of Object.keys(colorObj)) {
				const scale = key.replace(colorName, "");
				if (key.includes("A")) {
					themeColor[scale] = `var(--${colorName}${scale})`;
				} else {
					themeColor[
						scale
					] = `hsl(var(--${colorName}${scale}) / <alpha-value>)`;
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
	}
);

module.exports = windyRadixPalette;
