import { ActivityStatus } from "@/components/design-system/utils/types/chips-types";
import { OverviewDetails, OverviewDetailsType } from "./overview";
import { LearningProgressSubject, LearningProgressSubjectType } from "./learning-progress";
import { TestRecordDetails, TestRecordDetailsType } from "./test-record";

export interface StudentOverviewType {
    title: string;
    session_expiry: number;
    data: OverviewDetailsType[];
}
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
    overview: StudentOverviewType;
    learning_progress: StudentLearningProgressType;
    test_record: StudentTestRecordsType;
}

export const StudentSideViewData: StudentSideViewType = {
    student_pfp: "",
    student_name: "Aarav Sharma",
    status: "active",
    overview: {
        title: "Overview",
        session_expiry: 125,
        data: OverviewDetails,
    },
    learning_progress: {
        title: "Learning Progress",
        data: LearningProgressSubject,
    },
    test_record: {
        title: "Test Record",
        data: TestRecordDetails,
    },
};
