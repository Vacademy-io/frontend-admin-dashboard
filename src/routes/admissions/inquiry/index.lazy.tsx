import { createLazyFileRoute } from '@tanstack/react-router';
import { LayoutContainer } from '@/components/common/layout-container/layout-container';
import { InquiryPage } from './-components/InquiryPage';

export const Route = createLazyFileRoute('/admissions/inquiry/')({
    component: InquiryRoute,
});

function InquiryRoute() {
    return (
        <LayoutContainer>
            <InquiryPage />
        </LayoutContainer>
    );
}
