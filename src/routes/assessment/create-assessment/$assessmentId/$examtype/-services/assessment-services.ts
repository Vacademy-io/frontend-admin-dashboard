import {
    GET_ASSESSMENT_DETAILS,
    PUBLISH_ASSESSMENT_URL,
    STEP1_ASSESSMENT_URL,
    STEP2_ASSESSMENT_URL,
    STEP2_QUESTIONS_URL,
    STEP3_ASSESSMENT_URL,
} from "@/constants/urls";
import authenticatedAxiosInstance from "@/lib/auth/axiosInstance";
import {
    ConvertedCustomField,
    CustomFields,
    Steps,
} from "@/types/assessments/assessment-data-type";
import { z } from "zod";
import { BasicInfoFormSchema } from "../-utils/basic-info-form-schema";
import sectionDetailsSchema from "../-utils/section-details-schema";
import {
    calculateTotalTime,
    classifySections,
    convertStep2Data,
    convertToUTC,
} from "../-utils/helper";
import testAccessSchema from "../-utils/add-participants-schema";
import { AccessControlFormSchema } from "../-utils/access-control-form-schema";
import { AssessmentPreviewSectionsInterface } from "@/routes/assessment/assessment-list/assessment-details/$assessmentId/$examType/$assesssmentType/-utils/assessment-details-interface";

export const getAssessmentDetailsData = async ({
    assessmentId,
    instituteId,
    type,
}: {
    assessmentId: string | null | undefined;
    instituteId: string | undefined;
    type: string | undefined;
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
    assessmentId: string | null | undefined;
    instituteId: string | undefined;
    type: string | undefined;
}) => {
    return {
        queryKey: ["GET_ASSESSMENT_DETAILS", assessmentId, instituteId, type],
        queryFn: () => getAssessmentDetailsData({ assessmentId, instituteId, type }),
        staleTime: 60 * 60 * 1000,
        enabled: !!assessmentId,
    };
};

export const getQuestionsDataForStep2 = async ({
    assessmentId,
    sectionIds,
}: {
    assessmentId: string;
    sectionIds: string | undefined;
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

export const getQuestionDataForSection = ({
    assessmentId,
    sectionIds,
}: {
    assessmentId: string;
    sectionIds: string | undefined;
}) => {
    return {
        queryKey: ["GET_QUESTIONS_DATA_FOR_SECTIONS", assessmentId, sectionIds],
        queryFn: async () => {
            const data = await getQuestionsDataForStep2({ assessmentId, sectionIds });
            return data;
        },
        staleTime: 60 * 60 * 1000,
    };
};

export const handlePostStep1Data = async (
    data: z.infer<typeof BasicInfoFormSchema>,
    assessmentId: string | null | undefined,
    instituteId: string | undefined,
    type: string | undefined,
) => {
    const transformedData = {
        status: data.status,
        test_creation: {
            assessment_name: data.testCreation.assessmentName,
            subject_id: data.testCreation.subject,
            assessment_instructions_html: data.testCreation.assessmentInstructions,
        },
        test_boundation: {
            start_date: convertToUTC(data.testCreation.liveDateRange.startDate || ""),
            end_date: convertToUTC(data.testCreation.liveDateRange.endDate || ""),
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
    oldData: z.infer<typeof sectionDetailsSchema>,
    data: z.infer<typeof sectionDetailsSchema>,
    assessmentId: string | null,
    instituteId: string | undefined,
    type: string | undefined,
) => {
    const convertedOldData = convertStep2Data(oldData);
    const convertedNewData = convertStep2Data(data);
    const classifiedSections = classifySections(convertedOldData, convertedNewData);
    const convertedData = {
        test_duration: {
            entire_test_duration: data.testDuration.entireTestDuration.checked
                ? parseInt(data?.testDuration?.entireTestDuration?.testDuration?.hrs || "0") * 60 +
                  parseInt(data?.testDuration?.entireTestDuration?.testDuration?.min || "0")
                : calculateTotalTime(data),
            distribution_duration: data.testDuration.sectionWiseDuration
                ? "SECTION"
                : data.testDuration.entireTestDuration.checked
                  ? "ASSESSMENT"
                  : "QUESTION",
        },
        added_sections: classifiedSections.added_sections,
        updated_sections: classifiedSections.updated_sections,
        deleted_sections: classifiedSections.deleted_sections,
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

export const handlePostAssessmentPreview = async (
    data: AssessmentPreviewSectionsInterface,
    assessmentId: string | null,
    instituteId: string | undefined,
    type: string | undefined,
) => {
    const convertedData = {
        test_duration: data.test_duration,
        added_sections: data.added_sections,
        updated_sections: data.updated_sections,
        deleted_sections: data.deleted_sections,
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
    type: string | undefined,
) => {
    const convertedData = {
        closed_test: data.closed_test,
        open_test_details: data.open_test.checked
            ? {
                  registration_start_date: convertToUTC(data.open_test.start_date) || "",
                  registration_end_date: convertToUTC(data.open_test.end_date) || "",
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
    type: string | undefined,
) => {
    const convertedData = {
        assessment_creation_access: {
            roles: data.assessment_creation_access.roles
                .filter((role) => role.isSelected)
                .map((role) => role.roleName),
            user_ids: data.assessment_creation_access.users.map((user) => user.email),
        },
        live_assessment_notification_access: {
            roles: data.live_assessment_notification.roles
                .filter((role) => role.isSelected)
                .map((role) => role.roleName),
            user_ids: data.live_assessment_notification.users.map((user) => user.email),
        },
        assessment_submission_and_report_access: {
            roles: data.assessment_submission_and_report_access.roles
                .filter((role) => role.isSelected)
                .map((role) => role.roleName),
            user_ids: data.assessment_submission_and_report_access.users.map((user) => user.email),
        },
        evaluation_process_access: {
            roles: data.evaluation_process.roles
                .filter((role) => role.isSelected)
                .map((role) => role.roleName),
            user_ids: data.evaluation_process.users.map((user) => user.email),
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

export const publishAssessment = async ({
    assessmentId,
    instituteId,
    type,
}: {
    assessmentId: string | null;
    instituteId: string | undefined;
    type: string | undefined;
}) => {
    const response = await authenticatedAxiosInstance({
        method: "POST",
        url: PUBLISH_ASSESSMENT_URL,
        params: {
            assessmentId,
            instituteId,
            type,
        },
        data: {},
    });
    return response?.data;
};
