const radix = require("@radix-ui/colors");
const plugin = require("tailwindcss/plugin");

const windyRadixPalette = plugin.withOptions(
  ({ colors = radix, rootSelector = ":root" } = {}) => {
    let rootColors = {};
    let darkModeColors = {};

    for (const [colorName, colorObj] of Object.entries(colors)) {
      const colorMap = colorName.includes("Dark") ? darkModeColors : rootColors;
      for (const [key, value] of Object.entries(colorObj)) {
        if (key.includes("A")) {
          colorMap[`--${key}`] = value;
        } else {
          const [hue, saturation, lightness] = value
            .match(/\d+/g)
            ?.map(Number) ?? [0, 0, 0];
          colorMap[`--${key}`] = `${hue}deg ${saturation}% ${lightness}%`;
        }
      }
    }

    return ({ addBase, config }) => {
      const [darkMode, className = ".dark"] = [].concat(
        config("darkMode", "media")
      );

      if (darkMode === "class") {
        addBase({
          [rootSelector]: rootColors,
          [className]: darkModeColors,
        });
      } else {
        addBase({
          [rootSelector]: rootColors,
          "@media (prefers-color-scheme: dark)": {
            [rootSelector]: darkModeColors,
          },
        });
      }
    };
  },
  ({ colors = radix } = {}) => {
    const themeColors = {};

    for (const [colorName, colorObj] of Object.entries(colors)) {
      if (colorName.includes("Dark")) {
        continue;
      }

      const themeColor = {};
      for (const key of Object.keys(colorObj)) {
        const scale = key.replace(colorName, "");
        if (key.includes("A")) {
          themeColor[scale] = `var(--${colorName}${scale})`;
        } else {
          themeColor[
            scale
          ] = `hsl(var(--${colorName}${scale}) / <alpha-value>)`;
        }
      }

      themeColors[colorName] = themeColor;
    }

    return {
      theme: {
        extend: {
          colors: themeColors,
        },
      },
    };
  }
);

module.exports = windyRadixPalette;
