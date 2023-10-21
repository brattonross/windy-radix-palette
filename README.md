# Windy Radix Palette

An unofficial package to improve the compatibility of [Radix Colors](https://www.radix-ui.com/colors) and [Tailwind](https://tailwindcss.com/).

> [!WARNING]
> The following documentation is for version 2.x of this package.
> v1.0.0 of this package has an issue that makes it unable to display P3 colors. There is a v2.0.0-beta.x version available which fixes this issue.

## Installation

```sh
npm install --save-dev windy-radix-palette @radix-ui/colors
```

## Usage

Add the plugin to your Tailwind config:

```js
const { createPlugin } = require("windy-radix-palette");

const colors = createPlugin();

module.exports = {
	plugins: [colors.plugin],
};
```

Then you can use the classes in your markup!

```html
<button class="bg-tomato-4 hover:bg-tomato-5 text-tomatoA-11">Button</button>
```

## Customization

### Colors

By default, this plugin will add CSS properties for **all** of the available Radix Colors. This adds many hundreds of CSS properties into your stylesheet. If this is an issue for your case, you can tell the plugin which colors you'd like it to generate for you:

```js
const radixColors = require("@radix-ui/colors");
const { createPlugin } = require("windy-radix-palette");

const colors = createPlugin({
	colors: {
		mauveA: radixColors.mauveA,
		mauveDarkA: radixColors.mauveDarkA,
		red: radixColors.red,
		redDark: radixColors.redDark,
	},
});

module.exports = {
	plugins: [colors.plugin],
};
```

## Aliasing

The return value from `createPlugin()` includes an `alias` function. This function can be called to help create aliases for Radix Colors, or arbitrary values.

### Semantic aliases

Creating semantic aliases for colors can be helpful to when it comes to theming. For example, in western culture, it would be common to see `red` mapped to "danger", `yellow` to "warning", and `green` to "success".

```js
const { createPlugin } = require("windy-radix-palette");

const colors = createPlugin();

module.exports = {
	theme: {
		extend: {
			colors: {
				danger: {
					1: colors.alias("red.1"),
					2: colors.alias("red.2"),
				},
				warning: {
					1: colors.alias("yellow.1"),
					2: colors.alias("yellow.2"),
				},
				success: {
					1: colors.alias("green.1"),
					2: colors.alias("green.2"),
				},
			},
		},
	},
};
```

### Renaming scales

If you wish to rename a scale, just omit the scale step from the alias:

```js
const { createPlugin } = require("windy-radix-palette");

const colors = createPlugin();

module.exports = {
	theme: {
		extend: {
			colors: {
				danger: colors.alias("red"),
				warning: colors.alias("yellow"),
				success: colors.alias("green"),
			},
		},
	},
};
```

This will make `danger-1` map to `red-1`, `danger-2` map to `red-2`, etc.

### Mutable aliases

> When designing for both light and dark modes, you sometimes need to map a variable to one color in light mode, and another color in dark mode. Common examples include:
>
> Components that have a white background in light mode and a subtle gray background in dark mode. For example, Card, Popover, DropdownMenu, HoverCard, Dialog etc.
> Components that have a transparent black background in light mode and a transparent white background in dark mode. For example, Tooltip.
> Shadows that are saturated, transparent gray in light mode, and pure black in dark mode.
> An overlay that is light transparent black in light mode, and a darker transparent black in dark mode.
>
> — [Radix Colors](https://www.radix-ui.com/colors/docs/overview/aliasing#mutable-aliases)

```js
const { createPlugin } = require("windy-radix-palette");

const colors = createPlugin();

module.exports = {
	theme: {
		extend: {
			colors: {
				panel: colors.alias({
					light: "white",
					dark: "slate.2",
				}),
				"panel-contrast": colors.alias({
					light: "blackA.9",
					dark: "whiteA.9",
				}),
				shadow: colors.alias({
					light: "slateA.3",
					dark: "black",
				}),
				overlay: colors.alias({
					light: "blackA.8",
					dark: "blackA.11",
				}),
			},
		},
	},
};
```

It is also possible to use a mutable alias on an entire scale:

```js
const { createPlugin } = require("windy-radix-palette");

const colors = createPlugin();

module.exports = {
	theme: {
		extend: {
			colors: {
				overlay: colors.alias({
					light: "blackA",
					dark: "whiteA",
				}),
			},
		},
	},
};
```

### Arbitrary values

You can also use the `alias` function to create aliases for arbitrary values:

```js
const { createPlugin } = require("windy-radix-palette");

const colors = createPlugin();

module.exports = {
	theme: {
		extend: {
			colors: {
				surface: colors.alias({
					light: "hsla(0, 0%, 100%, 0.9)",
					dark: "rgba(0, 0, 0, 0.25)",
				}),
			},
		},
	},
};
```

### CSS variable names

The `alias` function will try not to create any extra CSS variables if they aren't required. In the case of mutable aliases, however, a CSS variable must be created so that we have a consistent value to reference in Tailwind config.

By default, any CSS variables created will have the name `--wrp-alias-XXXXX`, where `XXXXX` is replaced with a randomly generated sequence of characters.

If you want to have control over the name of the generated variable, you can pass a `name` property to your alias. The variable will use the name provided, for example, the following code will create a CSS variable `--surface`:

```js
const { createPlugin } = require("windy-radix-palette");

const colors = createPlugin();

module.exports = {
	theme: {
		extend: {
			colors: {
				surface: colors.alias({
					name: "surface",
					light: "hsla(0, 0%, 100%, 0.9)",
					dark: "rgba(0, 0, 0, 0.25)",
				}),
			},
		},
	},
};
```

### Opacity Support

Use of Tailwind's opacity modifier is disabled by default. This means that classes like the following will not work with the default plugin configuration:

```html
<button class="bg-red-9/50">Button</button>
```

This is partially an opinionated decision (the Radix Colors are hand-picked with purpose), but also because it makes support for the P3 colors included in Radix Colors v3 a much better experience for users of this plugin.

```js
const { createPlugin } = require("windy-radix-palette");

const colors = createPlugin({
	opacitySupport: true,
});

module.exports = {
	plugins: [colors.plugin],
};
```

If you'd like to enable support for the opacity modifier, bear in mind that P3 colors will not be automatically applied when support is detected, and instead you will have to do this manually, with the help of the `p3` modifier added by this plugin:

```html
<button class="bg-red-9 p3:bg-redP3-9">Button</button>
```

### Root Selector

By default, this plugin will add CSS properties to the `:root` CSS [pseudo-class](https://developer.mozilla.org/en-US/docs/Web/CSS/:root). The selector where these properties are placed can be customized via the `rootSelector` option. For example, when working with shadow DOM you might want to put the properties under the `:host` selector:

```js
const { createPlugin } = require("windy-radix-palette");

const colors = createPlugin({
	rootSelector: ":host",
});

module.exports = {
	plugins: [colors.plugin],
};
```

## Dark mode

The colors in this palette will automatically switch to the light/dark variant based on your Tailwind dark mode settings:

-   When `darkMode` is not set, or is set to `'media'`, the palette will change based on the user's preferred color scheme ([`prefers-color-scheme`](https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-color-scheme))
-   When `darkMode` is set to `'class'`, the palette will change based on the presence of the dark mode selector (defaults to `.dark`), note that you can [customize the dark mode selector](https://tailwindcss.com/docs/dark-mode#customizing-the-class-name) if required

## Typography

We also ship a typography preset that is meant to be used in combination with `windy-radix-palette` and `@tailwindcss/typography`. It adds custom color themes for all available Radix colors.

### Installation

```sh
npm install --save-dev windy-radix-typography @tailwindcss/typography
```

### Usage

Add it to your Tailwind config:

```js
const { createPlugin } = require("windy-radix-palette");

const colors = createPlugin();

module.exports = {
	plugins: [colors.plugin, require("@tailwindcss/typography")],
	presets: [require("windy-radix-typography")],
};
```

Now you can use the prose themes in your markup:

```html
<div class="prose prose-mauve">...</div>
```

### Customization

Customization is done in the way you'd typically customize typography styles in Tailwind. Let's say that you want to make `a` tags blue:

```js
<div class="prose prose-slate prose-a:text-blue-11">...</div>
```

## Prior Art

-   [Radix UI](https://github.com/radix-ui)
