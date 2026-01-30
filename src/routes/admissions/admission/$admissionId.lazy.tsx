import { createLazyFileRoute } from '@tanstack/react-router';
import { LayoutContainer } from '@/components/common/layout-container/layout-container';
import { AdmissionDetailPage } from './-components/AdmissionDetailPage';

export const Route = createLazyFileRoute('/admissions/admission/$admissionId')({
    component: AdmissionDetailRoute,
});

function AdmissionDetailRoute() {
    return (
        <LayoutContainer>
            <AdmissionDetailPage />
        </LayoutContainer>
    );
}
