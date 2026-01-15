import { useQuery } from '@tanstack/react-query';
import { StudentFilterRequest, StudentListResponse } from '@/types/student-table-types';
import { GET_STUDENTS } from '@/constants/urls';
import authenticatedAxiosInstance from '@/lib/auth/axiosInstance';
import { useMemo } from 'react';

interface FetchStudentsParams {
    pageNo?: number;
    pageSize?: number;
    filters: StudentFilterRequest;
}

export const fetchStudents = async ({
    pageNo = 0,
    pageSize = 10,
    filters,
}: FetchStudentsParams): Promise<StudentListResponse> => {
    const response = await authenticatedAxiosInstance.post<StudentListResponse>(
        `${GET_STUDENTS}?pageNo=${pageNo}&pageSize=${pageSize}`,
        filters
    );
    return response.data;
};

// React Query hook with stabilized query key
export const useStudentList = (
    filters: StudentFilterRequest,
    pageNo?: number,
    pageSize?: number
) => {
    // Stabilize the filters object by creating a consistent string representation
    // This prevents React Query from treating each render's filter object as a new key
    const stableFiltersKey = useMemo(() => {
        return JSON.stringify({
            name: filters.name || '',
            institute_ids: filters.institute_ids?.sort() || [],
            package_session_ids: filters.package_session_ids?.sort() || [],
            group_ids: filters.group_ids?.sort() || [],
            gender: filters.gender?.sort() || [],
            statuses: filters.statuses?.map((s: any) => typeof s === 'string' ? s : s?.name || '').sort() || [],
            sort_columns: filters.sort_columns || {},
        });
    }, [
        filters.name,
        filters.institute_ids,
        filters.package_session_ids,
        filters.group_ids,
        filters.gender,
        filters.statuses,
        filters.sort_columns,
    ]);

    return useQuery({
        queryKey: ['students', pageNo, pageSize, stableFiltersKey],
        queryFn: () => fetchStudents({ pageNo, pageSize, filters }),
        // Prevent refetching when window regains focus
        refetchOnWindowFocus: false,
        // Don't refetch when component remounts
        refetchOnMount: false,
        // Keep data fresh for 30 seconds to prevent duplicate fetches
        staleTime: 1000 * 30,
        // Keep data in cache for 5 minutes
        gcTime: 1000 * 60 * 5,
    });
};
