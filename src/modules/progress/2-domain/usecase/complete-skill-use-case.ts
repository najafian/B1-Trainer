import { SKILL_IDS } from '@/constants/lines';

import type { SkillId, StationProgress } from '../models/progress';
import type { ProgressRepo } from '../repository/progress-repo';

export interface CompleteSkillUseCase {
  /** Marks one line done and reports the station's new state. */
  execute(station: number, skill: SkillId): Promise<StationProgress>;
}

export class CompleteSkillUseCaseImpl implements CompleteSkillUseCase {
  constructor(private readonly progressRepo: ProgressRepo) {}

  async execute(station: number, skill: SkillId): Promise<StationProgress> {
    await this.progressRepo.markSkillDone(station, skill);
    const completedSkills = await this.progressRepo.completedSkills(station);
    return {
      station,
      completedSkills,
      isReached: SKILL_IDS.every((id) => completedSkills.includes(id)),
    };
  }
}
