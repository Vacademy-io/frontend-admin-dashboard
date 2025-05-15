import { useStudentFilters } from '@/routes/manage-students/students-list/-hooks/useStudentFilters';
import { useStudentTable } from '@/routes/manage-students/students-list/-hooks/useStudentTable';
// import { useSearch } from '@tanstack/react-router';
// import { Route } from '@/routes/manage-students/students-list';
// import { InviteFormProvider } from '@/routes/manage-students/invite/-context/useInviteFormContext';
// import { StudentListHeader } from '@/routes/manage-students/students-list/-components/students-list/student-list-section/student-list-header';
import { DashboardLoader } from '@/components/core/dashboard-loader';
import { EmptyStudentListImage } from '@/assets/svgs';
import { SidebarProvider } from '@/components/ui/sidebar';
import { MyTable } from '@/components/design-system/table';
import { StudentTable } from '@/types/student-table-types';
import { StudentSidebar } from '@/routes/manage-students/students-list/-components/students-list/student-side-view/student-side-view';
import { MyPagination } from '@/components/design-system/pagination';
import { IndividualShareCredentialsDialog } from '@/routes/manage-students/students-list/-components/students-list/student-list-section/bulk-actions/individual-share-credentials-dialog';
// import { useSuspenseQuery } from '@tanstack/react-query';
// import { useInstituteQuery } from '@/services/student-list-section/getInstituteDetails';
// import { useRef, useState } from 'react';
// import { useInstituteDetailsStore } from '@/stores/students/students-list/useInstituteDetailsStore';
import { myColumns } from '@/components/design-system/utils/constants/table-column-data';
import { STUDENT_LIST_COLUMN_WIDTHS } from '@/components/design-system/utils/constants/table-layout';
import { OnChangeFn, RowSelectionState } from '@tanstack/react-table';
import { EnrollStudentsButton } from '@/components/common/students/enroll-students-button';
import { BulkDialogProvider } from '@/routes/manage-students/students-list/-providers/bulk-dialog-provider';
import { useRef, useState } from 'react';

const Students = ({ packageSessionId }: { packageSessionId: string }) => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [rowSelections, setRowSelections] = useState<Record<number, Record<string, boolean>>>({});
    const tableRef = useRef<HTMLDivElement>(null);
    const {
        // columnFilters,
        appliedFilters,
        // clearFilters,
        // searchInput,
        // searchFilter,
        // currentSession,
        // sessionList,
        // getActiveFiltersState,
        // handleFilterChange,
        // handleFilterClick,
        // handleClearFilters,
        // handleSearchInputChange,
        // handleSearchEnter,
        // handleClearSearch,
        setAppliedFilters,
        // handleSessionChange,
        // setColumnFilters,
    } = useStudentFilters();
    const {
        studentTableData,
        isLoading: loadingData,
        error: loadingError,
        page,
        handleSort,
        handlePageChange,
    } = useStudentTable(appliedFilters, setAppliedFilters, [packageSessionId]);

    const handleRowSelectionChange: OnChangeFn<RowSelectionState> = (updaterOrValue) => {
        const newSelection =
            typeof updaterOrValue === 'function'
                ? updaterOrValue(rowSelections[page] || {})
                : updaterOrValue;

        setRowSelections((prev) => ({
            ...prev,
            [page]: newSelection,
        }));
    };
    const currentPageSelection = rowSelections[page] || {};

    return (
        <section className="flex  flex-col">
            <div className="flex flex-col gap-4 ">
                {/* <InviteFormProvider> */}
                <BulkDialogProvider>
                    <EnrollStudentsButton scale="medium" />
                </BulkDialogProvider>
                {/* </InviteFormProvider> */}
                {/* Filter section here */}
                {loadingData ? (
                    <div className="flex w-full flex-col items-center gap-3 text-neutral-600">
                        <DashboardLoader />
                    </div>
                ) : !studentTableData || studentTableData.content.length == 0 ? (
                    <div className="flex w-full flex-col items-center gap-3 text-neutral-600">
                        <EmptyStudentListImage />
                        <p>No student data available</p>
                    </div>
                ) : (
                    <div className="flex w-auto flex-col gap-5">
                        <div className="relative flex h-auto">
                            <div className="overflow-hidden" ref={tableRef}>
                                <SidebarProvider
                                    style={{ ['--sidebar-width' as string]: '500px' }}
                                    defaultOpen={false}
                                    open={isSidebarOpen}
                                    onOpenChange={setIsSidebarOpen}
                                >
                                    <MyTable<StudentTable>
                                        data={{
                                            content: studentTableData.content.map((student) => ({
                                                ...student,
                                                id: student.user_id,
                                            })),
                                            total_pages: studentTableData.total_pages,
                                            page_no: studentTableData.page_no,
                                            page_size: studentTableData.page_size,
                                            total_elements: studentTableData.total_elements,
                                            last: studentTableData.last,
                                        }}
                                        columns={myColumns}
                                        isLoading={loadingData}
                                        error={loadingError}
                                        onSort={handleSort}
                                        columnWidths={STUDENT_LIST_COLUMN_WIDTHS}
                                        rowSelection={currentPageSelection}
                                        onRowSelectionChange={handleRowSelectionChange}
                                        currentPage={page}
                                        scrollable={false} // Change this to false to prevent horizontal scrolling
                                        className="w-full" // Add this to ensure table takes full width
                                    />
                                    <div>
                                        <StudentSidebar
                                            selectedTab={'ENDED,PENDING,LIVE'}
                                            examType={'EXAM'}
                                            isStudentList={true}
                                        />
                                    </div>
                                </SidebarProvider>
                            </div>
                        </div>
                        <div className="flex">
                            {/* <BulkActions
                                selectedCount={totalSelectedCount}
                                selectedStudentIds={getSelectedStudentIds()}
                                selectedStudents={getSelectedStudents()}
                                onReset={handleResetSelections}
                            /> */}
                            <MyPagination
                                currentPage={page}
                                totalPages={studentTableData?.total_pages || 1}
                                onPageChange={handlePageChange}
                            />
                        </div>
                    </div>
                )}
            </div>
            <IndividualShareCredentialsDialog />
        </section>
    );
};

export default Students;
