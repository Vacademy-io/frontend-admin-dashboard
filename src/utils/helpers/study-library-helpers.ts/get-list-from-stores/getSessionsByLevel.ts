// utils/study-library/getSessionsByLevel.ts
import {
    useStudyLibraryStore,
    StudyLibrarySessionType,
} from "@/stores/study-library/use-study-library-store";

export const getSessionsByLevel = (
    courseId: string,
    levelId: string,
): StudyLibrarySessionType[] => {
    const studyLibraryData = useStudyLibraryStore.getState().studyLibraryData;

    if (!studyLibraryData) {
        return [];
    }

    const course = studyLibraryData.find((courseData) => courseData.course.id === courseId);

    if (!course) {
        return [];
    }

    // Filter sessions that contain the specified levelId
    return course.sessions
        .filter((session) => session.level_with_details.some((level) => level.id === levelId))
        .map((session) => session.session_dto);
};
