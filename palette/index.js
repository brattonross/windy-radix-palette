const radix = require('@radix-ui/colors');
const plugin = require('tailwindcss/plugin');

const windyRadixPalette = plugin.withOptions(
  ({ colors = radix } = {}) => {
    let rootColors = {};
    let darkModeColors = {};

    for (const [colorName, colorObj] of Object.entries(colors)) {
      const colorMap = colorName.includes('Dark') ? darkModeColors : rootColors;
      for (const [key, value] of Object.entries(colorObj)) {
        colorMap[`--${key}`] = value;
      }
    }

    return ({ addBase }) => {
      addBase({
        ':root': rootColors,
        '.dark': darkModeColors,
      });
    };
  },
  ({ colors = radix } = {}) => {
    const themeColors = {};

    for (const [colorName, colorObj] of Object.entries(colors)) {
      if (colorName.includes('Dark')) {
        continue;
      }

      const themeColor = {};
      for (const key of Object.keys(colorObj)) {
        const scale = key.replace(colorName, '');
        themeColor[scale] = `var(--${colorName}${scale})`;
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
