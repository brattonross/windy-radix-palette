---
title: "Getting started"
---

The typography plugin is an extension of the official Tailwind Typography plugin. It adds support for Radix Colors grayscales as typography color themes.

Note that you need `windy-radix-palette` and `@tailwindcss/typography` installed and configured for this plugin to work.

Install `windy-radix-typography`:

```bash
npm install --save-dev windy-radix-typography @tailwindcss/typography
```

Add the plugin to your Tailwind config:

```js
// tailwind.config.js
module.exports = {
	// ...
	plugins: [
		require("windy-radix-palette"),
		require("@tailwindcss/typography"),
		require("windy-radix-typography"),
	],
};
```

Now you're set to start using the typography classes!

```html
<div class="prose prose-mauve">Hello world</div>
```
