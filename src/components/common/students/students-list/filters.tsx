import { FilterChips } from "@/components/design-system/chips";
import { FilterProps } from "@/types/students/students-list-types";
import { useState } from "react";

export const Filters = ({ filterDetails }: FilterProps) => {
    const [selectedFilters, setSelectedFilters] = useState<string[]>([]);

    return (
        <FilterChips
            label={filterDetails.label}
            filterList={filterDetails.filters}
            selectedFilters={selectedFilters}
            setSelectedFilters={setSelectedFilters}
        ></FilterChips>
    );
};
