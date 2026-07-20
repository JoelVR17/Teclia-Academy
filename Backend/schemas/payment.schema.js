import { z } from 'zod';

export const checkout = z.object({
  plan: z.enum(['basico', 'pro', 'master'], {
    errorMap: () => ({ message: 'Plan must be one of: basico, pro, master' }),
  }),
});
