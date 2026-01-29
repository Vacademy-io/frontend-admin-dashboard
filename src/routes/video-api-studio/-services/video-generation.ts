import { AI_SERVICE_BASE_URL } from '@/constants/urls';

export type VideoStage = 'PENDING' | 'SCRIPT' | 'TTS' | 'WORDS' | 'HTML' | 'RENDER';
export type VideoStatusType = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'FAILED';

export type VoiceGender = 'female' | 'male';
export type TtsProvider = 'edge' | 'google';

export interface GenerateVideoRequest {
    prompt: string;
    language: string;
    voice_gender: VoiceGender;
    tts_provider: TtsProvider;
    captions_enabled: boolean;
    html_quality: 'classic' | 'advanced';
    target_audience: string;
    target_duration: string;
    model: string;
}

export interface ProgressEvent {
    type: 'progress';
    stage: VideoStage;
    message: string;
    percentage: number;
    video_id: string;
    files?: {
        script?: { file_id: string; s3_url: string };
        audio?: { file_id: string; s3_url: string };
        words?: { file_id: string; s3_url: string };
        timeline?: { file_id: string; s3_url: string };
        video?: { file_id: string; s3_url: string };
    };
}

export interface CompletedEvent {
    type: 'completed';
    files: {
        video?: string;
        script?: string;
        audio?: string;
    };
    percentage: number;
}

export interface ErrorEvent {
    type: 'error';
    message: string;
}

export type SSEEvent = ProgressEvent | CompletedEvent | ErrorEvent;

export interface VideoUrls {
    video_id: string;
    html_url: string;
    audio_url: string;
    words_url: string;
    current_stage: VideoStage;
}

export interface VideoStatusResponse {
    id: string;
    video_id: string;
    current_stage: VideoStage;
    status: VideoStatusType;
    s3_urls: {
        script?: string;
        audio?: string;
        video?: string;
    };
    created_at: string;
}

export interface HistoryItem {
    id: string;
    video_id: string;
    prompt: string;
    status: 'pending' | 'generating' | 'completed' | 'failed';
    stage: VideoStage;
    created_at: string;
    html_url?: string;
    audio_url?: string;
    video_url?: string;
    options: Omit<GenerateVideoRequest, 'prompt'>;
}

const HISTORY_STORAGE_KEY = 'vacademy_video_generation_history';

export const AVAILABLE_MODELS = [
    // Free Models
    { id: 'xiaomi/mimo-v2-flash:free', name: 'MIMO v2 Flash (Free)', tier: 'free' },
    { id: 'mistralai/devstral-2512:free', name: 'Devstral 2512 (Free)', tier: 'free' },
    { id: 'nvidia/nemotron-3-nano-30b-a3b:free', name: 'Nemotron 3 Nano (Free)', tier: 'free' },
    { id: 'google/gemini-2.0-flash-exp:free', name: 'Gemini 2.0 Flash Exp (Free)', tier: 'free' },
    // OpenAI Models
    { id: 'openai/gpt-4o-mini', name: 'GPT-4o Mini', tier: 'openai' },
    { id: 'openai/gpt-4o', name: 'GPT-4o', tier: 'openai' },
    { id: 'openai/gpt-4-turbo', name: 'GPT-4 Turbo', tier: 'openai' },
    { id: 'openai/gpt-3.5-turbo', name: 'GPT-3.5 Turbo', tier: 'openai' },
    // Gemini Models
    { id: 'google/gemini-2.5-pro', name: 'Gemini 2.5 Pro', tier: 'gemini' },
    { id: 'google/gemini-2.5-flash', name: 'Gemini 2.5 Flash', tier: 'gemini' },
    { id: 'google/gemini-2.5-flash-image', name: 'Gemini 2.5 Flash Image', tier: 'gemini' },
    { id: 'google/gemini-3-flash-preview', name: 'Gemini 3 Flash Preview', tier: 'gemini' },
    { id: 'google/gemini-2.5-flash-lite', name: 'Gemini 2.5 Flash Lite', tier: 'gemini' },
    { id: 'google/gemini-3-pro-preview', name: 'Gemini 3 Pro Preview', tier: 'gemini' },
    // OpenRouter / Other Paid Models
    { id: 'anthropic/claude-3.5-sonnet', name: 'Claude 3.5 Sonnet', tier: 'paid' },
    { id: 'meta-llama/llama-3.1-70b-instruct', name: 'Llama 3.1 70B', tier: 'paid' },
    { id: 'anthropic/claude-sonnet-4.5', name: 'Claude Sonnet 4.5', tier: 'paid' },
    { id: 'x-ai/grok-code-fast-1', name: 'Grok Code Fast 1', tier: 'paid' },
    { id: 'deepseek/deepseek-v3.2', name: 'DeepSeek V3.2', tier: 'paid' },
    { id: 'anthropic/claude-opus-4.5', name: 'Claude Opus 4.5', tier: 'paid' },
    { id: 'x-ai/grok-4.1-fast', name: 'Grok 4.1 Fast', tier: 'paid' },
] as const;

