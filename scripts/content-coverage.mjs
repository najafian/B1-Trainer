/**
 * Reports how much of the offline corpus exists against the target of
 * 10 variants per station per kind.
 *
 * Run with: npm run check:content
 */
import { readFileSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const read = (...p) => JSON.parse(readFileSync(join(here, '..', ...p), 'utf8'));

const seedDir = join(here, '..', 'src', 'modules', 'content', '3-data', 'repository', 'seed', 'stations');
const seed = { reading: [], writing: [], picture: [] };
for (const file of readdirSync(seedDir).filter((f) => f.endsWith('.json'))) {
  const kind = file.replace(/^\d+-/, '').replace(/\.json$/, '');
  if (seed[kind]) seed[kind].push(...JSON.parse(readFileSync(join(seedDir, file), 'utf8')));
}
const { stations } = read('src', 'modules', 'curriculum', '3-data', 'repository', 'curriculum.json');

const VARIANTS = 10;
const KINDS = ['reading', 'writing', 'picture'];
const required = stations.length * VARIANTS;

console.log(`Offline content coverage - ${stations.length} stations x ${VARIANTS} variants\n`);

let total = 0;
for (const kind of KINDS) {
  const items = seed[kind] ?? [];
  const covered = new Set(items.map((i) => `${i.station}:${i.variant}`)).size;
  total += covered;
  const pct = ((covered / required) * 100).toFixed(1);
  const bar = '#'.repeat(Math.round((covered / required) * 30)).padEnd(30, '.');
  console.log(`  ${kind.padEnd(8)} ${bar} ${String(covered).padStart(4)} / ${required}  (${pct}%)`);
}

const grandTotal = required * KINDS.length;
console.log(`\n  TOTAL    ${total} / ${grandTotal} items - ${grandTotal - total} still to author.`);

// Reading passages are specified at ~250 words; anything much shorter is not a
// B1 exam text. Report it rather than letting the corpus drift short.
const MIN_WORDS = 230;
const MAX_WORDS = 300;
const short = [];
for (const item of seed.reading ?? []) {
  const words = item.text.trim().split(/\s+/).filter(Boolean).length;
  if (words < MIN_WORDS || words > MAX_WORDS) short.push([item.id, words]);
}
console.log(`\n  Lesen length (target ${MIN_WORDS}-${MAX_WORDS} words)`);
if (short.length === 0) {
  console.log('           all passages in range');
} else {
  for (const [id, words] of short) {
    console.log(`           ${id.padEnd(10)} ${String(words).padStart(3)} words  ${words < MIN_WORDS ? 'TOO SHORT' : 'TOO LONG'}`);
  }
}

const missingTitles = stations.filter((s) => !s.titleConfirmed).length;
if (missingTitles > 0) {
  console.log(`  NOTE     ${missingTitles} station titles are still placeholders.`);
}
