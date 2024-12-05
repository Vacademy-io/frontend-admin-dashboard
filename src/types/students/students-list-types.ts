export interface StudentListSectionProps {
    filter?: string;
}

export type PageFilters = {
    session?: string[];
    batch?: string[];
    status?: string[];
    gender?: string[];
    session_expiry?: string[];
};
export interface FilterProps {
    filterDetails: {
        label: string;
        filters: string[];
    };
    onFilterChange?: (values: string[]) => void;
    clearFilters?: boolean;
}
