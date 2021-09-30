const radixColors = require('@radix-ui/colors');

function colorKey(name, step) {
  return `${name.replace('Dark', '')}${step}`;
}

function fromRadixColor(key, color) {
  return [
    key,
    {
      1: color[colorKey(key, 1)],
      2: color[colorKey(key, 2)],
      3: color[colorKey(key, 3)],
      4: color[colorKey(key, 4)],
      5: color[colorKey(key, 5)],
      6: color[colorKey(key, 6)],
      7: color[colorKey(key, 7)],
      8: color[colorKey(key, 8)],
      9: color[colorKey(key, 9)],
      10: color[colorKey(key, 10)],
      11: color[colorKey(key, 11)],
      12: color[colorKey(key, 12)],
    },
  ];
}

const colors = Object.fromEntries(
  Object.entries(radixColors).map(([key, value]) => fromRadixColor(key, value))
);

module.exports = {
  theme: {
    colors,
  },
};
