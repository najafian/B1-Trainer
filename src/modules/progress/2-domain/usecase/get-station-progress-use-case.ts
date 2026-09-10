import { SKILL_IDS } from '@/constants/lines';

import type { StationProgress } from '../models/progress';
import type { ProgressRepo } from '../repository/progress-repo';

export interface GetStationProgressUseCase {
  execute(station: number): Promise<StationProgress>;
}

export class GetStationProgressUseCaseImpl implements GetStationProgressUseCase {
  constructor(private readonly progressRepo: ProgressRepo) {}

  async execute(station: number): Promise<StationProgress> {
    const completedSkills = await this.progressRepo.completedSkills(station);
    return {
      station,
      completedSkills,
      isReached: SKILL_IDS.every((id) => completedSkills.includes(id)),
    };
  }
}
