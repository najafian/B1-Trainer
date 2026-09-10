import type { Station, StationStatus } from '../models/station';
import type { StationRepo } from '../repository/station-repo';

export type StationOnLine = Station & { status: StationStatus };

export interface GetStationsUseCase {
  /** The whole line, each stop tagged relative to `currentStation`. */
  execute(currentStation: number): Promise<StationOnLine[]>;
}

export class GetStationsUseCaseImpl implements GetStationsUseCase {
  constructor(private readonly stationRepo: StationRepo) {}

  async execute(currentStation: number): Promise<StationOnLine[]> {
    const stations = await this.stationRepo.findAll();
    return stations.map((station) => ({
      ...station,
      status: statusFor(station.number, currentStation),
    }));
  }
}

function statusFor(stationNumber: number, currentStation: number): StationStatus {
  if (stationNumber < currentStation) return 'reached';
  if (stationNumber === currentStation) return 'current';
  return 'ahead';
}
