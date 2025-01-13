import {
    GET_ASSESSMENT_DETAILS,
    STEP1_ASSESSMENT_URL,
    STEP2_ASSESSMENT_URL,
    STEP2_QUESTIONS_URL,
} from "@/constants/urls";
import authenticatedAxiosInstance from "@/lib/auth/axiosInstance";
import { Steps } from "@/types/assessment-data-type";
import { z } from "zod";
import { BasicInfoFormSchema } from "../-utils/basic-info-form-schema";
import sectionDetailsSchema from "../-utils/section-details-schema";
import { convertToUTCPlus530 } from "../-utils/helper";

export const getAssessmentDetailsData = async ({
    assessmentId,
    instituteId,
    type,
}: {
    assessmentId: string | null;
    instituteId: string | undefined;
    type: string;
}): Promise<Steps> => {
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
};
export const getAssessmentDetails = ({
    assessmentId,
    instituteId,
    type,
}: {
    assessmentId: string | null;
    instituteId: string | undefined;
    type: string;
}) => {
    return {
        queryKey: ["GET_ASSESSMENT_DETAILS", assessmentId, instituteId, type],
        queryFn: () => getAssessmentDetailsData({ assessmentId, instituteId, type }),
        staleTime: 60 * 60 * 1000,
    };
};

export const handlePostStep1Data = async (
    data: z.infer<typeof BasicInfoFormSchema>,
    assessmentId: string | null,
    instituteId: string | undefined,
    type: string,
) => {
    const transformedData = {
        status: data.status,
        test_creation: {
            assessment_name: data.testCreation.assessmentName,
            subject_id: data.testCreation.subject,
            assessment_instructions_html: data.testCreation.assessmentInstructions,
        },
        test_boundation: {
            start_date: convertToUTCPlus530(data.testCreation.liveDateRange.startDate),
            end_date: convertToUTCPlus530(data.testCreation.liveDateRange.endDate),
        },
        test_duration: {
            entire_test_duration: data.testDuration.entireTestDuration.checked
                ? parseInt(data?.testDuration?.entireTestDuration?.testDuration?.hrs || "0") * 60 +
                  parseInt(data?.testDuration?.entireTestDuration?.testDuration?.min || "0")
                : 0,
            distribution_duration: data.testDuration.sectionWiseDuration
                ? "SECTION"
                : data.testDuration.entireTestDuration.checked
                  ? "ASSESSMENT"
                  : "QUESTION",
        },
        assessment_preview_time: data.assessmentPreview.checked
            ? parseInt(data.assessmentPreview.previewTimeLimit)
            : 0,
        switch_sections: data.switchSections,
        evaluation_type: data.evaluationType,
        submission_type: data.submissionType,
        raise_reattempt_request: data.raiseReattemptRequest,
        raise_time_increase_request: data.raiseTimeIncreaseRequest,
    };
    const response = await authenticatedAxiosInstance({
        method: "POST",
        url: STEP1_ASSESSMENT_URL,
        data: transformedData,
        params: {
            assessmentId,
            instituteId,
            type,
        },
    });
    return response?.data;
};

export const handlePostStep2Data = async (
    data: z.infer<typeof sectionDetailsSchema>,
    assessmentId: string | null,
    instituteId: string | undefined,
    type: string,
) => {
    const convertedData = {
        added_sections: data.section.map((section, index) => ({
            section_description_html: section.section_description || "",
            section_name: section.sectionName,
            section_id: section.sectionId || "",
            section_duration:
                parseInt(section.section_duration.hrs) * 60 +
                parseInt(section.section_duration.min),
            section_order: index + 1,
            total_marks: parseInt(section.total_marks) || 0,
            cutoff_marks: section.cutoff_marks.checked
                ? parseInt(section.cutoff_marks.value) || 0
                : 0,
            problem_randomization: section.problem_randomization,
            question_and_marking: section.adaptive_marking_for_each_question.map(
                (question, qIndex) => ({
                    question_id: question.questionId,
                    marking_json: JSON.stringify({
                        type: question.questionType,
                        data: {
                            totalMark: question.questionMark || "",
                            negativeMark: question.questionPenalty || "",
                            negativeMarkingPercentage:
                                question.questionMark && question.questionPenalty
                                    ? (Number(question.questionPenalty) /
                                          Number(question.questionMark)) *
                                      100
                                    : "",
                            ...(question.questionType === "MCQM" && {
                                partialMarking: question.correctOptionIdsCnt
                                    ? 1 / question.correctOptionIdsCnt
                                    : 0,
                                partialMarkingPercentage: question.correctOptionIdsCnt
                                    ? (1 / question.correctOptionIdsCnt) * 100
                                    : 0,
                            }),
                        },
                    }),
                    question_duration_in_min: 0,
                    question_order: qIndex + 1,
                    is_added: true,
                    is_deleted: false,
                }),
            ),
        })),
        updated_sections: [],
        deleted_sections: [],
    };
    const response = await authenticatedAxiosInstance({
        method: "POST",
        url: STEP2_ASSESSMENT_URL,
        data: convertedData,
        params: {
            assessmentId,
            instituteId,
            type,
        },
    });
    return response?.data;
};

export const getQuestionsDataForStep2 = async ({
    assessmentId,
    sectionIds,
}: {
    assessmentId: string;
    sectionIds: string;
}) => {
    const response = await authenticatedAxiosInstance({
        method: "GET",
        url: STEP2_QUESTIONS_URL,
        params: {
            assessmentId,
            sectionIds,
        },
    });
    return response?.data;
};
