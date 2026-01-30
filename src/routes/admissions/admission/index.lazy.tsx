import { createLazyFileRoute } from '@tanstack/react-router';
import { LayoutContainer } from '@/components/common/layout-container/layout-container';
import { AdmissionPage } from './-components/AdmissionPage';

export const Route = createLazyFileRoute('/admissions/admission/')({
    component: AdmissionRoute,
});

function AdmissionRoute() {
    return (
        <LayoutContainer>
            <AdmissionPage />
        </LayoutContainer>
    );
}
