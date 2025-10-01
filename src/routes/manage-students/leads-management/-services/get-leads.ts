import { LEADS_MANAGEMENT_LISTS } from '@/constants/urls';
import authenticatedAxiosInstance from '@/lib/auth/axiosInstance';
import { LeadsManagementInterface, LeadsListResponse } from '../-types/leads-types';

export const getLeadsData = async ({
    pageNo,
    pageSize,
    requestBody,
}: {
    pageNo: number;
    pageSize: number;
    requestBody: LeadsManagementInterface;
}): Promise<LeadsListResponse> => {
    const response = await authenticatedAxiosInstance({
        method: 'POST',
        url: LEADS_MANAGEMENT_LISTS,
        params: {
            pageNo,
            pageSize,
        },
        data: requestBody,
    });
    return response?.data;
};
