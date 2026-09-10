import type { PictureTask, ReadingTask, WritingTask } from '../models/content';
import type { ContentRepo } from '../repository/content-repo';

import { GetDailyContentUseCaseImpl } from './get-daily-content-use-case';

const reading = (variant: number) =>
  ({ id: `r-${variant}`, station: 1, variant, title: 't', text: 'x', questions: [] }) as ReadingTask;

function repoWith(readings: ReadingTask[]): ContentRepo {
  return {
    readingForStation: async () => readings,
    writingForStation: async () => [] as WritingTask[],
    pictureForStation: async () => [] as PictureTask[],
    coverage: async () => [],
  };
}

describe('GetDailyContentUseCase', () => {
  it('serves the first variant on the first attempt', async () => {
    const daily = await new GetDailyContentUseCaseImpl(
      repoWith([reading(0), reading(1)])
    ).execute(1, 0);
    expect(daily.reading?.variant).toBe(0);
  });

  it('serves a different variant when the station is repeated', async () => {
    const useCase = new GetDailyContentUseCaseImpl(repoWith([reading(0), reading(1), reading(2)]));
    const first = await useCase.execute(1, 0);
    const second = await useCase.execute(1, 1);
    expect(second.reading?.id).not.toBe(first.reading?.id);
  });

  it('wraps around when there are fewer than ten variants', async () => {
    // Most stations will be short of the full ten for a long while.
    const useCase = new GetDailyContentUseCaseImpl(repoWith([reading(0), reading(1)]));
    const third = await useCase.execute(1, 2);
    expect(third.reading?.variant).toBe(0);
  });

  it('returns null rather than throwing when a station has no content', async () => {
    const daily = await new GetDailyContentUseCaseImpl(repoWith([])).execute(42, 0);
    expect(daily.reading).toBeNull();
    expect(daily.writing).toBeNull();
    expect(daily.picture).toBeNull();
  });
});
