import {
  CompleteSkillUseCaseImpl,
  type CompleteSkillUseCase,
} from '../../2-domain/usecase/complete-skill-use-case';
import {
  GetJourneyUseCaseImpl,
  type GetJourneyUseCase,
} from '../../2-domain/usecase/get-journey-use-case';
import {
  GetStationProgressUseCaseImpl,
  type GetStationProgressUseCase,
} from '../../2-domain/usecase/get-station-progress-use-case';
import { ProgressRepoImpl } from '../../3-data/repository/progress-repo-impl';

export type { Journey, SkillId, StationProgress } from '../../2-domain/models/progress';

/** The progress module's only public surface. */
export class ProgressEndpoint {
  private static readonly repo = new ProgressRepoImpl();

  private static readonly journey: GetJourneyUseCase = new GetJourneyUseCaseImpl(
    ProgressEndpoint.repo
  );
  private static readonly stationProgress: GetStationProgressUseCase =
    new GetStationProgressUseCaseImpl(ProgressEndpoint.repo);
  private static readonly completeSkill: CompleteSkillUseCase = new CompleteSkillUseCaseImpl(
    ProgressEndpoint.repo
  );

  static currentJourney() {
    return ProgressEndpoint.journey.execute();
  }

  static forStation(station: number) {
    return ProgressEndpoint.stationProgress.execute(station);
  }

  static markSkillDone(station: number, skill: import('../../2-domain/models/progress').SkillId) {
    return ProgressEndpoint.completeSkill.execute(station, skill);
  }
}
