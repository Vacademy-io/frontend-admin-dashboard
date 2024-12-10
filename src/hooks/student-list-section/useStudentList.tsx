import { useQuery, UseQueryResult } from "@tanstack/react-query";
import { StudentFilterRequest, StudentListResponse } from "@/schemas/student-list/table-schema";
import { fetchStudents } from "@/services/student-list-section/getStudentTable";

export const useStudentList = (
    filters: StudentFilterRequest,
    pageNo?: number,
    pageSize?: number,
): UseQueryResult<StudentListResponse> => {
    return useQuery<StudentListResponse>({
        queryKey: ["students", pageNo, pageSize, filters],
        queryFn: () => fetchStudents({ pageNo, pageSize, filters }),
    });
};
