import { FilterChips } from "@/components/design-system/chips";
import { FilterProps } from "@/types/students/students-list-types";
import { useState, useEffect } from "react";

export const Filters = ({ filterDetails, onFilterChange, clearFilters }: FilterProps) => {
    const [selectedFilters, setSelectedFilters] = useState<string[]>([]);

    useEffect(() => {
        if (onFilterChange) {
            onFilterChange(selectedFilters);
        }
    }, [selectedFilters, onFilterChange]);

    return (
        <FilterChips
            label={filterDetails.label}
            filterList={filterDetails.filters}
            selectedFilters={selectedFilters}
            setSelectedFilters={setSelectedFilters}
            clearFilters={clearFilters}
        ></FilterChips>
    );
};
