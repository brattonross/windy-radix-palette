import type * as radixColors from "@radix-ui/colors";

declare type RadixColor = keyof typeof radixColors;
declare type RadixScale = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;

declare function toRadixVar(
	color: RadixColor,
	n: RadixScale | `${RadixScale}`
): string;

declare function toRadixVars(color: RadixColor): Record<string, string>;
