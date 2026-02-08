import authenticatedAxiosInstance from '@/lib/auth/axiosInstance';
import { getCurrentInstituteId } from '@/lib/auth/instituteUtils';
import { AI_SERVICE_BASE_URL } from '@/constants/urls';
import { useQuery } from '@tanstack/react-query';

export interface AiCreditsType {
    institute_id: string;
    total_credits: string;
    used_credits: string;
    current_balance: string;
    low_balance_threshold: string;
    is_low_balance: boolean;
    created_at: string;
    updated_at: string;
}

export const fetchAiCredits = async (): Promise<AiCreditsType> => {
    const INSTITUTE_ID = getCurrentInstituteId();

    const response = await authenticatedAxiosInstance.get<AiCreditsType>(
        `${AI_SERVICE_BASE_URL}/credits/v1/institutes/${INSTITUTE_ID}/balance`
    );
    return response.data;
};

export const useAiCreditsQuery = (enabled: boolean = true) => {
    return useQuery({
        queryKey: ['GET_AI_CREDITS'],
        queryFn: fetchAiCredits,
        enabled: enabled,
        staleTime: 60000, // 1 minute
        retry: false, // Do not retry on failure as per requirement "if the api fails ... do not give error just do not show"
    });
};
