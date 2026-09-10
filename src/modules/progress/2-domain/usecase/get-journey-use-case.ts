import type { Journey } from '../models/progress';
import type { ProgressRepo } from '../repository/progress-repo';

export interface GetJourneyUseCase {
  execute(): Promise<Journey>;
}

export class GetJourneyUseCaseImpl implements GetJourneyUseCase {
  constructor(private readonly progressRepo: ProgressRepo) {}

  async execute(): Promise<Journey> {
    const reachedStations = await this.progressRepo.reachedStations();
    // The train stands at the first station that is not finished yet.
    const currentStation = reachedStations.length === 0 ? 1 : Math.max(...reachedStations) + 1;
    return { currentStation, reachedStations };
  }
}
