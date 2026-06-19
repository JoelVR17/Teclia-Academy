import path from 'path';
import fs from 'fs';
import { initDb, getDb } from '../../db/init.js';

const ADMIN_EMAIL = 'austinrmz2007@gmail.com';

export const setupTestDb = () => {
  beforeAll(async () => {
    // Use isolated folder for test DB so we never touch dev/prod DB
    const testDbDir = path.join(process.cwd(), 'Backend', 'tests_db');
    process.env.DATABASE_DIR = testDbDir;
    process.env.NODE_ENV = 'test';

    // remove any leftover DB file to ensure clean init
    const dbPath = path.join(testDbDir, 'teclia.db');
    try {
      if (fs.existsSync(dbPath)) fs.unlinkSync(dbPath);
    } catch (e) {
      // ignore
    }

    await initDb();
  });

  afterEach(async () => {
    const db = getDb();
    try {
      // remove non-admin users and content between tests
      await db.run("DELETE FROM content");
      await db.run("DELETE FROM users WHERE LOWER(email) != '" + ADMIN_EMAIL + "'");
      await db.run("DELETE FROM site_stats");
      // persist changes
      try { await db.run('SELECT 1'); } catch (_) {}
    } catch (e) {
      // ignore
    }
  });

  afterAll(() => {
    const testDbFile = path.join(process.cwd(), 'Backend', 'tests_db', 'teclia.db');
    try {
      if (fs.existsSync(testDbFile)) fs.unlinkSync(testDbFile);
    } catch (e) {
      // ignore
    }
  });
};
