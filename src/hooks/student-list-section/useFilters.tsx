import { useInstituteDetailsStore } from "@/stores/students/students-list/useInstituteDetailsStore";

export const useGetSessions = () => {
    const { instituteDetails } = useInstituteDetailsStore();
    return instituteDetails?.sessions?.map((session) => session.session_name) || [];
};

export const useGetBatchNames = (selectedSession?: string) => {
    const { instituteDetails } = useInstituteDetailsStore();

    return (
        instituteDetails?.batches_for_sessions
            .filter((batch) => !selectedSession || batch.session.session_name === selectedSession)
            .map((batch) => `${batch.level.level_name} ${batch.package_dto.package_name}`)
            .sort() || []
    );
};

export const useGetGenders = () => {
    const { instituteDetails } = useInstituteDetailsStore();
    return instituteDetails?.genders || [];
};

export const useGetStatuses = () => {
    const { instituteDetails } = useInstituteDetailsStore();
    return instituteDetails?.student_statuses || [];
};

export const useGetSessionExpiry = () => {
    const { instituteDetails } = useInstituteDetailsStore();
    return instituteDetails?.session_expiry_days || [];
};
