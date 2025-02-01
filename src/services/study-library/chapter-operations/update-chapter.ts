import { useMutation, useQueryClient } from "@tanstack/react-query";
import authenticatedAxiosInstance from "@/lib/auth/axiosInstance";
import { Chapter } from "@/stores/study-library/use-modules-with-chapters-store";
import { UPDATE_CHAPTER } from "@/constants/urls";

export const useUpdateChapter = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({
            chapterId,
            commaSeparatedPackageSessionIds,
            chapter,
        }: {
            chapterId: string;
            commaSeparatedPackageSessionIds: string;
            chapter: Chapter;
        }) => {
            const payload = {
                id: chapter.id,
                chapter_name: chapter.chapter_name,
                status: chapter.status,
                file_id: chapter.file_id,
                description: chapter.description,
                chapter_order: chapter.chapter_order,
            };

            return authenticatedAxiosInstance.put(
                `${UPDATE_CHAPTER}?chapterId=${chapterId}&commaSeparatedPackageSessionIds=${commaSeparatedPackageSessionIds}`,
                payload,
            );
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["GET_MODULES_WITH_CHAPTERS"] });
        },
    });
};
