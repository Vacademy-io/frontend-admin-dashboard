// hooks/student-list/useGetStudentBatch.ts
import { useInstituteDetailsStore } from "@/stores/student-list/useInstituteDetailsStore";

export const useGetStudentBatch = (package_session_id: string): string => {
    const instituteDetails = useInstituteDetailsStore((state) => state.instituteDetails);

    if (!instituteDetails) return "";

    const batch = instituteDetails.batches_for_sessions.find(
        (batch) => batch.id === package_session_id,
    );

    return batch?.package_dto.package_name || "";
};
