import { ENROLL_INVITE_URL } from '@/constants/urls';
import authenticatedAxiosInstance from '@/lib/auth/axiosInstance';
import { InviteLinkFormValues } from '../GenerateInviteLinkSchema';
import { convertInviteData, PaymentOption } from '../-utils/helper';

export interface Course {
    id: string;
    name: string;
}

export interface Batch {
    sessionId: string;
    levelId: string;
    sessionName: string;
    levelName: string;
}

export const handleEnrollInvite = async ({
    data,
    selectedCourse,
    selectedBatches,
    getPackageSessionId,
    paymentsData,
}: {
    data: InviteLinkFormValues;
    selectedCourse: Course | null;
    selectedBatches: Batch[];
    getPackageSessionId: ({
        courseId,
        levelId,
        sessionId,
    }: {
        courseId: string;
        levelId: string;
        sessionId: string;
    }) => void;
    paymentsData: PaymentOption[];
}) => {
    const convertedData = convertInviteData(
        data,
        selectedCourse,
        selectedBatches,
        getPackageSessionId,
        paymentsData
    );
    const response = await authenticatedAxiosInstance({
        method: 'POST',
        url: ENROLL_INVITE_URL,
        data: convertedData,
    });
    return response?.data;
};
