import { createFileRoute } from '@tanstack/react-router';
import { z } from 'zod';
import { zodValidator } from '@tanstack/zod-adapter';

export const createAssessmentSchema = z.object({
    currentStep: z.number(),
});

// Route definition only - component is lazy loaded from index.lazy.tsx
export const Route = createFileRoute(
    '/homework-creation/create-assessment/$assessmentId/$examtype/'
)({
    validateSearch: zodValidator(createAssessmentSchema),
    // Component is defined in index.lazy.tsx
});

