import { GET_QUESTION_PAPER_FILTERED_DATA } from "@/constants/urls";
import authenticatedAxiosInstance from "@/lib/auth/axiosInstance";

export const getQuestionPaperFilteredData = (
    pageNo: number,
    pageSize: number,
    instituteId: string,
) => {
    return {
        queryKey: ["GET_QUESTION_PAPER_FILTERED_DATA", pageNo, pageSize, instituteId],
        queryFn: async () => {
            try {
                const response = await authenticatedAxiosInstance({
                    method: "GET",
                    url: `${GET_QUESTION_PAPER_FILTERED_DATA}`,
                    params: {
                        pageNo,
                        instituteId,
                        pageSize,
                    },
                });
                return response?.data;
            } catch (error: unknown) {
                throw new Error(`Error redirecting to login page: ${error}`);
            }
        },
    };
};
