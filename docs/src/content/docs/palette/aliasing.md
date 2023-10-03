---
title: "Aliasing"
---

It is considered a good practice to create semantic names for the colors you are using in your project. For example, you might map the name "success" to a green color, "error" to a red color etc.

There is a helper functions included in this package to help you create aliases:

```js
const { alias } = require("windy-radix-palette");

module.exports = {
	theme: {
		extend: {
			colors: {
				// Alias an entire palette
				success: alias("green"),
				error: alias("red"),

				// Alias a single color
				"high-contrast": alias("slate", 12),
			},
		},
	},
};
```

Then you could use the above like so:

```html
<div class="bg-success-3 text-high-contrast">Hello world</div>
```
