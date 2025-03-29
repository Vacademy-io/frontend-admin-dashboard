import { AddLevelData } from "@/routes/study-library/courses/levels/-components/add-level-form";
import { ADD_LEVEL } from "@/constants/urls";
import authenticatedAxiosInstance from "@/lib/auth/axiosInstance";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export const useAddLevel = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({
            requestData,
            packageId,
            sessionId,
        }: {
            requestData: AddLevelData;
            packageId: string;
            sessionId: string;
        }) => {
            const payload = requestData;

            return authenticatedAxiosInstance.post(
                `${ADD_LEVEL}?packageId=${packageId}&sessionId=${sessionId}`,
                payload,
            );
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["GET_INIT_STUDY_LIBRARY"] });
            queryClient.invalidateQueries({ queryKey: ["GET_INIT_INSTITUTE"] });
        },
    });
};
