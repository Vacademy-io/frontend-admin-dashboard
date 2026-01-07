// AI Model Types for model selection feature

export interface AIModelsResponse {
    defaultModel: string;
    availableModels: string[];
    fallbackModels: string[];
}

export interface ModelInfo {
    id: string;
    name: string;
    description: string;
    isDefault?: boolean;
}

// Display name mappings for AI models
export const MODEL_DISPLAY_NAMES: Record<string, { name: string; description: string }> = {
    'google/gemini-2.5-flash': {
        name: 'Gemini 2.5 Flash',
        description: 'Fast and balanced (Recommended)',
    },
    'openai/gpt-4o-mini': {
        name: 'GPT-4o Mini',
        description: 'Complex reasoning',
    },
    'anthropic/claude-3-haiku': {
        name: 'Claude 3 Haiku',
        description: 'Creative and nuanced',
    },
    'google/gemini-2.0-flash-exp': {
        name: 'Gemini 2.0 Flash',
        description: 'Experimental, fast',
    },
    'mistralai/devstral-2512:free': {
        name: 'DevStral 2512',
        description: 'Fast and balanced (Recommended)',
    },
};

/**
 * Get display info for a model ID
 */
export const getModelDisplayInfo = (modelId: string): ModelInfo => {
    const displayInfo = MODEL_DISPLAY_NAMES[modelId];
    if (displayInfo) {
        return {
            id: modelId,
            name: displayInfo.name,
            description: displayInfo.description,
        };
    }
    // Fallback for unknown models - extract name from ID
    const parts = modelId.split('/');
    const name = parts.length > 1 ? parts[1] : modelId;
    const formattedName = name
        ? name.replace(/-/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())
        : modelId;
    return {
        id: modelId,
        name: formattedName,
        description: 'AI Model',
    };
};
