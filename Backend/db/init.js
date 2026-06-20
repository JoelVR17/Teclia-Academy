import prisma from '../utils/prismaClient.js';

const resolveDatabaseUrl = () => {
  if (process.env.NODE_ENV === 'test' && process.env.TEST_DATABASE_URL) {
    return process.env.TEST_DATABASE_URL;
  }
  return process.env.DATABASE_URL;
};

export const connectDb = async () => {
  const databaseUrl = resolveDatabaseUrl();

  if (!databaseUrl) {
    throw new Error(
      'DATABASE_URL is required. Configure your Supabase PostgreSQL connection string in Backend/.env'
    );
  }

  if (process.env.NODE_ENV === 'test' && process.env.TEST_DATABASE_URL) {
    process.env.DATABASE_URL = process.env.TEST_DATABASE_URL;
  }

  await prisma.$connect();
  console.log('✓ Database connected via Prisma');
};

export const initDb = connectDb;

export default { connectDb, initDb };
