import authenticatedAxiosInstance from '@/lib/auth/axiosInstance';
import { ADMIN_DETAILS_URL } from '@/constants/urls';
import { getTokenDecodedData, getTokenFromCookie } from '@/lib/auth/sessionUtility';
import { TokenKey } from '@/constants/auth/tokens';

export interface UserRole {
    id: string;
    institute_id: string;
    role_name: string;
    status: string;
    role_id: string;
}

export interface UserProfile {
    id: string;
    email: string;
    full_name: string | null;
    address_line: string;
    city: string;
    region: string | null;
    pin_code: string;
    mobile_number: string | null;
    date_of_birth: string; // ISO string (can be converted to Date if needed)
    gender: string;
    profile_pic_file_id: string;
    roles: UserRole[];
    delete_user_role_request: string[]; // Replace `any` with actual type if known
    add_user_role_request: string[]; // Replace `any` with actual type if known
    root_user: boolean;
}

const getAdminDetails = async (): Promise<UserProfile> => {
    const accessToken = getTokenFromCookie(TokenKey.accessToken);
    const data = getTokenDecodedData(accessToken);
    const INSTITUTE_ID = data && Object.keys(data.authorities)[0];
    const response = await authenticatedAxiosInstance({
        method: 'GET',
        url: `${ADMIN_DETAILS_URL}`,
        params: {
            instituteId: INSTITUTE_ID,
            userId: data?.user,
        },
    });
    return response.data;
};

export const handleGetAdminDetails = () => {
    return {
        queryKey: ['GET_ADMIN_DETAILS'],
        queryFn: () => getAdminDetails(),
        staleTime: 3600000,
    };
};
