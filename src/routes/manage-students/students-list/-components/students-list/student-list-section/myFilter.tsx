import { FilterChips } from '@/components/design-system/chips';
import { FilterProps } from '@/routes/manage-students/students-list/-types/students-list-types';
import { useEffect } from 'react';
import { useStudentFiltersContext } from '../../../-context/StudentFiltersContext';

export const Filters = ({ filterDetails, onFilterChange, clearFilters, id }: FilterProps) => {
    const { selectedFilterList, setSelectedFilterList } = useStudentFiltersContext();

    const handleSelect = (option: { id: string; label: string }) => {
        setSelectedFilterList((prev) => ({
            ...prev,
            [id]: [...prev[id], option],
        }));
    };

    const handleClearFilters = () => {
        setSelectedFilterList((prev) => ({
            ...prev,
            [id]: [],
        }));
    };

    useEffect(() => {
        if (onFilterChange) {
            // If this is a session expiry filter, extract only the numbers
            if (filterDetails.label === 'Session Expiry') {
                const processedValues = selectedFilterList[id].map((filter) => {
                    const numberMatch = filter.label.match(/\d+/);
                    return numberMatch ? { id: filter.id, label: numberMatch[0] } : filter;
                });
                onFilterChange(processedValues);
            } else {
                onFilterChange(selectedFilterList[id]);
            }
            // This block is duplicated and can be removed
        }
    }, [selectedFilterList[id], filterDetails.label]);

    return (
        <FilterChips
            label={filterDetails.label}
            filterList={filterDetails.filters}
            selectedFilters={selectedFilterList[id]}
            clearFilters={clearFilters}
            handleSelect={handleSelect}
            handleClearFilters={handleClearFilters}
        />
    );
};
