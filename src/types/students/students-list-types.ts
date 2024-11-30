export interface StudentListSectionProps {
    filter?: string;
}

export interface FilterProps {
    filterDetails: {
        label: string;
        filters: string[];
    };
}
