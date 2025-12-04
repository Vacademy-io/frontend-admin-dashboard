import { createFileRoute } from '@tanstack/react-router';
import { LayoutContainer } from '@/components/common/layout-container/layout-container';
import { StudentsListSection } from '@/routes/manage-students/students-list/-components/students-list/student-list-section/students-list-section';
import { Helmet } from 'react-helmet';

interface StudentListSearchParams {
    session?: string;
    batch?: string | string[];
    package_session_id?: string;
    role?: string | string[];
    gender?: string | string[];
    status?: string | string[];
    sessionExpiry?: number | number[];
    name?: string;
}

export const Route = createFileRoute('/manage-students/students-list/')({
    component: StudentsList,
    validateSearch: (search): StudentListSearchParams => ({
        session: search.session as string | undefined,
        batch: search.batch as string | string[] | undefined,
        package_session_id: search.package_session_id as string | undefined,
        role: search.role as string | string[] | undefined,
        gender: search.gender as string | string[] | undefined,
        status: search.status as string | string[] | undefined,
        sessionExpiry: search.sessionExpiry as number | number[] | undefined,
        name: search.name as string | undefined,
    }),
});

export function StudentsList() {
    return (
        <LayoutContainer>
            {/* <EmptyDashboard /> */}
            <Helmet>
                <title>Students</title>
                <meta
                    name="description"
                    content="This page shows all the students of the institute."
                />
            </Helmet>
            <StudentsListSection />
        </LayoutContainer>
    );
}
