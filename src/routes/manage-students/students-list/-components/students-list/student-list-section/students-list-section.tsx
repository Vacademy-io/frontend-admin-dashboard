// StudentListSection.tsx
import { useEffect, useState, useRef } from 'react';
import { useNavHeadingStore } from '@/stores/layout-container/useNavHeadingStore';
import { useInstituteQuery } from '@/services/student-list-section/getInstituteDetails';
import { GetFilterData } from '@/routes/manage-students/students-list/-constants/all-filters';
import { MyTable } from '@/components/design-system/table';
import { MyPagination } from '@/components/design-system/pagination';
import { StudentListHeader } from './student-list-header';
import { StudentFilters } from './student-filters';
import { useStudentFilters } from '@/routes/manage-students/students-list/-hooks/useStudentFilters';
import { useStudentTable } from '@/routes/manage-students/students-list/-hooks/useStudentTable';
import { StudentTable } from '@/types/student-table-types';
import { myColumns } from '@/components/design-system/utils/constants/table-column-data';
import { STUDENT_LIST_COLUMN_WIDTHS } from '@/components/design-system/utils/constants/table-layout';
import { BulkActions } from './bulk-actions/bulk-actions';
import { OnChangeFn, RowSelectionState } from '@tanstack/react-table';
import { useQuery } from '@tanstack/react-query';
import { DashboardLoader, ErrorBoundary } from '@/components/core/dashboard-loader';
import RootErrorComponent from '@/components/core/deafult-error';
import { SidebarProvider } from '@/components/ui/sidebar';
import { StudentSidebar } from '../student-side-view/student-side-view';
import useIntroJsTour from '@/hooks/use-intro';
import { IntroKey } from '@/constants/storage/introKey';
import { studentManagementSteps } from '@/constants/intro/steps';
import { EmptyStudentListImage } from '@/assets/svgs';
import { useInstituteDetailsStore } from '@/stores/students/students-list/useInstituteDetailsStore';
import { NoCourseDialog } from '@/components/common/students/no-course-dialog';
import { useSearch } from '@tanstack/react-router';
import { Route } from '@/routes/manage-students/students-list';
import { useUsersCredentials } from '../../../-services/usersCredentials';
import { DropdownItemType } from '@/components/common/students/enroll-manually/dropdownTypesForPackageItems';
import { ShareCredentialsDialog } from './bulk-actions/share-credentials-dialog';
import { IndividualShareCredentialsDialog } from './bulk-actions/individual-share-credentials-dialog';
import { InviteFormProvider } from '@/routes/manage-students/invite/-context/useInviteFormContext';
import { Users, FileMagnifyingGlass } from '@phosphor-icons/react';

