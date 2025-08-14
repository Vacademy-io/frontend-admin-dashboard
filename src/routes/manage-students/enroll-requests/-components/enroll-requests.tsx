import { MyTable } from '@/components/design-system/table';
import { SidebarProvider } from '@/components/ui/sidebar';
import { StudentTable } from '@/types/student-table-types';
import { useEffect, useRef, useState } from 'react';
import { StudentSidebar } from '../../students-list/-components/students-list/student-side-view/student-side-view';
import { enrollRequestColumns } from '@/components/design-system/utils/constants/table-column-data';
import { STUDENT_LIST_COLUMN_WIDTHS } from '@/components/design-system/utils/constants/table-layout';
import { useStudentTable } from '../../students-list/-hooks/useStudentTable';
import { useStudentFilters } from '../../students-list/-hooks/useStudentFilters';
import { OnChangeFn, RowSelectionState } from '@tanstack/react-table';
import { BulkActions } from '../../students-list/-components/students-list/bulk-actions';
import { MyPagination } from '@/components/design-system/pagination';
import { AssessmentDetailsSearchComponent } from '@/routes/evaluation/evaluations/assessment-details/$assessmentId/$examType/$assesssmentType/-components/SearchComponent';
import { ScheduleTestFilters } from '@/routes/assessment/assessment-list/-components/ScheduleTestFilters';
import { MyFilterOption } from '@/types/assessments/my-filter';
import { Step3ParticipantsFilterButtons } from '@/routes/assessment/assessment-list/assessment-details/$assessmentId/$examType/$assesssmentType/$assessmentTab/-components/AssessmentParticipantsList';
import { Users } from 'phosphor-react';
import { cn } from '@/lib/utils';

export interface AssessmentParticipantsInterface {
    name: string;
    statuses: string[];
    institute_ids: string[];
    package_session_ids: string[];
    group_ids: string[];
    gender: MyFilterOption[];
    sort_columns: Record<string, string>; // For dynamic keys in sort_columns
}

export const EnrollRequests = () => {
    const [selectedFilter, setSelectedFilter] = useState<AssessmentParticipantsInterface>({
        name: '',
        statuses: [],
        institute_ids: [],
        package_session_ids: [],
        group_ids: [],
        gender: [],
        sort_columns: {},
    });
    const [searchText, setSearchText] = useState('');
    const [allPagesData, setAllPagesData] = useState<Record<number, StudentTable[]>>({});
    const { appliedFilters, setAppliedFilters } = useStudentFilters();
    const {
        studentTableData,
        isLoading: loadingData,
        error: loadingError,
        page,
        handleSort,
        handlePageChange,
    } = useStudentTable(appliedFilters, setAppliedFilters, null);

    const [rowSelections, setRowSelections] = useState<Record<number, Record<string, boolean>>>({});
    const currentPageSelection = rowSelections[page] || {};
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const tableRef = useRef<HTMLDivElement>(null);
    const totalSelectedCount = Object.values(rowSelections).reduce(
        (count, pageSelection) => count + Object.keys(pageSelection).length,
        0
    );

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

    const handleSearch = (searchValue: string) => {
        setSearchText(searchValue);
    };

    const clearSearch = () => {
        setSearchText('');
    };

    const handleResetFilters = () => {
        setSelectedFilter((prevFilter) => ({
            ...prevFilter,
            name: '',
            gender: [],
        }));
        setSearchText('');
    };

    const handleFilterChange = (filterKey: string, selectedItems: MyFilterOption[]) => {
        setSelectedFilter((prev) => {
            const updatedFilters = { ...prev, [filterKey]: selectedItems };
            return updatedFilters;
        });
    };

    useEffect(() => {
        if (studentTableData?.content) {
            setAllPagesData((prev) => ({
                ...prev,
                [page]: studentTableData.content,
            }));
        }
    }, [studentTableData?.content, page]);

    return (
        <div className="flex w-full flex-col gap-10 text-neutral-600">
            <div className="animate-slideInRight flex flex-col gap-4">
                <div className="flex items-center gap-2.5">
                    <div className="rounded-lg bg-gradient-to-br from-primary-100 to-primary-200 p-1.5 shadow-sm">
                        <Users className="size-4 text-primary-500" />
                    </div>
                    <div className="flex flex-col">
                        <h1 className={cn('text-lg font-semibold text-neutral-700')}>
                            Enroll Requests List
                        </h1>
                        <div className="h-0.5 w-8 rounded-full bg-gradient-to-r from-primary-400 to-primary-500"></div>
                    </div>
                </div>
                <div className="flex flex-col items-start gap-4 rounded-xl border p-4">
                    <AssessmentDetailsSearchComponent
                        onSearch={handleSearch}
                        searchText={searchText}
                        setSearchText={setSearchText}
                        clearSearch={clearSearch}
                        placeholderText="Search by name, enroll..."
                    />
                    <div className="flex items-center gap-4">
                        <ScheduleTestFilters
                            label="Preferred Batch"
                            data={[]}
                            selectedItems={selectedFilter['gender'] || []}
                            onSelectionChange={(items) => handleFilterChange('gender', items)}
                        />
                        <ScheduleTestFilters
                            label="Payment Status"
                            data={[]}
                            selectedItems={selectedFilter['gender'] || []}
                            onSelectionChange={(items) => handleFilterChange('gender', items)}
                        />
                        <ScheduleTestFilters
                            label="Approval Status"
                            data={[]}
                            selectedItems={selectedFilter['gender'] || []}
                            onSelectionChange={(items) => handleFilterChange('gender', items)}
                        />
                        <ScheduleTestFilters
                            label="Payment Option"
                            data={[]}
                            selectedItems={selectedFilter['gender'] || []}
                            onSelectionChange={(items) => handleFilterChange('gender', items)}
                        />
                    </div>
                    <Step3ParticipantsFilterButtons
                        selectedQuestionPaperFilters={selectedFilter}
                        handleSubmitFilters={() => {}}
                        handleResetFilters={handleResetFilters}
                    />
                </div>
                {/* Modern table container */}
                <div className="overflow-hidden rounded-xl border border-neutral-200/50 bg-gradient-to-br from-white to-neutral-50/30 shadow-sm">
                    <div className="max-w-full" ref={tableRef}>
                        <SidebarProvider
                            style={{ ['--sidebar-width' as string]: '565px' }}
                            defaultOpen={false}
                            open={isSidebarOpen}
                            onOpenChange={setIsSidebarOpen}
                        >
                            <MyTable<StudentTable>
                                data={{
                                    content: [],
                                    total_pages: 0,
                                    page_no: 0,
                                    page_size: 0,
                                    total_elements: 0,
                                    last: false,
                                }}
                                columns={enrollRequestColumns}
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
                <div className="flex flex-col justify-between gap-4 rounded-lg border border-neutral-200/50 bg-gradient-to-r from-neutral-50/50 to-white p-4 lg:flex-row lg:items-center">
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
        </div>
    );
};
