import {
  GetDailyContentUseCaseImpl,
  type GetDailyContentUseCase,
} from '../../2-domain/usecase/get-daily-content-use-case';
import { ContentRepoImpl } from '../../3-data/repository/content-repo-impl';

export type {
  ContentCoverage,
  ContentKind,
  DailyContent,
  PictureTask,
  ReadingQuestion,
  ReadingTask,
  WritingTask,
} from '../../2-domain/models/content';
export { VARIANTS_PER_STATION } from '../../2-domain/models/content';

/** The content module's only public surface. */
export class ContentEndpoint {
  private static readonly repo = new ContentRepoImpl();
  private static readonly getDaily: GetDailyContentUseCase = new GetDailyContentUseCaseImpl(
    ContentEndpoint.repo
  );

  static dailyContent(station: number, attempt = 0) {
    return ContentEndpoint.getDaily.execute(station, attempt);
  }

  static coverage(totalStations: number) {
    return ContentEndpoint.repo.coverage(totalStations);
  }
}
