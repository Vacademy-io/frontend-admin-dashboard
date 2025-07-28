import { createFileRoute } from '@tanstack/react-router';
import { getTokenDecodedData, getTokenFromCookie } from '@/lib/auth/sessionUtility';
import { TokenKey } from '@/constants/auth/tokens';
import { AdminSlidesView } from './admin/AdminSlidesView';
import { NonAdminSlidesView } from './non-admin/NonAdminSlidesView';
import { useStudyLibraryStore } from '@/stores/study-library/use-study-library-store';
import { useMemo } from 'react';

interface ChapterSearchParams {
    courseId: string;
    levelId: string;
    subjectId: string;
    moduleId: string;
    chapterId: string;
    slideId: string;
    sessionId: string;
    timestamp?: number;
    currentPage?: number;
}

export const Route = createFileRoute(
    '/study-library/courses/course-details/subjects/modules/chapters/slides/'
)({
    component: RouteComponent,
    validateSearch: (search: Record<string, unknown>): ChapterSearchParams => {
        return {
            courseId: search.courseId as string,
            levelId: search.levelId as string,
            subjectId: search.subjectId as string,
            moduleId: search.moduleId as string,
            chapterId: search.chapterId as string,
            slideId: search.slideId as string,
            sessionId: search.sessionId as string,
            ...(typeof search.timestamp === 'number' && { timestamp: search.timestamp }),
            ...(typeof search.currentPage === 'number' && { currentPage: search.currentPage }),
        };
    },
});

function RouteComponent() {
    const searchParams = Route.useSearch();
    const { courseId } = searchParams;
    const { studyLibraryData } = useStudyLibraryStore();

    // Get user role and institute ID
    const { userRole } = useMemo(() => {
        const accessToken = getTokenFromCookie(TokenKey.accessToken);
        const tokenData = getTokenDecodedData(accessToken);

        if (!tokenData || !tokenData.authorities) {
            return { userRole: null };
        }

        // Find the institute from studyLibraryData to get the correct institute ID
        const courseData = studyLibraryData?.find((item) => item.course.id === courseId);
        const currentInstituteId =
            courseData?.course?.institute_id || Object.keys(tokenData.authorities)[0]; // fallback to first institute

        if (!currentInstituteId || !tokenData.authorities[currentInstituteId]) {
            return { userRole: null };
        }

        const roles = tokenData.authorities[currentInstituteId]?.roles || [];
        const isAdmin = roles.includes('ADMIN');

        return {
            userRole: isAdmin ? 'ADMIN' : 'TEACHER',
        };
    }, [courseId, studyLibraryData]);

    // Route to appropriate view based on user role
    if (userRole === 'ADMIN') {
        return <AdminSlidesView {...searchParams} />;
    } else {
        return <NonAdminSlidesView {...searchParams} />;
    }
}
