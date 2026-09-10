import * as SQLite from 'expo-sqlite';

import { pictureSeed, readingSeed, writingSeed } from './seed';

const DATABASE_NAME = 'linie-b1.db';
const SCHEMA_VERSION = 1;

let handle: Promise<SQLite.SQLiteDatabase> | null = null;

/**
 * Opens the offline content database, creating and seeding it on first run.
 *
 * The corpus is created at runtime from the bundled JSON. Once the full 1350
 * items exist this should move to a prepopulated .db shipped via
 * SQLiteProvider's `assetSource`, so first launch does not pay the insert cost.
 */
export function openContentDatabase(): Promise<SQLite.SQLiteDatabase> {
  handle ??= (async () => {
    const db = await SQLite.openDatabaseAsync(DATABASE_NAME);
    await migrate(db);
    await seedIfEmpty(db);
    return db;
  })();
  return handle;
}

async function migrate(db: SQLite.SQLiteDatabase): Promise<void> {
  const row = await db.getFirstAsync<{ user_version: number }>('PRAGMA user_version');
  if ((row?.user_version ?? 0) >= SCHEMA_VERSION) return;

  await db.execAsync(`
    PRAGMA journal_mode = WAL;

    CREATE TABLE IF NOT EXISTS reading_task (
      id TEXT PRIMARY KEY NOT NULL,
      station INTEGER NOT NULL,
      variant INTEGER NOT NULL,
      title TEXT NOT NULL,
      text TEXT NOT NULL,
      questions TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS writing_task (
      id TEXT PRIMARY KEY NOT NULL,
      station INTEGER NOT NULL,
      variant INTEGER NOT NULL,
      prompt TEXT NOT NULL,
      emailType TEXT NOT NULL,
      minWords INTEGER NOT NULL,
      modelAnswer TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS picture_task (
      id TEXT PRIMARY KEY NOT NULL,
      station INTEGER NOT NULL,
      variant INTEGER NOT NULL,
      imageRef TEXT NOT NULL,
      description TEXT NOT NULL,
      attribution TEXT
    );

    CREATE INDEX IF NOT EXISTS idx_reading_station ON reading_task (station, variant);
    CREATE INDEX IF NOT EXISTS idx_writing_station ON writing_task (station, variant);
    CREATE INDEX IF NOT EXISTS idx_picture_station ON picture_task (station, variant);

    PRAGMA user_version = ${SCHEMA_VERSION};
  `);
}

async function seedIfEmpty(db: SQLite.SQLiteDatabase): Promise<void> {
  const existing = await db.getFirstAsync<{ n: number }>('SELECT COUNT(*) AS n FROM reading_task');
  if ((existing?.n ?? 0) > 0) return;

  await db.withTransactionAsync(async () => {
    for (const task of readingSeed) {
      await db.runAsync(
        'INSERT OR REPLACE INTO reading_task (id, station, variant, title, text, questions) VALUES (?, ?, ?, ?, ?, ?)',
        task.id,
        task.station,
        task.variant,
        task.title,
        task.text,
        JSON.stringify(task.questions)
      );
    }
    for (const task of writingSeed) {
      await db.runAsync(
        'INSERT OR REPLACE INTO writing_task (id, station, variant, prompt, emailType, minWords, modelAnswer) VALUES (?, ?, ?, ?, ?, ?, ?)',
        task.id,
        task.station,
        task.variant,
        task.prompt,
        task.emailType,
        task.minWords,
        task.modelAnswer
      );
    }
    for (const task of pictureSeed) {
      await db.runAsync(
        'INSERT OR REPLACE INTO picture_task (id, station, variant, imageRef, description, attribution) VALUES (?, ?, ?, ?, ?, ?)',
        task.id,
        task.station,
        task.variant,
        task.imageRef,
        task.description,
        task.attribution ?? null
      );
    }
  });
}
