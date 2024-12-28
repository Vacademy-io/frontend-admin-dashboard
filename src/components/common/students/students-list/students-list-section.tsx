// StudentListSection.tsx
import { useEffect } from "react";
import { useNavHeadingStore } from "@/stores/layout-container/useNavHeadingStore";
import { useInstituteQuery } from "@/services/student-list-section/getInstituteDetails";
import { useGetSessions } from "@/hooks/student-list-section/useFilters";
import { GetFilterData } from "@/constants/student-list/all-filters";
import { MyTable } from "@/components/design-system/table";
import { MyPagination } from "@/components/design-system/pagination";
import { StudentListHeader } from "./student-list-header";
import { StudentFilters } from "./student-filters";
import { useStudentFilters } from "@/hooks/student-list-section/useStudentFilters";
import { useStudentTable } from "@/hooks/student-list-section/useStudentTable";
import { useSuspenseQuery } from "@tanstack/react-query";

export const getCurrentSession = (): string => {
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    return `${currentYear}-${currentYear + 1}`;
};

export const StudentsListSection = () => {
    const { setNavHeading } = useNavHeadingStore();
    const { isError, isLoading } = useSuspenseQuery(useInstituteQuery());
    const sessions = useGetSessions();
    const filters = GetFilterData(getCurrentSession());

    const {
        columnFilters,
        appliedFilters,
        clearFilters,
        searchInput,
        searchFilter,
        currentSession,
        getActiveFiltersState,
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

    useEffect(() => {
        setNavHeading("Students");
        // console.log("columnFilters: ", columnFilters)
        // console.log("hasActiveFilters: ", hasActiveFilters())
    }, []);

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
                    getActiveFiltersState={getActiveFiltersState}
                    onSessionChange={handleSessionChange}
                    onSearchChange={handleSearchInputChange}
                    onSearchEnter={handleSearchEnter}
                    onClearSearch={handleClearSearch}
                    onFilterChange={handleFilterChange}
                    onFilterClick={handleFilterClick}
                    onClearFilters={handleClearFilters}
                    appliedFilters={appliedFilters}
                    page={page}
                    pageSize={10}
                />
                <div className="max-w-full">
                    <MyTable
                        data={studentTableData}
                        isLoading={loadingData}
                        error={loadingError}
                        onSort={handleSort}
                    />
                </div>
                <MyPagination
                    currentPage={page}
                    totalPages={studentTableData?.total_pages || 1}
                    onPageChange={handlePageChange}
                />
            </div>
        </section>
    );
};
