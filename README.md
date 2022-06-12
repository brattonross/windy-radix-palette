# Windy Radix Palette

Tailwind preset for bringing [Radix Colors](https://www.radix-ui.com/colors) to [Tailwind](https://tailwindcss.com/).

Features an automatic dark mode palette switch based on the presence of the `.dark` class.

## Installation

```bash
npm install --save-dev windy-radix-palette
```

## Usage

### Tailwind CLI

Since Tailwind v3.1, the [Tailwind CLI has built-in support for CSS imports](https://tailwindcss.com/blog/tailwindcss-v3-1#built-in-support-for-css-imports-in-the-cli). This means that PostCSS is not required if you use Tailwind CLI v3.1+ to process your CSS.

Add the preset to your `tailwind.config.js`:

```js
module.exports = {
  presets: [require('windy-radix-palette')],
};
```

Import the base styles in your css:

```css
@import 'tailwindcss/base';
@import 'windy-radix-palette/base';

@import 'tailwindcss/components';

@import 'tailwindcss/utilities';
```

### PostCSS

Add the preset to your `tailwind.config.js`:

```js
module.exports = {
  presets: [require('windy-radix-palette')],
};
```
Add `postcss-import` to your `postcss.config.js`:

```js
module.exports = {
  plugins: {
    'postcss-import': {},
    tailwindcss: {},
    autoprefixer: {},
  },
};
```

Import the base styles in your css:

```css
@import 'tailwindcss/base';
@import 'windy-radix-palette/base';

@import 'tailwindcss/components';

@import 'tailwindcss/utilities';
```

## Usage

```html
<button class="bg-tomato-4 hover:bg-tomato-5 text-tomatoA-11">Button</button>
```

### À la carte

Colors can be manually added to Tailwind config if you prefer:

```js
const colors = require('windy-radix-palette/colors');

module.exports = {
  darkMode: 'class',
  theme: {
    colors: {
      blackA: colors.blackA,
      tomato: colors.tomato
    }
  }
};
```

Remember to also import the corresponding colors in your css:

```css
@import 'tailwindcss/base';
@import 'windy-radix-palette/blackA.css';
@import 'windy-radix-palette/tomato.css';
@import 'windy-radix-palette/tomatoDark.css';

@import 'tailwindcss/components';

@import 'tailwindcss/utilities';
```

See the [Tailwind docs](https://tailwindcss.com/docs/using-with-preprocessors#build-time-imports) for more information about build-time imports.

## Dark mode

Unlike in the default Tailwind palette, Radix Colors does not share a color palette between light and dark mode. The palettes are designed to be used exclusively in their associated mode.

This package embraces that philosophy by toggling between the palettes based on the presence of a `dark` class, so you only need to use a single class to support both light and dark mode.

### Class strategy

Currently, this preset works best when the Tailwind dark mode strategy is set to `class`. If you don't specify a dark mode strategy in your Tailwind config, then the preset will set it to `class`.

To toggle between light and dark mode, you will need to manually add the `dark` class to an element. See the [Tailwind docs on toggling dark mode manually](https://tailwindcss.com/docs/dark-mode#toggling-dark-mode-manually) for more information.

### Media strategy

Whilst it is possible to use this preset with the media strategy, it isn't fully supported at this time. You will still need to manually add the `dark` class to an element in order for the dark mode palette to be applied.

## Attributions

[Radix UI](https://github.com/radix-ui) team for creating this wonderful color palette!
