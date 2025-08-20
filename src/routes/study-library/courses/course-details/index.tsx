// routes/study-library/$class/index.tsx
import { LayoutContainer } from '@/components/common/layout-container/layout-container';
import { CourseDetailsPage } from '@/routes/study-library/courses/course-details/-components/course-details-page';
import { AuthoredCoursesSidebar } from '@/routes/study-library/courses/course-details/-components/authored-courses-sidebar';
import { useNavHeadingStore } from '@/stores/layout-container/useNavHeadingStore';
import { InitStudyLibraryProvider } from '@/providers/study-library/init-study-library-provider';

import { createFileRoute } from '@tanstack/react-router';
import { CaretLeft } from '@phosphor-icons/react';
import { useMemo, useState, useEffect } from 'react';
import { DashboardLoader } from '@/components/core/dashboard-loader';
import { getTerminology } from '@/components/common/layout-container/sidebar/utils';
import { ContentTerms, SystemTerms } from '@/routes/settings/-components/NamingSettings';
import { convertCapitalToTitleCase } from '@/lib/utils';
import { useQuery } from '@tanstack/react-query';
import { getMyCourses } from '@/routes/study-library/courses/-services/approval-services';

interface CourseDetailsSearchParams {
    courseId: string;
}

export const Route = createFileRoute('/study-library/courses/course-details/')({
    component: RouteComponent,
    validateSearch: (search: Record<string, unknown>): CourseDetailsSearchParams => ({
        courseId: (search.courseId as string) || '',
    }),
});

function RouteComponent() {
    const { setNavHeading } = useNavHeadingStore();
    const { courseId } = Route.useSearch();
    const [isLoading, setIsLoading] = useState(false);

    // Fetch authored courses using the correct API
    const { data: authoredCoursesData, isLoading: isLoadingCourses } = useQuery({
        queryKey: ['my-courses'],
        queryFn: getMyCourses,
        refetchInterval: 30000,
    });

    // Process authored courses for sidebar
    const authoredCourses = useMemo(() => {
        if (!authoredCoursesData || !Array.isArray(authoredCoursesData)) {
            return [];
        }

        // Group courses by courseId and extract unique courses
        const courseMap = new Map();
        authoredCoursesData.forEach((response) => {
            const courseId = response.courseId;
            const course = response.packageEntity;

            if (!courseMap.has(courseId)) {
                courseMap.set(courseId, {
                    id: courseId,
                    package_name: course.packageName,
                    status: course.status,
                });
            }
        });

        return Array.from(courseMap.values());
    }, [authoredCoursesData]);

    const [courses, setCourses] = useState(authoredCourses);

    useEffect(() => {
        setIsLoading(true);
        setCourses(authoredCourses);
        // Add a small delay to ensure smooth transition
        const timer = setTimeout(() => {
            setIsLoading(false);
        }, 500);
        return () => clearTimeout(timer);
    }, [authoredCourses, courseId]);

    const heading = (
        <div className="flex items-center gap-4">
            <CaretLeft onClick={() => window.history.back()} className="cursor-pointer" />
            <div>{getTerminology(ContentTerms.Course, SystemTerms.Course)} Details</div>
        </div>
    );

    useEffect(() => {
        setNavHeading(heading);
    }, []);

    // Custom sidebar component with authored courses and "View All" button
    const customSidebar = (
        <AuthoredCoursesSidebar
            sideBarList={courses.map((course) => ({
                value: convertCapitalToTitleCase(course.package_name),
                id: course.id,
                status: course.status,
            }))}
            sideBarData={{
                title: getTerminology(ContentTerms.Course, SystemTerms.Course) + 's',
                listIconText: 'C',
                searchParam: 'courseId',
            }}
        />
    );

    return (
        <LayoutContainer
            hasInternalSidebarComponent={true}
            internalSidebarComponent={customSidebar}
        >
            <InitStudyLibraryProvider>
                {isLoading || isLoadingCourses ? (
                    <div className="flex min-h-screen items-center justify-center">
                        <div className="flex flex-col items-center gap-4">
                            <DashboardLoader size={32} />
                        </div>
                    </div>
                ) : (
                    <CourseDetailsPage />
                )}
            </InitStudyLibraryProvider>
        </LayoutContainer>
    );
}
