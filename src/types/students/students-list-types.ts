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

type FilterId = "session" | "batch" | "status" | "gender";

export interface FilterConfig {
    id: FilterId; // Change this line
    title: string;
    filterList: string[];
}
