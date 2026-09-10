import type { Station } from '../models/station';

/**
 * Contract for reading the curriculum. Implemented in 3-data; the domain never
 * knows whether stations come from bundled JSON, SQLite or the server.
 */
export interface StationRepo {
  findAll(): Promise<Station[]>;
  findByNumber(stationNumber: number): Promise<Station | null>;
}
