---
title: "Getting started"
---

Install `windy-radix-palette`:

```bash
npm install --save-dev windy-radix-palette @radix-ui/colors
```

Add the plugin to your Tailwind config:

```js
// tailwind.config.js
module.exports = {
	// ...
	plugins: [require("windy-radix-palette")],
};
```

Now you're set to start using Radix Colors classes!

```html
<div class="bg-crimson-3 text-crimson-11 dark:bg-jade-3">Hello world</div>
```
