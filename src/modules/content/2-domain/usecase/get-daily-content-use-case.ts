import type { DailyContent } from '../models/content';
import { VARIANTS_PER_STATION } from '../models/content';
import type { ContentRepo } from '../repository/content-repo';

export interface GetDailyContentUseCase {
  /**
   * One variant of each kind for a station. `attempt` is how many times the
   * user has already worked this station, so repeats serve fresh material.
   */
  execute(station: number, attempt: number): Promise<DailyContent>;
}

export class GetDailyContentUseCaseImpl implements GetDailyContentUseCase {
  constructor(private readonly contentRepo: ContentRepo) {}

  async execute(station: number, attempt: number): Promise<DailyContent> {
    const [reading, writing, picture] = await Promise.all([
      this.contentRepo.readingForStation(station),
      this.contentRepo.writingForStation(station),
      this.contentRepo.pictureForStation(station),
    ]);

    return {
      station,
      reading: pickVariant(reading, attempt),
      writing: pickVariant(writing, attempt),
      picture: pickVariant(picture, attempt),
    };
  }
}

/**
 * Rotates through the available variants rather than indexing by `attempt`
 * directly, so a station with fewer than ten variants still works.
 */
function pickVariant<T>(items: T[], attempt: number): T | null {
  if (items.length === 0) return null;
  const wanted = attempt % VARIANTS_PER_STATION;
  return items[wanted % items.length] ?? null;
}
