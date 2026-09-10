import type {
  ContentCoverage,
  PictureTask,
  ReadingTask,
  WritingTask,
} from '../../2-domain/models/content';
import { CONTENT_KINDS, VARIANTS_PER_STATION } from '../../2-domain/models/content';
import type { ContentRepo } from '../../2-domain/repository/content-repo';

import { openContentDatabase } from './content-database';

type ReadingRow = Omit<ReadingTask, 'questions'> & { questions: string };

const TABLE_BY_KIND = {
  reading: 'reading_task',
  writing: 'writing_task',
  picture: 'picture_task',
} as const;

/** Reads the offline corpus out of SQLite. The only class that speaks SQL. */
export class ContentRepoImpl implements ContentRepo {
  async readingForStation(station: number): Promise<ReadingTask[]> {
    const db = await openContentDatabase();
    const rows = await db.getAllAsync<ReadingRow>(
      'SELECT * FROM reading_task WHERE station = ? ORDER BY variant',
      station
    );
    return rows.map((row) => ({ ...row, questions: JSON.parse(row.questions) }));
  }

  async writingForStation(station: number): Promise<WritingTask[]> {
    const db = await openContentDatabase();
    return db.getAllAsync<WritingTask>(
      'SELECT * FROM writing_task WHERE station = ? ORDER BY variant',
      station
    );
  }

  async pictureForStation(station: number): Promise<PictureTask[]> {
    const db = await openContentDatabase();
    return db.getAllAsync<PictureTask>(
      'SELECT * FROM picture_task WHERE station = ? ORDER BY variant',
      station
    );
  }

  async coverage(totalStations: number): Promise<ContentCoverage[]> {
    const db = await openContentDatabase();
    const required = totalStations * VARIANTS_PER_STATION;

    return Promise.all(
      CONTENT_KINDS.map(async (kind) => {
        const row = await db.getFirstAsync<{ n: number }>(
          `SELECT COUNT(*) AS n FROM ${TABLE_BY_KIND[kind]}`
        );
        return { kind, present: row?.n ?? 0, required };
      })
    );
  }
}
