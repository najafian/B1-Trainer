/**
 * Asserts every skill line is readable in every state it is drawn in:
 *
 *   1. filled badge   - onColor on top of color
 *   2. outlined badge - textOnLight on the light ground
 *   3. outlined badge - textOnDark on the night ground
 *
 * The brand colours alone do not survive this: U3 and U4 are too light on
 * white, U1/U2/U6/BB too dark on the night ground. That is why the tokens carry
 * hue-preserving text variants, and why this runs in CI.
 *
 * Parses src/constants/lines.ts rather than importing it, so it runs on plain
 * node with no TypeScript loader and no duplicated colour values.
 *
 * Run with: npm run check:contrast
 */
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const source = readFileSync(join(here, '..', 'src', 'constants', 'lines.ts'), 'utf8');

const ENTRY =
  /(\w+):\s*\{\s*line:\s*'([^']+)',\s*labelDe:\s*'[^']*',\s*color:\s*'(#[0-9A-Fa-f]{6})',\s*onColor:\s*'(#[0-9A-Fa-f]{6})',\s*textOnLight:\s*'(#[0-9A-Fa-f]{6})',\s*textOnDark:\s*'(#[0-9A-Fa-f]{6})'/g;

const ground = (name) =>
  source.match(new RegExp(`${name}\\s*=\\s*'(#[0-9A-Fa-f]{6})'`))?.[1] ?? null;

const LIGHT = ground('LIGHT_GROUND');
const DARK = ground('DARK_GROUND');

const channel = (v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4);

function luminance(hex) {
  const h = hex.replace('#', '');
  const [r, g, b] = [0, 2, 4].map((i) => channel(parseInt(h.slice(i, i + 2), 16) / 255));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function contrast(a, b) {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

const MIN = 4.5;
const entries = [...source.matchAll(ENTRY)];

if (entries.length === 0 || !LIGHT || !DARK) {
  console.error('Could not parse src/constants/lines.ts - has its shape changed?');
  process.exit(1);
}

let failed = 0;
const seenDark = new Map();

for (const [, id, line, color, onColor, textOnLight, textOnDark] of entries) {
  const cases = [
    ['filled  ', onColor, color],
    ['on light', textOnLight, LIGHT],
    ['on dark ', textOnDark, DARK],
  ];
  for (const [label, fg, bg] of cases) {
    const ratio = contrast(fg, bg);
    const ok = ratio >= MIN;
    if (!ok) failed++;
    console.log(
      `${ok ? 'PASS' : 'FAIL'}  ${line.padEnd(3)} ${id.padEnd(11)} ${label}  ${fg} on ${bg}  ${ratio.toFixed(2)}:1`
    );
  }
  // A duplicated variant means a copy-paste slip between lines.
  if (seenDark.has(textOnDark)) {
    failed++;
    console.log(`FAIL  ${line} shares textOnDark ${textOnDark} with ${seenDark.get(textOnDark)}`);
  }
  seenDark.set(textOnDark, line);
}

if (failed > 0) {
  console.error(`\n${failed} check(s) failed - fix the variants in src/constants/lines.ts`);
  process.exit(1);
}
console.log(`\nAll ${entries.length} lines readable in all three states (>= ${MIN}:1).`);
