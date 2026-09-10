import { SKILL_IDS } from '@/constants/lines';

import type { SkillId } from '../../2-domain/models/progress';
import type { ProgressRepo } from '../../2-domain/repository/progress-repo';

import { openProgressDatabase } from './progress-database';

/** Stores progress in SQLite. The only class here that speaks SQL. */
export class ProgressRepoImpl implements ProgressRepo {
  async completedSkills(station: number): Promise<SkillId[]> {
    const db = await openProgressDatabase();
    const rows = await db.getAllAsync<{ skill: string }>(
      'SELECT skill FROM skill_done WHERE station = ?',
      station
    );
    return rows.map((row) => row.skill).filter(isSkillId);
  }

  async markSkillDone(station: number, skill: SkillId): Promise<void> {
    const db = await openProgressDatabase();
    await db.runAsync(
      'INSERT OR REPLACE INTO skill_done (station, skill, completedAt) VALUES (?, ?, ?)',
      station,
      skill,
      new Date().toISOString()
    );
  }

  async reachedStations(): Promise<number[]> {
    const db = await openProgressDatabase();
    const rows = await db.getAllAsync<{ station: number; n: number }>(
      'SELECT station, COUNT(*) AS n FROM skill_done GROUP BY station HAVING n >= ? ORDER BY station',
      SKILL_IDS.length
    );
    return rows.map((row) => row.station);
  }
}

function isSkillId(value: string): value is SkillId {
  return (SKILL_IDS as readonly string[]).includes(value);
}
