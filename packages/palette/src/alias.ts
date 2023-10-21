import { createId } from "@paralleldrive/cuid2";
import * as radix from "@radix-ui/colors";

const steps = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12] as const;

export type NumberOrString<T extends number> = T | `${T}`;
export type RadixStep = NumberOrString<(typeof steps)[number]>;
export type NonDark<T> = T extends `${infer U}Dark${infer V}` ? `${U}${V}` : T;
export type RadixColor = keyof typeof radix;
export type RadixColorWithStep = `${RadixColor}.${RadixStep}`;
export type Loose<T extends string> = T | ({} & string);
export type AliasFullPaletteOptions =
	| NonDark<RadixColor>
	| {
			/** The color to use in light mode. */
			light: Loose<NonDark<RadixColor>>;
			/** The color to use in dark mode. */
			dark: Loose<NonDark<RadixColor>>;
	  };
export type AliasSingleColorOptions =
	| {
			/** The color to use in light mode. */
			light: NonDark<RadixColorWithStep>;
			/** The color to use in dark mode. */
			dark: NonDark<RadixColorWithStep>;
	  }
	| {
			/** Unique name for the alias. Used to generate the CSS variable name. */
			name: string;
			/** The color to use in light mode. */
			light: Loose<NonDark<RadixColorWithStep>>;
			/** The color to use in dark mode. */
			dark: Loose<NonDark<RadixColorWithStep>>;
	  }
	| NonDark<RadixColorWithStep>
	| {
			/** The color to use in both light and dark mode. */
			value: NonDark<RadixColorWithStep>;
	  }
	| {
			/** Unique name for the alias. Used to generate the CSS variable name. */
			name: string;
			/** The color to use in both light and dark mode. */
			value: Loose<NonDark<RadixColorWithStep>>;
	  };
export type AliasOptions = AliasFullPaletteOptions | AliasSingleColorOptions;
export type DarkModeConfig = "class" | "media" | ["class", string];

export type AliaserOptions = {
	rootSelector?: string;
};

export class Aliaser {
	#aliases = new Map<string, { light: string; dark: string }>();
	#radixColorNames: Array<string> = Object.keys(radix).filter(
		(color) => !color.includes("Dark"),
	);
	#rootSelector: string;

	public constructor(options: AliaserOptions = {}) {
		this.#rootSelector = options.rootSelector ?? ":root";
	}

	/**
	 * Alias a color to a new name.
	 *
	 * Can either be a single color, or a full palette.
	 * Different values can be provided for light and dark mode.
	 */
	public alias(
		options: AliasOptions,
		step?: RadixStep,
	): string | Record<string, string> {
		if (step) {
			return `var(--${options}${step})`;
		} else if (typeof options === "string" && options.includes(".")) {
			const [color, step] = options.split(".");
			return `var(--${color}${step})`;
		}

		if (typeof options === "object" && "value" in options) {
			const [color, step] = options.value.split(".");
			return `var(--${color}${step})`;
		}

		if (typeof options === "string") {
			const result: Record<string, string> = {};
			for (let i = 1; i <= 12; i++) {
				result[i] = `var(--${options}${i})`;
			}
			return result;
		}

		const variableName = this.#generatePrefix(
			"name" in options ? options.name : undefined,
		);
		this.#aliases.set(variableName, {
			light: options.light,
			dark: options.dark,
		});

		if (
			!this.#isRadixColorName(options.light) ||
			!this.#isRadixColorName(options.dark)
		) {
			return `var(--${variableName})`;
		}

		if (options.light.includes(".") || options.dark.includes(".")) {
			return `var(--${variableName})`;
		}

		const result: Record<string, string> = {};
		for (let i = 1; i <= 12; i++) {
			result[i] = `var(--${variableName}-${i})`;
		}
		return result;
	}

	/** Generates Tailwind base styles for the aliased colors. */
	public generateStyles({
		darkMode = "media",
	}: {
		darkMode?: DarkModeConfig;
	} = {}): Record<string, any> {
		if (this.#aliases.size === 0) {
			return {};
		}

		const darkModeSelector = this.#getDarkModeSelector(darkMode);
		const lightTable: Record<string, string> = {};
		const darkTable: Record<string, string> = {};

		for (const [variableName, { light, dark }] of this.#aliases) {
			if (!this.#isRadixColorName(light)) {
				lightTable[`--${variableName}`] = light;
			} else if (light.includes(".")) {
				const [color, step] = light.split(".");
				lightTable[`--${variableName}`] = `var(--${color}${step})`;
			} else {
				for (let i = 1; i <= steps.length; i++) {
					lightTable[
						`--${variableName}-${i}`
					] = `var(--${light}${i})`;
				}
			}

			if (!this.#isRadixColorName(dark)) {
				darkTable[`--${variableName}`] = dark;
			} else if (dark.includes(".")) {
				const [color, step] = dark.split(".");
				darkTable[`--${variableName}`] = `var(--${color}${step})`;
			} else {
				for (let i = 1; i <= steps.length; i++) {
					darkTable[`--${variableName}-${i}`] = `var(--${dark}${i})`;
				}
			}
		}

		return darkMode === "media"
			? {
					[this.#rootSelector]: lightTable,
					[darkModeSelector]: {
						[this.#rootSelector]: darkTable,
					},
			  }
			: {
					[this.#rootSelector]: lightTable,
					[darkModeSelector]: darkTable,
			  };
	}

	#getDarkModeSelector(darkMode: DarkModeConfig): string {
		if (darkMode === "class") {
			return ".dark";
		} else if (Array.isArray(darkMode)) {
			return darkMode[1] ?? ".dark";
		} else {
			return "@media (prefers-color-scheme: dark)";
		}
	}

	#generatePrefix(name?: string): string {
		if (name) {
			return name;
		}

		return "wrp-alias-" + createId();
	}

	#isRadixColorName(name: string): boolean {
		return this.#radixColorNames.includes(name.split(".")[0]);
	}
}
