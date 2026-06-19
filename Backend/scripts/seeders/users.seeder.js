import bcryptjs from 'bcryptjs';

const SEED_USERS = [
  {
    name: 'Admin User',
    email: 'admin@teclia.dev',
    password: 'Admin1234!',
    role: 'admin'
  },
  {
    name: 'Student One',
    email: 'student1@teclia.dev',
    password: 'Student1234!',
    role: 'student'
  },
  {
    name: 'Student Two',
    email: 'student2@teclia.dev',
    password: 'Student1234!',
    role: 'student'
  }
];

export const seedUsers = async (db, isPostgres) => {
  console.log('🌱 Seeding users...');

  for (const user of SEED_USERS) {
    try {
      const hashedPassword = bcryptjs.hashSync(user.password, 10);

      if (isPostgres) {
        // PostgreSQL: use ON CONFLICT DO NOTHING
        await db.run(
          `INSERT INTO users (email, password_hash, name, role, plan_tier, created_at)
           VALUES ($1, $2, $3, $4, NULL, CURRENT_TIMESTAMP)
           ON CONFLICT (email) DO NOTHING`,
          [user.email, hashedPassword, user.name, user.role]
        );
      } else {
        // SQLite: use INSERT OR IGNORE
        await db.run(
          `INSERT OR IGNORE INTO users (email, password_hash, name, role, plan_tier, created_at)
           VALUES (?, ?, ?, ?, NULL, CURRENT_TIMESTAMP)`,
          [user.email, hashedPassword, user.name, user.role]
        );
      }

      // Check if it was actually inserted
      let checkResult;
      if (isPostgres) {
        checkResult = await db.exec(
          `SELECT id FROM users WHERE email = $1`,
          [user.email]
        );
      } else {
        checkResult = await db.exec(
          `SELECT id FROM users WHERE email = ?`,
          [user.email]
        );
      }

      if (checkResult.length > 0 && checkResult[0].values.length > 0) {
        console.log(`  ✓ User "${user.name}" (${user.email}) seeded successfully`);
      } else {
        console.log(`  ⏭️  User "${user.name}" (${user.email}) already exists, skipping`);
      }
    } catch (error) {
      console.error(`  ✗ Error seeding user "${user.name}":`, error.message);
      throw error;
    }
  }

  console.log('✅ Users seeding complete');
};

export { SEED_USERS };
