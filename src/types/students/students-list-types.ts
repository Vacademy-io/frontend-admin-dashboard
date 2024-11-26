export interface StudentListSectionProps {
    filter?: string;
}

export interface myDropDownProps {
    currentValue: string;
    setCurrentValue: React.Dispatch<React.SetStateAction<string>>;
    dropdownList: string[];
}

export interface FilterProps {
    filterDetails: {
        label: string;
        filters: string[];
    };
}
