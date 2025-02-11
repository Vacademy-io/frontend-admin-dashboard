import { GET_ASSESSMENT_INIT_DETAILS, GET_ASSESSMENT_LISTS } from "@/constants/urls";
import authenticatedAxiosInstance from "@/lib/auth/axiosInstance";
import { SelectedQuestionPaperFilters } from "../-components/ScheduleTestMainComponent";

const fetchInitAssessmentDetails = async (instituteId: string | undefined) => {
    const response = await authenticatedAxiosInstance({
        method: "GET",
        url: GET_ASSESSMENT_INIT_DETAILS,
        params: { instituteId },
    });
    return response?.data;
};
export const getInitAssessmentDetails = (instituteId: string | undefined) => {
    return {
        queryKey: ["GET_INIT_INSTITUTE", instituteId],
        queryFn: async () => {
            const data = await fetchInitAssessmentDetails(instituteId);
            return data;
        },
        staleTime: 60 * 60 * 1000,
    };
};

export function transformFilterAssessmentData(data: SelectedQuestionPaperFilters) {
    const result: Record<string, string[] | string | boolean | undefined> = {};

    Object.keys(data).forEach((key) => {
        const items = data[key as keyof SelectedQuestionPaperFilters];
        if (["access_statuses", "assessment_modes", "assessment_statuses"].includes(key)) {
            result[key] = Array.isArray(items)
                ? items.map((item) => (typeof item === "object" && "name" in item ? item.name : ""))
                : items;
            return;
        }

        if (Array.isArray(items)) {
            result[key] = items.map((item) =>
                typeof item === "object" && "id" in item ? item.id : String(item),
            );
        } else {
            result[key] = items;
        }

        if (key === "name" && Array.isArray(result[key])) {
            result[key] = (result[key] as string[]).join("");
        }
    });

    return result;
}

export const getAssessmentListWithFilters = async (
    pageNo: number,
    pageSize: number,
    instituteId: string | undefined,
    data: SelectedQuestionPaperFilters,
) => {
    const response = await authenticatedAxiosInstance({
        method: "POST",
        url: `${GET_ASSESSMENT_LISTS}`,
        params: {
            pageNo,
            instituteId,
            pageSize,
        },
        data: transformFilterAssessmentData(data),
    });
    return response?.data;
};
