import { GET_USER_CREDENTIALS } from "@/constants/urls";
import authenticatedAxiosInstance from "@/lib/auth/axiosInstance";
import { useQuery } from "@tanstack/react-query";

export interface StudentCredentialsType {
    username: string;
    password: string;
    user_id: string;
}

export const useStudentCredentails = ({ userId }: { userId: string }) => {
    return useQuery<StudentCredentialsType | null>({
        queryKey: ["GET_USER_CREDENTIALS", userId],
        queryFn: async () => {
            const response = await authenticatedAxiosInstance.get(
                `${GET_USER_CREDENTIALS}/${userId}`,
            );
            return response.data;
        },
        staleTime: 3600000,
        enabled: !!userId,
    });
};
