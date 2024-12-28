import { StudentFilterRequest } from "@/schemas/student/student-list/table-schema";

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
    appliedFilters: StudentFilterRequest;
    page: number;
    pageSize: number;
}

// types/students/student-types.ts
export interface Student {
    id: string;
    username: string;
    user_id: string;
    email: string;
    full_name: string;
    address_line: string;
    region: string;
    city: string;
    pin_code: string;
    mobile_number: string;
    date_of_birth: string;
    gender: string;
    father_name: string;
    mother_name: string;
    parents_mobile_number: string;
    parents_email: string;
    linked_institute_name: string;
    created_at: string;
    updated_at: string;
}

export interface StudentListResponse {
    content: Student[];
    page_no: number;
    page_size: number;
    total_elements: number;
    total_pages: number;
    last: boolean;
}

export interface CsvRow {
    [key: string]: string;
}

export interface ValidationError {
    path: [number, string];
    message: string;
    resolution: string;
    currentVal: string;
    format: string;
}

export interface ValidationResult {
    data: CsvRow[];
    errors: ValidationError[];
}

export interface StudentSearchBoxProps {
    searchInput: string;
    searchFilter: string;
    onSearchChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
    onSearchEnter: () => void;
    onClearSearch: () => void;
}

export interface StudentSearchBoxProps {
    searchInput: string;
    searchFilter: string;
    onSearchChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
    onSearchEnter: () => void;
    onClearSearch: () => void;
}
