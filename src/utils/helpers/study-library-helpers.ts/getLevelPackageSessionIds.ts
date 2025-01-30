// utils/institute/getPackageSessionIds.ts
import { useInstituteDetailsStore } from "@/stores/students/students-list/useInstituteDetailsStore";

export const getPackageSessionIds = (levelName: string, sessionName: string): string => {
    const instituteDetails = useInstituteDetailsStore.getState().instituteDetails;

    if (!instituteDetails || !instituteDetails.batches_for_sessions) {
        return "";
    }

    return instituteDetails.batches_for_sessions
        .filter(
            (batch) =>
                batch.level.level_name === levelName && batch.session.session_name === sessionName,
        )
        .map((batch) => batch.id)
        .join(",");
};
