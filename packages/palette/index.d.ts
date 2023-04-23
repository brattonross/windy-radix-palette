import type * as radixColors from "@radix-ui/colors";

declare type DeepPartial<T> = T extends object
	? { [P in keyof T]?: DeepPartial<T[P]> }
	: T;

declare interface WindyRadixPaletteOptions {
	/**
	 * The Radix colors to generate a palette for.
	 * @default All Radix colors.
	 */
	colors?: DeepPartial<typeof radixColors>;
	/**
	 * The selector that the color variables will be added to.
	 * @default ':root'
	 */
	rootSelector?: string;
}

declare function plugin(options?: Partial<WindyRadixPaletteOptions>): {
	handler: () => void;
};

declare namespace plugin {
	const __isOptionsFunction: true;
}

export = plugin;
