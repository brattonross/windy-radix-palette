# `windy-radix-palette`

Bring the [Radix Colors](https://www.radix-ui.com/colors) palette to [TailwindCSS](https://tailwindcss.com/) / [WindiCSS](https://windicss.org/)

## Getting Started

Install the preset:

```bash
npm install --save-dev windy-radix-palette
```

Add it to your `tailwind.config.js`:

```js
module.exports = {
  presets: [require('windy-radix-palette')],
  // your config here...
};
```

All set! Now you can use the colors like so:

```html
<button class="bg-tomato-4 hover:bg-tomato-5 active:bg-tomato-6 text-tomato-11">
  Button
</button>
```

Alpha and dark colors are included as well. Colors follow the naming convention [documented on the Radix site](https://www.radix-ui.com/docs/colors/palette-composition/the-scales).

## Dark Mode

If you want to support dark mode, you could do something like:

```html
<button class="bg-tomato-4 dark:bg-tomatoDark-4">Button</button>
```

## Motivation

I found that I have been reaching for Radix Colors in my recent projects, but I also tend to use Tailwind as my styling solution, so I wanted a quick and easy way to get access to Radix Colors without manually configuring them in each project.

## Thanks

Thanks go out to the [Radix UI](https://github.com/radix-ui) team for creating this wonderful color palette!
