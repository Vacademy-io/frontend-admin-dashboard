import { FilterChips } from "@/components/design-system/chips";
import { FilterProps } from "@/types/students/students-list-types";
import { useState, useEffect } from "react";

export const Filters = ({
    filterDetails,
    onFilterChange,
}: FilterProps & { onFilterChange: (values: string[]) => void }) => {
    const [selectedFilters, setSelectedFilters] = useState<string[]>([]);

    useEffect(() => {
        onFilterChange(selectedFilters);
    }, [selectedFilters, onFilterChange]);

    return (
        <FilterChips
            label={filterDetails.label}
            filterList={filterDetails.filters}
            selectedFilters={selectedFilters}
            setSelectedFilters={setSelectedFilters}
        ></FilterChips>
    );
};
