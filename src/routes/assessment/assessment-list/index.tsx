import { createFileRoute } from '@tanstack/react-router';
import { z } from 'zod';
import { zodValidator } from '@tanstack/zod-adapter';

export const assessmentListParamsSchema = z.object({
    selectedTab: z.string().optional(),
});

// Route definition only - component is lazy loaded from index.lazy.tsx
export const Route = createFileRoute('/assessment/assessment-list/')({
    validateSearch: zodValidator(assessmentListParamsSchema),
});
