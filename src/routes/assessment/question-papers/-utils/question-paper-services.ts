import {
    ADD_QUESTION_PAPER,
    GET_QUESTION_PAPER_BY_ID,
    GET_QUESTION_PAPER_FILTERED_DATA,
    MARK_QUESTION_PAPER_STATUS,
    UPDATE_QUESTION_PAPER,
} from "@/constants/urls";
import authenticatedAxiosInstance from "@/lib/auth/axiosInstance";
import {
    transformFilterData,
    transformQuestionPaperData,
    transformQuestionPaperEditData,
} from "./helper";
import { FilterOption } from "@/types/question-paper-filter";
import {
    MyQuestionPaperFormEditInterface,
    MyQuestionPaperFormInterface,
} from "../../../../types/question-paper-form";

export const addQuestionPaper = async (data: MyQuestionPaperFormInterface) => {
    try {
        const response = await authenticatedAxiosInstance({
            method: "POST",
            url: `${ADD_QUESTION_PAPER}`,
            data: transformQuestionPaperData(data),
        });
        return response?.data;
    } catch (error: unknown) {
        throw new Error(`${error}`);
    }
};

export const updateQuestionPaper = async (
    data: MyQuestionPaperFormInterface,
    previousQuestionPaperData: MyQuestionPaperFormEditInterface,
) => {
    try {
        const response = await authenticatedAxiosInstance({
            method: "PATCH",
            url: `${UPDATE_QUESTION_PAPER}`,
            data: transformQuestionPaperEditData(data, previousQuestionPaperData),
        });
        return response?.data;
    } catch (error: unknown) {
        throw new Error(`${error}`);
    }
};

export const markQuestionPaperStatus = async (
    status: string,
    questionPaperId: string,
    instituteId: string,
) => {
    try {
        const response = await authenticatedAxiosInstance({
            method: "POST",
            url: `${MARK_QUESTION_PAPER_STATUS}`,
            data: { status, question_paper_id: questionPaperId, institute_id: instituteId },
        });
        return response?.data;
    } catch (error: unknown) {
        throw new Error(`${error}`);
    }
};

export const getQuestionPaperById = async (questionPaperId: string | undefined) => {
    try {
        const response = await authenticatedAxiosInstance({
            method: "GET",
            url: `${GET_QUESTION_PAPER_BY_ID}`,
            params: {
                questionPaperId,
            },
        });
        return response?.data;
    } catch (error: unknown) {
        throw new Error(`${error}`);
    }
};

export const getQuestionPaperDataWithFilters = async (
    pageNo: number,
    pageSize: number,
    instituteId: string,
    data: Record<string, FilterOption[]>,
) => {
    try {
        const response = await authenticatedAxiosInstance({
            method: "POST",
            url: `${GET_QUESTION_PAPER_FILTERED_DATA}`,
            params: {
                pageNo,
                instituteId,
                pageSize,
            },
            data: transformFilterData(data),
        });
        return response?.data;
    } catch (error: unknown) {
        throw new Error(`${error}`);
    }
};

export const getQuestionPaperFilteredData = (
    pageNo: number,
    pageSize: number,
    instituteId: string,
    data: Record<string, FilterOption[]>,
) => {
    return {
        queryKey: ["GET_QUESTION_PAPER_FILTERED_DATA", pageNo, pageSize, instituteId, data],
        queryFn: () => getQuestionPaperDataWithFilters(pageNo, pageSize, instituteId, data),
        staleTime: Infinity, // Prevent query from becoming stale
        cacheTime: Infinity, // Keep the query in the cache indefinitely
    };
};