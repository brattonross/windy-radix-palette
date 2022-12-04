/**
 * Returns a string that represents the CSS variable for a given Radix color and scale index.
 * @param {string} color The name of the Radix color.
 * @param {(number | string)} n The number of the color in the scale.
 * @returns {string} A string representing the CSS variable for this color.
 */
function toRadixVar(color, n) {
	return `var(--${color}${n})`;
}

const scale = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

/**
 * Returns a Tailwind color definition object for a given Radix color.
 * @param {string} color The name of the Radix color.
 * @returns {{ [number]: string }} An object that contains Tailwind color definitions for the given Radix color.
 */
function toRadixVars(color) {
	return scale.reduce(
		(obj, n) => ({
			...obj,
			[n]: toRadixVar(color, n),
		}),
		{}
	);
}

exports.toRadixVar = toRadixVar;
exports.toRadixVars = toRadixVars;
