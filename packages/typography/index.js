const plugin = require("tailwindcss/plugin");

module.exports = plugin.withOptions(
	() => {
		return () => {};
	},
	({ colors = ["gray", "mauve", "slate", "sage", "olive", "sand"] } = {}) => {
		return {
			theme: {
				extend: {
					typography: ({ theme }) => {
						// TODO: Why doesn't Tailwind replace `<alpha-value>` for us?
						function getThemeColor(color, step) {
							return theme(`colors.${color}[${step}]`).replace(
								"<alpha-value>",
								"1"
							);
						}

						const themes = {};
						for (const color of colors) {
							themes[color] = {
								css: {
									"--tw-prose-body": getThemeColor(color, 12),
									"--tw-prose-headings": getThemeColor(color, 12),
									"--tw-prose-lead": getThemeColor(color, 11),
									"--tw-prose-links": getThemeColor(color, 12),
									"--tw-prose-bold": getThemeColor(color, 12),
									"--tw-prose-counters": getThemeColor(color, 11),
									"--tw-prose-bullets": getThemeColor(color, 7),
									"--tw-prose-hr": getThemeColor(color, 6),
									"--tw-prose-quotes": getThemeColor(color, 12),
									"--tw-prose-quote-borders": getThemeColor(color, 6),
									"--tw-prose-captions": getThemeColor(color, 11),
									"--tw-prose-code": getThemeColor(color, 12),
									"--tw-prose-pre-code": getThemeColor(color, 12),
									"--tw-prose-pre-bg": getThemeColor(color, 3),
									"--tw-prose-th-borders": getThemeColor(color, 7),
									"--tw-prose-td-borders": getThemeColor(color, 6),
									"--tw-prose-invert-body": getThemeColor(color, 12),
									"--tw-prose-invert-headings": getThemeColor(color, 12),
									"--tw-prose-invert-lead": getThemeColor(color, 11),
									"--tw-prose-invert-links": getThemeColor(color, 12),
									"--tw-prose-invert-bold": getThemeColor(color, 12),
									"--tw-prose-invert-counters": getThemeColor(color, 11),
									"--tw-prose-invert-bullets": getThemeColor(color, 7),
									"--tw-prose-invert-hr": getThemeColor(color, 6),
									"--tw-prose-invert-quotes": getThemeColor(color, 12),
									"--tw-prose-invert-quote-borders": getThemeColor(color, 6),
									"--tw-prose-invert-captions": getThemeColor(color, 11),
									"--tw-prose-invert-code": getThemeColor(color, 12),
									"--tw-prose-invert-pre-code": getThemeColor(color, 12),
									"--tw-prose-invert-pre-bg": getThemeColor(color, 3),
									"--tw-prose-invert-th-borders": getThemeColor(color, 7),
									"--tw-prose-invert-td-borders": getThemeColor(color, 6),
								},
							};
						}
						return themes;
					},
				},
			},
		};
	}
);
