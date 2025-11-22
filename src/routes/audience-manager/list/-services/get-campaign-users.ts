import { GET_CAMPAIGN_USERS } from '@/constants/urls';
import authenticatedAxiosInstance from '@/lib/auth/axiosInstance';

export interface CampaignLeadUser {
    response_id?: string;
    audience_id?: string;
    campaign_name?: string;
    user_id?: string;
    source_type?: string;
    source_id?: string;
    submitted_at_local?: string;
    user?: {
        id?: string;
        username?: string;
        email?: string;
        full_name?: string;
        address_line?: string;
        city?: string;
        region?: string;
        pin_code?: string;
        mobile_number?: string;
        date_of_birth?: string;
        gender?: string;
        roles?: string[];
        last_login_time?: string;
        root_user?: boolean;
    };
    custom_field_values?: Record<string, string>;
    custom_field_metadata?: Record<string, unknown>;
}

export interface CampaignLeadsResponse {
    totalElements: number;
    totalPages: number;
    number: number;
    size: number;
    first: boolean;
    last: boolean;
    content: CampaignLeadUser[];
}

export interface CampaignLeadsRequest {
    audience_id: string;
    source_type?: string;
    source_id?: string;
    submitted_from_local?: string;
    submitted_to_local?: string;
    page: number;
    size: number;
    sort_by?: string;
    sort_direction?: string;
}

const fetchCampaignLeads = async (payload: CampaignLeadsRequest): Promise<CampaignLeadsResponse> => {
    try {
        const response = await authenticatedAxiosInstance({
            method: 'POST',
            url: GET_CAMPAIGN_USERS,
            data: payload,
            params: {
                pageNo: payload.page,
                pageSize: payload.size,
            },
        });
        return response.data;
    } catch (error) {
        console.error('Error fetching campaign leads:', error);
        throw error;
    }
};

export const handleFetchCampaignUsers = (payload: CampaignLeadsRequest) => {
    return {
        queryKey: [
            'campaignUsers',
            payload.audience_id,
            payload.page,
            payload.size,
            payload.sort_by,
            payload.sort_direction,
            payload.source_type,
            payload.source_id,
            payload.submitted_from_local,
            payload.submitted_to_local,
        ],
        queryFn: () => fetchCampaignLeads(payload),
        staleTime: 60 * 1000, // 1 minute
    };
};

