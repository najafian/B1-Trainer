import type { SkillId } from '../models/progress';
import type { ProgressRepo } from '../repository/progress-repo';

import { GetJourneyUseCaseImpl } from './get-journey-use-case';

function repoWith(reached: number[]): ProgressRepo {
  return {
    completedSkills: async () => [] as SkillId[],
    markSkillDone: async () => {},
    reachedStations: async () => reached,
  };
}

describe('GetJourneyUseCase', () => {
  it('starts at station 1 when nothing is finished', async () => {
    const journey = await new GetJourneyUseCaseImpl(repoWith([])).execute();
    expect(journey.currentStation).toBe(1);
    expect(journey.reachedStations).toEqual([]);
  });

  it('stands at the station after the furthest one reached', async () => {
    const journey = await new GetJourneyUseCaseImpl(repoWith([1, 2, 3])).execute();
    expect(journey.currentStation).toBe(4);
  });

  it('uses the furthest station even when earlier ones were skipped', async () => {
    // Gating is soft, so a passenger may finish 5 without finishing 2.
    const journey = await new GetJourneyUseCaseImpl(repoWith([1, 5])).execute();
    expect(journey.currentStation).toBe(6);
  });
});
