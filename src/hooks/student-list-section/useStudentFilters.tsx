import { useState, useEffect } from "react";
import { StudentFilterRequest } from "@/schemas/student/student-list/table-schema";
import { INSTITUTE_ID } from "@/constants/urls";
import { usePackageSessionIds } from "./getPackageSessionId";

export const useStudentFilters = (initialSession: string) => {
    const [currentSession, setCurrentSession] = useState(initialSession);
    const [columnFilters, setColumnFilters] = useState<{ id: string; value: string[] }[]>([]);
    const [searchInput, setSearchInput] = useState<string>("");
    const [searchFilter, setSearchFilter] = useState("");
    const [clearFilters, setClearFilters] = useState<boolean>(false);

    const currentPackageSessionIds = usePackageSessionIds(
        currentSession,
        columnFilters.find((filter) => filter.id === "batch")?.value,
    );

    const [appliedFilters, setAppliedFilters] = useState<StudentFilterRequest>({
        name: "",
        institute_ids: [INSTITUTE_ID],
        package_session_ids: currentPackageSessionIds,
        group_ids: [],
        gender: [],
        statuses: [],
        sort_columns: {},
    });

    useEffect(() => {
        setAppliedFilters((prev) => ({
            ...prev,
            package_session_ids: currentPackageSessionIds,
        }));
    }, [currentSession, currentPackageSessionIds]);

    useEffect(() => {
        if (columnFilters.length === 0) {
            setClearFilters(false);
        }
    }, [columnFilters.length]);

    const handleSessionChange = (session: string) => {
        setCurrentSession(session);
        setColumnFilters((prev) => prev.filter((f) => f.id !== "batch"));

        const sessionUpdatedFilters = {
            ...appliedFilters,
            package_session_ids: [], // Initially set empty array
        };

        setAppliedFilters(sessionUpdatedFilters);
    };

    const handleFilterChange = (filterId: string, values: string[]) => {
        setColumnFilters((prev) => {
            const existing = prev.filter((f) => f.id !== filterId);
            if (values.length === 0) return existing;
            return [...existing, { id: filterId, value: values }];
        });
    };

    const handleFilterClick = async () => {
        const newAppliedFilters: StudentFilterRequest = {
            name: searchFilter,
            institute_ids: [INSTITUTE_ID],
            package_session_ids: currentPackageSessionIds,
            group_ids: [],
            gender: columnFilters.find((filter) => filter.id === "gender")?.value || [],
            statuses: columnFilters.find((filter) => filter.id === "statuses")?.value || [],
            sort_columns: appliedFilters.sort_columns,
        };
        setAppliedFilters(newAppliedFilters);
    };

    const handleClearFilters = async () => {
        setClearFilters(true);
        setColumnFilters([]);
        setSearchFilter("");
        setSearchInput("");

        const clearedFilters: StudentFilterRequest = {
            name: "",
            institute_ids: [INSTITUTE_ID],
            package_session_ids: currentPackageSessionIds,
            group_ids: [],
            gender: [],
            statuses: [],
            sort_columns: appliedFilters.sort_columns,
        };
        setAppliedFilters(clearedFilters);
    };

    const handleSearchInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSearchInput(event.target.value);
    };

    const handleSearchEnter = async () => {
        setSearchFilter(searchInput);
        setAppliedFilters((prev) => ({
            ...prev,
            name: searchInput,
        }));
    };

    const handleClearSearch = async () => {
        setSearchInput("");
        setSearchFilter("");
        setAppliedFilters((prev) => ({
            ...prev,
            name: "",
        }));
    };

    const hasActiveFilters = () => {
        const hasBatch = !!(
            columnFilters.find((filter) => filter.id === "batch")?.value?.length ?? 0 > 0
        );
        const hasName = !!(appliedFilters.name && appliedFilters.name.trim() !== "");
        const hasGender = !!(
            Array.isArray(appliedFilters.gender) && appliedFilters.gender.length > 0
        );
        const hasStatus = !!(
            Array.isArray(appliedFilters.statuses) && appliedFilters.statuses.length > 0
        );

        // console.log("Filter Status:", {
        //     hasName,
        //     hasGender,
        //     hasStatus,
        //     hasBatch,
        //     columnFilters,
        //     appliedFilters,
        // });

        return hasName || hasGender || hasStatus || hasBatch;
    };

    return {
        columnFilters,
        appliedFilters,
        clearFilters,
        searchInput,
        searchFilter,
        currentSession,
        hasActiveFilters,
        handleFilterChange,
        handleFilterClick,
        handleClearFilters,
        handleSearchInputChange,
        handleSearchEnter,
        handleClearSearch,
        setAppliedFilters,
        handleSessionChange,
    };
};
