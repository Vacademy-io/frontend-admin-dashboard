export interface StudentListSectionProps {
    filter?: string;
}

export interface FilterProps {
    filterDetails: {
        label: string;
        filters: string[];
    };
    onFilterChange?: (values: string[]) => void;
    clearFilters?: boolean;
}

type FilterId = "session" | "batch" | "statuses" | "gender";

export interface FilterConfig {
    id: FilterId; // Change this line
    title: string;
    filterList: string[];
}

export interface Filter {
    id: string;
    title: string;
    filterList: string[];
}
export interface StudentFiltersProps {
    currentSession: string;
    sessions: string[];
    filters: Filter[];
    searchInput: string;
    searchFilter: string;
    columnFilters: { id: string; value: string[] }[];
    clearFilters: boolean;
    hasActiveFilters: boolean;
    onSessionChange: (session: string) => void;
    onSearchChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
    onSearchEnter: () => void;
    onClearSearch: () => void;
    onFilterChange: (filterId: string, values: string[]) => void;
    onFilterClick: () => void;
    onClearFilters: () => void;
}
