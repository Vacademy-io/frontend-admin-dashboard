import {
    ResponseQuestionList,
    ResponseQuestionListClose,
    ResponseQuestionListOpen,
} from "@/types/assessments/assessment-overview";
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
import { AdaptiveMarking } from "@/routes/assessment/create-assessment/$assessmentId/$examtype/-hooks/getQuestionsDataForSection";
import { Section } from "@/types/assessments/assessment-steps";
import {
    AssessmentSection,
    AssessmentSectionQuestionInterface,
    calculateAverageMarksQuestionInterface,
    PreBatchRegistration,
    SectionInfoWithAddedQuestions,
    SectionInfoWithAddedQuestionsCntOrNull,
    StudentLeaderboardEntry,
    transformSectionsAndQuestionsDataQuestionsData,
} from "./assessment-details-interface";
import { sectionsEditQuestionFormType } from "../-components/AssessmentPreview";
import { MyQuestion } from "@/types/assessments/question-paper-form";
import { BatchDetailsInterface, StudentLeaderboard } from "@/types/assessment-overview";
// import { sectionsEditQuestionFormType } from "../-components/AssessmentPreview";
// import { QuestionAssessmentPreview } from "@/types/assessment-preview-interface";

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

export function calculateAverageMarks(questions: calculateAverageMarksQuestionInterface[]): number {
    if (questions.length === 0) return 0;

    const totalMarks = questions.reduce(
        (sum, question) => sum + parseFloat(question.questionMark),
        0,
    );
    return parseFloat((totalMarks / questions.length).toFixed(2));
}

