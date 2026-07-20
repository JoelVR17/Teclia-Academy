import 'dotenv/config';
import { defineConfig } from 'prisma/config';

// Use TEST_DATABASE_URL for tests, otherwise use DATABASE_URL or default
const databaseUrl = process.env.TEST_DATABASE_URL ||
  process.env.DATABASE_URL ||
  'postgresql://postgres:postgres@127.0.0.1:5432/postgres';

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
    seed: 'node prisma/seed.js',
  },
  datasource: {
    url: databaseUrl,
  },
});
