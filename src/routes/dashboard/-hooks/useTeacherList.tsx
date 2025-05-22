import { useQuery } from '@tanstack/react-query';
import { fetchFacultyList, FacultyFilterParams } from '../-services/dashboard-services';

export const useTeacherList = (
    instituteId: string,
    pageNo: number = 0,
    pageSize: number = 10,
    filters: FacultyFilterParams = {},
    enabled: boolean = true
) => {
    return useQuery({
        queryKey: ['facultyList', instituteId, pageNo, pageSize, filters],
        queryFn: () => fetchFacultyList(instituteId, pageNo, pageSize, filters),
        enabled,
    });
};
