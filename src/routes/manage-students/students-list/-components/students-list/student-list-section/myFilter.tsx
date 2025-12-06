import { FilterChips } from '@/components/design-system/chips';
import {
    FilterId,
    FilterProps,
} from '@/routes/manage-students/students-list/-types/students-list-types';
import { useEffect, useState } from 'react';

type SelectedFilterListType = Record<string, { id: string; label: string }[]>;

export const Filters = ({
    filterDetails,
    onFilterChange,
    clearFilters,
    filterId,
    columnFilters,
}: FilterProps) => {
    const [selectedFilterList, setSelectedFilterList] = useState<SelectedFilterListType>({});

    // Sync local state with parent columnFilters on mount and when columnFilters change
    useEffect(() => {
        const existingFilter = columnFilters?.find((filter) => filter.id === filterId);
        if (existingFilter) {
            // Deduplicate values when syncing to prevent count mismatch
            const uniqueValues = Array.from(
                new Map(existingFilter.value.map(v => [v.id, v])).values()
            );
            setSelectedFilterList((prev) => ({
                ...prev,
                [filterId]: uniqueValues,
            }));
        } else if (clearFilters) {
            // When clearFilters is true, reset local state
            setSelectedFilterList((prev) => ({
                ...prev,
                [filterId]: [],
            }));
        }
    }, [columnFilters, filterId, clearFilters]);

    const handleSelectDeSelect = (option: { id: string; label: string }) => {
        let updatedValue: { id: string; label: string }[] = [];
        const existingFilter = columnFilters?.find((filter) => filter.id === filterId);

        if (existingFilter) {
            const alreadyExists = existingFilter.value.some((filter) => filter.id === option.id);
            if (alreadyExists) {
                // Remove the option if it exists
                updatedValue = existingFilter.value.filter((filter) => filter.id !== option.id);
            } else {
                // Add the option if it doesn't exist
                updatedValue = [...existingFilter.value, option];
            }
        } else {
            // If no filter exists for this ID, create a new one with just this option
            updatedValue = [option];
        }

        // Update the local state
        setSelectedFilterList((prev) => ({
            ...prev,
            [filterId]: updatedValue,
        }));

        // Notify parent component of the change
        if (onFilterChange) {
            onFilterChange(updatedValue);
        }
    };

    const handleClearFilters = () => {
        setSelectedFilterList((prev) => ({
            ...prev,
            [filterId]: [],
        }));

        if (onFilterChange) {
            onFilterChange([]);
        }
    };

    return (
        <div className="hover:scale-102 group transition-all duration-200">
            <FilterChips
                label={filterDetails.label}
                filterList={filterDetails.filters || []}
                selectedFilters={selectedFilterList[filterId] || []}
                clearFilters={clearFilters}
                handleSelect={handleSelectDeSelect}
                handleClearFilters={handleClearFilters}
            />
        </div>
    );
};
