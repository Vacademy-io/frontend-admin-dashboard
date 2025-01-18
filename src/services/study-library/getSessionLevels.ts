import { useStudyLibraryStore } from "@/stores/study-library/use-study-library-store";

// utils/study-library/getSessionLevels.ts
interface LevelInfo {
    id: string;
    name: string;
}

export const getSessionLevels = (sessionName: string): LevelInfo[] => {
    const studyLibraryData = useStudyLibraryStore.getState().studyLibraryData;

    if (!studyLibraryData) {
        return [];
    }

    const sessionData = studyLibraryData.find(
        (item) => item.session_dto.session_name === sessionName,
    );

    if (!sessionData) {
        return [];
    }

    return sessionData.level_with_details.map((level) => ({
        id: level.id,
        name: level.name,
    }));
};
