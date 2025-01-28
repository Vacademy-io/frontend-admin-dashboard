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
    return totalMarks / questions.length;
}

export function calculateAveragePenalty(questions: Question[]): number {
    if (questions.length === 0) return 0;

    const totalPenalty = questions.reduce(
        (sum, question) => sum + parseFloat(question.questionPenalty),
        0,
    );
    return totalPenalty / questions.length;
}

export function parseHtmlToString(html: string) {
    const doc = new DOMParser().parseFromString(html, "text/html");
    return doc.body.textContent || doc.body.innerText || "";
}
