// components/StudentFilters.tsx
import { MyButton } from "@/components/design-system/button";
import { MyDropdown } from "@/components/design-system/dropdown";
import { Export } from "@phosphor-icons/react";
import { Filters } from "./myFilter";
import { StudentSearchBox } from "./student-search-box";
import { StudentFiltersProps } from "@/types/students/students-list-types";
import { useMemo } from "react";

export const StudentFilters = ({
    currentSession,
    sessions,
    filters,
    searchInput,
    searchFilter,
    columnFilters,
    clearFilters,
    getActiveFiltersState,
    onSessionChange,
    onSearchChange,
    onSearchEnter,
    onClearSearch,
    onFilterChange,
    onFilterClick,
    onClearFilters,
}: StudentFiltersProps) => {
    const isFilterActive = useMemo(() => {
        return getActiveFiltersState();
    }, [columnFilters, searchFilter]);
    return (
        <div className="flex items-start justify-between">
            <div className="flex flex-wrap items-center gap-6 gap-y-4">
                <div className="flex items-center gap-2">
                    <div className="text-title">Session</div>
                    <MyDropdown
                        currentValue={currentSession}
                        handleChange={onSessionChange}
                        dropdownList={sessions}
                    />
                </div>

                <StudentSearchBox
                    searchInput={searchInput}
                    searchFilter={searchFilter}
                    onSearchChange={onSearchChange}
                    onSearchEnter={onSearchEnter}
                    onClearSearch={onClearSearch}
                />

                {filters.map((filter) => (
                    <Filters
                        key={filter.id}
                        filterDetails={{
                            label: filter.title,
                            filters: filter.filterList,
                        }}
                        onFilterChange={(values) => onFilterChange(filter.id, values)}
                        clearFilters={clearFilters}
                    />
                ))}

                {(columnFilters.length > 0 || isFilterActive) && (
                    <div className="flex flex-wrap items-center gap-6">
                        <MyButton
                            buttonType="primary"
                            scale="small"
                            layoutVariant="default"
                            className="h-8"
                            onClick={onFilterClick}
                        >
                            Filter
                        </MyButton>
                        <MyButton
                            buttonType="secondary"
                            scale="small"
                            layoutVariant="default"
                            className="h-8 border border-neutral-400 bg-neutral-200 hover:border-neutral-500 hover:bg-neutral-300 active:border-neutral-600 active:bg-neutral-400"
                            onClick={onClearFilters}
                        >
                            Reset
                        </MyButton>
                    </div>
                )}
            </div>
            <MyButton scale="large" buttonType="secondary" layoutVariant="default">
                <Export />
                <div>Export</div>
            </MyButton>
        </div>
    );
};
