export const AI_COURSE_API_CONFIG = {
    timeout: 60_000,
    defaultHeaders: {
        'Content-Type': 'application/json',
    },
};

export function buildApiUrl(endpoint: string, params: Record<string, string | number>) {
    const base = `https://backend-stage.vacademy.io/media-service/course/ai/v1/${endpoint}`;
    const url = new URL(base);
    Object.entries(params).forEach(([key, value]) => {
        url.searchParams.set(key, String(value));
    });
    return url.toString();
} 