import { useInstituteDetailsStore } from "@/stores/student-list/useInstituteDetailsStore";

export const usePackageSessionIds = (
    sessionName: string,
    batchName?: string, // Made optional
): string[] => {
    const { instituteDetails } = useInstituteDetailsStore();

    if (!instituteDetails?.batches_for_sessions) return [];

    // If no batchName provided, return all batch IDs for the session
    if (!batchName) {
        return instituteDetails.batches_for_sessions
            .filter((batch) => batch.session.session_name === sessionName)
            .map((batch) => batch.id);
    }

    // If batchName is provided, find specific batch(es)
    const [levelName, ...packageNameParts] = batchName.split(" ");
    const packageName = packageNameParts.join(" ");

    const matchingBatches = instituteDetails.batches_for_sessions.filter(
        (batch) =>
            batch.session.session_name === sessionName &&
            batch.level.level_name === levelName &&
            batch.package_dto.package_name === packageName,
    );

    return matchingBatches.map((batch) => batch.id);
};
