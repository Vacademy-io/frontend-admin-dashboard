import { useInstituteDetailsStore } from "@/stores/student-list/useInstituteDetailsStore";

export const usePackageSessionIds = (
    sessionName: string,
    batchNames?: string[], // Changed to accept array of batch names
): string[] => {
    const { instituteDetails } = useInstituteDetailsStore();

    if (!instituteDetails?.batches_for_sessions) return [];

    // If no batchNames provided, return all batch IDs for the session
    if (!batchNames || batchNames.length === 0) {
        return instituteDetails.batches_for_sessions
            .filter((batch) => batch.session.session_name === sessionName)
            .map((batch) => batch.id);
    }

    // Process multiple batch names
    const matchingBatches = instituteDetails.batches_for_sessions.filter((batch) => {
        if (batch.session.session_name !== sessionName) return false;

        // Create the batch name string in the same format as the filter
        const batchNameString = `${batch.level.level_name} ${batch.package_dto.package_name}`;

        // Check if this batch matches any of the provided batch names
        return batchNames.includes(batchNameString);
    });

    return matchingBatches.map((batch) => batch.id);
};
