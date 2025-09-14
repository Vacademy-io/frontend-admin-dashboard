import { LayoutContainer } from '@/components/common/layout-container/layout-container';
import { CourseMaterial } from '@/routes/study-library/courses/-components/course-material';
import { InitStudyLibraryProvider } from '@/providers/study-library/init-study-library-provider';
import { createFileRoute } from '@tanstack/react-router';
import { Helmet } from 'react-helmet';

interface CourseSearchParams {
    selectedTab?: 'AuthoredCourses' | 'AllCourses' | 'CourseInReview' | 'CourseApproval';
}

export const Route = createFileRoute('/study-library/courses/')({
    component: RouteComponent,
    validateSearch: (search: Record<string, unknown>): CourseSearchParams => ({
        selectedTab: (search.selectedTab as CourseSearchParams['selectedTab']) || undefined,
    }),
});

function RouteComponent() {
    const searchParams = Route.useSearch();

    return (
        <LayoutContainer>
            <Helmet>
                <title>Study Library</title>
                <meta
                    name="description"
                    content="This page shows the study library of the institute."
                />
            </Helmet>
            <InitStudyLibraryProvider>
                <CourseMaterial initialSelectedTab={searchParams.selectedTab} />
            </InitStudyLibraryProvider>
        </LayoutContainer>
    );
}
