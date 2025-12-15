import { createFileRoute } from '@tanstack/react-router';
import z from 'zod';

export const settingsParamsSchema = z.object({
    selectedTab: z.string().optional(),
});

// Route definition only - component is lazy loaded from index.lazy.tsx
export const Route = createFileRoute('/settings/')({
    validateSearch: settingsParamsSchema,
});
