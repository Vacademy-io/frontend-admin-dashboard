import { GET_QUESTION_PAPER_FILTERED_DATA } from "@/constants/urls";
import authenticatedAxiosInstance from "@/lib/auth/axiosInstance";
// import {
//     transformFilterData,
// } from "./helper";
import { FilterOption } from "@/types/assessments/question-paper-filter";

export function fetchStaticData() {}

export const getQuestionPaperDataWithFilters = async (
    pageNo: number,
    pageSize: number,
    data: Record<string, FilterOption[]>,
) => {
    try {
        const response = await authenticatedAxiosInstance({
            method: "POST",
            url: `${GET_QUESTION_PAPER_FILTERED_DATA}`,
            params: {
                pageNo,
                pageSize,
            },
            // data: transformFilterData(data),
            data,
        });
        return response?.data;
    } catch (error: unknown) {
        throw new Error(`${error}`);
    }
};
