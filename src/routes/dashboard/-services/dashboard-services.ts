import { GET_DASHBOARD_URL } from "@/constants/urls";
import authenticatedAxiosInstance from "@/lib/auth/axiosInstance";

export const fetchInstituteDashboardDetails = async (instituteId: string | undefined) => {
    const response = await authenticatedAxiosInstance({
        method: "GET",
        url: GET_DASHBOARD_URL,
        params: {
            instituteId,
        },
    });
    return response.data;
};

export const getInstituteDashboardData = (instituteId: string | undefined) => {
    return {
        queryKey: ["GET_INSTITUTE_DASHBOARD_DATA", instituteId],
        queryFn: async () => {
            const data = await fetchInstituteDashboardDetails(instituteId);
            return data;
        },
        staleTime: 3600000,
    };
};
