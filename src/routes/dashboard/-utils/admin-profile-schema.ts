import { z } from 'zod';

export const adminProfileSchema = z.object({
    profilePictureUrl: z.string(),
    profilePictureId: z.union([z.string(), z.undefined()]),
    name: z.string().min(1, 'Name is required'),
    roles: z.array(z.string()),
    email: z
        .string()
        .optional()
        .refine((val) => !val || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val), 'Invalid email address'),
    phone: z.string(),
});
