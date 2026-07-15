const fs = require('fs');

function hexToRgb(hex) {
  if (!hex || hex === 'undefined') return '255 255 255';
  hex = hex.replace('#', '');
  if (hex.length === 3) {
    hex = hex.split('').map(char => char + char).join('');
  }
  const bigint = parseInt(hex, 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  return `${r} ${g} ${b}`;
}

let globalsCss = fs.readFileSync('src/app/globals.css', 'utf8');

globalsCss = globalsCss.replace(/--([a-zA-Z0-9-]+):\s*(#[0-9a-fA-F]{3,6});/g, (match, name, hex) => {
  return `--${name}: ${hexToRgb(hex)};`;
});

fs.writeFileSync('src/app/globals.css', globalsCss);

let tailwindConfig = fs.readFileSync('tailwind.config.ts', 'utf8');

// Replace "var(--color-name)" with 'rgb(var(--color-name) / <alpha-value>)'
tailwindConfig = tailwindConfig.replace(/\"var\(--([a-zA-Z0-9-]+)\)\"/g, (match, name) => {
  return `'rgb(var(--${name}) / <alpha-value>)'`;
});

fs.writeFileSync('tailwind.config.ts', tailwindConfig);
console.log('Successfully converted variables to rgb format');
