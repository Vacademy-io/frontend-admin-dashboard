import {
    GET_ASSESSMENT_DETAILS,
    STEP1_ASSESSMENT_URL,
    STEP2_ASSESSMENT_URL,
    STEP2_QUESTIONS_URL,
    STEP3_ASSESSMENT_URL,
} from "@/constants/urls";
import authenticatedAxiosInstance from "@/lib/auth/axiosInstance";
import { Steps } from "@/types/assessment-data-type";
import { z } from "zod";
import { BasicInfoFormSchema } from "../-utils/basic-info-form-schema";
import sectionDetailsSchema from "../-utils/section-details-schema";
import { convertToUTCPlus530 } from "../-utils/helper";
import testAccessSchema from "../-utils/add-participants-schema";
import { AccessControlFormSchema } from "../-utils/access-control-form-schema";

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
                    question_duration_in_min:
                        parseInt(section.question_duration.hrs) * 60 +
                            parseInt(section.question_duration.min) || 0,
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

// Type definition for each converted custom field
interface ConvertedCustomField {
    name: string;
    type: string;
    default_value: string;
    description: string;
    is_mandatory: boolean;
    key: string;
    comma_separated_options: string;
}

// Assuming customFields is an object where keys are strings and values are the custom field details
type CustomFields = {
    type: string;
    name: string;
    oldKey: boolean;
    isRequired: boolean;
    options?: { id: number; value: string }[];
    default_value?: string;
    description?: string;
    key?: string;
    is_mandatory?: boolean;
}[];

// Function that converts customFields to the desired structure
const convertCustomFields = (customFields: CustomFields): ConvertedCustomField[] => {
    const convertedFields = customFields.map((field) => {
        return {
            name: field.name,
            type: field.type,
            default_value: "", // Provide a default value, if necessary
            description: "", // Provide a description, if necessary
            is_mandatory: field.isRequired,
            key: "", // Use the ID as the key
            comma_separated_options: field.options
                ? field.options.map((opt) => opt.value).join(",")
                : "", // Join options for dropdowns
        };
    });
    return convertedFields;
};

export const handlePostStep3Data = async (
    data: z.infer<typeof testAccessSchema>,
    assessmentId: string | null,
    instituteId: string | undefined,
    type: string,
) => {
    const convertedData = {
        closed_test: data.closed_test,
        open_test_details: data.open_test.checked
            ? {
                  registration_start_date: convertToUTCPlus530(data.open_test.start_date) || "",
                  registration_end_date: convertToUTCPlus530(data.open_test.end_date) || "",
                  instructions_html: data.open_test.instructions || "",
                  registration_form_details: {
                      added_custom_added_fields: convertCustomFields(data.open_test.custom_fields),
                      removed_custom_added_fields: [], // Default to an empty array as per example
                  },
              }
            : {},
        added_pre_register_batches_details: data.select_batch.batch_details
            ? Object.values(data.select_batch.batch_details).flat()
            : [],
        deleted_pre_register_batches_details: [],
        added_pre_register_students_details: data.select_individually.student_details
            ? data.select_individually.student_details
            : [],
        deleted_pre_register_students_details: [],
        updated_join_link: data.join_link || "",
        notify_student: {
            when_assessment_created: data.notify_student.when_assessment_created || false,
            show_leaderboard: data.show_leaderboard || false,
            before_assessment_goes_live:
                parseInt(data.notify_student.before_assessment_goes_live.value) || 0,
            when_assessment_live: data.notify_student.when_assessment_live || false,
            when_assessment_report_generated:
                data.notify_student.when_assessment_report_generated || false,
        },
        notify_parent: {
            when_assessment_created: data.notify_parent.when_assessment_created || false,
            before_assessment_goes_live:
                parseInt(data.notify_parent.before_assessment_goes_live.value) || 0,
            show_leaderboard: data.show_leaderboard || false,
            when_assessment_live: data.notify_parent.when_assessment_live || false,
            when_student_appears: data.notify_parent.when_student_appears || false,
            when_student_finishes_test: data.notify_parent.when_student_finishes_test || false,
            when_assessment_report_generated:
                data.notify_parent.when_assessment_report_generated || false,
        },
    };
    const response = await authenticatedAxiosInstance({
        method: "POST",
        url: STEP3_ASSESSMENT_URL,
        data: convertedData,
        params: {
            assessmentId,
            instituteId,
            type,
        },
    });
    return response?.data;
};

export const handlePostStep4Data = async (
    data: z.infer<typeof AccessControlFormSchema>,
    assessmentId: string | null,
    instituteId: string | undefined,
    type: string,
) => {
    const convertedData = {
        assessment_creation_access: {
            roles: data.assessment_creation_access.roles.filter((role) => role.isSelected),
            user_ids: data.assessment_creation_access.users,
        },
        live_assessment_notification_access: {
            roles: data.live_assessment_notification.roles.filter((role) => role.isSelected),
            user_ids: data.live_assessment_notification.users,
        },
        assessment_submission_and_report_access: {
            roles: data.assessment_submission_and_report_access.roles.filter(
                (role) => role.isSelected,
            ),
            user_ids: data.assessment_submission_and_report_access.users,
        },
        evaluation_process_access: {
            roles: data.evaluation_process.roles.filter((role) => role.isSelected),
            user_ids: data.evaluation_process.users,
        },
    };
    const response = await authenticatedAxiosInstance({
        method: "POST",
        url: STEP3_ASSESSMENT_URL,
        data: convertedData,
        params: {
            assessmentId,
            instituteId,
            type,
        },
    });
    return response?.data;
};
