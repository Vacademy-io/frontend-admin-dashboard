import {
    CONVERT_PDF_TO_HTML_AI_URL,
    GENERATE_QUESTIONS_FROM_FILE_AI_URL,
    GET_QUESTIONS_FROM_AUDIO,
    GET_QUESTIONS_URL_FROM_HTML_AI_URL,
    HTML_TO_QUESTIONS_FROM_FILE_AI_URL,
    PROCESS_AUDIO_FILE,
    SORT_SPLIT_FILE_AI_URL,
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

export const handleSortSplitPDF = async (pdfId: string, requiredTopics: string) => {
    const response = await axios({
        method: "GET",
        url: SORT_SPLIT_FILE_AI_URL,
        params: {
            pdfId,
            requiredTopics,
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

export const handleGenerateAssessmentQuestionsPageWise = async (
    html: string,
    userPrompt: string,
) => {
    const response = await axios({
        method: "POST",
        url: HTML_TO_QUESTIONS_FROM_FILE_AI_URL,
        params: {
            userPrompt,
        },
        data: { html: html },
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

export const handleGetQuestionsFromHTMLUrl = async (html: string, userPrompt: string) => {
    const response = await axios({
        method: "POST",
        params: {
            userPrompt,
        },
        url: GET_QUESTIONS_URL_FROM_HTML_AI_URL,
        data: { html: html },
    });
    return response?.data;
};

export const handleStartProcessUploadedAudioFile = async (fileId: string) => {
    const response = await axios({
        method: "POST",
        url: PROCESS_AUDIO_FILE,
        // params: {
        //     audioId: fileId
        // },
        data: { file_id: fileId },
    });
    return response?.data;
};

export const handleGetQuestionsFromAudio = async (
    audioId: string,
    numQuestions: number | null,
    prompt: string | null,
    difficulty: string | null,
    language: string | null,
) => {
    const response = await axios({
        method: "GET",
        url: GET_QUESTIONS_FROM_AUDIO,
        params: {
            audioId: audioId,
            numQuestions: numQuestions,
            prompt: prompt,
            difficulty: difficulty,
            language: language,
        },
    });
    return response?.data;
};
