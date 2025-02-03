import {
    ResponseQuestionList,
    ResponseQuestionListClose,
    ResponseQuestionListOpen,
} from "@/types/assessment-overview";
import {
    assessmentStatusStudentAttemptedColumnsExternal,
    assessmentStatusStudentAttemptedColumnsInternal,
    assessmentStatusStudentOngoingColumnsExternal,
    assessmentStatusStudentOngoingColumnsInternal,
    assessmentStatusStudentPendingColumnsExternal,
    assessmentStatusStudentPendingColumnsInternal,
    assessmentStatusStudentQuestionResponseExternal,
    assessmentStatusStudentQuestionResponseInternal,
} from "./student-columns";
import { Section } from "@/types/assessment-data-type";

interface StudentLeaderboardEntry {
    userId: string;
    rank: string;
    name: string;
    batch: string;
    percentile: string;
    scoredMarks: number;
    totalMarks: number;
}
export const convertMarksRankData = (leaderboard: StudentLeaderboardEntry[]) => {
    const rankMap = new Map();

    leaderboard.forEach(({ rank, scoredMarks, percentile }) => {
        if (!rankMap.has(rank)) {
            rankMap.set(rank, {
                rank: parseInt(rank),
                marks: scoredMarks,
                percentile: parseFloat(percentile),
                noOfParticipants: 0,
            });
        }
        rankMap.get(rank).noOfParticipants += 1;
    });

    return Array.from(rankMap.values());
};

export const getAssessmentFilteredDataForAssessmentStatus = (
    studentsListData:
        | ResponseQuestionList[]
        | ResponseQuestionListOpen[]
        | ResponseQuestionListClose[],
    type: string,
    selectedParticipantsTab: string,
    selectedTab: string,
) => {
    switch (type) {
        case "open": {
            const openData = (studentsListData as ResponseQuestionListOpen[])
                ?.find((status) => status.participantsType === selectedParticipantsTab)
                ?.studentsData?.find((data) => data.type === selectedTab)?.studentDetails;

            if (!openData) return [];

            return openData.map((student) => {
                if (selectedTab === "Attempted" && "attemptDate" in student) {
                    return {
                        status: selectedTab,
                        id: student.userId,
                        full_name: student.name,
                        package_session_id: student.batch,
                        institute_enrollment_id: student.enrollmentNumber,
                        gender: student.gender,
                        attempt_date: student.attemptDate,
                        start_time: student.startTime,
                        end_time: student.endTime,
                        duration: student.duration,
                        marks:
                            student.scoredMarks !== undefined && student.totalMarks !== undefined
                                ? `${student.scoredMarks}/${student.totalMarks}`
                                : undefined,
                    };
                } else if (selectedTab === "Pending" && "phoneNo" in student) {
                    return {
                        status: selectedTab,
                        id: student.userId,
                        full_name: student.name,
                        package_session_id: student.batch,
                        institute_enrollment_id: student.enrollmentNumber,
                        gender: student.gender,
                        mobile_number: student.phoneNo,
                        email: student.email,
                        city: student.city,
                        state: student.state,
                    };
                } else if (selectedTab === "Ongoing" && "startTime" in student) {
                    return {
                        status: selectedTab,
                        id: student.userId,
                        full_name: student.name,
                        package_session_id: student.batch,
                        institute_enrollment_id: student.enrollmentNumber,
                        gender: student.gender,
                        start_time: student.startTime,
                    };
                }
                return {};
            });
        }

        case "close": {
            const closeData = (studentsListData as ResponseQuestionListClose[])?.find(
                (status) => status.type === selectedTab,
            )?.studentDetails;

            if (!closeData) return [];

            return closeData.map((student) => {
                if (selectedTab === "Attempted" && "attemptDate" in student) {
                    return {
                        status: selectedTab,
                        id: student.userId,
                        full_name: student.name,
                        package_session_id: student.batch,
                        institute_enrollment_id: student.enrollmentNumber,
                        gender: student.gender,
                        attempt_date: student.attemptDate,
                        start_time: student.startTime,
                        end_time: student.endTime,
                        duration: student.duration,
                        marks:
                            student.scoredMarks !== undefined && student.totalMarks !== undefined
                                ? `${student.scoredMarks}/${student.totalMarks}`
                                : undefined,
                    };
                } else if (selectedTab === "Pending" && "phoneNo" in student) {
                    return {
                        status: selectedTab,
                        id: student.userId,
                        full_name: student.name,
                        package_session_id: student.batch,
                        institute_enrollment_id: student.enrollmentNumber,
                        gender: student.gender,
                        mobile_number: student.phoneNo,
                        email: student.email,
                        city: student.city,
                        state: student.state,
                    };
                } else if (selectedTab === "Ongoing" && "startTime" in student) {
                    return {
                        status: selectedTab,
                        id: student.userId,
                        full_name: student.name,
                        package_session_id: student.batch,
                        institute_enrollment_id: student.enrollmentNumber,
                        gender: student.gender,
                        start_time: student.startTime,
                    };
                }
                return {};
            });
        }

        case "question": {
            const questionData = (studentsListData as ResponseQuestionList[])?.find(
                (data) => data.type === selectedParticipantsTab,
            )?.studentDetails;

            if (!questionData) return [];

            return questionData.map((student) => ({
                id: student.userId,
                full_name: student.name,
                ...(selectedParticipantsTab === "internal" && {
                    package_session_id: student.batch,
                    institute_enrollment_id: student.enrollmentNumber,
                }),
                gender: student.gender,
                response_time: student.responseTime,
            }));
        }

        default:
            return [];
    }
};

