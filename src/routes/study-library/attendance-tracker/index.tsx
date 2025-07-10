import { createFileRoute } from '@tanstack/react-router';
import { LayoutContainer } from '@/components/common/layout-container/layout-container';
import { Helmet } from 'react-helmet';

export const Route = createFileRoute('/study-library/attendance-tracker/')({
    component: RouteComponent,
});

function RouteComponent() {
    return (
        <LayoutContainer>
            <Helmet>
                <title>Attendance Tracker</title>
                <meta
                    name="description"
                    content="This page provides attendance tracking of live sessions and courses."
                />
            </Helmet>
            <div className="flex flex-col gap-4">
                <h1 className="text-2xl font-semibold text-neutral-800">Attendance Tracker</h1>
                <p className="text-neutral-600">
                    This section will display attendance reports for your live sessions. (Coming
                    soon)
                </p>
            </div>
        </LayoutContainer>
    );
}
