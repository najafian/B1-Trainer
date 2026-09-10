import * as SQLite from 'expo-sqlite';

const DATABASE_NAME = 'linie-b1-progress.db';
const SCHEMA_VERSION = 1;

let handle: Promise<SQLite.SQLiteDatabase> | null = null;

/**
 * The passenger's own progress, in its own database file.
 *
 * Deliberately separate from the content database: sharing one connection
 * would mean this module importing the content module's internals, which the
 * architecture forbids. It also keeps user data separable for GDPR export and
 * delete, while the content corpus stays disposable and re-seedable.
 */
export function openProgressDatabase(): Promise<SQLite.SQLiteDatabase> {
  handle ??= (async () => {
    const db = await SQLite.openDatabaseAsync(DATABASE_NAME);
    await migrate(db);
    return db;
  })();
  return handle;
}

async function migrate(db: SQLite.SQLiteDatabase): Promise<void> {
  const row = await db.getFirstAsync<{ user_version: number }>('PRAGMA user_version');
  if ((row?.user_version ?? 0) >= SCHEMA_VERSION) return;

  await db.execAsync(`
    PRAGMA journal_mode = WAL;

    CREATE TABLE IF NOT EXISTS skill_done (
      station INTEGER NOT NULL,
      skill TEXT NOT NULL,
      completedAt TEXT NOT NULL,
      PRIMARY KEY (station, skill)
    );

    PRAGMA user_version = ${SCHEMA_VERSION};
  `);
}
