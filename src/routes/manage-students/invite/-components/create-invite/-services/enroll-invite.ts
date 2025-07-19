import { ENROLL_INVITE_URL } from '@/constants/urls';
import authenticatedAxiosInstance from '@/lib/auth/axiosInstance';
import { InviteLinkFormValues } from '../GenerateInviteLinkSchema';
import { convertInviteData } from '../-utils/helper';

export const handleEnrollInvite = async ({ data }: { data: InviteLinkFormValues }) => {
    const convertedData = convertInviteData(data);
    const response = await authenticatedAxiosInstance({
        method: 'POST',
        url: ENROLL_INVITE_URL,
        data: convertedData,
    });
    return response?.data;
};
