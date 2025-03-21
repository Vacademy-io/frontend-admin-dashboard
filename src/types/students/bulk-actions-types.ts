import { StudentTable } from "@/schemas/student/student-list/table-schema";
import { SubmissionStudentData } from "../assessments/assessment-overview";

export interface BulkActionInfo {
    selectedStudentIds: string[];
    selectedStudents: StudentTable[]; // Add this
    displayText: string;
}

export interface AssessmentSubmissionsBulkActionInfo {
    selectedStudentIds: string[];
    selectedStudents: SubmissionStudentData[]; // Add this
    displayText: string;
}