export const getAllColumnsForTable = (type: string, selectedParticipantsTab: string) => {
    if (type === "open") {
        if (selectedParticipantsTab === "internal")
            return {
                Attempted: assessmentStatusStudentAttemptedColumnsInternal,
                Pending: assessmentStatusStudentPendingColumnsInternal,
                Ongoing: assessmentStatusStudentOngoingColumnsInternal,
            };
        return {
            Attempted: assessmentStatusStudentAttemptedColumnsExternal,
            Pending: assessmentStatusStudentPendingColumnsExternal,
            Ongoing: assessmentStatusStudentOngoingColumnsExternal,
        };
    } else if (type === "close") {
        return {
            Attempted: assessmentStatusStudentAttemptedColumnsInternal,
            Pending: assessmentStatusStudentPendingColumnsInternal,
            Ongoing: assessmentStatusStudentOngoingColumnsInternal,
        };
    } else {
        return {
            internal: assessmentStatusStudentQuestionResponseInternal,
            external: assessmentStatusStudentQuestionResponseExternal,
        };
    }
};

interface PreBatchRegistration {
    id: string;
    batchId: string;
    instituteId: string;
    registrationTime: string;
    status: string;
    createdAt: string;
    updatedAt: string;
}
export function getBatchDetails(
    batchData: Record<string, { name: string; id: string }[]>,
    batchList: PreBatchRegistration[] | undefined,
) {
    const result: {
        id: string;
        name: string | undefined;
    }[] = [];

    // Flatten batchData into a single array of objects
    const allBatches = Object.values(batchData).flat();

    // Create a lookup map for quick access
    const batchMap = new Map(allBatches.map((batch) => [batch.id, batch.name]));

    // Filter and map the batchList based on batchId
    batchList?.forEach(({ batchId }) => {
        if (batchMap.has(batchId)) {
            result.push({ id: batchId, name: batchMap.get(batchId) });
        }
    });

    return result;
}

interface Question {
    questionId: string;
    questionName: string;
    questionType: string; // You can use a union type like `"MCQM" | "SCQ" | "TF"` if needed
    questionMark: string;
    questionPenalty: string;
    questionDuration: {
        hrs: string;
        min: string;
    };
}

export function calculateAverageMarks(questions: Question[]): number {
    if (questions.length === 0) return 0;

    const totalMarks = questions.reduce(
        (sum, question) => sum + parseFloat(question.questionMark),
        0,
    );
    return parseFloat((totalMarks / questions.length).toFixed(2));
}

export function calculateAveragePenalty(questions: Question[]): number {
    if (questions.length === 0) return 0;

    const totalPenalty = questions.reduce(
        (sum, question) => sum + parseFloat(question.questionPenalty),
        0,
    );
    return parseFloat((totalPenalty / questions.length).toFixed(2));
}

export function parseHtmlToString(html: string) {
    const doc = new DOMParser().parseFromString(html, "text/html");
    return doc.body.textContent || doc.body.innerText || "";
}

interface QuestionText {
    id: string;
    type: "HTML" | string;
    content: string;
}

interface ExplanationText {
    id: string | null;
    type: string | null;
    content: string | null;
}

interface Option {
    id: string;
    preview_id: string | null;
    question_id: string;
    text: QuestionText;
    media_id: string | null;
    option_order: number | null;
    created_on: string;
    updated_on: string;
    explanation_text: ExplanationText;
}

interface Question {
    question_id: string;
    parent_rich_text: string | null;
    question: QuestionText;
    section_id: string;
    question_duration: number;
    question_order: number;
    marking_json: string;
    evaluation_json: string;
    question_type: string;
    options: Option[];
    options_with_explanation: Option[];
}

interface QuestionsData {
    [sectionId: string]: Question[];
}

