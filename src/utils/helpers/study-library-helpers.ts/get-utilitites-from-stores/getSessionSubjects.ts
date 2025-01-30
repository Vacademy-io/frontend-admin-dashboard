import { useStudyLibraryStore } from "@/stores/study-library/use-study-library-store";
import { useMemo } from "react";

interface Subject {
    id: string;
    subject_name: string;
    subject_code: string;
    credit: number;
    thumbnail_id: string | null;
    created_at: string | null;
    updated_at: string | null;
}

// Create a custom hook for reactive updates
export const useSessionSubjects = (sessionName: string, levelName: string): Subject[] => {
    const studyLibraryData = useStudyLibraryStore((state) => state.studyLibraryData);

    return useMemo(() => {
        if (!studyLibraryData) {
            return [];
        }

        // Find the session
        const sessionData = studyLibraryData.find(
            (item) => item.session_dto.session_name === sessionName,
        );

        if (!sessionData) {
            return [];
        }

        // Find the level within that session
        const levelData = sessionData.level_with_details.find((level) => level.name === levelName);

        if (!levelData) {
            return [];
        }

        return levelData.subjects;
    }, [studyLibraryData, sessionName, levelName]);
};
