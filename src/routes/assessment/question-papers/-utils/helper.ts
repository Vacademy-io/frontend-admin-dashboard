import { INSTITUTE_ID } from "@/constants/urls";
import { FilterOption } from "@/types/question-paper-filter";
import { Level, QuestionResponse, Subject } from "@/types/question-paper-template";
import {
    MyQuestion,
    MyQuestionPaperFormEditInterface,
    MyQuestionPaperFormInterface,
} from "../../../../types/question-paper-form";
import { useMutation } from "@tanstack/react-query";

export function formatStructure(structure: string, value: string | number): string {
    // If structure does not contain parentheses, just replace the number/letter with the value
    return structure.replace(/[a-zA-Z0-9]/, `${value}`);
}

export function transformFilterData(data: Record<string, FilterOption[]>) {
    const result: Record<string, string[] | string> = {};

    Object.keys(data).forEach((key) => {
        // Safely handle undefined and assign an empty array if necessary
        const items = data[key] || [];
        result[key] = items.map((item) => item.id);

        if (key === "name" && Array.isArray(result[key])) {
            // Perform join only if result[key] is an array
            result[key] = (result[key] as string[]).join("");
        }
    });

    return result;
}

export function transformQuestionPaperData(data: MyQuestionPaperFormInterface) {
    return {
        title: data.title,
        institute_id: INSTITUTE_ID, // Assuming there's no direct mapping for institute_id
        level_id: data.yearClass, // Assuming there's no direct mapping for level_id
        subject_id: data.subject, // Assuming there's no direct mapping for subject_id
        questions: data.questions.map((question) => {
            const options =
                question.questionType === "MCQS"
                    ? question.singleChoiceOptions.map((opt, idx) => ({
                          id: null, // Assuming no direct mapping for option ID
                          preview_id: idx, // Using index as preview_id
                          question_id: null,
                          text: {
                              id: null, // Assuming no direct mapping for option text ID
                              type: "HTML", // Assuming option content is HTML
                              content: opt.name.replace(/<\/?p>/g, ""), // Remove <p> tags from content
                          },
                          media_id: null, // Assuming no direct mapping for option media ID
                          option_order: null,
                          created_on: null,
                          updated_on: null,
                          explanation_text: {
                              id: null, // Assuming no direct mapping for explanation text ID
                              type: "HTML", // Assuming explanation for options is in HTML
                              content: question.explanation, // Assuming no explanation provided for options
                          },
                      }))
                    : question.multipleChoiceOptions.map((opt, idx) => ({
                          id: null, // Assuming no direct mapping for option ID
                          preview_id: idx, // Using index as preview_id
                          question_id: null,
                          text: {
                              id: null, // Assuming no direct mapping for option text ID
                              type: "HTML", // Assuming option content is HTML
                              content: opt.name.replace(/<\/?p>/g, ""), // Remove <p> tags from content
                          },
                          media_id: null, // Assuming no direct mapping for option media ID
                          option_order: null,
                          created_on: null,
                          updated_on: null,
                          explanation_text: {
                              id: null, // Assuming no direct mapping for explanation text ID
                              type: "HTML", // Assuming explanation for options is in HTML
                              content: question.explanation, // Assuming no explanation provided for options
                          },
                      }));

            // Extract correct option indices as strings
            const correctOptionIds = (
                question.questionType === "MCQS"
                    ? question.singleChoiceOptions
                    : question.multipleChoiceOptions
            )
                .map((opt, idx) => (opt.isSelected ? idx.toString() : null))
                .filter((idx) => idx !== null); // Remove null values

            const auto_evaluation_json = JSON.stringify({
                type: question.questionType === "MCQS" ? "MCQS" : "MCQM",
                data: {
                    correctOptionIds,
                },
            });

            return {
                id: null,
                preview_id: question.questionId, // Assuming no direct mapping for preview_id
                text: {
                    id: null, // Assuming no direct mapping for text ID
                    type: "HTML", // Assuming the content is HTML
                    content: question.questionName.replace(/<\/?p>/g, ""), // Remove <p> tags from content
                },
                media_id: null, // Assuming no direct mapping for media_id
                created_at: null,
                updated_at: null,
                question_response_type: null, // Assuming no direct mapping for response type
                question_type: question.questionType,
                access_level: null, // Assuming no direct mapping for access level
                auto_evaluation_json, // Add auto_evaluation_json
                evaluation_type: null, // Assuming no direct mapping for evaluation type
                explanation_text: {
                    id: null, // Assuming no direct mapping for explanation text ID
                    type: "HTML", // Assuming explanation is in HTML
                    content: question.explanation,
                },
                default_question_time_mins: null, // Assuming default time is not provided
                options, // Use the mapped options
                errors: [], // Assuming no errors are provided
                warnings: [], // Assuming no warnings are provided
            };
        }),
    };
}

