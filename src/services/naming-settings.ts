import { CREATE_NAMING_SETTINGS, UPDATE_NAMING_SETTINGS } from '@/constants/urls';
import authenticatedAxiosInstance from '@/lib/auth/axiosInstance';
import { getTokenDecodedData, getTokenFromCookie } from '@/lib/auth/sessionUtility';
import { TokenKey } from '@/constants/auth/tokens';

export interface NamingSettingsRequest {
    Course: string;
    Level: string;
    Session: string;
    Subjects: string;
    Modules: string;
    Chapters: string;
    Slides: string;
    Admin: string;
    Teacher: string;
    CourseCreator: string;
    AssessmentCreator: string;
    Evaluator: string;
    Student: string;
    LiveSession: string;
}

export const createNamingSettings = async (nameRequest: NamingSettingsRequest): Promise<void> => {
    const accessToken = getTokenFromCookie(TokenKey.accessToken);
    const tokenData = getTokenDecodedData(accessToken);
    const instituteIds = Object.keys(tokenData?.authorities || {});

    if (instituteIds.length === 0) {
        throw new Error('No institute ID found in token');
    }

    const instituteId = instituteIds[0];

    const response = await authenticatedAxiosInstance.post(
        CREATE_NAMING_SETTINGS,
        { name_request: nameRequest },
        {
            params: { instituteId },
        }
    );

    return response.data;
};

export const updateNamingSettings = async (nameRequest: NamingSettingsRequest): Promise<void> => {
    const accessToken = getTokenFromCookie(TokenKey.accessToken);
    const tokenData = getTokenDecodedData(accessToken);
    const instituteIds = Object.keys(tokenData?.authorities || {});

    console.log('naming settings', nameRequest);

    if (instituteIds.length === 0) {
        throw new Error('No institute ID found in token');
    }

    const instituteId = instituteIds[0];

    const response = await authenticatedAxiosInstance.post(
        UPDATE_NAMING_SETTINGS,
        { name_request: nameRequest },
        {
            params: { instituteId },
        }
    );

    return response.data;
};
