import { GET_USER_CREDENTIALS } from "@/constants/urls";
import authenticatedAxiosInstance from "@/lib/auth/axiosInstance";
import { useStudentSidebar } from "@/routes/students/students-list/-context/selected-student-sidebar-context";
import { useQuery } from "@tanstack/react-query";

export interface StudentCredentialsType {
    username: string;
    password: string;
    user_id: string;
}

export const useStudentCredentails = ({ userId }: { userId: string }) => {
    const { setSelectedStudentCredentials } = useStudentSidebar();
    return useQuery<StudentCredentialsType | null>({
        queryKey: ["GET_USER_CREDENTIALS", userId],
        queryFn: async () => {
            const response = await authenticatedAxiosInstance.get(
                `${GET_USER_CREDENTIALS}/${userId}`,
            );
            setSelectedStudentCredentials(response.data);
            return response.data;
        },
        enabled: !!userId,
    });
};
