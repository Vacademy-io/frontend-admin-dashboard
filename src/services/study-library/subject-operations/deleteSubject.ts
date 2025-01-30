import { useMutation, useQueryClient } from "@tanstack/react-query";
import authenticatedAxiosInstance from "@/lib/auth/axiosInstance";
import { DELETE_SUBJECT } from "@/constants/urls";

export const useDeleteSubject = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (subjectId: string) => {
            const payload = [subjectId];
            return authenticatedAxiosInstance.put(`${DELETE_SUBJECT}`, payload);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["GET_INIT_STUDY_LIBRARY"] });
        },
    });
};
