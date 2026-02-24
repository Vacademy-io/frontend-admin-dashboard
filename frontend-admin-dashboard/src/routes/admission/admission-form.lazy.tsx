
import { createLazyFileRoute } from '@tanstack/react-router';
import { AdmissionFormWizard } from '@/features/admission/AdmissionFormWizard';
import { LayoutContainer } from '@/components/common/layout-container/layout-container';
import { Helmet } from 'react-helmet';

export const Route = createLazyFileRoute('/admission/admission-form')({
    component: AdmissionFormComponent,
});

function AdmissionFormComponent() {
    return (
        <LayoutContainer>
            <Helmet>
                <title>Admission Form</title>
            </Helmet>
            <AdmissionFormWizard />
        </LayoutContainer>
    );
}
