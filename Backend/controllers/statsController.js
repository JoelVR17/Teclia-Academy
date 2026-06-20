import prisma from '../utils/prismaClient.js';

const VISIT_KEY = 'page_visits';

export const recordVisit = async (_req, res) => {
  try {
    const stat = await prisma.siteStat.upsert({
      where: { key: VISIT_KEY },
      update: { value: { increment: 1 } },
      create: { key: VISIT_KEY, value: 1 },
    });

    res.json({ total: stat.value });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getVisitStats = async (_req, res) => {
  try {
    const visits = await prisma.siteStat.findUnique({ where: { key: VISIT_KEY } });
    const total = visits?.value ?? 0;

    const studentCount = await prisma.user.count({
      where: { NOT: { role: 'admin' } },
    });

    res.json({ pageVisits: total, studentCount });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
