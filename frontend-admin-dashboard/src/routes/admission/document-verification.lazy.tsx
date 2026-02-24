import { createLazyFileRoute } from '@tanstack/react-router';
import { DocumentVerification } from '@/features/admission/DocumentVerification';

export const Route = createLazyFileRoute('/admission/document-verification')({
    component: DocumentVerification,
});
