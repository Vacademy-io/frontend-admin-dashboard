// utils/institute/getPackageSessionIds.ts
import { useInstituteDetailsStore } from "@/stores/students/students-list/useInstituteDetailsStore";

export const getPackageSessionIdsByIds = (
    levelId: string | undefined,
    sessionId: string,
): string => {
    const instituteDetails = useInstituteDetailsStore.getState().instituteDetails;

    if (!instituteDetails || !instituteDetails.batches_for_sessions) {
        return "";
    }

    return instituteDetails.batches_for_sessions
        .filter((batch) => batch.level.id === levelId && batch.session.id === sessionId)
        .map((batch) => batch.id)
        .join(",");
};
