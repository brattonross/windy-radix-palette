const fs = require('fs/promises');
const path = require('path');
const prettier = require('prettier');

const COLORS_PATH = path.dirname(require.resolve('@radix-ui/colors'));

function radixToTailwindConfig(color) {
  return Object.fromEntries(
    [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((n) => [
      n,
      `var(--${color}${n})`,
    ])
  );
}

async function generate() {
  const allFiles = await fs.readdir(COLORS_PATH, 'utf-8');
  const cssFiles = allFiles.filter((file) => file.endsWith('.css'));

  try {
    let baseCss = '';
    let colors = [];

    // Create a modified copy of each Radix Colors CSS file
    await Promise.all(
      cssFiles.map(async (file) => {
        const originalCss = await fs.readFile(
          path.join(COLORS_PATH, file),
          'utf-8'
        );
        const editedCss = originalCss.replace(/\.dark-theme/, '.dark');

        const editedFilePath = path.join(__dirname, file);
        await fs.writeFile(editedFilePath, editedCss, 'utf-8');

        const color = path.basename(file, '.css');
        baseCss += `@import './${color}.css';\n`;
        if (!color.toLowerCase().includes('dark')) {
          colors.push(color);
        }
      })
    );

    // Create a CSS file for base layer styles
    await fs.writeFile(path.join(__dirname, 'base.css'), baseCss, 'utf-8');

    // Create a js file that contains the color definitions
    await fs.writeFile(
      path.join(__dirname, 'colors.js'),
      prettier.format(
        `module.exports = ${JSON.stringify(
          Object.fromEntries(
            colors.map((color) => [color, radixToTailwindConfig(color)])
          ),
          null,
          2
        )};`,
        {
          parser: 'babel',
        }
      ),
      'utf-8'
    );

    // Create the preset file
    await fs.writeFile(
      path.join(__dirname, 'index.js'),
      prettier.format(
        `const colors = require('./colors');
        module.exports = {
          darkMode: 'class',
          theme: {
            extend: {
              colors
            }
          }
        };`,
        { parser: 'babel' }
      ),
      'utf-8'
    );
  } catch (err) {
    console.error('Failed to generate files.', err);
  }
}

generate();
