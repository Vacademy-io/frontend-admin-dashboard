// StudentListSection.tsx
import { useEffect } from "react";
import { useNavHeadingStore } from "@/stores/layout-container/useNavHeadingStore";
import { useInstituteQuery } from "@/services/student-list-section/getInstituteDetails";
import { useFilterData, useGetSessions } from "@/hooks/student-list-section/useFilterData";
import { MyTable } from "@/components/design-system/table";
import { MyPagination } from "@/components/design-system/pagination";
import { StudentListHeader } from "./student-list-header";
import { StudentFilters } from "./student-filters";
import { useStudentFilters } from "@/hooks/student-list-section/useStudentFilters";
import { useStudentTable } from "@/hooks/student-list-section/useStudentTable";
import { SidebarProvider } from "@/components/ui/sidebar";
import { StudentSidebar } from "./student-side-view/student-side-view";

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
        refetch,
    } = useStudentTable(appliedFilters, setAppliedFilters);

    useEffect(() => {
        setNavHeading("Students");
        // console.log("columnFilters: ", columnFilters)
        // console.log("hasActiveFilters: ", hasActiveFilters())
        refetch();
    }, []);

    if (isLoading) return <div>Loading...</div>;
    if (isError) return <div>Error loading institute details</div>;

    return (
        <section className="flex max-w-full flex-col gap-8 overflow-visible">
            <div className="flex flex-col gap-5">
                <StudentListHeader onEnrollClick={() => {}} />
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
                    <div className="max-w-full">
                        <SidebarProvider style={{ ["--sidebar-width" as string]: "565px" }}>
                            <MyTable
                                data={studentTableData}
                                isLoading={loadingData}
                                error={loadingError}
                                onSort={handleSort}
                            />
                            <StudentSidebar />
                        </SidebarProvider>
                    </div>
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
