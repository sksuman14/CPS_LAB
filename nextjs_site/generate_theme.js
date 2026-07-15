const fs = require('fs');

const tailwindConfigPath = 'tailwind.config.ts';
let tailwindConfig = fs.readFileSync(tailwindConfigPath, 'utf8');

const colorsMatch = tailwindConfig.match(/colors:\s*\{([\s\S]*?)backgroundImage:/);
if (!colorsMatch) throw new Error('Could not find colors');

const colorsBlock = colorsMatch[1];
const colorRegex = /\"([a-zA-Z0-9-]+)\":\s*\"(#[0-9a-fA-F]+)\"/g;
let match;
const darkColors = {};
while ((match = colorRegex.exec(colorsBlock)) !== null) {
  darkColors[match[1]] = match[2];
}

const lightColors = {
  'on-tertiary': '#ffffff',
  'surface-bright': '#f8fafc',
  'outline-variant': '#cbd5e1',
  'on-tertiary-fixed-variant': '#3b0918',
  'on-secondary-fixed-variant': '#0d3b36',
  'on-tertiary-container': '#4a044e',
  'on-secondary': '#ffffff',
  'tertiary-container': '#fdf4ff',
  'on-background': '#0f172a',
  'secondary-fixed': '#ccfbf1',
  'surface-variant': '#f1f5f9',
  'on-secondary-fixed': '#042f2e',
  'on-surface': '#0f172a',
  'on-tertiary-fixed': '#4a044e',
  'surface-tint': '#2563eb',
  'primary-fixed': '#dbeafe',
  'tertiary-fixed': '#fae8ff',
  'surface': '#ffffff',
  'surface-container-low': '#f8fafc',
  'primary-fixed-dim': '#bfdbfe',
  'inverse-surface': '#1e293b',
  'surface-container-lowest': '#ffffff',
  'outline': '#94a3b8',
  'on-secondary-container': '#0f766e',
  'on-primary': '#ffffff',
  'error-container': '#fee2e2',
  'tertiary-fixed-dim': '#f5d0fe',
  'on-primary-fixed-variant': '#1e3a8a',
  'on-primary-container': '#1e40af',
  'error': '#ef4444',
  'background': '#f8fafc',
  'on-primary-fixed': '#172554',
  'secondary-container': '#ccfbf1',
  'inverse-on-surface': '#f8fafc',
  'surface-container': '#f1f5f9',
  'on-error-container': '#7f1d1d',
  'surface-dim': '#e2e8f0',
  'surface-container-highest': '#e2e8f0',
  'surface-container-high': '#e2e8f0',
  'primary-container': '#dbeafe',
  'inverse-primary': '#93c5fd',
  'secondary-fixed-dim': '#99f6e4',
  'secondary': '#0f766e',
  'primary': '#2563eb',
  'on-surface-variant': '#334155',
  'tertiary': '#c026d3',
  'on-error': '#ffffff'
};

let newTailwindConfig = tailwindConfig;
for (const [key, value] of Object.entries(darkColors)) {
  newTailwindConfig = newTailwindConfig.replace(
    new RegExp('\"' + key + '\":\\s*\"' + value + '\"'),
    '\"' + key + '\": \"var(--' + key + ')\"'
  );
}

newTailwindConfig = newTailwindConfig.replace(/colors:\s*\{/, 'colors: {\n        white: \"var(--color-white)\",\n        black: \"var(--color-black)\",');

fs.writeFileSync('tailwind.config.ts', newTailwindConfig);

let globalsCss = fs.readFileSync('src/app/globals.css', 'utf8');

let rootVars = `  :root {
    --color-white: #0f172a;
    --color-black: #ffffff;
`;
for (const key of Object.keys(darkColors)) {
  rootVars += `    --${key}: ${lightColors[key] || '#ffffff'};\n`;
}
rootVars += '  }';

let darkVars = `  .dark {
    --color-white: #ffffff;
    --color-black: #000000;
`;
for (const [key, value] of Object.entries(darkColors)) {
  darkVars += `    --${key}: ${value};\n`;
}
darkVars += '  }';

globalsCss = globalsCss.replace(/:root\s*\{[\s\S]*?\}\s*\.dark\s*\{[\s\S]*?\}/, rootVars + '\n\n' + darkVars);

fs.writeFileSync('src/app/globals.css', globalsCss);
console.log('Successfully updated tailwind.config.ts and globals.css');
