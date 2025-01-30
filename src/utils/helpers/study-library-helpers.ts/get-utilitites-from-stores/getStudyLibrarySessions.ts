// utils/study-library/getSessionNames.ts
import { useStudyLibraryStore } from "@/stores/study-library/use-study-library-store";

export const getSessionNames = (): string[] => {
    const studyLibraryData = useStudyLibraryStore.getState().studyLibraryData;

    if (!studyLibraryData) {
        return [];
    }

    return studyLibraryData.map((item) => item.session_dto.session_name);
};
