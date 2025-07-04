import { createFileRoute } from '@tanstack/react-router';
import { LayoutContainer } from '@/components/common/layout-container/layout-container';
import { Helmet } from 'react-helmet';
import { useEffect } from 'react';
import { useNavHeadingStore } from '@/stores/layout-container/useNavHeadingStore';
import { CaretLeft } from 'phosphor-react';
import ScheduleStep1 from '../-components/scheduleStep1';
export const Route = createFileRoute('/study-library/live-session/schedule/step1/')({
    component: RouteComponent,
});

function RouteComponent() {
    const { setNavHeading } = useNavHeadingStore();

    const heading = (
        <div className="flex items-center gap-4">
            <CaretLeft onClick={() => window.history.back()} className="cursor-pointer" />
            <div>Schedule Live Sessions</div>
        </div>
    );

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
            <ScheduleStep1 />
        </LayoutContainer>
    );
}
