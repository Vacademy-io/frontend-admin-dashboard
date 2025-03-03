import { ActivityStatus } from "@/components/design-system/utils/types/chips-types";
import { LearningProgressSubject, LearningProgressSubjectType } from "./learning-progress";
import { TestRecordDetails, TestRecordDetailsType } from "./test-record";

export interface StudentLearningProgressType {
    title: string;
    data: LearningProgressSubjectType[];
}
export interface StudentTestRecordsType {
    title: string;
    data: TestRecordDetailsType[];
}

export interface StudentSideViewType {
    student_pfp: string;
    student_name: string;
    status: ActivityStatus;
    learning_progress: StudentLearningProgressType;
    test_record: StudentTestRecordsType;
}

export const StudentSideViewData: StudentSideViewType = {
    student_pfp: "",
    student_name: "Aarav Sharma",
    status: "active",
    learning_progress: {
        title: "Learning Progress",
        data: LearningProgressSubject,
    },
    test_record: {
        title: "Test Record",
        data: TestRecordDetails,
    },
};
