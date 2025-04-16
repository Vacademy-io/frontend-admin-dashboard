import { GET_ASSESSMENT_URL, STEP1_ASSESSMENT_URL, STEP2_ASSESSMENT_URL } from "@/constants/urls";
import authenticatedAxiosInstance from "@/lib/auth/axiosInstance";
import { ConvertedCustomField, CustomFields } from "@/types/assessments/assessment-data-type";
import { z } from "zod";
import { BasicInfoFormSchema } from "../-utils/basic-info-form-schema";
import sectionDetailsSchema from "../-utils/section-details-sechma";
import { AssessmentPreviewSectionsInterface } from "@/routes/assessment/assessment-list/assessment-details/$assessmentId/$examType/$assesssmentType/$assessmentTab/-utils/assessment-details-interface";
import { classifySections, convertStep2Data } from "../-utils/helper";
import { ApiResponse } from "../-hooks/getQuestionsDataForSection";
import axios from "axios";

export const getAssessmentDetailsData = async ({
    assessmentId,
}: {
    assessmentId: string | null | undefined;
}): Promise<ApiResponse> => {
    const response = await axios({
        method: "GET",
        url: `${GET_ASSESSMENT_URL}/${assessmentId}`,
    });
    return response?.data as ApiResponse;
};

export const getAssessmentDetails = ({
    assessmentId,
}: {
    assessmentId: string | null | undefined;
}) => {
    return {
        queryKey: ["GET_ASSESSMENT_DETAILS", assessmentId],
        queryFn: () => getAssessmentDetailsData({ assessmentId }),
        staleTime: 60 * 60 * 1000,
        enabled: !!assessmentId,
    };
};

export const handlePostStep1Data = async (data: z.infer<typeof BasicInfoFormSchema>) => {
    const response = await authenticatedAxiosInstance({
        method: "POST",
        url: STEP1_ASSESSMENT_URL,
        data: data,
        params: {},
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
        test_duration: {},
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
export const convertCustomFields = (customFields: CustomFields): ConvertedCustomField[] => {
    const convertedFields = customFields.map((field) => {
        return {
            id: field.id,
            name: field.name,
            type: field.type,
            default_value: "", // Provide a default value, if necessary
            description: "", // Provide a description, if necessary
            is_mandatory: field.isRequired,
            key: field.key ?? "", // Use the ID as the key
            comma_separated_options: field.options
                ? field.options.map((opt) => opt.value).join(",")
                : "", // Join options for dropdowns
        };
    });
    return convertedFields;
};
