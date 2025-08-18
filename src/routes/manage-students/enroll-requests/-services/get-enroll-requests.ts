import { ENROLL_REQUESTS_LISTS } from '@/constants/urls';
import authenticatedAxiosInstance from '@/lib/auth/axiosInstance';
import { EnrollRequestsInterface } from '../-components/enroll-requests';

export const getEnrollmentRequestsData = async ({
    pageNo,
    pageSize,
    requestBody,
}: {
    pageNo: number;
    pageSize: number;
    requestBody: EnrollRequestsInterface;
}) => {
    const response = await authenticatedAxiosInstance({
        method: 'POST',
        url: ENROLL_REQUESTS_LISTS,
        params: {
            pageNo,
            pageSize,
        },
        data: requestBody,
    });
    return response?.data;
};
