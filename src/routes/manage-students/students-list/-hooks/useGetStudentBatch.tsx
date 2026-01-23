// hooks/student-list/useGetStudentBatch.ts
import { useBatchesByIds } from '@/services/paginated-batches';

export const useGetStudentBatch = (
    package_session_id: string
): { packageName: string; levelName: string } => {
    // Fetch batch details using paginated API
    const batchIds = package_session_id ? [package_session_id] : [];
    const { data: batchesData } = useBatchesByIds(batchIds);

    const batch = batchesData?.content?.[0];

    return {
        levelName: batch?.level?.level_name || '',
        packageName: batch?.package_dto?.package_name || '',
    };
};
