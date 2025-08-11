import authenticatedAxiosInstance from '@/lib/auth/axiosInstance';
import { getInstituteId } from '@/constants/helper';
import {
    CourseSettingsData,
    CourseSettingsRequest,
    CourseSettingsResponse,
    DEFAULT_COURSE_SETTINGS,
} from '@/types/course-settings';

const COURSE_SETTINGS_KEY = 'COURSE_SETTING';
const LOCALSTORAGE_KEY = 'course-settings-cache';
const CACHE_EXPIRY_HOURS = 24; // Cache expires after 24 hours

interface CachedCourseSettings {
    data: CourseSettingsData;
    timestamp: number;
    instituteId: string;
}

/**
 * Get cached course settings from localStorage
 */
const getCachedSettings = (): CourseSettingsData | null => {
    try {
        const instituteId = getInstituteId();
        if (!instituteId) return null;

        const cached = localStorage.getItem(LOCALSTORAGE_KEY);
        if (!cached) return null;

        const cachedData: CachedCourseSettings = JSON.parse(cached);

        // Check if cache is for the same institute
        if (cachedData.instituteId !== instituteId) {
            localStorage.removeItem(LOCALSTORAGE_KEY);
            return null;
        }

        // Check if cache has expired
        const now = Date.now();
        const cacheAge = now - cachedData.timestamp;
        const expiryTime = CACHE_EXPIRY_HOURS * 60 * 60 * 1000; // Convert to milliseconds

        if (cacheAge > expiryTime) {
            localStorage.removeItem(LOCALSTORAGE_KEY);
            return null;
        }

        return mergeWithDefaults(cachedData.data);
    } catch (error) {
        console.error('Error reading cached course settings:', error);
        localStorage.removeItem(LOCALSTORAGE_KEY);
        return null;
    }
};

/**
 * Save course settings to localStorage cache
 */
const setCachedSettings = (settings: CourseSettingsData): void => {
    try {
        const instituteId = getInstituteId();
        if (!instituteId) return;

        const cacheData: CachedCourseSettings = {
            data: settings,
            timestamp: Date.now(),
            instituteId,
        };

        localStorage.setItem(LOCALSTORAGE_KEY, JSON.stringify(cacheData));
    } catch (error) {
        console.error('Error caching course settings:', error);
    }
};

/**
 * Clear cached course settings
 */
export const clearCourseSettingsCache = (): void => {
    localStorage.removeItem(LOCALSTORAGE_KEY);
};

/**
 * Get course settings synchronously from cache only (no API call)
 * Useful for cases where you need immediate access and don't want to wait for async
 */
export const getCourseSettingsFromCache = (): CourseSettingsData => {
    const cachedSettings = getCachedSettings();
    return cachedSettings || DEFAULT_COURSE_SETTINGS;
};

/**
 * Fetch course settings from API and update cache
 */
const fetchCourseSettingsFromAPI = async (): Promise<CourseSettingsData> => {
    try {
        const instituteId = getInstituteId();

        if (!instituteId) {
            throw new Error('Institute ID not found. Please log in again.');
        }

        const response = await authenticatedAxiosInstance.get<CourseSettingsResponse>(
            'https://backend-stage.vacademy.io/admin-core-service/institute/setting/v1/get',
            {
                params: {
                    instituteId,
                    settingKey: COURSE_SETTINGS_KEY,
                },
            }
        );

        let settings: CourseSettingsData;

        // If we get a successful response with data, use it
        if (response.data && response.data.data && Object.keys(response.data.data).length > 0) {
            settings = mergeWithDefaults(response.data.data);
        } else {
            // If no data found or response is null/empty, use default settings

            settings = DEFAULT_COURSE_SETTINGS;
        }

        // Cache the settings
        setCachedSettings(settings);
        return settings;
    } catch (error: unknown) {
        console.error('Error fetching course settings:', error);

        // Check if it's a 510 error (Setting not found) or other error
        const err = error as { response?: { status?: number; data?: { ex?: string } } };
        if (err.response?.status === 510 || err.response?.data?.ex?.includes('Setting not found')) {
            const settings = DEFAULT_COURSE_SETTINGS;
            setCachedSettings(settings);
            return settings;
        }

        // For other errors, still return default settings but log the error
        const message = (error as Error)?.message || 'unknown error';
        console.warn('Error loading course settings, using defaults:', message);
        return DEFAULT_COURSE_SETTINGS; // Don't cache error responses
    }
};

/**
 * Get course settings - tries cache first, then API if needed
 */
export const getCourseSettings = async (forceRefresh = false): Promise<CourseSettingsData> => {
    // If forcing refresh, skip cache and fetch from API
    if (forceRefresh) {
        return fetchCourseSettingsFromAPI();
    }

    // Try to get from cache first
    const cachedSettings = getCachedSettings();
    if (cachedSettings) {
        return cachedSettings;
    }

    // If no cache, fetch from API
    return fetchCourseSettingsFromAPI();
};

/**
 * Save course settings for the current institute and update cache
 */
export const saveCourseSettings = async (
    settings: CourseSettingsData
): Promise<CourseSettingsResponse> => {
    try {
        const instituteId = getInstituteId();

        if (!instituteId) {
            throw new Error('Institute ID not found. Please log in again.');
        }

        const requestData: CourseSettingsRequest = {
            setting_name: 'Course Creation Configuration',
            setting_data: settings,
        };

        const response = await authenticatedAxiosInstance.post<CourseSettingsResponse>(
            'https://backend-stage.vacademy.io/admin-core-service/institute/setting/v1/save-setting',
            requestData,
            {
                params: {
                    instituteId,
                    settingKey: COURSE_SETTINGS_KEY,
                },
                headers: {
                    'Content-Type': 'application/json',
                },
            }
        );

        // Update cache with the saved settings
        const mergedSettings = mergeWithDefaults(settings);
        setCachedSettings(mergedSettings);

        return response.data;
    } catch (error) {
        console.error('Error saving course settings:', error);
        throw error;
    }
};

/**
 * Merge provided settings with defaults to ensure all fields are present
 */
export const mergeWithDefaults = (settings: Partial<CourseSettingsData>): CourseSettingsData => {
    return {
        courseInformation: {
            ...DEFAULT_COURSE_SETTINGS.courseInformation,
            ...settings.courseInformation,
        },
        courseStructure: {
            ...DEFAULT_COURSE_SETTINGS.courseStructure,
            ...settings.courseStructure,
        },
        catalogueSettings: {
            ...DEFAULT_COURSE_SETTINGS.catalogueSettings,
            ...settings.catalogueSettings,
        },
        courseViewSettings: {
            ...DEFAULT_COURSE_SETTINGS.courseViewSettings,
            ...settings.courseViewSettings,
        },
        outlineSettings: {
            ...DEFAULT_COURSE_SETTINGS.outlineSettings,
            ...settings.outlineSettings,
        },
        permissions: {
            ...DEFAULT_COURSE_SETTINGS.permissions,
            ...settings.permissions,
        },
    };
};
