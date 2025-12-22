import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { GET_AVAILABLE_AI_MODELS } from '@/constants/urls';
import { AIModelsResponse, getModelDisplayInfo, ModelInfo } from '../-types/ai-models';

/**
 * Custom hook to fetch and manage available AI models
 */
export const useAIModels = () => {
    const { data, isLoading, isError, error, refetch } = useQuery<AIModelsResponse>({
        queryKey: ['GET_AVAILABLE_AI_MODELS'],
        queryFn: async () => {
            const response = await axios.get(GET_AVAILABLE_AI_MODELS);
            return response.data;
        },
        staleTime: 5 * 60 * 1000, // Cache for 5 minutes as per best practices
        gcTime: 10 * 60 * 1000,
        retry: 2,
    });

    // Transform available models to include display info
    const availableModels: ModelInfo[] =
        data?.availableModels?.map((modelId) => ({
            ...getModelDisplayInfo(modelId),
            isDefault: modelId === data.defaultModel,
        })) || [];

    // Get default model info
    const defaultModel = data?.defaultModel
        ? {
            ...getModelDisplayInfo(data.defaultModel),
            isDefault: true,
        }
        : null;

    return {
        availableModels,
        defaultModel,
        defaultModelId: data?.defaultModel || null,
        fallbackModels: data?.fallbackModels || [],
        isLoading,
        isError,
        error,
        refetch,
    };
};

export default useAIModels;
