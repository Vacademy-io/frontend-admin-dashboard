import { createLazyFileRoute, useSearch } from '@tanstack/react-router';
import { LayoutContainer } from '@/components/common/layout-container/layout-container';
import { CourseMaterial } from '@/routes/study-library/courses/-components/course-material';
import { InitStudyLibraryProvider } from '@/providers/study-library/init-study-library-provider';
import { Helmet } from 'react-helmet';

interface CourseSearchParams {
    selectedTab?: 'AuthoredCourses' | 'AllCourses' | 'CourseInReview' | 'CourseApproval';
}

export const Route = createLazyFileRoute('/study-library/courses/')({
    component: RouteComponent,
});

function RouteComponent() {
    const searchParams = useSearch({ from: '/study-library/courses/' }) as CourseSearchParams;

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
