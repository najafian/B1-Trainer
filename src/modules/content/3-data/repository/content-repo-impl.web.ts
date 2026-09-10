import type {
  ContentCoverage,
  PictureTask,
  ReadingTask,
  WritingTask,
} from '../../2-domain/models/content';
import { CONTENT_KINDS, VARIANTS_PER_STATION } from '../../2-domain/models/content';
import type { ContentRepo } from '../../2-domain/repository/content-repo';

import { pictureSeed, readingSeed, writingSeed } from './seed';

/**
 * Web implementation of the content store.
 *
 * expo-sqlite's web build is alpha and its wa-sqlite worker does not survive
 * Metro's chunk serializer, so on web the corpus is read straight from the
 * bundled seed instead. The content is read-only, so nothing is lost - this is
 * the same data the native build loads into SQLite.
 *
 * Metro picks this file over content-repo-impl.ts for the web platform.
 */
export class ContentRepoImpl implements ContentRepo {
  async readingForStation(station: number): Promise<ReadingTask[]> {
    return byStation(readingSeed, station);
  }

  async writingForStation(station: number): Promise<WritingTask[]> {
    return byStation(writingSeed, station);
  }

  async pictureForStation(station: number): Promise<PictureTask[]> {
    return byStation(pictureSeed, station);
  }

  async coverage(totalStations: number): Promise<ContentCoverage[]> {
    const required = totalStations * VARIANTS_PER_STATION;
    const counts: Record<string, number> = {
      reading: readingSeed.length,
      writing: writingSeed.length,
      picture: pictureSeed.length,
    };
    return CONTENT_KINDS.map((kind) => ({ kind, present: counts[kind] ?? 0, required }));
  }
}

function byStation<T extends { station: number; variant: number }>(
  items: T[],
  station: number
): T[] {
  return items.filter((item) => item.station === station).sort((a, b) => a.variant - b.variant);
}
