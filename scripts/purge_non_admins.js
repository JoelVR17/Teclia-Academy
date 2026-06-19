#!/usr/bin/env node
import 'dotenv/config';
import prisma from '../Backend/utils/prismaClient.js';

const ADMIN_EMAIL = 'austinrmz2007@gmail.com';

async function main() {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL is required to run the purge script.');
  }

  const admin = await prisma.user.findFirst({
    where: { email: { equals: ADMIN_EMAIL, mode: 'insensitive' } },
  });

  if (admin) {
    await prisma.content.updateMany({
      where: { uploadedBy: { not: admin.id } },
      data: { uploadedBy: admin.id },
    });
  }

  await prisma.user.deleteMany({
    where: { NOT: { role: 'admin' } },
  });

  await prisma.siteStat.upsert({
    where: { key: 'production_user_reset_v1' },
    update: { value: 1 },
    create: { key: 'production_user_reset_v1', value: 1 },
  });

  console.log('Purge complete. Non-admin users removed. Admin id:', admin?.id ?? null);
}

main()
  .catch((err) => {
    console.error('Error running purge:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
