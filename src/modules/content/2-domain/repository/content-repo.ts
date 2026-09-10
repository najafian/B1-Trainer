import type {
  ContentCoverage,
  PictureTask,
  ReadingTask,
  WritingTask,
} from '../models/content';

/**
 * Contract for the offline content store. Implemented over SQLite in 3-data;
 * the domain does not know the storage engine.
 */
export interface ContentRepo {
  readingForStation(station: number): Promise<ReadingTask[]>;
  writingForStation(station: number): Promise<WritingTask[]>;
  pictureForStation(station: number): Promise<PictureTask[]>;
  /** Per-kind counts against the required total, for the coverage report. */
  coverage(totalStations: number): Promise<ContentCoverage[]>;
}
