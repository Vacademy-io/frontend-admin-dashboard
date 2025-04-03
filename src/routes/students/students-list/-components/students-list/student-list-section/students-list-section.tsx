// StudentListSection.tsx
import { useEffect, useState } from "react";
import { useNavHeadingStore } from "@/stores/layout-container/useNavHeadingStore";
import { useInstituteQuery } from "@/services/student-list-section/getInstituteDetails";
import { GetFilterData } from "@/routes/students/students-list/-constants/all-filters";
import { MyTable } from "@/components/design-system/table";
import { MyPagination } from "@/components/design-system/pagination";
import { StudentListHeader } from "./student-list-header";
import { StudentFilters } from "./student-filters";
import { useStudentFilters } from "@/routes/students/students-list/-hooks/useStudentFilters";
import { useStudentTable } from "@/routes/students/students-list/-hooks/useStudentTable";
import { StudentTable } from "@/types/student-table-types";
import { myColumns } from "@/components/design-system/utils/constants/table-column-data";
import { STUDENT_LIST_COLUMN_WIDTHS } from "@/components/design-system/utils/constants/table-layout";
import { BulkActions } from "./bulk-actions/bulk-actions";
import { OnChangeFn, RowSelectionState } from "@tanstack/react-table";
import { useSuspenseQuery } from "@tanstack/react-query";
import { DashboardLoader } from "@/components/core/dashboard-loader";
import RootErrorComponent from "@/components/core/deafult-error";
import { SidebarProvider } from "@/components/ui/sidebar";
import { StudentSidebar } from "../student-side-view/student-side-view";
import useIntroJsTour from "@/hooks/use-intro";
import { IntroKey } from "@/constants/storage/introKey";
import { studentManagementSteps } from "@/constants/intro/steps";
import { EmptyStudentListImage } from "@/assets/svgs";
import { useInstituteDetailsStore } from "@/stores/students/students-list/useInstituteDetailsStore";
import { NoCourseDialog } from "@/components/common/students/no-course-dialog";
import { useSearch } from "@tanstack/react-router";
import { Route } from "@/routes/students/students-list";

export const StudentsListSection = () => {
    const { setNavHeading } = useNavHeadingStore();
    const { isError, isLoading } = useSuspenseQuery(useInstituteQuery());
    const [isOpen, setIsOpen] = useState(false);
    const { getCourseFromPackage } = useInstituteDetailsStore();
    useEffect(() => {
        const courseList = getCourseFromPackage();
        if (courseList.length === 0) {
            setIsOpen(true);
        }
    }, [getCourseFromPackage]);

    useIntroJsTour({
        key: IntroKey.studentManagementFirstTimeVisit,
        steps: studentManagementSteps,
    });

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
        getActiveFiltersState,
        handleFilterChange,
        handleFilterClick,
        handleClearFilters,
        handleSearchInputChange,
        handleSearchEnter,
        handleClearSearch,
        setAppliedFilters,
        handleSessionChange,
    } = useStudentFilters();
    const filters = GetFilterData(currentSession);

    const {
        studentTableData,
        isLoading: loadingData,
        error: loadingError,
        page,
        handleSort,
        handlePageChange,
    } = useStudentTable(appliedFilters, setAppliedFilters);

    const [allPagesData, setAllPagesData] = useState<Record<number, StudentTable[]>>({});
    useEffect(() => {
        if (studentTableData?.content) {
            setAllPagesData((prev) => ({
                ...prev,
                [page]: studentTableData.content,
            }));
        }
    }, [studentTableData?.content, page]);

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

    const getSelectedStudents = (): StudentTable[] => {
        return Object.entries(rowSelections).flatMap(([pageNum, selections]) => {
            const pageData = allPagesData[parseInt(pageNum)];
            if (!pageData) return [];

            return Object.entries(selections)
                .filter(([, isSelected]) => isSelected)
                .map(([index]) => pageData[parseInt(index)])
                .filter((student): student is StudentTable => student !== undefined);
        });
    };

    const getSelectedStudentIds = (): string[] => {
        return getSelectedStudents().map((student) => student.id);
    };

    const currentPageSelection = rowSelections[page] || {};
    const totalSelectedCount = Object.values(rowSelections).reduce(
        (count, pageSelection) => count + Object.keys(pageSelection).length,
        0,
    );

    const { instituteDetails } = useInstituteDetailsStore();
    const search = useSearch({ from: Route.id });

    useEffect(() => {
        if (search.batch && search.package_session_id) {
            console.log("batch to filter: ", search.batch);
            console.log("package session id to filter: ", search.package_session_id);
        }
    }, [search, instituteDetails]);

    if (isLoading) return <DashboardLoader />;
    if (isError) return <RootErrorComponent />;

    return (
        <section className="flex max-w-full flex-col gap-8 overflow-visible">
            <div className="flex flex-col gap-5">
                <StudentListHeader />
                <StudentFilters
                    currentSession={currentSession}
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
                    totalElements={studentTableData?.total_elements || 0}
                />
                {!studentTableData || studentTableData.content.length == 0 ? (
                    <div className="flex w-full flex-col items-center gap-3 text-neutral-600">
                        <EmptyStudentListImage />
                        <p>No student data available</p>
                    </div>
                ) : (
                    <div className="flex flex-col gap-5">
                        <div className="h-auto max-w-full">
                            <div className="max-w-full">
                                <SidebarProvider
                                    style={{ ["--sidebar-width" as string]: "565px" }}
                                    defaultOpen={false}
                                >
                                    <MyTable<StudentTable>
                                        data={studentTableData}
                                        columns={myColumns}
                                        isLoading={loadingData}
                                        error={loadingError}
                                        onSort={handleSort}
                                        columnWidths={STUDENT_LIST_COLUMN_WIDTHS}
                                        rowSelection={currentPageSelection}
                                        onRowSelectionChange={handleRowSelectionChange}
                                        currentPage={page}
                                    />
                                    <StudentSidebar />
                                </SidebarProvider>
                            </div>
                        </div>
                        <div className="flex">
                            <BulkActions
                                selectedCount={totalSelectedCount}
                                selectedStudentIds={getSelectedStudentIds()}
                                selectedStudents={getSelectedStudents()}
                                onReset={handleResetSelections}
                            />
                            <MyPagination
                                currentPage={page}
                                totalPages={studentTableData?.total_pages || 1}
                                onPageChange={handlePageChange}
                            />
                        </div>
                    </div>
                )}
            </div>
            <NoCourseDialog isOpen={isOpen} setIsOpen={setIsOpen} type="Enroll Students" />
        </section>
    );
};
