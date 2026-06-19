import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { spawn } from 'child_process';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

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

  let db = null;
  let isPostgres = false;

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
        const sqliteSql = sql.replace(/\$\d+/g, '?');
        return originalRun(sqliteSql, params);
      } catch (error) {
        throw error;
      }
    };

    const originalExec = db.exec.bind(db);
    db.exec = function (sql, params = []) {
      try {
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

  return { db, isPostgres };
};

/**
 * Main reset function
 */
const runReset = async () => {
  try {
    // Check if production
    if (process.env.NODE_ENV === 'production') {
      console.error(
        '\n❌ SAFETY CHECK FAILED: db:reset is not allowed in production environment.\n' +
        '   NODE_ENV is set to "production". Please set it to "development" or "staging" to proceed.\n'
      );
      process.exit(1);
    }

    console.log('\n⚠️  DANGEROUS OPERATION: This will truncate your database tables.\n');

    const { db, isPostgres } = await initializeDatabase();

    console.log('🗑️  Truncating tables in reverse dependency order: content → users\n');

    // Truncate content first (depends on users)
    if (isPostgres) {
      await db.run('TRUNCATE TABLE content');
      await db.run('TRUNCATE TABLE users');
    } else {
      db.run('DELETE FROM content');
      db.run('DELETE FROM users');

      // Reset AUTOINCREMENT for SQLite
      db.run("DELETE FROM sqlite_sequence WHERE name='content'");
      db.run("DELETE FROM sqlite_sequence WHERE name='users'");
    }

    console.log('✓ Tables truncated successfully\n');

    if (!isPostgres && db.saveToFile) {
      db.saveToFile();
    }

    console.log('🌱 Running seed to re-populate database...\n');

    // Run seed.js
    const seedProcess = spawn('node', [path.join(__dirname, 'seed.js')], {
      stdio: 'inherit',
      shell: true
    });

    seedProcess.on('close', (code) => {
      if (code === 0) {
        console.log('✅ Database reset and re-seeded successfully!\n');
        process.exit(0);
      } else {
        console.error('❌ Seeding failed during reset\n');
        process.exit(1);
      }
    });

    seedProcess.on('error', (error) => {
      console.error('❌ Error running seed:', error.message, '\n');
      process.exit(1);
    });
  } catch (error) {
    console.error('\n❌ Reset failed:', error.message, '\n');
    process.exit(1);
  }
};

// Run the reset
runReset();
