import {
    GET_ADMIN_PARTICIPANTS,
    GET_ASSESSMENT_TOTAL_MARKS_URL,
    GET_BATCH_DETAILS_URL,
    GET_INDIVIDUAL_STUDENT_DETAILS_URL,
    GET_LEADERBOARD_URL,
    GET_OVERVIEW_URL,
    GET_PARTICIPANTS_QUESTION_WISE,
    GET_QUESTIONS_INSIGHTS_URL,
    GET_REVALUATE_STUDENT_RESULT,
    PRIVATE_ADD_QUESTIONS,
    STUDENT_REPORT_DETAIL_URL,
    STUDENT_REPORT_URL,
} from "@/constants/urls";
import authenticatedAxiosInstance from "@/lib/auth/axiosInstance";
import { AssessmentStudentLeaderboardInterface } from "../-components/AssessmentStudentLeaderboard";
import { AssessmentDetailQuestions } from "../-utils/assessment-details-interface";
import { SelectedSubmissionsFilterInterface } from "../-components/AssessmentSubmissionsTab";
import { StudentReportFilterInterface } from "@/routes/students/students-list/-components/students-list/student-side-view/student-test-records/student-test-record";
import { SelectedFilterQuestionWise } from "@/types/assessments/student-questionwise-status";
import { SelectedFilterRevaluateInterface } from "@/types/assessments/assessment-revaluate-question-wise";
import { AssessmentParticipantsInterface } from "../-components/AssessmentParticipantsList";

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

export const getAssessmentTotalMarks = async (assessmentId: string) => {
    const response = await authenticatedAxiosInstance({
        method: "GET",
        url: GET_ASSESSMENT_TOTAL_MARKS_URL,
        params: {
            assessmentId,
        },
    });
    return response?.data;
};

export const handleGetAssessmentTotalMarksData = ({ assessmentId }: { assessmentId: string }) => {
    return {
        queryKey: ["GET_ASSESSMENT_TOTAL_MARKS", assessmentId],
        queryFn: () => getAssessmentTotalMarks(assessmentId),
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
    selectedFilter: SelectedSubmissionsFilterInterface,
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
        data: {
            ...selectedFilter,
            batches: selectedFilter.batches.map((batch: { id: string }) => batch.id),
        },
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
    selectedFilter: SelectedSubmissionsFilterInterface;
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

export const getStudentReport = async (
    studentId: string | undefined,
    instituteId: string | undefined,
    pageNo: number,
    pageSize: number,
    selectedFilter: StudentReportFilterInterface,
) => {
    const response = await authenticatedAxiosInstance({
        method: "POST",
        url: STUDENT_REPORT_URL,
        params: {
            studentId,
            instituteId,
            pageNo,
            pageSize,
        },
        data: selectedFilter,
    });
    return response?.data;
};

export const viewStudentReport = async (
    assessmentId: string,
    attemptId: string,
    instituteId: string | undefined,
) => {
    const response = await authenticatedAxiosInstance({
        method: "GET",
        url: STUDENT_REPORT_DETAIL_URL,
        params: {
            assessmentId,
            attemptId,
            instituteId,
        },
    });
    return response?.data;
};

export const handleStudentReportData = ({
    studentId,
    instituteId,
    pageNo,
    pageSize,
    selectedFilter,
}: {
    studentId: string | undefined;
    instituteId: string | undefined;
    pageNo: number;
    pageSize: number;
    selectedFilter: StudentReportFilterInterface;
}) => {
    return {
        queryKey: [
            "GET_STUDENT_REPORT_DETAILS",
            studentId,
            instituteId,
            pageNo,
            pageSize,
            selectedFilter,
        ],
        queryFn: () => getStudentReport(studentId, instituteId, pageNo, pageSize, selectedFilter),
        staleTime: 60 * 60 * 1000,
    };
};

export const getParticipantsListQuestionwise = async (
    assessmentId: string,
    sectionId: string | undefined,
    questionId: string | undefined,
    pageNo: number,
    pageSize: number,
    selectedFilter: SelectedFilterQuestionWise,
) => {
    const response = await authenticatedAxiosInstance({
        method: "POST",
        url: GET_PARTICIPANTS_QUESTION_WISE,
        params: {
            assessmentId,
            sectionId,
            questionId,
            pageNo,
            pageSize,
        },
        data: {
            ...selectedFilter,
            registration_source_id: selectedFilter.registration_source_id.map(
                (batch: { id: string; name: string }) => batch.id,
            ),
        },
    });
    return response?.data;
};

export const handleParticipantsListQuestionwise = ({
    assessmentId,
    sectionId,
    questionId,
    pageNo,
    pageSize,
    selectedFilter,
}: {
    assessmentId: string;
    sectionId: string | undefined;
    questionId: string | undefined;
    pageNo: number;
    pageSize: number;
    selectedFilter: SelectedFilterQuestionWise;
}) => {
    return {
        queryKey: [
            "GET_PARTICIPANTS_LIST_QUESTION_WISE",
            assessmentId,
            sectionId,
            questionId,
            pageNo,
            pageSize,
            selectedFilter,
        ],
        queryFn: () =>
            getParticipantsListQuestionwise(
                assessmentId,
                sectionId,
                questionId,
                pageNo,
                pageSize,
                selectedFilter,
            ),
        staleTime: 60 * 60 * 1000,
    };
};

export const getRevaluateStudentResult = async (
    assessmentId: string,
    instituteId: string | undefined,
    methodType: string,
    selectedFilter: SelectedFilterRevaluateInterface,
) => {
    const response = await authenticatedAxiosInstance({
        method: "POST",
        url: GET_REVALUATE_STUDENT_RESULT,
        params: {
            assessmentId,
            instituteId,
            methodType,
        },
        data: selectedFilter,
    });
    return response?.data;
};

export const getBatchDetailsListOfStudents = async (
    pageNo: number,
    pageSize: number,
    selectedFilter: AssessmentParticipantsInterface,
) => {
    const response = await authenticatedAxiosInstance({
        method: "POST",
        url: GET_BATCH_DETAILS_URL,
        params: {
            pageNo,
            pageSize,
        },
        data: {
            ...selectedFilter,
            gender: selectedFilter.gender.map((type: { id: string; name: string }) => type.name),
        },
    });
    return response?.data;
};

export const getBatchDetailsListOfIndividualStudents = async (
    instituteId: string | undefined,
    assessmentId: string,
) => {
    const response = await authenticatedAxiosInstance({
        method: "GET",
        url: GET_INDIVIDUAL_STUDENT_DETAILS_URL,
        params: {
            instituteId,
            assessmentId,
        },
    });
    return response?.data;
};
