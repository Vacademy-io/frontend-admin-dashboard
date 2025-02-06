import {
    StudyLibrarySessionType,
    useStudyLibraryStore,
} from "@/stores/study-library/use-study-library-store";

export const getSubjectSessions = (subjectId: string): StudyLibrarySessionType[] => {
    const studyLibraryData = useStudyLibraryStore.getState().studyLibraryData;

    if (!studyLibraryData) {
        return [];
    }

    const sessions: StudyLibrarySessionType[] = [];

    studyLibraryData.forEach((courseData) => {
        courseData.sessions.forEach((session) => {
            if (
                session.level_with_details.some((level) =>
                    level.subjects.some((subject) => subject.id === subjectId),
                )
            ) {
                sessions.push(session.session_dto);
            }
        });
    });

    return sessions;
};
