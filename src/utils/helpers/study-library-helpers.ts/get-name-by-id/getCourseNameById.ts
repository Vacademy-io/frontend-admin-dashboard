import { useStudyLibraryStore } from '@/stores/study-library/use-study-library-store';
import { convertCapitalToTitleCase } from '@/lib/utils';

export const getCourseNameById = (courseId: string): string | undefined => {
    const studyLibraryData = useStudyLibraryStore.getState().studyLibraryData;
    if (!studyLibraryData) {
        return undefined;
    }

    const course = studyLibraryData.find(
        (courseWithSessions) => courseWithSessions.course.id === courseId
    );

    return course?.course.package_name
        ? convertCapitalToTitleCase(course.course.package_name)
        : undefined;
};
