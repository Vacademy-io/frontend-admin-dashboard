import { GET_BATCH_REPORT, GET_LEADERBOARD_DATA } from "@/constants/urls";
import authenticatedAxiosInstance from "@/lib/auth/axiosInstance";

export const fetchBatchReport = async (data: {
    start_date: string;
    end_date: string;
    package_session_id: string;
}) => {
    const response = await authenticatedAxiosInstance.post(GET_BATCH_REPORT, data, {
        headers: {
            Accept: "*/*",
            "Content-Type": "application/json",
        },
    });
    return response.data;
};
export const fetchLeaderboardData = async (data: {
    start_date: string;
    end_date: string;
    package_session_id: string;
}) => {
    const response = await authenticatedAxiosInstance.post(GET_LEADERBOARD_DATA, data, {
        headers: {
            Accept: "*/*",
            "Content-Type": "application/json",
        },
    });
    return response.data;
};
