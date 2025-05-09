import { LayoutContainer } from '@/components/common/layout-container/layout-container';
import { useNavHeadingStore } from '@/stores/layout-container/useNavHeadingStore';
import { useEffect } from 'react';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/manage-institute/teams/')({
    component: RouteComponent,
});

function RouteComponent() {
    const { setNavHeading } = useNavHeadingStore();

    useEffect(() => {
        setNavHeading('Teams');
    }, []);

    return (
        <LayoutContainer>
            <p>Hi there</p>
        </LayoutContainer>
    );
}
