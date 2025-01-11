// hooks/students/useEnrollStudent.ts
import { useMutation } from "@tanstack/react-query";
import { enrollStudent } from "@/services/student-list-section/enroll-manually";
import { EnrollStudentRequest } from "@/types/students/type-enroll-student-manually";

export const useEnrollStudent = () => {
    return useMutation<string, Error, EnrollStudentRequest>({
        mutationFn: enrollStudent,
    });
};
