import prisma from './prismaClient.js';
import { formatUserWithCreatedAt } from './serializers.js';

export const listNonAdminUsers = async () => {
  const users = await prisma.user.findMany({
    where: { NOT: { role: 'admin' } },
    orderBy: { id: 'desc' },
  });

  return users.map(formatUserWithCreatedAt);
};
