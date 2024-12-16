// StudentListSection.tsx
import { useEffect, useState } from "react";
import { useNavHeadingStore } from "@/stores/layout-container/useNavHeadingStore";
import { useInstituteQuery } from "@/services/student-list-section/getInstituteDetails";
import { useFilterData, useGetSessions } from "@/hooks/student-list-section/useFilterData";
import { MyTable } from "@/components/design-system/table";
import { MyPagination } from "@/components/design-system/pagination";
import { StudentListHeader } from "./student-list-header";
import { StudentFilters } from "./student-filters";
import { useStudentFilters } from "@/hooks/student-list-section/useStudentFilters";
import { useStudentTable } from "@/hooks/student-list-section/useStudentTable";
import { BulkActions } from "./bulk-actions";
import { OnChangeFn, RowSelectionState } from "@tanstack/react-table";

export const getCurrentSession = (): string => {
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    return `${currentYear}-${currentYear + 1}`;
};

export const StudentsListSection = () => {
    const { setNavHeading } = useNavHeadingStore();
    const { isError, isLoading } = useInstituteQuery();
    const sessions = useGetSessions();
    const filters = useFilterData(getCurrentSession());

    useEffect(() => {
        setNavHeading("Students");
    }, []);

    const {
        columnFilters,
        appliedFilters,
        clearFilters,
        searchInput,
        searchFilter,
        currentSession,
        hasActiveFilters,
        handleFilterChange,
        handleFilterClick,
        handleClearFilters,
        handleSearchInputChange,
        handleSearchEnter,
        handleClearSearch,
        setAppliedFilters,
        handleSessionChange,
    } = useStudentFilters(getCurrentSession());

    const {
        studentTableData,
        isLoading: loadingData,
        error: loadingError,
        page,
        handleSort,
        handlePageChange,
    } = useStudentTable(appliedFilters, setAppliedFilters);

    const [rowSelections, setRowSelections] = useState<Record<number, Record<string, boolean>>>({});

    const handleRowSelectionChange: OnChangeFn<RowSelectionState> = (updaterOrValue) => {
        const newSelection =
            typeof updaterOrValue === "function"
                ? updaterOrValue(rowSelections[page] || {})
                : updaterOrValue;

        setRowSelections((prev) => ({
            ...prev,
            [page]: newSelection,
        }));
    };

    const handleResetSelections = () => {
        setRowSelections({});
    };

    const getSelectedStudentIds = () => {
        return Object.entries(rowSelections)
            .flatMap(([selections]) =>
                Object.entries(selections)
                    .filter(([isSelected]) => isSelected)
                    .map(([index]) => studentTableData?.content[parseInt(index)]?.id),
            )
            .filter(Boolean) as string[];
    };

    const currentPageSelection = rowSelections[page] || {};
    const totalSelectedCount = Object.values(rowSelections).reduce(
        (count, pageSelection) => count + Object.keys(pageSelection).length,
        0,
    );

    if (isLoading) return <div>Loading...</div>;
    if (isError) return <div>Error loading institute details</div>;

    return (
        <section className="flex max-w-full flex-col gap-8 overflow-visible">
            <div className="flex flex-col gap-5">
                <StudentListHeader />
                <StudentFilters
                    currentSession={currentSession} // Now this will work
                    sessions={sessions}
                    filters={filters}
                    searchInput={searchInput}
                    searchFilter={searchFilter}
                    columnFilters={columnFilters}
                    clearFilters={clearFilters}
                    hasActiveFilters={hasActiveFilters()}
                    onSessionChange={handleSessionChange}
                    onSearchChange={handleSearchInputChange}
                    onSearchEnter={handleSearchEnter}
                    onClearSearch={handleClearSearch}
                    onFilterChange={handleFilterChange}
                    onFilterClick={handleFilterClick}
                    onClearFilters={handleClearFilters}
                />
                <div className="max-w-full">
                    <MyTable
                        data={studentTableData}
                        isLoading={loadingData}
                        error={loadingError}
                        onSort={handleSort}
                        rowSelection={currentPageSelection}
                        onRowSelectionChange={handleRowSelectionChange}
                        currentPage={page}
                    />
                </div>
                <div className="flex">
                    <BulkActions
                        selectedCount={totalSelectedCount}
                        selectedStudentIds={getSelectedStudentIds()}
                        onReset={handleResetSelections}
                    />
                    <MyPagination
                        currentPage={page}
                        totalPages={studentTableData?.total_pages || 1}
                        onPageChange={handlePageChange}
                    />
                </div>
            </div>
        </section>
    );
};