export const StudentsListSection = () => {
    const { setNavHeading } = useNavHeadingStore();
    const { isError, isLoading } = useQuery(useInstituteQuery());
    const [isOpen, setIsOpen] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const { getCourseFromPackage, instituteDetails, getDetailsFromPackageSessionId } =
        useInstituteDetailsStore();
    const tableRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                tableRef.current &&
                !tableRef.current.contains(event.target as Node) &&
                isSidebarOpen
            ) {
                setIsSidebarOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isSidebarOpen]);

    useEffect(() => {
        const courseList = getCourseFromPackage();
        if (courseList.length === 0) {
            setIsOpen(true);
        }
    }, [instituteDetails]);

    useIntroJsTour({
        key: IntroKey.studentManagementFirstTimeVisit,
        steps: studentManagementSteps,
    });

    useEffect(() => {
        setNavHeading('Students');
    }, []);

    const {
        columnFilters,
        appliedFilters,
        clearFilters,
        searchInput,
        searchFilter,
        currentSession,
        sessionList,
        getActiveFiltersState,
        handleFilterChange,
        handleFilterClick,
        handleClearFilters,
        handleSearchInputChange,
        handleSearchEnter,
        handleClearSearch,
        setAppliedFilters,
        handleSessionChange,
        setColumnFilters,
    } = useStudentFilters();

    const filters = GetFilterData(instituteDetails, currentSession.id);

    const search = useSearch({ from: Route.id });

    const {
        studentTableData,
        isLoading: loadingData,
        error: loadingError,
        page,
        handleSort,
        handlePageChange,
    } = useStudentTable(
        appliedFilters,
        setAppliedFilters,
        search.package_session_id ? [search.package_session_id] : null
    );

    const getUserCredentialsMutation = useUsersCredentials();

    async function getCredentials() {
        const ids = studentTableData?.content.map((student: StudentTable) => student.user_id);
        if (!ids || ids.length === 0) {
            return;
        }
        const credentials = await getUserCredentialsMutation.mutateAsync({ userIds: ids || [] });
        return credentials;
    }

    useEffect(() => {
        async function fetchCredentials() {
            if (studentTableData?.content && studentTableData.content.length > 0) {
                await getCredentials();
            }
        }
        fetchCredentials();
    }, [studentTableData]);

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
            typeof updaterOrValue === 'function'
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
        0
    );

    useEffect(() => {
        if (search.batch && search.package_session_id) {
            const details = getDetailsFromPackageSessionId({
                packageSessionId: search.package_session_id,
            });
            const batchName =
                (details?.level.level_name || '') + (details?.package_dto.package_name || '');
            setColumnFilters((prev) => [
                ...prev,
                {
                    id: 'batch',
                    value: [
                        {
                            id: search.package_session_id || '',
                            label: batchName,
                        },
                    ],
                },
            ]);
            setAppliedFilters((prev) => ({
                ...prev,
                package_session_ids: search.package_session_id
                    ? [search.package_session_id]
                    : undefined,
            }));
            const session: DropdownItemType = {
                id: details?.session.id || '',
                name: details?.session.session_name || '',
            };
            handleSessionChange(session);
        }
    }, [search, instituteDetails]);

    if (isLoading) return <DashboardLoader />;
    if (isError) return <RootErrorComponent />;

    // Enhanced empty state component
    const EmptyState = () => (
        <div className="flex flex-col items-center justify-center py-16 px-4 text-center animate-fadeIn">
            <div className="mb-6 p-6 rounded-full bg-gradient-to-br from-neutral-100 to-neutral-200 shadow-inner">
                <EmptyStudentListImage className="w-16 h-16 opacity-50" />
            </div>
            <h3 className="text-xl font-semibold text-neutral-700 mb-3">No Students Found</h3>
            <p className="text-sm text-neutral-500 mb-6 max-w-md leading-relaxed">
                No student data matches your current filters. Try adjusting your search criteria or add new students to get started.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 items-center">
                <InviteFormProvider>
                    <button className="group flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-lg hover:from-primary-600 hover:to-primary-700 transition-all duration-200 hover:scale-105 shadow-md">
                        <Users className="size-4 group-hover:scale-110 transition-transform duration-200" />
                        Invite Students
                    </button>
                </InviteFormProvider>
                <button 
                    onClick={handleClearFilters}
                    className="group flex items-center gap-2 px-4 py-2 bg-neutral-100 text-neutral-700 rounded-lg hover:bg-neutral-200 transition-all duration-200 hover:scale-105"
                >
                    <FileMagnifyingGlass className="size-4 group-hover:scale-110 transition-transform duration-200" />
                    Clear Filters
                </button>
            </div>
        </div>
    );

    return (
        <ErrorBoundary>
            <section className="flex max-w-full flex-col gap-6 overflow-visible animate-fadeIn">
                <div className="flex flex-col gap-5">
                    <InviteFormProvider>
                        <StudentListHeader currentSession={currentSession} />
                    </InviteFormProvider>
                    
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
                        sessionList={sessionList}
                    />

                    {loadingData ? (
                        <div className="flex w-full flex-col items-center gap-4 py-12">
                            <DashboardLoader />
                            <p className="text-sm text-neutral-500 animate-pulse">Loading student data...</p>
                        </div>
                    ) : !studentTableData || studentTableData.content.length == 0 ? (
                        <EmptyState />
                    ) : (
                        <div className="flex flex-col gap-4 animate-slideInRight">
                            {/* Modern table container */}
                            <div className="bg-gradient-to-br from-white to-neutral-50/30 rounded-xl border border-neutral-200/50 shadow-sm overflow-hidden">
                                <div className="max-w-full" ref={tableRef}>
                                    <SidebarProvider
                                        style={{ ['--sidebar-width' as string]: '565px' }}
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

                            {/* Enhanced footer with bulk actions and pagination */}
                            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-4 bg-gradient-to-r from-neutral-50/50 to-white rounded-lg border border-neutral-200/50">
                                <BulkActions
                                    selectedCount={totalSelectedCount}
                                    selectedStudentIds={getSelectedStudentIds()}
                                    selectedStudents={getSelectedStudents()}
                                    onReset={handleResetSelections}
                                />
                                <div className="flex justify-center lg:justify-end">
                                    <MyPagination
                                        currentPage={page}
                                        totalPages={studentTableData?.total_pages || 1}
                                        onPageChange={handlePageChange}
                                    />
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                <NoCourseDialog
                    isOpen={isOpen}
                    setIsOpen={setIsOpen}
                    type="Enroll Students"
                    content="You need to create a course and add a subject in it before"
                />
                <ShareCredentialsDialog />
                <IndividualShareCredentialsDialog />
            </section>
        </ErrorBoundary>
    );
};
