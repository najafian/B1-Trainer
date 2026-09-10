import { SKILL_IDS } from '@/constants/lines';

import type { SkillId } from '../../2-domain/models/progress';
import type { ProgressRepo } from '../../2-domain/repository/progress-repo';

const STORAGE_KEY = 'linie-b1:progress';

type Stored = Record<string, string[]>;

/**
 * Web implementation of progress storage, backed by localStorage.
 *
 * expo-sqlite's web build is alpha and fails Metro's chunk serializer, so the
 * browser build keeps progress in localStorage instead. Same contract, same
 * use cases - only this class differs.
 *
 * Metro picks this file over progress-repo-impl.ts for the web platform.
 */
export class ProgressRepoImpl implements ProgressRepo {
  async completedSkills(station: number): Promise<SkillId[]> {
    return (read()[String(station)] ?? []).filter(isSkillId);
  }

  async markSkillDone(station: number, skill: SkillId): Promise<void> {
    const all = read();
    const key = String(station);
    const done = new Set(all[key] ?? []);
    done.add(skill);
    all[key] = [...done];
    write(all);
  }

  async reachedStations(): Promise<number[]> {
    const all = read();
    return Object.entries(all)
      .filter(([, skills]) => skills.length >= SKILL_IDS.length)
      .map(([station]) => Number(station))
      .sort((a, b) => a - b);
  }
}

function read(): Stored {
  try {
    return JSON.parse(globalThis.localStorage?.getItem(STORAGE_KEY) ?? '{}') as Stored;
  } catch {
    // Private mode, blocked storage, or corrupt value - start empty.
    return {};
  }
}

function write(value: Stored): void {
  try {
    globalThis.localStorage?.setItem(STORAGE_KEY, JSON.stringify(value));
  } catch {
    // Progress simply does not persist in this browser context.
  }
}

function isSkillId(value: string): value is SkillId {
  return (SKILL_IDS as readonly string[]).includes(value);
}
