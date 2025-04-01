import { FilterOption } from "@/types/assessments/question-paper-filter";
import { Level, QuestionResponse, Subject } from "@/types/assessments/question-paper-template";
import {
    MyQuestion,
    MyQuestionPaperFormEditInterface,
    MyQuestionPaperFormInterface,
} from "../../../../types/assessments/question-paper-form";
import { useMutation } from "@tanstack/react-query";
import { getTokenDecodedData, getTokenFromCookie } from "@/lib/auth/sessionUtility";
import { TokenKey } from "@/constants/auth/tokens";
import { getPublicUrls } from "@/services/upload_file";

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
    const accessToken = getTokenFromCookie(TokenKey.accessToken);
    const tokenData = getTokenDecodedData(accessToken);
    const INSTITUTE_ID = tokenData && Object.keys(tokenData.authorities)[0];
    return {
        title: data.title,
        institute_id: INSTITUTE_ID, // Assuming there's no direct mapping for institute_id
        level_id: data.yearClass, // Assuming there's no direct mapping for level_id
        subject_id: data.subject, // Assuming there's no direct mapping for subject_id
        questions: data?.questions?.map((question) => {
            const options =
                question.questionType === "MCQS"
                    ? question.singleChoiceOptions.map((opt, idx) => ({
                          id: null, // Assuming no direct mapping for option ID
                          preview_id: idx, // Using index as preview_id
                          question_id: null,
                          text: {
                              id: null, // Assuming no direct mapping for option text ID
                              type: "HTML", // Assuming option content is HTML
                              content: opt?.name?.replace(/<\/?p>/g, ""), // Remove <p> tags from content
                          },
                          media_id: opt.image.imageName, // Assuming no direct mapping for option media ID
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
                              content: opt?.name?.replace(/<\/?p>/g, ""), // Remove <p> tags from content
                          },
                          media_id: opt.image.imageName, // Assuming no direct mapping for option media ID
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

            const correctOptionIdsCnt = question.multipleChoiceOptions.filter(
                (option) => option.isSelected,
            ).length;

            return {
                id: null,
                preview_id: question.questionId, // Assuming no direct mapping for preview_id
                text: {
                    id: null, // Assuming no direct mapping for text ID
                    type: "HTML", // Assuming the content is HTML
                    content: question.questionName.replace(/<\/?p>/g, ""), // Remove <p> tags from content
                },
                media_id: question?.imageDetails?.map((img) => img.imageName).join(","), // Assuming no direct mapping for media_id
                created_at: null,
                updated_at: null,
                question_response_type: null, // Assuming no direct mapping for response type
                question_type: question.questionType,
                access_level: null, // Assuming no direct mapping for access level
                auto_evaluation_json, // Add auto_evaluation_json
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
                            partialMarking: correctOptionIdsCnt ? 1 / correctOptionIdsCnt : 0,
                            partialMarkingPercentage: correctOptionIdsCnt
                                ? (1 / correctOptionIdsCnt) * 100
                                : 0,
                        }),
                    },
                }),
                evaluation_type: null, // Assuming no direct mapping for evaluation type
                explanation_text: {
                    id: null, // Assuming no direct mapping for explanation text ID
                    type: "HTML", // Assuming explanation is in HTML
                    content: question.explanation,
                },
                default_question_time_mins:
                    Number(question.questionDuration.hrs || 0) * 60 +
                    Number(question.questionDuration.min || 0),
                options, // Use the mapped options
                errors: [], // Assuming no errors are provided
                warnings: [], // Assuming no warnings are provided
            };
        }),
    };
}

function stripHtmlTags(str: string) {
    return str.replace(/<[^>]*>/g, "").trim();
}

function cleanQuestionData(question: MyQuestion) {
    return {
        ...question,
        questionName: stripHtmlTags(question.questionName || ""),
        singleChoiceOptions:
            question.singleChoiceOptions?.map((option) => ({
                ...option,
                name: stripHtmlTags(option.name || ""),
            })) || [],
        multipleChoiceOptions:
            question.multipleChoiceOptions?.map((option) => ({
                ...option,
                name: stripHtmlTags(option.name || ""),
            })) || [],
    };
}

