import { GET_FACULTY_BATCHES_URL } from '@/constants/urls';
import { getTokenDecodedData, getTokenFromCookie } from '@/lib/auth/sessionUtility';
import { TokenKey } from '@/constants/auth/tokens';
import {
    FacultyAssignmentsResponse,
    useFacultyBatchesStore,
} from '@/stores/faculty/faculty-batches-store';
import authenticatedAxiosInstance from '@/lib/auth/axiosInstance';

export const getFacultyBatches = async (): Promise<FacultyAssignmentsResponse | null> => {
    try {
        const accessToken = getTokenFromCookie(TokenKey.accessToken);
        const tokenData = getTokenDecodedData(accessToken);
        const userId = tokenData?.user; // You'll need to implement this function

        const response = await authenticatedAxiosInstance.get(GET_FACULTY_BATCHES_URL, {
            params: { userId },
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        });

        if (response.data) {
            return response.data;
        }
        return null;
    } catch (error) {
        console.error('Error fetching faculty batches:', error);
        return null;
    }
};

export const fetchAndStoreFacultyBatches = async (): Promise<void> => {
    try {
        const assignmentsData = await getFacultyBatches();
        if (assignmentsData) {
            useFacultyBatchesStore.getState().setBatchAssignments(assignmentsData);
        }
    } catch (error) {
        console.error('Error in fetchAndStoreFacultyBatches:', error);
    }
};
