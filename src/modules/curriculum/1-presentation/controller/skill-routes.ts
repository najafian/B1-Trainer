import type { SkillId } from '@/constants/lines';

/**
 * Skills that already have a screen. Shared by the home and station screens so
 * both agree on what is tappable; add a route here when a screen lands.
 */
export const ROUTE_BY_SKILL: Partial<Record<SkillId, string>> = {
  sprechen: 'sprechen',
  lesen: 'lesen',
  schreiben: 'schreiben',
};

export const isSkillAvailable = (skill: SkillId): boolean => Boolean(ROUTE_BY_SKILL[skill]);

export const skillHref = (station: number, skill: SkillId): string =>
  `/station/${station}/${ROUTE_BY_SKILL[skill]}`;
