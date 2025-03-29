import { AddSessionDataType } from "@/routes/study-library/session/-components/session-operations/add-session/add-session-form";
import { ADD_SESSION } from "@/constants/urls";
import authenticatedAxiosInstance from "@/lib/auth/axiosInstance";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export const useAddSession = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ requestData }: { requestData: AddSessionDataType }) => {
            const payload = requestData;
            return authenticatedAxiosInstance.post(ADD_SESSION, payload);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["GET_INIT_INSTITUTE"] });
            queryClient.invalidateQueries({ queryKey: ["GET_INIT_STUDY_LIBRARY"] });
            queryClient.invalidateQueries({ queryKey: ["GET_SESSION_DATA"] });
        },
    });
};
