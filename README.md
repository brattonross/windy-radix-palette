# Windy Radix Palette

An unofficial package to improve the compatibility of [Radix Colors](https://www.radix-ui.com/colors) and [Tailwind](https://tailwindcss.com/).

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

The typography plugin creates a set of themes for Tailwind Typography, based on the Radix Colors gray scales.

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
	plugins: [
		colors.plugin,
		require("@tailwindcss/typography"),
		require("windy-radix-typography"),
	],
};
```

Now you can use the prose themes in your markup:

```html
<div class="prose prose-mauve">...</div>
```

## Prior Art

-   [Radix UI](https://github.com/radix-ui)
