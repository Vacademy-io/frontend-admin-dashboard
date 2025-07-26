import { ENROLL_INVITE_URL, GET_SINGLE_INVITE_DETAILS } from '@/constants/urls';
import authenticatedAxiosInstance from '@/lib/auth/axiosInstance';
import { InviteLinkFormValues } from '../GenerateInviteLinkSchema';
import { convertInviteData, PaymentOption } from '../-utils/helper';
import { getInstituteId } from '@/constants/helper';

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

export const getEnrollSingleInviteDetails = async ({ inviteId }: { inviteId: string }) => {
    const instituteId = getInstituteId();
    const response = await authenticatedAxiosInstance({
        method: 'GET',
        url: GET_SINGLE_INVITE_DETAILS.replace('{instituteId}', instituteId || '').replace(
            '{enrollInviteId}',
            inviteId
        ),
        params: {
            instituteId,
            enrollInviteId: inviteId,
        },
    });
    return response?.data;
};
export const handleGetEnrollSingleInviteDetails = ({ inviteId }: { inviteId: string }) => {
    return {
        queryKey: ['GET_SINGLE_INVITE_DETAILS', inviteId],
        queryFn: () => getEnrollSingleInviteDetails({ inviteId }),
        staleTime: 60 * 60 * 1000,
    };
};
