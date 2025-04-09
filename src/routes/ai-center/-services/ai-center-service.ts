import {
    CONVERT_PDF_TO_HTML_AI_URL,
    GENERATE_QUESTIONS_FROM_FILE_AI_URL,
    GET_QUESTIONS_URL_FROM_HTML_AI_URL,
    START_PROCESSING_FILE_AI_URL,
} from "@/constants/urls";
import axios from "axios";

export const handleStartProcessUploadedFile = async (fileId: string) => {
    const response = await axios({
        method: "POST",
        url: START_PROCESSING_FILE_AI_URL,
        data: {
            file_id: fileId,
        },
    });
    return response?.data;
};

export const handleGenerateAssessmentQuestions = async (pdfId: string, userPrompt: string) => {
    const response = await axios({
        method: "GET",
        url: GENERATE_QUESTIONS_FROM_FILE_AI_URL,
        params: {
            pdfId,
            userPrompt,
        },
    });
    return response?.data;
};

export const handleConvertPDFToHTML = async (pdfId: string) => {
    const response = await axios({
        method: "GET",
        url: CONVERT_PDF_TO_HTML_AI_URL,
        params: {
            pdfId,
        },
    });
    return response?.data;
};

export const handleGetQuestionsFromHTMLUrl = async (html: string) => {
    const response = await axios({
        method: "POST",
        url: GET_QUESTIONS_URL_FROM_HTML_AI_URL,
        data: { html: html },
    });
    return response?.data;
};
