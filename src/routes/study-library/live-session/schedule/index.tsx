import { createFileRoute } from '@tanstack/react-router';
import { LayoutContainer } from '@/components/common/layout-container/layout-container';
import { Helmet } from 'react-helmet';
import { useEffect } from 'react';
import { useNavHeadingStore } from '@/stores/layout-container/useNavHeadingStore';
import { CaretLeft } from 'phosphor-react';
import { useNavigate } from '@tanstack/react-router';

export const Route = createFileRoute('/study-library/live-session/schedule/')({
    component: RouteComponent,
});

function RouteComponent() {
    const { setNavHeading } = useNavHeadingStore();
    const navigate = useNavigate();

    const heading = (
        <div className="flex items-center gap-4">
            <CaretLeft onClick={() => window.history.back()} className="cursor-pointer" />
            <div>Schedule Live Sessions</div>
        </div>
    );

    useEffect(() => {
        navigate({ to: '/study-library/live-session/schedule/step1' });
    });

    useEffect(() => {
        setNavHeading(heading);
    }, []);
    return (
        <LayoutContainer>
            <Helmet>
                <title>Schedule</title>
                <meta
                    name="description"
                    content="This page helpls you schedule the live session for the institute"
                />
            </Helmet>
        </LayoutContainer>
    );
}
