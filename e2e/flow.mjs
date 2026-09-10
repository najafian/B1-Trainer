/**
 * End-to-end check of the core loop, driven against the web build.
 *
 * Uses the system Chrome over CDP rather than a downloaded browser, so it needs
 * no playwright install step - only a dev server:
 *
 *   npx expo start --web --port 8099
 *   npm run e2e
 *
 * Set E2E_BASE_URL or E2E_CHROME to override the defaults.
 */
import { chromium } from 'playwright-core';

const BASE = process.env.E2E_BASE_URL ?? 'http://localhost:8099';
const CHROME = process.env.E2E_CHROME ?? '/usr/bin/google-chrome';
/** The web build renders through Metro, so first paint is not instant. */
const SETTLE = 2500;

let failures = 0;
const check = (ok, msg) => {
  if (!ok) failures++;
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${msg}`);
};

const browser = await chromium.launch({ executablePath: CHROME, args: ['--no-sandbox'] });
const page = await browser.newPage({ viewport: { width: 820, height: 1000 } });
const errors = [];
page.on('pageerror', (e) => errors.push(String(e)));

try {
  await page.goto(BASE, { waitUntil: 'networkidle' });
  await page.waitForTimeout(SETTLE);
  check(await page.getByText('Sich vorstellen').first().isVisible(), 'home shows today’s station');

  await page.getByLabel(/Lesen, Linie U3/).click();
  await page.waitForTimeout(SETTLE);
  check(page.url().includes('/station/1/lesen'), 'home badge opens the reading screen');

  const submit = page.getByLabel('Antworten abgeben');
  check(await submit.isDisabled(), 'answer key is withheld until every question is answered');

  await page.getByLabel('Der Text sagt es nicht genau.').click();
  await page.getByLabel('Sie sucht eine Arbeitsstelle.').click();
  await page.getByLabel('Er kocht und spielt Fußball.').click();
  await page.waitForTimeout(600);
  check(await submit.isEnabled(), 'submit enables once all answered');

  await submit.click();
  await page.waitForTimeout(1200);
  // Assert the stamp itself, not loose page text: getByText is case-insensitive,
  // so a plain string here passed even after the result became a stamp.
  const verdict = await page.getByLabel(/^Bewertung:/).getAttribute('aria-label');
  check(
    verdict === 'Bewertung: BESTANDEN. 3 VON 3 RICHTIG',
    `stamped with the earned verdict (“${verdict}”)`
  );

  await page.getByLabel('Lesen als erledigt markieren').click();
  await page.waitForTimeout(SETTLE);

  await page.goto(BASE, { waitUntil: 'networkidle' });
  await page.waitForTimeout(SETTLE);
  const label = await page.getByLabel(/Lesen, Linie U3/).getAttribute('aria-label');
  check(/erledigt/.test(label ?? ''), `progress survives the round trip (“${label}”)`);

  // --- Sprechen: the picture description is time-gated, not answer-gated ---
  await page.goto(`${BASE}/station/1/sprechen`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(SETTLE);

  const reveal = page.getByLabel('Musterbeschreibung aufdecken');
  check(await reveal.isDisabled(), 'model description is withheld before the minute is up');

  await page.getByLabel('Zeit starten').click();
  await page.waitForTimeout(3200);
  const clock = await page.getByText(/\d\d:\d\d \/ 01:00/).textContent();
  check(/00:0[23]/.test(clock ?? ''), `timer runs while speaking (“${clock?.trim()}”)`);
  check(await reveal.isDisabled(), 'still withheld part-way through');

  check(errors.length === 0, `no page errors (${errors.length})`);
  if (errors.length) console.log(errors.slice(0, 3).join('\n'));
} finally {
  await browser.close();
}

console.log(failures === 0 ? '\nALL CHECKS PASSED' : `\n${failures} CHECK(S) FAILED`);
process.exit(failures === 0 ? 0 : 1);