export function convertQuestionsDataToResponse(questions: MyQuestion[], key: string) {
    const convertedQuestions = questions?.map((question) => {
        const options =
            question.questionType === "MCQS"
                ? question.singleChoiceOptions.map((opt, idx) => ({
                      id: key === "added" ? null : opt.id, // Set to null if it's a new question
                      preview_id: key === "added" ? idx : opt.id, // Always use index as preview_id
                      question_id: question.questionId,
                      text: {
                          id: null, // Assuming no mapping for text ID
                          type: "HTML",
                          content: opt?.name?.replace(/<\/?p>/g, ""),
                      },
                      media_id: opt.image.imageName,
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
                      id: key === "added" ? null : opt.id, // Set to null if it's a new question
                      preview_id: key === "added" ? idx : opt.id, // Always use index as preview_id
                      question_id: question.questionId,
                      text: {
                          id: null,
                          type: "HTML",
                          content: opt?.name?.replace(/<\/?p>/g, ""),
                      },
                      media_id: opt.image.imageName,
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
            id: key === "added" ? null : question.questionId, // Set to null if it's a new question
            preview_id: question.questionId, // Keep preview_id as the questionId
            text: {
                id: null,
                type: "HTML",
                content: question.questionName.replace(/<\/?p>/g, ""),
            },
            media_id: question?.imageDetails?.map((img) => img.imageName).join(","),
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
    });
    return convertedQuestions;
}

export function compareQuestions(
    oldData: MyQuestionPaperFormInterface,
    newData: MyQuestionPaperFormInterface,
) {
    const oldQuestionsMap = new Map(
        oldData.questions?.map((q) => [q.questionId, cleanQuestionData(q)]),
    );
    const newQuestionsMap = new Map(
        newData.questions?.map((q) => [q.questionId, cleanQuestionData(q)]),
    );

    let added_questions = [];
    let deleted_questions = [];
    let updated_questions = [];

    // Find added and updated questions
    for (const [questionId, newQuestion] of newQuestionsMap.entries()) {
        if (!oldQuestionsMap.has(questionId)) {
            added_questions.push(newQuestion);
        } else {
            const oldQuestion = oldQuestionsMap.get(questionId);
            if (JSON.stringify(oldQuestion) !== JSON.stringify(newQuestion)) {
                updated_questions.push(newQuestion);
            }
        }
    }

    // Find deleted questions
    for (const [questionId, oldQuestion] of oldQuestionsMap.entries()) {
        if (!newQuestionsMap.has(questionId)) {
            deleted_questions.push(oldQuestion);
        }
    }
    added_questions = convertQuestionsDataToResponse(added_questions, "added");
    deleted_questions = convertQuestionsDataToResponse(deleted_questions, "deleted");
    updated_questions = convertQuestionsDataToResponse(updated_questions, "updated");

    return { added_questions, deleted_questions, updated_questions };
}

export function transformQuestionPaperEditData(
    data: MyQuestionPaperFormInterface,
    previousQuestionPaperData: MyQuestionPaperFormEditInterface,
) {
    const accessToken = getTokenFromCookie(TokenKey.accessToken);
    const tokenData = getTokenDecodedData(accessToken);
    const INSTITUTE_ID = tokenData && Object.keys(tokenData.authorities)[0];

    return {
        id: data.questionPaperId,
        title: data.title,
        institute_id: INSTITUTE_ID,
        ...(data.yearClass !== "N/A" && { level_id: data.yearClass }),
        ...(data.subject !== "N/A" && { subject_id: data.subject }),
        ...compareQuestions(previousQuestionPaperData, data),
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

export const getIdByLevelName = (levels: Level[], name: string | null | undefined): string => {
    const level = levels.find((item) => item.level_name === name);
    return level?.id || "N/A";
};

export const getIdBySubjectName = (
    subjects: Subject[],
    name: string | null | undefined,
): string => {
    const subject = subjects.find((item) => item.subject_name === name);
    return subject?.id || "N/A";
};

const fetchImageUrls = async (mediaIds: string[]) => {
    if (mediaIds.length === 0) return {};

    const uniqueMediaIds = [...new Set(mediaIds)].join(",");
    const data = await getPublicUrls(uniqueMediaIds);

    // Create a mapping of media_id -> url
    const mediaIdToUrlMap: Record<string, string> = {};
    data.forEach((item: { id: string; url: string }) => {
        mediaIdToUrlMap[item.id] = item.url;
    });

    return mediaIdToUrlMap;
};

const getMediaIdToUrlMap = async (data: QuestionResponse[]) => {
    const allMediaIds: string[] = [];

    data.forEach((item) => {
        if (item.media_id) {
            allMediaIds.push(...item.media_id.split(","));
        }
        item.options.forEach((option) => {
            if (option.media_id) {
                allMediaIds.push(option.media_id);
            }
        });
    });

    return await fetchImageUrls(allMediaIds);
};

export const processQuestions = async (data: QuestionResponse[]) => {
    const mediaIdToUrlMap = await getMediaIdToUrlMap(data);
    return transformResponseDataToMyQuestionsSchema(data, mediaIdToUrlMap);
};

export const transformResponseDataToMyQuestionsSchema = (
    data: QuestionResponse[],
    mediaIdToUrlMap: Record<string, string>,
) => {
    return data.map((item) => {
        const correctOptionIds =
            JSON.parse(item.auto_evaluation_json)?.data?.correctOptionIds || [];
        const markingJson = item.marking_json ? JSON.parse(item.marking_json) : {};
        const baseQuestion: MyQuestion = {
            id: item.id || "",
            questionId: item.id || item.preview_id || undefined,
            questionName: item.text?.content || "",
            explanation: item.explanation_text?.content || "",
            questionType: item.question_type === "MCQS" ? "MCQS" : "MCQM",
            questionMark: markingJson.data?.totalMark || "0",
            questionPenalty: markingJson.data?.negativeMark || "0",
            questionDuration: {
                hrs: String(Math.floor((item.default_question_time_mins ?? 0) / 60)), // Extract hours
                min: String((item.default_question_time_mins ?? 0) % 60), // Extract remaining minutes
            },
            imageDetails:
                item.media_id !== "" && item.media_id !== null
                    ? item.media_id?.split(",").map((id) => ({
                          imageId: "",
                          imageName: "",
                          imageTitle: "",
                          imageFile: mediaIdToUrlMap[id] || "",
                          isDeleted: false,
                      }))
                    : [],
            singleChoiceOptions: [],
            multipleChoiceOptions: [],
        };

        if (item.question_type === "MCQS") {
            baseQuestion.singleChoiceOptions = item.options.map((option) => ({
                id: option.id,
                name: option.text?.content || "",
                isSelected: correctOptionIds.includes(option.id || option.preview_id),
                image: {
                    imageId: "",
                    imageName: "",
                    imageTitle: "",
                    imageFile:
                        option.media_id !== null && option.media_id !== ""
                            ? mediaIdToUrlMap[option.media_id!]
                            : "",
                    isDeleted: false,
                },
            }));
            baseQuestion.multipleChoiceOptions = Array(4).fill({
                id: "",
                name: "",
                isSelected: false,
                image: {
                    imageId: "",
                    imageName: "",
                    imageTitle: "",
                    imageFile: "",
                    isDeleted: false,
                },
            });
        } else if (item.question_type === "MCQM") {
            baseQuestion.multipleChoiceOptions = item.options.map((option) => ({
                id: option.id,
                name: option.text?.content || "",
                isSelected: correctOptionIds.includes(option.id || option.preview_id),
                image: {
                    imageId: "",
                    imageName: "",
                    imageTitle: "",
                    imageFile:
                        option.media_id !== null && option.media_id !== ""
                            ? mediaIdToUrlMap[option.media_id!]
                            : "",
                    isDeleted: false,
                },
            }));
            baseQuestion.singleChoiceOptions = Array(4).fill({
                id: "",
                name: "",
                isSelected: false,
                image: {
                    imageId: "",
                    imageName: "",
                    imageTitle: "",
                    imageFile: "",
                    isDeleted: false,
                },
            });
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
    const accessToken = getTokenFromCookie(TokenKey.accessToken);
    const data = getTokenDecodedData(accessToken);
    const INSTITUTE_ID = data && Object.keys(data.authorities)[0];
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
