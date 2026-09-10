import type { SkillId } from '../models/progress';

/** Contract for the passenger's own progress. Implemented over SQLite. */
export interface ProgressRepo {
  completedSkills(station: number): Promise<SkillId[]>;
  markSkillDone(station: number, skill: SkillId): Promise<void>;
  reachedStations(): Promise<number[]>;
}
