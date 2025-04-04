import {
    GET_BATCH_REPORT,
    GET_LEADERBOARD_DATA,
    GET_LEARNERS_REPORT,
    CHAPTER_WISE_BATCH_REPORT,
    SUBJECT_WISE_BATCH_REPORT,
    CHAPTER_WISE_LEARNERS_REPORT,
    SUBJECT_WISE_LEARNERS_REPORT,
    SLIDE_WISE_LEARNERS_REPORT,
} from "@/constants/urls";
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
export const fetchLearnersReport = async (data: {
    start_date: string;
    end_date: string;
    package_session_id: string;
    user_id: string;
}) => {
    const response = await authenticatedAxiosInstance.post(GET_LEARNERS_REPORT, data, {
        headers: {
            Accept: "*/*",
            "Content-Type": "application/json",
        },
    });
    return response.data;
};
export const fetchLeaderboardData = async (data: {
    body: {
        start_date: string;
        end_date: string;
        package_session_id: string;
    };
    param: { pageNo: number; pageSize: number };
}) => {
    const response = await authenticatedAxiosInstance.post(GET_LEADERBOARD_DATA, data.body, {
        params: data.param,
        headers: {
            Accept: "*/*",
            "Content-Type": "application/json",
        },
    });
    return response.data;
};

export const fetchChapterWiseProgress = async (data: {
    packageSessionId: string;
    moduleId: string;
}) => {
    try {
        const response = await authenticatedAxiosInstance.get(CHAPTER_WISE_BATCH_REPORT, {
            params: data,
            headers: {
                Accept: "*/*",
            },
        });

        return response.data;
    } catch (error) {
        return null;
    }
};
export const fetchLearnersChapterWiseProgress = async (data: {
    userId: string;
    moduleId: string;
}) => {
    try {
        const response = await authenticatedAxiosInstance.get(CHAPTER_WISE_LEARNERS_REPORT, {
            params: data,
            headers: {
                Accept: "*/*",
            },
        });

        return response.data;
    } catch (error) {
        return null;
    }
};

export const fetchSubjectWiseProgress = async (data: { packageSessionId: string }) => {
    try {
        const response = await authenticatedAxiosInstance.get(SUBJECT_WISE_BATCH_REPORT, {
            params: data,
            headers: {
                Accept: "*/*",
            },
        });

        return response.data;
    } catch (error) {
        return null;
    }
};
export const fetchLearnersSubjectWiseProgress = async (data: {
    packageSessionId: string;
    userId: string;
}) => {
    try {
        const response = await authenticatedAxiosInstance.get(SUBJECT_WISE_LEARNERS_REPORT, {
            params: data,
            headers: {
                Accept: "*/*",
            },
        });

        return response.data;
    } catch (error) {
        return null;
    }
};

export const fetchSlideWiseProgress = async (data: {
    start_date: string;
    end_date: string;
    package_session_id: string;
    user_id: string;
}) => {
    try {
        const response = await authenticatedAxiosInstance.post(SLIDE_WISE_LEARNERS_REPORT, data, {
            headers: {
                Accept: "*/*",
                "Content-Type": "application/json",
            },
        });
        return response.data;
    } catch (error) {
        console.error(error);
        throw error;
    }
};
