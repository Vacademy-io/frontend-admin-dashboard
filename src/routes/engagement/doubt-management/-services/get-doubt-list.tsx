import authenticatedAxiosInstance from '@/lib/auth/axiosInstance';
import { GET_DOUBTS } from '@/constants/urls';
import { PaginatedDoubtResponse } from '@/routes/study-library/courses/levels/subjects/modules/chapters/slides/-types/get-doubts-type';
import { DoubtFilter } from '@/routes/study-library/courses/levels/subjects/modules/chapters/slides/-types/get-doubts-type';
import { useQuery } from '@tanstack/react-query';

export const useGetDoubtList = ({ filter }: { filter: DoubtFilter }) => {
    return useQuery({
        queryKey: ['GET_DOUBTS', filter],
        queryFn: async ({ pageParam = 0 }) => {
            const response = await authenticatedAxiosInstance.post<PaginatedDoubtResponse>(
                `${GET_DOUBTS}?pageNo=${pageParam}&pageSize=10`,
                { ...filter }
            );
            return response.data;
        },
    });
};
