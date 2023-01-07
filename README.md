# Windy Radix Palette

Brings [Radix Colors](https://www.radix-ui.com/colors) to [Tailwind](https://tailwindcss.com/).

Features an automatic dark mode palette switch and [Typography plugin](#typography).

## Installation

```bash
npm install --save-dev windy-radix-palette @radix-ui/colors
```

## Usage

Add the plugin to your Tailwind config:

```js
module.exports = {
	plugins: [require("windy-radix-palette")],
};
```

Then you can use the classes in your markup!

```html
<button class="bg-tomato-4 hover:bg-tomato-5 text-tomatoA-11">Button</button>
```

## Options

### Colors

By default, this plugin will add CSS properties for **all** of the available Radix Colors. If you would rather only include the properties for colors that you are actually using, you can pass these as an option to the plugin:

```js
const radixColors = require("@radix-ui/colors");

module.exports = {
	plugins: [
		require("windy-radix-palette")({
			colors: {
				mauveA: radixColors.mauveA,
				mauveDarkA: radixColors.mauveDarkA,
				red: radixColors.red,
				redDark: radixColors.redDark,
			},
		}),
	],
};
```

### Root Key

By default, this plugin will add CSS Variable to the `:root` identifier (which points to the root of the current DOM frame). To switch the rootKey to `:host` for example when working with shadowDOM, pass a rootKey option to the plugin:


default, this plugin will add CSS properties for **all** of the available Radix Colors. If you would rather only include the properties for colors that you are actually using, you can pass these as an option to the plugin:

```js

module.exports = {
	plugins: [
		require("windy-radix-palette")({
				rootKey: ":host",
			},
		}),
	],
};
```

## Dark mode

Thanks to the design of the Radix Colors palettes, you don't actually need to do anything to make dark mode work! The colors in this palette will automatically switch to the light/dark variant based on your Tailwind dark mode settings:

- When `darkMode` is not set, or is set to `'media'`, the palette will change based on the user's preferred color scheme ([`prefers-color-scheme`](https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-color-scheme))
- When `darkMode` is set to `'class'`, the palette will change based on the presence of the dark mode selector (defaults to `.dark`), note that you can [customize the dark mode selector](https://tailwindcss.com/docs/dark-mode#customizing-the-class-name) if required

Unlike the default Tailwind palette, Radix Colors come in light and dark variants, and the palettes are meant to be used only in light and dark mode respectively (in order to meet WCAG color contrast guidelines). This means that you don't need to prefix any of your classes with `dark:`&mdash;the palettes are designed to [_just work_](https://www.youtube.com/watch?v=aAwaxTGnkSk) when switching between light and dark mode.

## Typography

The typography plugin creates a set of themes for Tailwind Typography, based on the Radix Colors gray scales.

### Installation

```bash
npm install --save-dev windy-radix-typography @tailwindcss/typography
```

### Usage

Add it to your Tailwind config:

```js
module.exports = {
	plugins: [
		require("windy-radix-palette"),
		require("@tailwindcss/typography"),
		require("windy-radix-typography"),
	],
};
```

Now you can use the prose themes in your markup:

```html
<div class="prose prose-mauve">...</div>
```

Check out the docs and demo [here](https://windy-radix-palette.vercel.app/docs/typography/getting-started).

## Attributions

- [Radix UI](https://github.com/radix-ui) team for creating these wonderful color palettes
