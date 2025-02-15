import { GET_QUESTION_PAPER_FILTERED_DATA, INIT_FILTERS } from "@/constants/urls";
import authenticatedAxiosInstance from "@/lib/auth/axiosInstance";
// import {
//     transformFilterData,
// } from "./helper";
import { FilterOption } from "@/types/assessments/question-paper-filter";

export async function fetchStaticData() {
    try {
        const response = await authenticatedAxiosInstance({
            method: "GET",
            url: `${INIT_FILTERS}`,
        });
        return response?.data;
    } catch (error: unknown) {
        throw new Error(`${error}`);
    }
}

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
