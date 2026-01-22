import { createFileRoute } from '@tanstack/react-router';
import { z } from 'zod';
import { zodValidator } from '@tanstack/zod-adapter';

export const createAssessmentSchema = z.object({
    currentStep: z.number(),
});

export const Route = createFileRoute('/assessment/create-assessment/$assessmentId/$examtype/')({
    validateSearch: zodValidator(createAssessmentSchema),
});
