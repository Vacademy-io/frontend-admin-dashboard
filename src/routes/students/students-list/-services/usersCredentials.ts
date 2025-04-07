import { USERS_CREDENTIALS } from "@/constants/urls";
import authenticatedAxiosInstance from "@/lib/auth/axiosInstance";
import { useMutation } from "@tanstack/react-query";

export const useUsersCredentials = () => {
    return useMutation({
        mutationFn: async ({ userIds }: { userIds: string[] }) => {
            return authenticatedAxiosInstance.post(`${USERS_CREDENTIALS}`, userIds);
        },
    });
};