export const LANGUAGES = [
    // Global
    { value: 'English (US)', label: 'English (US)', group: 'Global' },
    { value: 'English (UK)', label: 'English (UK)', group: 'Global' },
    { value: 'Spanish', label: 'Spanish', group: 'Global' },
    { value: 'French', label: 'French', group: 'Global' },
    { value: 'German', label: 'German', group: 'Global' },
    { value: 'Japanese', label: 'Japanese', group: 'Global' },
    { value: 'Chinese', label: 'Chinese', group: 'Global' },
    // Indian
    { value: 'English (India)', label: 'English (India)', group: 'Indian' },
    { value: 'Hindi', label: 'Hindi', group: 'Indian' },
    { value: 'Bengali', label: 'Bengali', group: 'Indian' },
    { value: 'Tamil', label: 'Tamil', group: 'Indian' },
    { value: 'Telugu', label: 'Telugu', group: 'Indian' },
    { value: 'Marathi', label: 'Marathi', group: 'Indian' },
    { value: 'Kannada', label: 'Kannada', group: 'Indian' },
    { value: 'Gujarati', label: 'Gujarati', group: 'Indian' },
    { value: 'Malayalam', label: 'Malayalam', group: 'Indian' },
] as const;

export const VOICE_GENDERS = [
    { value: 'female', label: 'Female' },
    { value: 'male', label: 'Male' },
] as const;

export const TTS_PROVIDERS = [
    { value: 'edge', label: 'Standard (Free)' },
    { value: 'google', label: 'Premium (Google Cloud)' },
] as const;

export const TARGET_AUDIENCES = [
    'Class 1-2 (Ages 6-7)',
    'Class 3-4 (Ages 8-9)',
    'Class 5 (Ages 10-11)',
    'Class 6-8 (Ages 11-14)',
    'Class 9-10 (Ages 14-16)',
    'Class 11-12 (Ages 16-18)',
    'Undergraduate',
    'Graduate/Professional',
    'General/Adult',
];

export const TARGET_DURATIONS = [
    '30 seconds',
    '1 minute',
    '2-3 minutes',
    '5 minutes',
    '10 minutes',
];

export const DEFAULT_OPTIONS: Omit<GenerateVideoRequest, 'prompt'> = {
    language: 'English (US)',
    voice_gender: 'female',
    tts_provider: 'edge',
    captions_enabled: true,
    html_quality: 'advanced',
    target_audience: 'Class 5 (Ages 10-11)',
    target_duration: '2-3 minutes',
    model: 'xiaomi/mimo-v2-flash:free',
};

export function generateVideoId(): string {
    return `vid_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

export function generateVideo(
    request: GenerateVideoRequest,
    apiKey: string,
    onProgress: (event: SSEEvent) => void,
    onError: (error: Error) => void
): { abort: () => void; videoId: string } {
    const videoId = generateVideoId();
    const controller = new AbortController();

    const body = {
        ...request,
        video_id: videoId,
    };

    fetch(`${AI_SERVICE_BASE_URL}/external/video/v1/generate`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-Institute-Key': apiKey,
        },
        body: JSON.stringify(body),
        signal: controller.signal,
    })
        .then(async (response) => {
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const reader = response.body?.getReader();
            if (!reader) {
                throw new Error('No response body');
            }

            const decoder = new TextDecoder();
            let buffer = '';

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                buffer += decoder.decode(value, { stream: true });
                const lines = buffer.split('\n');
                buffer = lines.pop() || '';

                for (const line of lines) {
                    if (line.startsWith('data: ')) {
                        try {
                            let jsonStr = line.slice(6).trim();
                            // Handle Python-style single quotes by converting to double quotes
                            // Replace single quotes with double quotes for JSON compatibility
                            jsonStr = jsonStr
                                .replace(/'/g, '"')
                                .replace(/None/g, 'null')
                                .replace(/True/g, 'true')
                                .replace(/False/g, 'false');
                            const data = JSON.parse(jsonStr);
                            onProgress(data);
                        } catch (e) {
                            console.warn('SSE parse error:', e, 'Line:', line);
                        }
                    }
                }
            }
        })
        .catch((error) => {
            if (error.name !== 'AbortError') {
                onError(error);
            }
        });

    return {
        abort: () => controller.abort(),
        videoId,
    };
}

export async function getVideoUrls(videoId: string, apiKey: string): Promise<VideoUrls> {
    const response = await fetch(
        `${AI_SERVICE_BASE_URL}/external/video/v1/urls/${videoId}`,
        {
            headers: {
                'X-Institute-Key': apiKey,
            },
        }
    );

    if (!response.ok) {
        throw new Error(`Failed to get video URLs: ${response.statusText}`);
    }

    return response.json();
}

export async function getVideoStatus(
    videoId: string,
    apiKey: string
): Promise<VideoStatusResponse> {
    const response = await fetch(
        `${AI_SERVICE_BASE_URL}/external/video/v1/status/${videoId}`,
        {
            headers: {
                'X-Institute-Key': apiKey,
            },
        }
    );

    if (!response.ok) {
        throw new Error(`Failed to get video status: ${response.statusText}`);
    }

    return response.json();
}

export function getHistory(): HistoryItem[] {
    try {
        const stored = localStorage.getItem(HISTORY_STORAGE_KEY);
        return stored ? JSON.parse(stored) : [];
    } catch {
        return [];
    }
}

export function saveToHistory(item: HistoryItem): void {
    const history = getHistory();
    const existingIndex = history.findIndex((h) => h.video_id === item.video_id);

    if (existingIndex >= 0) {
        history[existingIndex] = item;
    } else {
        history.unshift(item);
    }

    // Keep only last 50 items
    const trimmed = history.slice(0, 50);
    localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(trimmed));
}

export function deleteFromHistory(videoId: string): void {
    const history = getHistory().filter((h) => h.video_id !== videoId);
    localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(history));
}

export function clearHistory(): void {
    localStorage.removeItem(HISTORY_STORAGE_KEY);
}
