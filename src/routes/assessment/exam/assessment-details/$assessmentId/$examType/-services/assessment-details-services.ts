import { PRIVATE_ADD_QUESTIONS } from "@/constants/urls";
import authenticatedAxiosInstance from "@/lib/auth/axiosInstance";
import { AssessmentDetailQuestions } from "../-utils/assessment-details-interface";

export const savePrivateQuestions = async (questions: AssessmentDetailQuestions) => {
    const response = await authenticatedAxiosInstance({
        method: "POST",
        url: PRIVATE_ADD_QUESTIONS,
        data: questions,
    });
    return response?.data;
};
