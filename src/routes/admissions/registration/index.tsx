import { createFileRoute } from '@tanstack/react-router';
import { LayoutContainer } from '@/components/common/layout-container/layout-container';
import { RegistrationListPage } from './-components/RegistrationListPage';

export const Route = createFileRoute('/admissions/registration/')({
    component: RegistrationListRoute,
});

function RegistrationListRoute() {
    return (
        <LayoutContainer>
            <RegistrationListPage />
        </LayoutContainer>
    );
}
