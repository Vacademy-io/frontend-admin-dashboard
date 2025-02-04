import { useMutation, useQueryClient } from "@tanstack/react-query";
import authenticatedAxiosInstance from "@/lib/auth/axiosInstance";
import { UPDATE_SUBJECT_ORDER } from "@/constants/urls";
import { orderSubjectPayloadType } from "@/types/study-library/order-payload";

export const useUpdateSubjectOrder = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ orderedSubjects }: { orderedSubjects: orderSubjectPayloadType[] }) => {
            const payload = orderedSubjects;
            return authenticatedAxiosInstance.put(`${UPDATE_SUBJECT_ORDER}`, payload);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["GET_INIT_STUDY_LIBRARY"] });
        },
    });
};
