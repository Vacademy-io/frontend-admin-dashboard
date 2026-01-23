import { useMemo } from 'react';
import { usePaginatedBatches } from '@/services/paginated-batches';

export const usePackageSessionIds = (sessionName: string, batchNames?: string[]): string[] => {
    // Fetch batches using paginated API
    const { data: batchesData } = usePaginatedBatches({ size: 500 });

    return useMemo(() => {
        const batches = batchesData?.content || [];

        if (batches.length === 0) return [];

        // Filter batches by session name
        const sessionBatches = batches.filter(
            (batch) => batch.session?.session_name === sessionName
        );

        if (!batchNames || batchNames.length === 0) {
            return sessionBatches.map((batch) => batch.id);
        }

        // Match by batch names
        const matchingBatches = sessionBatches.filter((batch) => {
            let batchNameString;
            if (batch.level?.id === 'DEFAULT') {
                batchNameString = batch.package_dto.package_name.replace(/^default\s+/i, '').trim();
            } else {
                const levelName = (batch.level?.level_name || '').replace(/^default\s+/i, '');
                const packageName = batch.package_dto.package_name.replace(/^default\s+/i, '');
                batchNameString = `${levelName} ${packageName}`.trim();
            }
            return batchNames.includes(batchNameString);
        });

        return matchingBatches.map((batch) => batch.id);
    }, [batchesData, sessionName, batchNames]);
};
