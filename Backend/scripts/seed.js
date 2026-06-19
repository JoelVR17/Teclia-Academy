import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { seedUsers } from './seeders/users.seeder.js';
import { seedContent } from './seeders/content.seeder.js';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));

let db = null;
let isPostgres = false;

/**
 * Initialize database connection based on DATABASE_URL
 */
const initializeDatabase = async () => {
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    throw new Error(
      'DATABASE_URL environment variable is not set. Please configure it in .env'
    );
  }

  if (databaseUrl.startsWith('postgres://') || databaseUrl.startsWith('postgresql://')) {
    // PostgreSQL
    isPostgres = true;
    console.log('🐘 Using PostgreSQL database...');

    const { createPostgresDb } = await import('../db/pgAdapter.js');
    db = await createPostgresDb(databaseUrl);
  } else if (databaseUrl.startsWith('sqlite:')) {
    // SQLite
    isPostgres = false;
    console.log('🔸 Using SQLite database...');

    const initSqlJs = (await import('sql.js')).default;
    const SQL = await initSqlJs();

    const dbPath = databaseUrl.replace('sqlite:', '').trim();
    const absolutePath = path.isAbsolute(dbPath) ? dbPath : path.join(process.cwd(), dbPath);

    fs.mkdirSync(path.dirname(absolutePath), { recursive: true });

    if (fs.existsSync(absolutePath)) {
      const buffer = fs.readFileSync(absolutePath);
      db = new SQL.Database(buffer);
    } else {
      db = new SQL.Database();
    }

    // Enhance SQLite DB object to mimic PostgreSQL adapter API
    const originalRun = db.run.bind(db);
    db.run = function (sql, params = []) {
      try {
        // Convert PostgreSQL $1, $2 style to ? for SQLite
        const sqliteSql = sql.replace(/\$\d+/g, '?');
        return originalRun(sqliteSql, params);
      } catch (error) {
        throw error;
      }
    };

    const originalExec = db.exec.bind(db);
    db.exec = function (sql, params = []) {
      try {
        // Convert PostgreSQL $1, $2 style to ? for SQLite
        const sqliteSql = sql.replace(/\$\d+/g, '?');
        return originalExec(sqliteSql, params);
      } catch (error) {
        throw error;
      }
    };

    // Add save function for SQLite
    db.saveToFile = () => {
      const data = db.export();
      const buffer = Buffer.from(data);
      fs.writeFileSync(absolutePath, buffer);
      console.log(`📁 SQLite database saved to ${absolutePath}`);
    };
  } else {
    throw new Error(
      'Invalid DATABASE_URL. Must start with "sqlite:" or "postgres://" / "postgresql://"'
    );
  }

  return db;
};

/**
 * Get the admin user ID from the database
 */
const getAdminUserId = async () => {
  try {
    let result;
    if (isPostgres) {
      result = await db.exec(
        `SELECT id FROM users WHERE email = $1 AND role = 'admin'`,
        ['admin@teclia.dev']
      );
    } else {
      result = await db.exec(
        `SELECT id FROM users WHERE email = ? AND role = 'admin'`,
        ['admin@teclia.dev']
      );
    }

    if (result.length > 0 && result[0].values.length > 0) {
      return result[0].values[0][0];
    }
    return null;
  } catch (error) {
    console.error('Error retrieving admin user ID:', error);
    throw error;
  }
};

/**
 * Main seed function
 */
const runSeed = async () => {
  try {
    console.log('\n🌱 Starting database seed...\n');

    // Initialize database
    await initializeDatabase();

    // Ensure tables exist (for SQLite)
    if (!isPostgres) {
      db.run(`CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        name TEXT NOT NULL,
        role TEXT DEFAULT 'student',
        avatar_url TEXT DEFAULT NULL,
        reset_pin TEXT DEFAULT NULL,
        reset_pin_expires_at DATETIME DEFAULT NULL,
        plan_tier TEXT DEFAULT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`);

      db.run(`CREATE TABLE IF NOT EXISTS content (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        description TEXT,
        type TEXT NOT NULL,
        url TEXT NOT NULL,
        is_free INTEGER DEFAULT 0,
        plan_tier TEXT DEFAULT 'free',
        uploaded_by INTEGER NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (uploaded_by) REFERENCES users(id)
      )`);

      db.run(`CREATE TABLE IF NOT EXISTS site_stats (
        key TEXT PRIMARY KEY,
        value INTEGER DEFAULT 0
      )`);
    }

    // Run seeders in order
    console.log('📋 Seeding in order: users → content\n');

    // 1. Seed users
    await seedUsers(db, isPostgres);

    // 2. Get admin user ID for content seeding
    const adminUserId = await getAdminUserId();
    if (!adminUserId) {
      throw new Error('Failed to retrieve admin user ID after seeding');
    }

    // 3. Seed content
    await seedContent(db, isPostgres, adminUserId);

    // Save database if SQLite
    if (!isPostgres && db.saveToFile) {
      db.saveToFile();
    }

    console.log('\n✅ Database seed completed successfully!\n');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Seeding failed:', error.message, '\n');
    process.exit(1);
  }
};

// Run the seed
runSeed();
