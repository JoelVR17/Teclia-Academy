import "dotenv/config";
import bcryptjs from "bcryptjs";
import prisma from "../utils/prismaClient.js";

// ! I WOULD'NT RECOMMEND THIS, BUT IS ON THE ISSUE DESCRIPTION, FIND OUT OTHER OPTIONS.
const ADMIN_EMAIL = (
  process.env.SEED_ADMIN_EMAIL || "austinrmz2007@gmail.com"
).toLowerCase();
const ADMIN_NAME = process.env.SEED_ADMIN_NAME || "Austin";
const ADMIN_PASSWORD = process.env.SEED_ADMIN_PASSWORD || "Mondaisa2007*";
const LEGACY_ADMIN_EMAIL = "admin@teclia.com";

const normalizeLegacyUsers = async () => {
  await prisma.user.updateMany({
    where: { OR: [{ role: null }, { role: "" }] },
    data: { role: "student" },
  });

  await prisma.user.updateMany({
    where: { planTier: "" },
    data: { planTier: null },
  });
};

const migrateAdminAccount = async () => {
  const adminPassword = bcryptjs.hashSync(ADMIN_PASSWORD, 10);

  const admin = await prisma.user.upsert({
    where: { email: ADMIN_EMAIL },
    update: {
      passwordHash: adminPassword,
      name: ADMIN_NAME,
      role: "admin",
      planTier: null,
    },
    create: {
      email: ADMIN_EMAIL,
      passwordHash: adminPassword,
      name: ADMIN_NAME,
      role: "admin",
      planTier: null,
    },
  });

  const legacyAdmin = await prisma.user.findFirst({
    where: { email: { equals: LEGACY_ADMIN_EMAIL } },
  });

  if (legacyAdmin) {
    await prisma.content.updateMany({
      where: { uploadedBy: legacyAdmin.id },
      data: { uploadedBy: admin.id },
    });
    await prisma.user.delete({ where: { id: legacyAdmin.id } });
  }

  return admin;
};

const removeSeededStudents = async () => {
  const legacyEmails = [
    "student1@teclia.com",
    "student2@teclia.com",
    LEGACY_ADMIN_EMAIL,
  ];

  await prisma.user.deleteMany({
    where: {
      OR: legacyEmails.map((email) => ({
        email: { equals: email },
      })),
    },
  });
};

const purgeLegacyNonAdminUsers = async () => {
  const flag = await prisma.siteStat.findUnique({
    where: { key: "production_user_reset_v1" },
  });

  if (flag) return;

  const admin = await prisma.user.findFirst({
    where: { email: { equals: ADMIN_EMAIL } },
  });

  if (admin) {
    await prisma.content.updateMany({
      where: { uploadedBy: { not: admin.id } },
      data: { uploadedBy: admin.id },
    });
  }

  await prisma.user.deleteMany({
    where: { NOT: { role: "admin" } },
  });

  await prisma.siteStat.upsert({
    where: { key: "production_user_reset_v1" },
    update: { value: 1 },
    create: { key: "production_user_reset_v1", value: 1 },
  });
};

const seedSiteStats = async () => {
  await prisma.siteStat.upsert({
    where: { key: "initial_setup" },
    update: {},
    create: { key: "initial_setup", value: 1 },
  });
};

async function main() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is required to run the seed script.");
  }

  await prisma.content.deleteMany({
    where: { url: { startsWith: "https://example.com/" } },
  });

  await removeSeededStudents();
  await normalizeLegacyUsers();
  await migrateAdminAccount();
  await purgeLegacyNonAdminUsers();
  await seedSiteStats();

  console.log("✓ Seed completed");
}

main()
  .catch((error) => {
    console.error("Seed failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
