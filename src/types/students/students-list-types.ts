export interface StudentListSectionProps {
    filter?: string;
}

export interface FilterProps {
    filterDetails: {
        label: string;
        filters: string[] | number[];
    };
    onFilterChange?: (values: string[]) => void;
    clearFilters?: boolean;
    isAssessment?: boolean;
}

type FilterId = "session" | "batch" | "statuses" | "gender" | "session_expiry_days";

export interface FilterConfig {
    id: FilterId; // Change this line
    title: string;
    filterList: string[] | number[];
}

// export interface Filter {
//     id: string;
//     title: string;
//     filterList: string[];
// }
export interface StudentFiltersProps {
    currentSession: string;
    sessions: string[];
    filters: FilterConfig[];
    searchInput: string;
    searchFilter: string;
    columnFilters: { id: string; value: string[] }[];
    clearFilters: boolean;
    getActiveFiltersState: () => boolean;
    onSessionChange: (session: string) => void;
    onSearchChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
    onSearchEnter: () => void;
    onClearSearch: () => void;
    onFilterChange: (filterId: string, values: string[]) => void;
    onFilterClick: () => void;
    onClearFilters: () => void;
    isAssessment?: boolean;
}

export interface StudentSearchBoxProps {
    searchInput: string;
    searchFilter: string;
    onSearchChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
    onSearchEnter: () => void;
    onClearSearch: () => void;
}
