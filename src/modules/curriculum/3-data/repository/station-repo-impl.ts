import type { Station } from '../../2-domain/models/station';
import type { StationRepo } from '../../2-domain/repository/station-repo';

import curriculum from './curriculum.json';

/**
 * Reads the 45 stations from the bundled curriculum file.
 *
 * This is the only place that knows the curriculum is bundled JSON. When the
 * plan moves to SQLite (offline sync) only this class changes.
 */
export class StationRepoImpl implements StationRepo {
  private readonly stations: Station[] = curriculum.stations;

  async findAll(): Promise<Station[]> {
    return this.stations;
  }

  async findByNumber(stationNumber: number): Promise<Station | null> {
    return this.stations.find((station) => station.number === stationNumber) ?? null;
  }
}
