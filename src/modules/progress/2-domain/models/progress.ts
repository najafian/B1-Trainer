import type { SkillId } from '@/constants/lines';

export type { SkillId };

/** How far along one station the passenger is. */
export type StationProgress = {
  station: number;
  completedSkills: SkillId[];
  /** True once all six lines are lit. */
  isReached: boolean;
};

/** The journey as a whole. */
export type Journey = {
  /** The station the train is standing at, 1..45. */
  currentStation: number;
  reachedStations: number[];
};
