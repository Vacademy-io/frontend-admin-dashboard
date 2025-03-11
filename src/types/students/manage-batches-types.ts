import { LevelType } from "@/schemas/student/student-list/institute-schema";
import { CourseType } from "@/stores/study-library/use-study-library-store";

export interface levelWithStudents {
    level: LevelType;
    students_count: number;
}

export interface batchWithStudentDetails {
    course: CourseType;
    levelsWithStudents: levelWithStudents[];
}

export type batchesWithStudents = batchWithStudentDetails[];