export function transformSectionsAndQuestionsData(
    sectionsData: Section[],
    questionsData: QuestionsData,
) {
    if (!sectionsData) return [];
    return sectionsData.map((section) => ({
        sectionId: section.id,
        sectionName: section.name,
        questions: (questionsData[section.id] || []).map((question) => {
            const markingJson = question.marking_json
                ? JSON.parse(question.marking_json)
                : { type: "MCQS", data: {} };

            const evaluationJson = question.evaluation_json
                ? JSON.parse(question.evaluation_json)
                : { type: "MCQM", data: { correctOptionIds: [] } };

            const correctOptionIds = evaluationJson.data.correctOptionIds || [];

            return {
                id: question.question_id,
                questionId: question.question_id,
                questionName: question.question.content,
                explanation: "",
                questionType: markingJson.type || "MCQS",
                questionMark: markingJson.data.totalMark,
                questionPenalty: markingJson.data.negativeMark,
                questionDuration: {
                    hrs: String(Math.floor(question.question_duration / 60)),
                    min: String(question.question_duration % 60),
                },
                imageDetails: [],
                singleChoiceOptions:
                    markingJson.type === "MCQS"
                        ? question.options_with_explanation.map((option) => ({
                              name: option.text.content,
                              isSelected: correctOptionIds.includes(option.id),
                              image: {
                                  imageId: "",
                                  imageName: "",
                                  imageTitle: "",
                                  imageFile: "",
                                  isDeleted: false,
                              },
                          }))
                        : [
                              {
                                  name: "",
                                  isSelected: false,
                                  image: {
                                      imageId: "",
                                      imageName: "",
                                      imageTitle: "",
                                      imageFile: "",
                                      isDeleted: false,
                                  },
                              },
                              {
                                  name: "",
                                  isSelected: false,
                                  image: {
                                      imageId: "",
                                      imageName: "",
                                      imageTitle: "",
                                      imageFile: "",
                                      isDeleted: false,
                                  },
                              },
                              {
                                  name: "",
                                  isSelected: false,
                                  image: {
                                      imageId: "",
                                      imageName: "",
                                      imageTitle: "",
                                      imageFile: "",
                                      isDeleted: false,
                                  },
                              },
                              {
                                  name: "",
                                  isSelected: false,
                                  image: {
                                      imageId: "",
                                      imageName: "",
                                      imageTitle: "",
                                      imageFile: "",
                                      isDeleted: false,
                                  },
                              },
                          ],
                multipleChoiceOptions:
                    markingJson.type === "MCQM"
                        ? question.options_with_explanation.map((option) => ({
                              name: option.text.content,
                              isSelected: correctOptionIds.includes(option.id),
                              image: {
                                  imageId: "",
                                  imageName: "",
                                  imageTitle: "",
                                  imageFile: "",
                                  isDeleted: false,
                              },
                          }))
                        : [
                              {
                                  name: "",
                                  isSelected: false,
                                  image: {
                                      imageId: "",
                                      imageName: "",
                                      imageTitle: "",
                                      imageFile: "",
                                      isDeleted: false,
                                  },
                              },
                              {
                                  name: "",
                                  isSelected: false,
                                  image: {
                                      imageId: "",
                                      imageName: "",
                                      imageTitle: "",
                                      imageFile: "",
                                      isDeleted: false,
                                  },
                              },
                              {
                                  name: "",
                                  isSelected: false,
                                  image: {
                                      imageId: "",
                                      imageName: "",
                                      imageTitle: "",
                                      imageFile: "",
                                      isDeleted: false,
                                  },
                              },
                              {
                                  name: "",
                                  isSelected: false,
                                  image: {
                                      imageId: "",
                                      imageName: "",
                                      imageTitle: "",
                                      imageFile: "",
                                      isDeleted: false,
                                  },
                              },
                          ],
            };
        }),
    }));
}

export const assessmentDialogTrigger = (
    previousDataRef: any,
    newData: any,
    selectedSectionIndex: number,
    currentQuestionIndex: number,
): void => {
    const prevQuestion =
        previousDataRef.current[selectedSectionIndex].questions[currentQuestionIndex];
    const newQuestion = newData[selectedSectionIndex].questions[currentQuestionIndex];

    console.log(prevQuestion);
    console.log(newQuestion);
    // Function to compare two objects deeply
    const deepEqual = (obj1: any, obj2: any): boolean => {
        if (obj1 === obj2) return true;
        if (typeof obj1 !== "object" || typeof obj2 !== "object" || obj1 === null || obj2 === null)
            return false;

        const keys1 = Object.keys(obj1);
        const keys2 = Object.keys(obj2);
        // console.log(keys1, keys2);

        if (keys1.length !== keys2.length) return false;

        for (let key of keys1) {
            // console.log(obj1[key]);
            // console.log(obj2[key]);
            if (!keys2.includes(key) || !deepEqual(obj1[key], obj2[key])) return false;
        }

        return true;
    };

    // Compare the two questions
    if (!deepEqual(prevQuestion, newQuestion)) {
        // Trigger alert if any field is changed
        alert("The question has changed!");

        // Assign the new question data to the previous data in the useRef object
        previousDataRef.current[selectedSectionIndex].questions[currentQuestionIndex] = {
            ...newQuestion,
        };
    }
};
