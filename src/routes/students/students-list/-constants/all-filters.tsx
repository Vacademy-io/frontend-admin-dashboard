import { FilterConfig } from "@/routes/students/students-list/-types/students-list-types";
import {
    useGetBatchNames,
    useGetSessionExpiry,
} from "@/routes/students/students-list/-hooks/useFilters";
import { useGetStatuses } from "@/routes/students/students-list/-hooks/useFilters";
import { useGetGenders } from "@/routes/students/students-list/-hooks/useFilters";

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
