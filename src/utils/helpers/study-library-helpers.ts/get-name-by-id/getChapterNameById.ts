// utils/study-library/getChapterName.ts
import { useModulesWithChaptersStore } from "@/stores/study-library/use-modules-with-chapters-store";

export const getChapterName = (chapterId: string): string => {
    const modulesData = useModulesWithChaptersStore.getState().modulesWithChaptersData;

    if (!modulesData) {
        return "";
    }

    // Search through all modules to find the chapter
    for (const moduleData of modulesData) {
        const chapter = moduleData.chapters.find(
            (chapterData) => chapterData.chapter.id === chapterId,
        );

        if (chapter) {
            return chapter.chapter.chapter_name;
        }
    }

    return "";
};
