import { LayoutContainer } from '@/components/common/layout-container/layout-container';
import { useNavHeadingStore } from '@/stores/layout-container/useNavHeadingStore';
import { createFileRoute } from '@tanstack/react-router';
import { useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { AudienceInvite } from './-components/audience-invite/audience-invite';
import { AudienceInviteFormProvider } from './-context/useAudienceInviteFormContext';

const AUDIENCE_MANAGER_ROUTE = '/audience-manager/list/' as const;

export const Route = createFileRoute(AUDIENCE_MANAGER_ROUTE as any)({
    component: AudienceManagerListPage,
});

export function AudienceManagerListPage() {
    const { setNavHeading } = useNavHeadingStore();

    useEffect(() => {
        setNavHeading('Manage Campaigns');
    }, []);

    return (
        <AudienceInviteFormProvider>
            <LayoutContainer>
                <Helmet>
                    <title>Campaign </title>
                    <meta
                        name="description"
                        content="View and manage invite links created for audience members."
                    />
                </Helmet>
                <AudienceInvite />
            </LayoutContainer>
        </AudienceInviteFormProvider>
    );
}