import { useState, useEffect, useCallback } from "react";
import { StudentFilterRequest } from "@/schemas/student-list/table-schema";
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
        session_expiry_days: [],
        sort_columns: {},
    });

    useEffect(() => {
        if (currentSession) {
            setAppliedFilters((prev) => ({
                ...prev,
                package_session_ids: currentPackageSessionIds,
            }));
        }
    }, [currentSession]);

    useEffect(() => {
        if (columnFilters.length === 0) {
            setClearFilters(false);
        }
    }, [columnFilters.length]);

    const handleSessionChange = (session: string) => {
        setCurrentSession(session);
        setColumnFilters((prev) => prev.filter((f) => f.id !== "batch"));

        setAppliedFilters((prev) => ({
            ...prev,
            package_session_ids: [], // Initially set empty array
        }));
    };

    const handleFilterChange = (filterId: string, values: string[]) => {
        setColumnFilters((prev) => {
            const existing = prev.filter((f) => f.id !== filterId);
            if (values.length === 0) return existing;
            return [...existing, { id: filterId, value: values }];
        });
    };

    const handleFilterClick = async () => {
        // Extract the number from "Expiring in X days" format
        const sessionExpiryFilter = columnFilters.find(
            (filter) => filter.id === "session_expiry_days",
        );
        const sessionExpiryDays = sessionExpiryFilter?.value.map((value) => {
            const numberMatch = value.match(/\d+/);
            return numberMatch ? parseInt(numberMatch[0]) : 0;
        });

        setAppliedFilters((prev) => ({
            ...prev,
            name: searchFilter,
            package_session_ids: currentPackageSessionIds,
            gender: columnFilters.find((filter) => filter.id === "gender")?.value || [],
            statuses: columnFilters.find((filter) => filter.id === "statuses")?.value || [],
            session_expiry_days: sessionExpiryDays || [],
        }));
    };

    const handleClearFilters = async () => {
        setClearFilters(true);
        setColumnFilters([]);
        setSearchFilter("");
        setSearchInput("");

        setAppliedFilters((prev) => ({
            ...prev,
            name: "",
            package_session_ids: currentPackageSessionIds,
            gender: [],
            statuses: [],
            session_expiry_days: [], // Add this line
        }));
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

    const getActiveFiltersState = useCallback(() => {
        const batchFilter = columnFilters.find((filter) => filter.id === "batch");
        const sessionExpiryFilter = columnFilters.find(
            (filter) => filter.id === "session_expiry_days",
        );

        const hasBatch = Boolean(batchFilter?.value && batchFilter.value.length > 0);
        const hasName = Boolean(appliedFilters.name?.trim());
        const hasGender = Array.isArray(appliedFilters.gender) && appliedFilters.gender.length > 0;
        const hasStatus =
            Array.isArray(appliedFilters.statuses) && appliedFilters.statuses.length > 0;
        const hasSessionExpiry = Boolean(
            sessionExpiryFilter?.value && sessionExpiryFilter.value.length > 0,
        );

        console.log("Filter Status Check:", {
            hasBatch,
            hasName,
            hasGender,
            hasStatus,
            hasSessionExpiry,
        });

        return Boolean(hasName || hasGender || hasStatus || hasBatch || hasSessionExpiry);
    }, [columnFilters, appliedFilters]);

    return {
        columnFilters,
        appliedFilters,
        clearFilters,
        searchInput,
        searchFilter,
        currentSession,
        getActiveFiltersState,
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
