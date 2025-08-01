import { MOVE_SLIDE } from '@/constants/urls';
import authenticatedAxiosInstance from '@/lib/auth/axiosInstance';
import { useMutation, useQueryClient } from '@tanstack/react-query';

export const useMoveSlide = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({
            slideId,
            oldChapterId,
            oldModuleId,
            oldSubjectId,
            oldPackageSessionId,
            newChapterId,
            newModuleId,
            newSubjectId,
            newPackageSessionId,
        }: {
            slideId: string;
            oldChapterId: string;
            oldModuleId: string;
            oldSubjectId: string;
            oldPackageSessionId: string;
            newChapterId: string;
            newModuleId: string;
            newSubjectId: string;
            newPackageSessionId: string;
        }) => {
            try {
                await authenticatedAxiosInstance.post(
                    `${MOVE_SLIDE}?slideId=${slideId}&oldChapterId=${oldChapterId}&oldModuleId=${oldModuleId}&oldSubjectId=${oldSubjectId}&oldPackageSessionId=${oldPackageSessionId}&newChapterId=${newChapterId}&newModuleId=${newModuleId}&newSubjectId=${newSubjectId}&newPackageSessionId=${newPackageSessionId}`
                );
            } catch {
                throw new Error('Failed to move slide');
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['slides'] });
            queryClient.invalidateQueries({ queryKey: ['GET_INIT_STUDY_LIBRARY'] });
            queryClient.invalidateQueries({ queryKey: ['GET_INIT_INSTITUTE'] });
            queryClient.invalidateQueries({ queryKey: ['GET_MODULES_WITH_CHAPTERS'] });
            queryClient.invalidateQueries({ queryKey: ['GET_STUDENT_SUBJECTS_PROGRESS'] });
            queryClient.invalidateQueries({ queryKey: ['GET_STUDENT_SLIDES_PROGRESS'] });
        },
    });
};