export function calculateAveragePenalty(questions: AdaptiveMarking[]): number {
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

export function transformSectionsAndQuestionsData(
    sectionsData: Section[],
    questionsData: transformSectionsAndQuestionsDataQuestionsData,
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

export function transformSectionQuestions(questions: AssessmentSectionQuestionInterface[]) {
    return {
        questions: questions?.map((question) => {
            const options =
                question.questionType === "MCQS"
                    ? question?.singleChoiceOptions?.map((opt, idx) => ({
                          id: null, // Assuming no direct mapping for option ID
                          preview_id: idx, // Using index as preview_id
                          question_id: null,
                          text: {
                              id: null, // Assuming no direct mapping for option text ID
                              type: "HTML", // Assuming option content is HTML
                              content: opt?.name?.replace(/<\/?p>/g, ""), // Remove <p> tags from content
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
                    : question?.multipleChoiceOptions?.map((opt, idx) => ({
                          id: null, // Assuming no direct mapping for option ID
                          preview_id: idx, // Using index as preview_id
                          question_id: null,
                          text: {
                              id: null, // Assuming no direct mapping for option text ID
                              type: "HTML", // Assuming option content is HTML
                              content: opt?.name?.replace(/<\/?p>/g, ""), // Remove <p> tags from content
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

            const correctOptionIds = (
                question.questionType === "MCQS"
                    ? question.singleChoiceOptions ?? [] // Default to empty array if undefined
                    : question.multipleChoiceOptions ?? []
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
                    content: question?.questionName?.replace(/<\/?p>/g, ""), // Remove <p> tags from content
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

export function extractEmptyIdQuestions(sections: sectionsEditQuestionFormType) {
    return sections.sections.flatMap((section) =>
        section.questions.filter((question) => question.questionId === ""),
    );
}

export function getSectionsWithEmptyQuestionIds(sections: sectionsEditQuestionFormType) {
    return sections.sections
        .map((section) => {
            // Filter questions where questionId is an empty string
            const filteredQuestions = section.questions.filter(
                (question) => question.questionId === "",
            );

            // Return the section only if it has questions with empty questionIds
            return filteredQuestions.length > 0
                ? { ...section, questions: filteredQuestions.length }
                : null;
        })
        .filter((section) => section !== null); // Remove null values
}

export function handleAddedQuestionsToSections(
    sections: SectionInfoWithAddedQuestionsCntOrNull[],
    questionsData: MyQuestion[],
) {
    let questionIndex = 0;

    return sections.map((section) => {
        const questionsCount = section?.questions ?? 0;
        const assignedQuestions = questionsData.slice(
            questionIndex,
            questionIndex + questionsCount,
        );
        questionIndex += questionsCount;

        return {
            ...section,
            assignedQuestions,
        };
    });
}

export function addQuestionIdToSections(
    previousSections: sectionsEditQuestionFormType["sections"],
    newSections: SectionInfoWithAddedQuestions[],
) {
    // Iterate over each section in newSections
    newSections.forEach((newSection) => {
        // Find the corresponding section in previousSections by matching sectionId
        const prevSection = previousSections.find(
            (section) => section.sectionId === newSection.sectionId,
        );

        if (prevSection) {
            // Update the sectionName if it exists in newSections
            prevSection.sectionName = newSection.sectionName;

            // Remove questions without questionId from previousSection
            prevSection.questions = prevSection.questions.filter((question) => question.questionId);

            // Add all assignedQuestions from newSection to previousSection
            newSection.assignedQuestions.forEach((question) => {
                // Add an 'id' field in each question, matching the questionId
                question.id = question.questionId || "";
            });

            // Append the updated questions to the previous section
            prevSection.questions.push(...newSection.assignedQuestions);
        }
    });

    return previousSections;
}

export function transformPreviewDataToSections(sections: Section[] | undefined) {
    return {
        updated_sections: sections?.map((section) => ({
            section_description_html: section.description || "",
            section_name: section.name,
            section_id: section.id,
            section_duration: section.duration || 0,
            section_order: section.section_order,
            total_marks: section.total_marks,
            cutoff_marks: section.cutoff_marks,
            problem_randomization: section.problem_randomization !== null ? true : false,
            question_and_marking: [],
        })),
    };
}

export function mergeSectionData(
    sourceData: sectionsEditQuestionFormType["sections"],
    targetData: AssessmentSection[] | undefined,
) {
    // Create a map of sections from source data for easier lookup
    const sectionQuestionsMap = new Map(
        sourceData.map((section) => [
            section.sectionId,
            section.questions.map((question, index) => {
                // Transform question format to match target structure
                const correctOptionIdsCnt = question.multipleChoiceOptions.filter(
                    (option) => option.isSelected,
                ).length;
                return {
                    question_id: question.questionId,
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
                    question_duration_in_min:
                        parseInt(question.questionDuration.hrs) * 60 +
                            parseInt(question.questionDuration.min) || 0,
                    question_order: index + 1,
                    is_added: true,
                    is_deleted: false,
                    is_updated: false,
                };
            }),
        ]),
    );

    // Update target data with questions from source
    return targetData?.map((section) => {
        const questions = sectionQuestionsMap.get(section.section_id) || [];
        return {
            ...section,
            question_and_marking: questions,
        };
    });
}

export function compareAndUpdateSections(
    oldSections: sectionsEditQuestionFormType["sections"] | undefined,
    newSections: AssessmentSection[] | undefined,
) {
    // Create maps to track questions by section
    const oldSectionQuestionMap = new Map();

    // Process old sections to build question map for each section
    oldSections?.forEach((oldSection) => {
        const sectionQuestions = new Map();
        oldSection.questions.forEach((question) => {
            sectionQuestions.set(question.questionId, question);
        });
        oldSectionQuestionMap.set(oldSection.sectionId, sectionQuestions);
    });

    // Process new sections and update status flags
    const processedSections = newSections?.map((newSection) => {
        const oldSectionQuestions = oldSectionQuestionMap.get(newSection.section_id) || new Map();

        // Process existing and new questions
        const processedQuestionAndMarking = newSection.question_and_marking.map((newQuestion) => {
            let status = {
                is_added: true,
                is_updated: false,
                is_deleted: false,
            };

            // Check if question exists in this specific section
            if (oldSectionQuestions.has(newQuestion.question_id)) {
                status = {
                    is_added: false,
                    is_updated: true,
                    is_deleted: false,
                };
                // Remove from map to track deleted questions
                oldSectionQuestions.delete(newQuestion.question_id);
            }

            return {
                ...newQuestion,
                ...status,
            };
        });

        return {
            ...newSection,
            question_and_marking: [...processedQuestionAndMarking],
        };
    });

    return processedSections;
}

export function getBatchNameById(data: BatchDetailsInterface[] | undefined, id: string) {
    const item = data?.find((obj) => obj.id === id);
    if (item && item.level && item.package_dto) {
        return `${item.level.level_name} ${item.package_dto.package_name}`;
    }
    return "";
}

export function calculatePercentiles(students: StudentLeaderboard[]) {
    const totalStudents = students.length;

    return students.map((student) => {
        const percentile = ((totalStudents - student.rank) / (totalStudents - 1)) * 100;
        return { ...student, percentile: percentile.toFixed(2) }; // Keeping two decimal places
    });
}

export function calculateIndividualPercentile(studentData: StudentLeaderboard[], user_id: string) {
    // Find the student with the given user_id
    const student = studentData.find((s) => s.user_id === user_id);

    // Return the percentile if found, otherwise return null or a default value
    return student ? student.percentile : "";
}

// export const announcementDialogTrigger = (
//     previousDataRef: sectionsEditQuestionFormType["sections"] | undefined,
//     newData: sectionsEditQuestionFormType["sections"],
//     selectedSectionIndex: number,
//     currentQuestionIndex: number,
// ): void => {
//     const prevQuestion = previousDataRef?.[selectedSectionIndex]?.questions[currentQuestionIndex];
//     const newQuestion = newData?.[selectedSectionIndex]?.questions[currentQuestionIndex];

//     // Function to compare two objects deeply
//     const deepEqual = (
//         obj1: QuestionAssessmentPreview | undefined,
//         obj2: QuestionAssessmentPreview | undefined,
//     ): boolean => {
//         if (obj1 === obj2) return true;
//         if (typeof obj1 !== "object" || typeof obj2 !== "object" || obj1 === null || obj2 === null)
//             return false;

//         const keys1 = Object.keys(obj1) as Array<keyof QuestionAssessmentPreview>;
//         const keys2 = Object.keys(obj2) as Array<keyof QuestionAssessmentPreview>;

//         if (keys1.length !== keys2.length) return false;

//         for (const key of keys1) {
//             if (!keys2.includes(key) || !deepEqual(obj1[key], obj2[key])) return false;
//         }

//         return true;
//     };

//     // Compare the two questions
//     if (!deepEqual(prevQuestion, newQuestion)) {
//         // Trigger alert if any field is changed
//         // alert("The question has changed!");

//         // Ensure required fields are always defined
//         if (previousDataRef && previousDataRef[selectedSectionIndex]) {
//             previousDataRef[selectedSectionIndex].questions[currentQuestionIndex] = {
//                 id: newQuestion?.id ?? "", // Default to empty string if undefined
//                 questionName: newQuestion?.questionName ?? "",
//                 questionType: newQuestion?.questionType ?? "",
//                 questionPenalty: newQuestion?.questionPenalty ?? "",
//                 questionDuration: newQuestion?.questionDuration ?? { hrs: "0", min: "0" },
//                 questionMark: newQuestion?.questionMark ?? "",
//                 singleChoiceOptions: newQuestion?.singleChoiceOptions ?? [],
//                 multipleChoiceOptions: newQuestion?.multipleChoiceOptions ?? [],
//                 questionId: newQuestion?.questionId ?? "",
//                 explanation: newQuestion?.explanation ?? "",
//                 imageDetails: newQuestion?.imageDetails ?? [],
//             };
//         }
//     }
// };
