# Windy Radix Palette

Tailwind preset for bringing [Radix Colors](https://www.radix-ui.com/colors) palette to [Tailwind](https://tailwindcss.com/).

## Features

- Automatic dark mode palette ✨
- Prototype fast by making all colors available 💨
- Exclude colors you don't need to keep your CSS lean 💪

## Usage

Install the preset from npm. You will also need `postcss-import` or an equivalent way to import this preset's base styles into your CSS:

```bash
npm install --save-dev windy-radix-palette postcss-import
```

### Quick start

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

Now the colors will become available for use with Tailwind utilities:

```html
<button class="bg-tomato-4 hover:bg-tomato-5 text-tomatoA-11">Button</button>
```

### À la carte

Colors can be added individually:

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

Import the same colors that you used in your Tailwind config. Note that you need to also import the dark css as well if you want to use dark mode:

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

This package embraces that philosophy by toggling between the palettes based on the presence of a `dark` class, so instead of needing to write `bg-blue-3 dark:bg-blueDark-3`, you just need to write `bg-blue-3`, and the `blue-3` from the dark palette will be applied when wrapped in an element with the `dark` class.

### Class strategy

Currently, this preset works best when the Tailwind dark mode strategy is set to `class`. If you don't specify a dark mode strategy in your Tailwind config, then the preset will set it to `class`.

To toggle between light and dark mode, you will need to manually add the `dark` class to an element. See the [Tailwind docs on toggling dark mode manually](https://tailwindcss.com/docs/dark-mode#toggling-dark-mode-manually) for more information.

### Media strategy

Whilst it is possible to use this preset with the media strategy, it isn't fully supported at this time. You will still need to manually add the `dark` class to an element in order for the dark mode palette to be applied.

## How does it work?

This package uses the [Radix Colors](https://www.radix-ui.com/colors) palette to generate a Tailwind preset and a modifed set of the Radix Colors CSS that are more compatible with Tailwind.

## Thanks

Thanks go out to the [Radix UI](https://github.com/radix-ui) team for creating this wonderful color palette!
