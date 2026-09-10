import {
  GetStationsUseCaseImpl,
  type GetStationsUseCase,
  type StationOnLine,
} from '../../2-domain/usecase/get-stations-use-case';
import { StationRepoImpl } from '../../3-data/repository/station-repo-impl';

export type { StationOnLine };
export type { Station, StationStatus } from '../../2-domain/models/station';
export { TOTAL_STATIONS } from '../../2-domain/models/station';

/**
 * The curriculum module's only public surface. Other modules import from here
 * and never reach into 2-domain or 3-data.
 */
export class CurriculumEndpoint {
  private static readonly getStations: GetStationsUseCase = new GetStationsUseCaseImpl(
    new StationRepoImpl()
  );

  static async stationsOnLine(currentStation: number): Promise<StationOnLine[]> {
    return CurriculumEndpoint.getStations.execute(currentStation);
  }
}
