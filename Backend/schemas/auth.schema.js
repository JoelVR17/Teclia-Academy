import { z } from 'zod';

const normalizeEmail = z
  .string()
  .email({ message: 'Email must be a valid email address' })
  .transform((value) => value.trim().toLowerCase());

const password = z
  .string()
  .min(8, { message: 'Password must be at least 8 characters long' })
  .regex(/[0-9]/, { message: 'Password must contain at least one number' });

const nonEmptyString = (label) =>
  z
    .string()
    .min(1, { message: `${label} is required` });

export const register = z.object({
  name: z
    .string()
    .min(2, { message: 'Name must contain at least 2 characters' })
    .max(50, { message: 'Name cannot exceed 50 characters' }),
  email: normalizeEmail,
  password,
});

export const login = z.object({
  email: normalizeEmail,
  password: nonEmptyString('Password'),
});

export const refresh = z.object({
  refreshToken: nonEmptyString('Refresh token'),
});

export const forgotPassword = z.object({
  email: normalizeEmail,
});

export const resetPassword = z.object({
  email: normalizeEmail,
  pin: nonEmptyString('PIN'),
  newPassword: password,
});

export const verifyRecoveryEmail = z.object({
  email: normalizeEmail,
});
