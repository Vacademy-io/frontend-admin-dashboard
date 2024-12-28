import { GET_ASSESSMENT_DETAILS } from "@/constants/urls";
import authenticatedAxiosInstance from "@/lib/auth/axiosInstance";
import { Steps } from "@/types/assessment-data-type";

export const getAssessmentDetails = ({
    assessmentId,
    instituteId,
    type,
}: {
    assessmentId: string;
    instituteId: string | undefined;
    type: string;
}) => {
    return {
        queryKey: ["GET_ASSESSMENT_DETAILS", assessmentId, instituteId, type],
        queryFn: async (): Promise<Steps> => {
            const response = await authenticatedAxiosInstance({
                method: "GET",
                url: GET_ASSESSMENT_DETAILS,
                params: {
                    assessmentId,
                    instituteId,
                    type,
                },
            });
            return response?.data as Steps;
        },
        staleTime: 60 * 60 * 1000,
    };
};
