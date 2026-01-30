import { createLazyFileRoute } from '@tanstack/react-router';
import { InquiryFormPage } from '../-components/InquiryFormPage';

export const Route = createLazyFileRoute('/admissions/inquiry/new/')({
    component: InquiryFormPage,
});
