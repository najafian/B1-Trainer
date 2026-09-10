/**
 * Skill lines for "Linie B1".
 *
 * Each B1 skill is represented by a real Wiener Linien line, so the colours are
 * fixed by the product concept - they are not a palette choice. See the design
 * guide, section 1.
 *
 * `onColor` is the text colour that must be used on top of `color`. It is not
 * always white: U3 (orange) and U4 (green) do not reach WCAG AA against white,
 * so they carry dark text instead. `scripts/check-line-contrast.mjs` asserts
 * every pair, and runs in CI.
 *
 * The colours below are the commonly published Wiener Linien values and still
 * need to be verified against the official design manual before release.
 */

export const SKILL_IDS = [
  'sprechen',
  'schreiben',
  'lesen',
  'hoeren',
  'wortschatz',
  'werte',
] as const;

export type SkillId = (typeof SKILL_IDS)[number];

export type SkillLine = {
  /** Line glyph shown on the badge - never rely on colour alone (WCAG 1.4.1). */
  line: string;
  labelDe: string;
  color: string;
  onColor: string;
};

export const SkillLines: Record<SkillId, SkillLine> = {
  sprechen: { line: 'U1', labelDe: 'Sprechen', color: '#E20A16', onColor: '#FFFFFF' },
  schreiben: { line: 'U2', labelDe: 'Schreiben', color: '#A05DA5', onColor: '#FFFFFF' },
  lesen: { line: 'U3', labelDe: 'Lesen', color: '#EE7D00', onColor: '#1F1300' },
  hoeren: { line: 'U4', labelDe: 'Hören', color: '#009A49', onColor: '#00190C' },
  wortschatz: { line: 'U6', labelDe: 'Wortschatz', color: '#9C6B30', onColor: '#FFFFFF' },
  werte: { line: 'BB', labelDe: 'Werte', color: '#0068B4', onColor: '#FFFFFF' },
};

/** The fictional seventh line the whole journey runs on. */
export const LinieB1 = {
  name: 'Linie B1',
  /** Chosen to stay distinct from U1-U6 and the Badner Bahn. */
  color: '#00857D',
  reachedColor: '#00857D',
  aheadColor: '#C3C8CC',
} as const;