export function transformQuestionPaperEditData(
    data: MyQuestionPaperFormInterface,
    previousQuestionPaperData: MyQuestionPaperFormEditInterface,
) {
    // Extract previous question IDs for comparison
    const previousQuestionIds = previousQuestionPaperData.questions.map(
        (prevQuestion) => prevQuestion.questionId,
    );

    return {
        id: data.questionPaperId,
        title: data.title,
        institute_id: INSTITUTE_ID,
        ...(data.yearClass !== "N/A" && { level_id: data.yearClass }),
        ...(data.subject !== "N/A" && { subject_id: data.subject }),
        questions: data.questions.map((question) => {
            // Check if the current question ID exists in the previous data
            const isNewQuestion = !previousQuestionIds.includes(question.questionId);

            const options =
                question.questionType === "MCQS"
                    ? question.singleChoiceOptions.map((opt, idx) => ({
                          id: isNewQuestion ? null : idx, // Set to null if it's a new question
                          preview_id: idx, // Always use index as preview_id
                          question_id: isNewQuestion ? null : question.questionId,
                          text: {
                              id: null, // Assuming no mapping for text ID
                              type: "HTML",
                              content: opt.name.replace(/<\/?p>/g, ""),
                          },
                          media_id: null,
                          option_order: null,
                          created_on: null,
                          updated_on: null,
                          explanation_text: {
                              id: null,
                              type: "HTML",
                              content: question.explanation,
                          },
                      }))
                    : question.multipleChoiceOptions.map((opt, idx) => ({
                          id: isNewQuestion ? null : idx,
                          preview_id: idx,
                          question_id: isNewQuestion ? null : question.questionId,
                          text: {
                              id: null,
                              type: "HTML",
                              content: opt.name.replace(/<\/?p>/g, ""),
                          },
                          media_id: null,
                          option_order: null,
                          created_on: null,
                          updated_on: null,
                          explanation_text: {
                              id: null,
                              type: "HTML",
                              content: question.explanation,
                          },
                      }));

            const correctOptionIds = (
                question.questionType === "MCQS"
                    ? question.singleChoiceOptions
                    : question.multipleChoiceOptions
            )
                .map((opt, idx) => (opt.isSelected ? idx.toString() : null))
                .filter((idx) => idx !== null);

            const auto_evaluation_json = JSON.stringify({
                type: question.questionType === "MCQS" ? "MCQS" : "MCQM",
                data: {
                    correctOptionIds,
                },
            });

            return {
                id: isNewQuestion ? null : question.questionId, // Set to null if it's a new question
                preview_id: question.questionId, // Keep preview_id as the questionId
                text: {
                    id: null,
                    type: "HTML",
                    content: question.questionName.replace(/<\/?p>/g, ""),
                },
                media_id: null,
                created_at: null,
                updated_at: null,
                question_response_type: null,
                question_type: question.questionType,
                access_level: null,
                auto_evaluation_json,
                evaluation_type: null,
                explanation_text: {
                    id: null,
                    type: "HTML",
                    content: question.explanation,
                },
                default_question_time_mins: null,
                options,
                errors: [],
                warnings: [],
            };
        }),
    };
}

export const getLevelNameById = (levels: Level[], id: string | null): string => {
    const level = levels.find((item) => item.id === id);
    return level?.level_name || "N/A";
};

export const getSubjectNameById = (subjects: Subject[], id: string | null): string => {
    const subject = subjects.find((item) => item.id === id);
    return subject?.subject_name || "N/A";
};

export const getIdByLevelName = (levels: Level[], name: string | null): string => {
    const level = levels.find((item) => item.level_name === name);
    return level?.id || "N/A";
};

export const getIdBySubjectName = (subjects: Subject[], name: string | null): string => {
    const subject = subjects.find((item) => item.subject_name === name);
    return subject?.id || "N/A";
};

export const transformResponseDataToMyQuestionsSchema = (data: QuestionResponse[]) => {
    return data.map((item) => {
        const correctOptionIds =
            JSON.parse(item.auto_evaluation_json)?.data?.correctOptionIds || [];
        const baseQuestion: MyQuestion = {
            questionId: item.id || item.preview_id || undefined,
            questionName: item.text?.content || "",
            explanation: item.explanation_text?.content || "",
            questionType: item.question_type === "MCQS" ? "MCQS" : "MCQM",
            questionMark: "",
            singleChoiceOptions: [],
            multipleChoiceOptions: [],
        };

        if (item.question_type === "MCQS") {
            baseQuestion.singleChoiceOptions = item.options.map((option) => ({
                name: option.text?.content || "",
                isSelected: correctOptionIds.includes(option.id || option.preview_id),
                image: {},
            }));
        } else if (item.question_type === "MCQM") {
            baseQuestion.multipleChoiceOptions = item.options.map((option) => ({
                name: option.text?.content || "",
                isSelected: correctOptionIds.includes(option.id || option.preview_id),
                image: {},
            }));
        }
        return baseQuestion;
    });
};

export const handleRefetchData = (
    getFilteredFavouriteData: ReturnType<typeof useMutation>,
    getFilteredActiveData: ReturnType<typeof useMutation>,
    pageNo: number,
    selectedQuestionPaperFilters: Record<string, FilterOption[]>,
) => {
    getFilteredFavouriteData.mutate({
        pageNo,
        pageSize: 10,
        instituteId: INSTITUTE_ID,
        data: {
            ...selectedQuestionPaperFilters,
            statuses: [{ id: "FAVOURITE", name: "FAVOURITE" }],
        },
    });
    getFilteredActiveData.mutate({
        pageNo,
        pageSize: 10,
        instituteId: INSTITUTE_ID,
        data: {
            ...selectedQuestionPaperFilters,
            statuses: [{ id: "ACTIVE", name: "ACTIVE" }],
        },
    });
};
