# Windy Radix Palette

Brings [Radix Colors](https://www.radix-ui.com/colors) to [Tailwind](https://tailwindcss.com/).

Features an automatic dark mode palette switch based on the presence of the `.dark` class, and [Typography plugin](#typography) which extends on the official `@tailwindcss/typography` plugin.

## Installation

```bash
npm install --save-dev windy-radix-palette @radix-ui/colors
```

## Usage

Add the plugin to your Tailwind config:

```js
module.exports = {
  plugins: [require('windy-radix-palette')],
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
const radixColors = require('@radix-ui/colors');

module.exports = {
  plugins: [
    require('windy-radix-palette')({
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

## Dark mode

Unlike in the default Tailwind palette, Radix Colors does not share a color palette between light and dark mode. The palettes are designed to be used exclusively in their associated mode.

This package embraces that philosophy by toggling between the palettes based on the presence of a `dark` class, so you only need to use a single class to support both light and dark mode.

To toggle between light and dark mode, you will need to manually add the `dark` class to an element. See the [Tailwind docs on toggling dark mode manually](https://tailwindcss.com/docs/dark-mode#toggling-dark-mode-manually) for more information.

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
    require('windy-radix-palette'),
    require('@tailwindcss/typography'),
    require('windy-radix-typography'),
  ],
};
```

Now you can use the prose themes in your markup:

```html
<div class="prose prose-mauve">...</div>
```

Check out the docs and demo [here](https://windy-radix-palette.vercel.app/docs/typography/getting-started).

## Attributions

[Radix UI](https://github.com/radix-ui) team for creating this wonderful color palette!
