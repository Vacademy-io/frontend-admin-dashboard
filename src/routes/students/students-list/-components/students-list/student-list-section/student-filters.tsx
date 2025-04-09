// components/StudentFilters.tsx
import { MyButton } from "@/components/design-system/button";
import { Export } from "@phosphor-icons/react";
import { Filters } from "./myFilter";
import { StudentSearchBox } from "../../../../../../components/common/student-search-box";
import { StudentFiltersProps } from "@/routes/students/students-list/-types/students-list-types";
import { useMemo } from "react";
import { exportStudentsCsv } from "../../../-services/exportStudentsCsv";
import { exportAccountDetails } from "../../../-services/exportAccountDetails";
import { MyDropdown } from "@/components/common/students/enroll-manually/dropdownForPackageItems";

export const StudentFilters = ({
    currentSession,
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
    totalElements,
    appliedFilters,
    sessionList,
}: StudentFiltersProps) => {
    const isFilterActive = useMemo(() => {
        return getActiveFiltersState();
    }, [columnFilters, searchFilter]);

    const handleExportClick = () => {
        exportStudentsCsv({ pageNo: 0, pageSize: totalElements || 0, filters: appliedFilters });
    };

    const handleExportAccountDetails = () => {
        exportAccountDetails({ pageNo: 0, pageSize: totalElements || 0, filters: appliedFilters });
    };

    return (
        <div className="flex items-start justify-between gap-4">
            <div className="flex w-full flex-col gap-3" id="organize">
                <div className="flex w-full justify-between">
                    <MyDropdown
                        currentValue={currentSession}
                        dropdownList={sessionList}
                        placeholder="Select Session"
                        handleChange={onSessionChange}
                    />
                    <div className="flex items-center gap-4">
                        <MyButton
                            scale="large"
                            buttonType="secondary"
                            layoutVariant="default"
                            onClick={handleExportAccountDetails}
                        >
                            <Export />
                            <div>Export account details</div>
                        </MyButton>
                        <MyButton
                            scale="large"
                            buttonType="secondary"
                            layoutVariant="default"
                            id="export-data"
                            onClick={handleExportClick}
                        >
                            <Export />
                            <div>Export</div>
                        </MyButton>
                    </div>
                </div>
                <div className="flex flex-wrap gap-6 gap-y-3">
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
            </div>
        </div>
    );
};
