import {
    GET_SIGNED_URL,
    ACKNOWLEDGE,
    GET_PUBLIC_URL,
    GET_DETAILS,
    ACKNOWLEDGE_FOR_PUBLIC_URL,
} from '@/constants/urls';
import authenticatedAxiosInstance from '@/lib/auth/axiosInstance';
import axios from 'axios';
import { isNullOrEmptyOrUndefined } from '@/lib/utils';

interface SignedURLResponse {
    id: string;
    url: string;
}

export enum StatusCode {
    success = 200,
}

export const UploadFileInS3 = async (
    file: File | undefined,
    setIsUploadingFile: React.Dispatch<React.SetStateAction<boolean>> = () => false,
    user_id: string,
    source?: string,
    sourceId?: string,
    publicUrl?: boolean
): Promise<string | undefined> => {
    setIsUploadingFile(true);
    const effectiveSource = source || 'FLOOR_DOCUMENTS';
    const effectiveSourceId = sourceId || 'STUDENTS';

    try {
        if (isNullOrEmptyOrUndefined(file)) {
            throw new Error('Invalid File');
        }

        if (file) {
            const signedURLData: SignedURLResponse = await getSignedURL(
                file.name.toLowerCase().replace(/\s+/g, '_'),
                file.type,
                effectiveSource,
                effectiveSourceId
            );

            const uploadResponse = await axios({
                method: 'PUT',
                url: signedURLData.url,
                data: file,
            });

            if (uploadResponse.status === StatusCode.success) {
                await acknowledgeUpload(signedURLData.id, user_id, publicUrl);
            }

            setIsUploadingFile(false);
            return signedURLData.id;
        }
    } catch (error) {
        console.error(error);
        setIsUploadingFile(false);
        throw error;
    }
    return undefined;
};

const getSignedURL = async (
    file_name: string,
    file_type: string,
    source: string,
    source_id: string
) => {
    // });
    const requestBody = {
        file_name: file_name,
        file_type: file_type,
        source: source,
        source_id: source_id,
    };
    const response = await authenticatedAxiosInstance.post(GET_SIGNED_URL, requestBody);
    return response.data;
};

const acknowledgeUpload = async (
    file_id: string,
    user_id: string,
    publicUrl?: boolean
): Promise<boolean> => {
    const requestBody = {
        file_id: file_id,
        user_id: user_id,
    };

    const response = publicUrl
        ? await authenticatedAxiosInstance.post(ACKNOWLEDGE_FOR_PUBLIC_URL, requestBody)
        : await authenticatedAxiosInstance.post(ACKNOWLEDGE, requestBody);

    return response.data;
};

export const getPublicUrl = async (fileId: string | undefined | null): Promise<string> => {
    if (!fileId) return '';
    const response = await authenticatedAxiosInstance.get(GET_PUBLIC_URL, {
        params: { fileId, expiryDays: 1 },
    });
    return response?.data;
};

export const getPublicUrls = async (fileIds: string | undefined | null) => {
    const response = await authenticatedAxiosInstance({
        method: 'GET',
        url: GET_DETAILS,
        params: { fileIds, expiryDays: 1 },
    });
    return response?.data;
};

export const UploadFileInS3V2 = async (
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    file: any,
    setIsUploadingFile: React.Dispatch<React.SetStateAction<boolean>> = () => false,
    user_id: string,
    source?: string,
    sourceId?: string,
    publicUrl?: boolean
): Promise<string | undefined> => {
    setIsUploadingFile(true);
    const effectiveSource = source || 'FLOOR_DOCUMENTS';
    const effectiveSourceId = sourceId || 'STUDENTS';

    try {
        if (isNullOrEmptyOrUndefined(file)) {
            throw new Error('Invalid File');
        }

        if (file) {
            const signedURLData: SignedURLResponse = await getSignedURL(
                'json',
                'json',
                effectiveSource,
                effectiveSourceId
            );

            const uploadResponse = await axios({
                method: 'PUT',
                url: signedURLData.url,
                data: file,
            });

            if (uploadResponse.status === StatusCode.success) {
                await acknowledgeUpload(signedURLData.id, user_id, publicUrl);
            }

            setIsUploadingFile(false);
            return signedURLData.id;
        }
    } catch (error) {
        console.error(error);
        setIsUploadingFile(false);
        throw error;
    }
    return undefined;
};
