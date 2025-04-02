import { useMutation, useQueryClient } from "@tanstack/react-query";
import { CreateInvitationRequestType } from "../-types/create-invitation-types";
import authenticatedAxiosInstance from "@/lib/auth/axiosInstance";
import { UPDATE_INVITATION } from "@/constants/urls";

export const useUpdateInvite = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ requestBody }: { requestBody: CreateInvitationRequestType }) => {
            return authenticatedAxiosInstance.put(`${UPDATE_INVITATION}`, requestBody);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["inviteList"] });
        },
    });
};
