import { z } from 'zod';

const objectIdRegex = /^[a-fA-F0-9]{24}$/;
const numericIdRegex = /^[0-9]+$/;

const idSchema = z.union([
  z.string().uuid({ message: 'ID must be a valid UUID' }),
  z.string().regex(objectIdRegex, { message: 'ID must be a valid MongoDB ObjectId' }),
  z.string().regex(numericIdRegex, { message: 'ID must be a valid numeric identifier' }),
]);

export const userStats = z.object({
  id: idSchema,
});

export const contentStats = z.object({
  id: idSchema,
});
