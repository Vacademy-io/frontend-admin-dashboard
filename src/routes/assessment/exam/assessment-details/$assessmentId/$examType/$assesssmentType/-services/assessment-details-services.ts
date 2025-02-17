import {
    GET_ADMIN_PARTICIPANTS,
    GET_LEADERBOARD_URL,
    GET_OVERVIEW_URL,
    GET_QUESTIONS_INSIGHTS_URL,
    PRIVATE_ADD_QUESTIONS,
} from "@/constants/urls";
import authenticatedAxiosInstance from "@/lib/auth/axiosInstance";
import { AssessmentStudentLeaderboardInterface } from "../-components/AssessmentStudentLeaderboard";
import { AssessmentDetailQuestions } from "../-utils/assessment-details-interface";

export const savePrivateQuestions = async (questions: AssessmentDetailQuestions) => {
    const response = await authenticatedAxiosInstance({
        method: "POST",
        url: PRIVATE_ADD_QUESTIONS,
        data: questions,
    });
    return response?.data;
};

export const getOverviewDetials = async (assessmentId: string, instituteId: string | undefined) => {
    const response = await authenticatedAxiosInstance({
        method: "GET",
        url: GET_OVERVIEW_URL,
        params: {
            assessmentId,
            instituteId,
        },
    });
    return response?.data;
};

export const getQuestionsInsightsData = async (
    assessmentId: string,
    instituteId: string | undefined,
    sectionId: string | undefined,
) => {
    const response = await authenticatedAxiosInstance({
        method: "GET",
        url: GET_QUESTIONS_INSIGHTS_URL,
        params: {
            assessmentId,
            instituteId,
            sectionId,
        },
    });
    return response?.data;
};

export const handleGetQuestionInsightsData = ({
    assessmentId,
    instituteId,
    sectionId,
}: {
    assessmentId: string;
    instituteId: string | undefined;
    sectionId: string | undefined;
}) => {
    return {
        queryKey: ["GET_QUESTION_INSIGHTS_DETAILS", assessmentId, instituteId, sectionId],
        queryFn: () => getQuestionsInsightsData(assessmentId, instituteId, sectionId),
        staleTime: 60 * 60 * 1000,
        enabled: !!sectionId,
    };
};

export const getStudentLeaderboardDetails = async (
    assessmentId: string,
    instituteId: string | undefined,
    pageNo: number,
    pageSize: number,
    selectedFilter: AssessmentStudentLeaderboardInterface,
) => {
    const response = await authenticatedAxiosInstance({
        method: "POST",
        url: GET_LEADERBOARD_URL,
        params: {
            assessmentId,
            instituteId,
            pageNo,
            pageSize,
        },
        data: selectedFilter,
    });
    return response?.data;
};

export const handleGetOverviewData = ({
    assessmentId,
    instituteId,
}: {
    assessmentId: string;
    instituteId: string | undefined;
}) => {
    return {
        queryKey: ["GET_ASSESSMENT_DETAILS", assessmentId, instituteId],
        queryFn: () => getOverviewDetials(assessmentId, instituteId),
        staleTime: 60 * 60 * 1000,
    };
};

export const handleGetLeaderboardData = ({
    assessmentId,
    instituteId,
    pageNo,
    pageSize,
    selectedFilter,
}: {
    assessmentId: string;
    instituteId: string | undefined;
    pageNo: number;
    pageSize: number;
    selectedFilter: AssessmentStudentLeaderboardInterface;
}) => {
    return {
        queryKey: [
            "GET_STUDENT_LEADERBOARD_DETAILS",
            assessmentId,
            instituteId,
            pageNo,
            pageSize,
            selectedFilter,
        ],
        queryFn: () =>
            getStudentLeaderboardDetails(
                assessmentId,
                instituteId,
                pageNo,
                pageSize,
                selectedFilter,
            ),
        staleTime: 60 * 60 * 1000,
    };
};

export const getAdminParticipants = async (
    assessmentId: string,
    instituteId: string | undefined,
    pageNo: number,
    pageSize: number,
    selectedFilter: any,
) => {
    const response = await authenticatedAxiosInstance({
        method: "POST",
        url: GET_ADMIN_PARTICIPANTS,
        params: {
            instituteId,
            assessmentId,
            pageNo,
            pageSize,
        },
        data: selectedFilter,
    });
    return response?.data;
};

export const handleAdminParticipantsData = ({
    assessmentId,
    instituteId,
    pageNo,
    pageSize,
    selectedFilter,
}: {
    assessmentId: string;
    instituteId: string | undefined;
    pageNo: number;
    pageSize: number;
    selectedFilter: any;
}) => {
    return {
        queryKey: [
            "GET_ADMIN_PARTICIPANTS_DETAILS",
            assessmentId,
            instituteId,
            pageNo,
            pageSize,
            selectedFilter,
        ],
        queryFn: () =>
            getAdminParticipants(assessmentId, instituteId, pageNo, pageSize, selectedFilter),
        staleTime: 60 * 60 * 1000,
    };
};
