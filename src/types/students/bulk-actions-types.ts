import { StudentTable } from "@/schemas/student/student-list/table-schema";

export interface BulkActionInfo {
    selectedStudentIds: string[];
    selectedStudents: StudentTable[]; // Add this
    displayText: string;
}
