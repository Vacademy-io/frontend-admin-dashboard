import { useQuery } from '@tanstack/react-query';
import authenticatedAxiosInstance from '@/lib/auth/axiosInstance';
import { GET_CPO_OPTIONS } from '@/constants/urls';
import type { CPOPackage } from '../-types/cpo-types';

export const fetchCPOOptions = async (packageSessionId: string): Promise<CPOPackage[]> => {
    const response = await authenticatedAxiosInstance.get(GET_CPO_OPTIONS(packageSessionId));
    return response.data;
};

export const useCPOOptions = (packageSessionId: string | null) => {
    return useQuery({
        queryKey: ['cpo-options', packageSessionId],
        queryFn: () => fetchCPOOptions(packageSessionId!),
        enabled: !!packageSessionId,
        staleTime: 30000,
    });
};
