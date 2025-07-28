import authenticatedAxiosInstance from '@/lib/auth/axiosInstance';
import { getInstituteId } from '@/constants/helper';
import {
    CourseSettingsData,
    CourseSettingsRequest,
    CourseSettingsResponse,
    DEFAULT_COURSE_SETTINGS,
} from '@/types/course-settings';

const COURSE_SETTINGS_KEY = 'COURSE_SETTING';

/**
 * Get course settings for the current institute
 */
export const getCourseSettings = async (): Promise<CourseSettingsData> => {
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

        // If we get a successful response with data, return it
        if (response.data && response.data.data) {
            return response.data.data;
        }

        // If no data found, return default settings
        return DEFAULT_COURSE_SETTINGS;
    } catch (error: any) {
        console.error('Error fetching course settings:', error);

        // Check if it's a 510 error (Setting not found) or other error
        if (error.response?.status === 510 || error.response?.data?.ex?.includes('Setting not found')) {
            console.log('Course settings not found, returning default settings');
            return DEFAULT_COURSE_SETTINGS;
        }

        // For other errors, still return default settings but log the error
        console.warn('Error loading course settings, using defaults:', error.message);
        return DEFAULT_COURSE_SETTINGS;
    }
};

/**
 * Save course settings for the current institute
 */
export const saveCourseSettings = async (settings: CourseSettingsData): Promise<CourseSettingsResponse> => {
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
