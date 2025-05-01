import { DUPLICATE_STUDY_MATERIAL_FROM_SESSION } from "@/constants/urls";
import authenticatedAxiosInstance from "@/lib/auth/axiosInstance";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export const useCopyStudyMaterialFromSession = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({fromPackageSessionId, toPackageSessionId}: {fromPackageSessionId: string, toPackageSessionId: string}) => {
            const response = await authenticatedAxiosInstance.post(`${DUPLICATE_STUDY_MATERIAL_FROM_SESSION}?fromPackageSessionId=${fromPackageSessionId}&toPackageSessionId=${toPackageSessionId}`);
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["sessions"] });
        },
        onError: (error) => {
            console.error("Error copying study material from session:", error);
        },
    });

}
