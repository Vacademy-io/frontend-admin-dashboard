import { extractUserRoles } from '@/lib/utils';
import { useFacultyBatchesStore } from '@/stores/faculty/faculty-batches-store';
import { useEffect, useState, useMemo } from 'react';

export const useBatchAccess = () => {
    const { batchAssignments, hasBatchAccess, isLoaded } = useFacultyBatchesStore();
    const [isFaculty, setIsFaculty] = useState(false);

    useEffect(() => {
        const userRoles = extractUserRoles();
        setIsFaculty(userRoles.includes('TEACHER'));
    }, []);

    const accessibleBatches = useMemo(() => {
        if (!isFaculty || !batchAssignments) return [];
        return batchAssignments.map((assignment) => assignment.batch_id);
    }, [batchAssignments, isFaculty]);

    return {
        isLoaded,
        isFaculty,
        accessibleBatches,
        hasBatchAccess,
        filterAccessibleBatches: (allBatches: { package_session_id: string }[]) => {
            if (!isFaculty) return allBatches;
            return allBatches.filter((batch) =>
                accessibleBatches.includes(batch.package_session_id)
            );
        },
    };
};
