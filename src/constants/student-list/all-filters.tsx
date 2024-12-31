import { FilterConfig } from "@/types/students/students-list-types";
import { useGetBatchNames, useGetSessionExpiry } from "@/hooks/student-list-section/useFilters";
import { useGetStatuses } from "@/hooks/student-list-section/useFilters";
import { useGetGenders } from "@/hooks/student-list-section/useFilters";

export const GetFilterData = (currentSession?: string) => {
    const batchNames = useGetBatchNames(currentSession);
    const statuses = useGetStatuses();
    const genders = useGetGenders();
    const sessionExpiry = useGetSessionExpiry();

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
        {
            id: "session_expiry_days",
            title: "Session Expiry",
            filterList: sessionExpiry.map((days) => `Expiring in ${days} days`),
        },
    ];
    return filterData;
};
