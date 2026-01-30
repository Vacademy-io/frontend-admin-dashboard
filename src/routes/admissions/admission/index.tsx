import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/admissions/admission/')({
    // Component is lazy loaded from index.lazy.tsx
    // This route handles the list view of admissions.
    // The details view is handled by $admissionId route.
});
