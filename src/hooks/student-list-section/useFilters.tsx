import { FilterConfig } from "@/types/students/students-list-types";
import { useInstituteDetailsStore } from "@/stores/students/students-list/useInstituteDetailsStore";

export const useFilterData = (currentSession?: string) => {
    const batchNames = useGetBatchNames(currentSession);
    const statuses = useGetStatuses();
    const genders = useGetGenders();

    const filterData: FilterConfig[] = [
        {
            id: "batch",
            title: "Batch",
            filterList: batchNames,
        },
        {
            id: "statuses",
            title: "Status",
            filterList: statuses,
        },
        {
            id: "gender",
            title: "Gender",
            filterList: genders,
        },
    ];
    return filterData;
};

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
