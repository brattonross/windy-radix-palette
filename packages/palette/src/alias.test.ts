import { describe, expect, test } from "vitest";
import { Aliaser } from "./alias";

describe("Aliaser", () => {
	test("full palette, same between light and dark mode", () => {
		const aliaser = new Aliaser();
		const result = aliaser.alias("gray");
		expect(result).toEqual({
			"1": "var(--gray1)",
			"2": "var(--gray2)",
			"3": "var(--gray3)",
			"4": "var(--gray4)",
			"5": "var(--gray5)",
			"6": "var(--gray6)",
			"7": "var(--gray7)",
			"8": "var(--gray8)",
			"9": "var(--gray9)",
			"10": "var(--gray10)",
			"11": "var(--gray11)",
			"12": "var(--gray12)",
		});

		const styles = aliaser.generateStyles();
		expect(styles).toEqual({});
	});

	test("single color, same between light and dark mode", () => {
		const aliaser = new Aliaser();
		const result = aliaser.alias("gray.12");
		expect(result).toEqual("var(--gray12)");

		const styles = aliaser.generateStyles();
		expect(styles).toEqual({});
	});

	test("single color, same between light and dark mode, object option", () => {
		const aliaser = new Aliaser();
		const result = aliaser.alias({ value: "gray.12" });
		expect(result).toEqual("var(--gray12)");

		const styles = aliaser.generateStyles();
		expect(styles).toEqual({});
	});

	test("full palette, different between light and dark mode", () => {
		const aliaser = new Aliaser();
		const result = aliaser.alias({
			name: "test",
			light: "gray",
			dark: "red",
		});
		expect(result).toEqual({
			"1": "var(--test-1)",
			"2": "var(--test-2)",
			"3": "var(--test-3)",
			"4": "var(--test-4)",
			"5": "var(--test-5)",
			"6": "var(--test-6)",
			"7": "var(--test-7)",
			"8": "var(--test-8)",
			"9": "var(--test-9)",
			"10": "var(--test-10)",
			"11": "var(--test-11)",
			"12": "var(--test-12)",
		});

		const styles = aliaser.generateStyles();
		expect(styles).toEqual({
			":root": {
				"--test-1": "var(--gray1)",
				"--test-2": "var(--gray2)",
				"--test-3": "var(--gray3)",
				"--test-4": "var(--gray4)",
				"--test-5": "var(--gray5)",
				"--test-6": "var(--gray6)",
				"--test-7": "var(--gray7)",
				"--test-8": "var(--gray8)",
				"--test-9": "var(--gray9)",
				"--test-10": "var(--gray10)",
				"--test-11": "var(--gray11)",
				"--test-12": "var(--gray12)",
			},
			"@media (prefers-color-scheme: dark)": {
				":root": {
					"--test-1": "var(--red1)",
					"--test-2": "var(--red2)",
					"--test-3": "var(--red3)",
					"--test-4": "var(--red4)",
					"--test-5": "var(--red5)",
					"--test-6": "var(--red6)",
					"--test-7": "var(--red7)",
					"--test-8": "var(--red8)",
					"--test-9": "var(--red9)",
					"--test-10": "var(--red10)",
					"--test-11": "var(--red11)",
					"--test-12": "var(--red12)",
				},
			},
		});
	});

	test("single color, different between light and dark mode", () => {
		const aliaser = new Aliaser();
		const result = aliaser.alias({
			name: "test",
			light: "gray.12",
			dark: "gray.11",
		});
		expect(result).toEqual("var(--test)");

		const styles = aliaser.generateStyles();
		expect(styles).toEqual({
			":root": {
				"--test": "var(--gray12)",
			},
			"@media (prefers-color-scheme: dark)": {
				":root": {
					"--test": "var(--gray11)",
				},
			},
		});
	});

	test("custom root selector", () => {
		const aliaser = new Aliaser({ rootSelector: ":host" });
		aliaser.alias({
			name: "test",
			light: "gray",
			dark: "red",
		});

		const styles = aliaser.generateStyles();
		expect(styles).toEqual({
			":host": {
				"--test-1": "var(--gray1)",
				"--test-2": "var(--gray2)",
				"--test-3": "var(--gray3)",
				"--test-4": "var(--gray4)",
				"--test-5": "var(--gray5)",
				"--test-6": "var(--gray6)",
				"--test-7": "var(--gray7)",
				"--test-8": "var(--gray8)",
				"--test-9": "var(--gray9)",
				"--test-10": "var(--gray10)",
				"--test-11": "var(--gray11)",
				"--test-12": "var(--gray12)",
			},
			"@media (prefers-color-scheme: dark)": {
				":host": {
					"--test-1": "var(--red1)",
					"--test-2": "var(--red2)",
					"--test-3": "var(--red3)",
					"--test-4": "var(--red4)",
					"--test-5": "var(--red5)",
					"--test-6": "var(--red6)",
					"--test-7": "var(--red7)",
					"--test-8": "var(--red8)",
					"--test-9": "var(--red9)",
					"--test-10": "var(--red10)",
					"--test-11": "var(--red11)",
					"--test-12": "var(--red12)",
				},
			},
		});
	});

	describe("darkMode: class", () => {
		test("full palette", () => {
			const aliaser = new Aliaser();
			aliaser.alias({ name: "test", light: "gray", dark: "red" });

			const styles = aliaser.generateStyles({ darkMode: "class" });
			expect(styles).toEqual({
				":root": {
					"--test-1": "var(--gray1)",
					"--test-2": "var(--gray2)",
					"--test-3": "var(--gray3)",
					"--test-4": "var(--gray4)",
					"--test-5": "var(--gray5)",
					"--test-6": "var(--gray6)",
					"--test-7": "var(--gray7)",
					"--test-8": "var(--gray8)",
					"--test-9": "var(--gray9)",
					"--test-10": "var(--gray10)",
					"--test-11": "var(--gray11)",
					"--test-12": "var(--gray12)",
				},
				".dark": {
					"--test-1": "var(--red1)",
					"--test-2": "var(--red2)",
					"--test-3": "var(--red3)",
					"--test-4": "var(--red4)",
					"--test-5": "var(--red5)",
					"--test-6": "var(--red6)",
					"--test-7": "var(--red7)",
					"--test-8": "var(--red8)",
					"--test-9": "var(--red9)",
					"--test-10": "var(--red10)",
					"--test-11": "var(--red11)",
					"--test-12": "var(--red12)",
				},
			});
		});

		test("single color", () => {
			const aliaser = new Aliaser();
			aliaser.alias({ name: "test", light: "gray.12", dark: "gray.11" });

			const styles = aliaser.generateStyles({ darkMode: "class" });
			expect(styles).toEqual({
				":root": {
					"--test": "var(--gray12)",
				},
				".dark": {
					"--test": "var(--gray11)",
				},
			});
		});
	});

	describe("darkMode: custom", () => {
		test("full palette", () => {
			const aliaser = new Aliaser();
			aliaser.alias({ name: "test", light: "gray", dark: "red" });

			const styles = aliaser.generateStyles({
				darkMode: ["class", ".dark-mode"],
			});
			expect(styles).toEqual({
				":root": {
					"--test-1": "var(--gray1)",
					"--test-2": "var(--gray2)",
					"--test-3": "var(--gray3)",
					"--test-4": "var(--gray4)",
					"--test-5": "var(--gray5)",
					"--test-6": "var(--gray6)",
					"--test-7": "var(--gray7)",
					"--test-8": "var(--gray8)",
					"--test-9": "var(--gray9)",
					"--test-10": "var(--gray10)",
					"--test-11": "var(--gray11)",
					"--test-12": "var(--gray12)",
				},
				".dark-mode": {
					"--test-1": "var(--red1)",
					"--test-2": "var(--red2)",
					"--test-3": "var(--red3)",
					"--test-4": "var(--red4)",
					"--test-5": "var(--red5)",
					"--test-6": "var(--red6)",
					"--test-7": "var(--red7)",
					"--test-8": "var(--red8)",
					"--test-9": "var(--red9)",
					"--test-10": "var(--red10)",
					"--test-11": "var(--red11)",
					"--test-12": "var(--red12)",
				},
			});
		});

		test("single color", () => {
			const aliaser = new Aliaser();
			aliaser.alias({ name: "test", light: "gray.12", dark: "gray.11" });

			const styles = aliaser.generateStyles({
				darkMode: ["class", ".dark-mode"],
			});
			expect(styles).toEqual({
				":root": {
					"--test": "var(--gray12)",
				},
				".dark-mode": {
					"--test": "var(--gray11)",
				},
			});
		});
	});

	test("arbitrary values", () => {
		const aliaser = new Aliaser();

		const result = aliaser.alias({
			name: "test",
			light: "hsla(0, 0%, 100%, 0.5)",
			dark: "rgba(0, 0, 0, 0.5)",
		});
		expect(result).toEqual("var(--test)");

		const styles = aliaser.generateStyles();
		expect(styles).toEqual({
			":root": {
				"--test": "hsla(0, 0%, 100%, 0.5)",
			},
			"@media (prefers-color-scheme: dark)": {
				":root": {
					"--test": "rgba(0, 0, 0, 0.5)",
				},
			},
		});
	});
});
