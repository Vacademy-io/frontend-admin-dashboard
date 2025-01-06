import { FilterChips } from "@/components/design-system/chips";
import { FilterProps } from "@/types/students/students-list-types";
import { useState, useEffect } from "react";

export const Filters = ({
    filterDetails,
    onFilterChange,
    clearFilters,
    isAssessment,
}: FilterProps) => {
    const [selectedFilters, setSelectedFilters] = useState<string[]>([]);

    console.log(selectedFilters);
    useEffect(() => {
        if (onFilterChange) {
            // If this is a session expiry filter, extract only the numbers
            if (filterDetails.label === "Session Expiry") {
                const processedValues = selectedFilters.map((filter) => {
                    const numberMatch = filter.match(/\d+/);
                    return numberMatch ? numberMatch[0] : filter;
                });
                onFilterChange(processedValues);
            } else {
                onFilterChange(selectedFilters);
            }
        }
    }, [selectedFilters, filterDetails.label]);

    useEffect(() => {
        if (onFilterChange && isAssessment) {
            // If this is a session expiry filter, extract only the numbers
            if (filterDetails.label === "Session Expiry") {
                const processedValues = selectedFilters.map((filter) => {
                    const numberMatch = filter.match(/\d+/);
                    return numberMatch ? numberMatch[0] : filter;
                });
                onFilterChange(processedValues);
            } else {
                onFilterChange(selectedFilters);
            }
        }
    }, [selectedFilters, filterDetails.label]);

    return (
        <FilterChips
            label={filterDetails.label}
            filterList={filterDetails.filters}
            selectedFilters={selectedFilters}
            setSelectedFilters={setSelectedFilters}
            clearFilters={clearFilters}
        />
    );
};
