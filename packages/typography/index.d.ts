import type * as radixColors from "@radix-ui/colors";

declare interface WindyRadixTypographyOptions {
  /**
   * The names of the colors to have a typography variant generated for.
   * @default ["gray", "mauve", "slate", "sage", "olive", "sand"]
   */
  colors?: Array<keyof typeof radixColors>;
}

declare function plugin(options?: Partial<WindyRadixTypographyOptions>): {
  handler: () => void;
};

declare namespace plugin {
  const __isOptionsFunction: true;
}

export = plugin;
