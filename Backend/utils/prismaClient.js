import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

const globalForPrisma = globalThis;

const resolveDatabaseUrl = () => {
  if (process.env.NODE_ENV === 'test' && process.env.TEST_DATABASE_URL) {
    return process.env.TEST_DATABASE_URL;
  }
  return process.env.DATABASE_URL;
};

const createAdapter = () => {
  const connectionString = resolveDatabaseUrl();

  if (!connectionString) {
    throw new Error(
      'DATABASE_URL is required. Configure your Supabase PostgreSQL connection string in Backend/.env'
    );
  }

  const isSupabase = connectionString.includes('supabase.co');

  return new PrismaPg({
    connectionString,
    ...(isSupabase ? { ssl: { rejectUnauthorized: false } } : {}),
  });
};

const createPrismaClient = () =>
  new PrismaClient({
    adapter: createAdapter(),
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  });

const getPrisma = () => {
  if (!globalForPrisma.__tecliaPrisma) {
    globalForPrisma.__tecliaPrisma = createPrismaClient();
  }
  return globalForPrisma.__tecliaPrisma;
};

const prisma = new Proxy(
  {},
  {
    get(_target, prop) {
      const client = getPrisma();
      const value = client[prop];
      return typeof value === 'function' ? value.bind(client) : value;
    },
  }
);

export default prisma;
