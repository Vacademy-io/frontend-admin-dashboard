import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/admissions/admission/$admissionId')({
    // Component is lazy loaded
});
