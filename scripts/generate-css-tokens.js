import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const tokensPath = path.join(__dirname, '../src/design/tokens.json');
const cssPath = path.join(__dirname, '../src/index.css');

const tokens = JSON.parse(fs.readFileSync(tokensPath, 'utf8'));

let rootCss = ':root {\n';
let darkCss = '.dark {\n';

// Helper to format key
function toKebab(str) {
  return str.replace(/[A-Z]/g, m => '-' + m.toLowerCase());
}

// Map color tokens
for (const [key, value] of Object.entries(tokens.color.light)) {
  rootCss += `  --ui-color-${toKebab(key)}: ${value};\n`;
}
for (const [key, value] of Object.entries(tokens.color.dark)) {
  darkCss += `  --ui-color-${toKebab(key)}: ${value};\n`;
}

// Map space tokens
for (const [key, value] of Object.entries(tokens.space)) {
  rootCss += `  --ui-space-${toKebab(key)}: ${value};\n`;
}

// Map radius tokens
for (const [key, value] of Object.entries(tokens.radius)) {
  rootCss += `  --ui-radius-${toKebab(key)}: ${value};\n`;
}

// Map shadow tokens
for (const [key, value] of Object.entries(tokens.shadow)) {
  rootCss += `  --ui-shadow-${toKebab(key)}: ${value};\n`;
}

// Map font tokens
for (const [key, value] of Object.entries(tokens.font)) {
  rootCss += `  --ui-font-${toKebab(key)}: ${value};\n`;
}

// Map motion tokens
for (const [key, value] of Object.entries(tokens.motion)) {
  rootCss += `  --ui-motion-${toKebab(key)}: ${value};\n`;
}

rootCss += '}';
darkCss += '}';

const generatedCss = `${rootCss}\n\n${darkCss}`;

let currentCss = fs.readFileSync(cssPath, 'utf8');

// Replace everything between :root { ... } and .dark { ... }
const regex = /:root\s*\{[^}]*\}\s*\.dark\s*\{[^}]*\}/;
if (regex.test(currentCss)) {
  currentCss = currentCss.replace(regex, generatedCss);
  fs.writeFileSync(cssPath, currentCss);
  console.log('Successfully updated src/index.css with tokens.json values.');
} else {
  console.error('Could not find existing :root and .dark blocks in index.css to replace.');
  process.exit(1);
}
