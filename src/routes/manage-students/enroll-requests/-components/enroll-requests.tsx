import { MyTable } from '@/components/design-system/table';
import { SidebarProvider } from '@/components/ui/sidebar';
import { StudentTable } from '@/types/student-table-types';
import { useEffect, useRef, useState } from 'react';
import { StudentSidebar } from '../../students-list/-components/students-list/student-side-view/student-side-view';
import { enrollRequestColumns } from '@/components/design-system/utils/constants/table-column-data';
import { STUDENT_LIST_COLUMN_WIDTHS } from '@/components/design-system/utils/constants/table-layout';
import { OnChangeFn, RowSelectionState } from '@tanstack/react-table';
import { BulkActions } from '../../students-list/-components/students-list/bulk-actions';
import { MyPagination } from '@/components/design-system/pagination';
import { AssessmentDetailsSearchComponent } from '@/routes/evaluation/evaluations/assessment-details/$assessmentId/$examType/$assesssmentType/-components/SearchComponent';
import { ScheduleTestFilters } from '@/routes/assessment/assessment-list/-components/ScheduleTestFilters';
import { MyFilterOption } from '@/types/assessments/my-filter';
import { Step3ParticipantsFilterButtons } from '@/routes/assessment/assessment-list/assessment-details/$assessmentId/$examType/$assesssmentType/$assessmentTab/-components/AssessmentParticipantsList';
import { Users } from 'phosphor-react';
import { cn } from '@/lib/utils';
import { getEnrollmentRequestsData } from '../-services/get-enroll-requests';
import { useMutation } from '@tanstack/react-query';
import { usePaginationState } from '@/hooks/pagination';
import { getInstituteId } from '@/constants/helper';

export interface EnrollRequestsInterface {
    name: string;
    statuses: string[];
    institute_ids: string[];
    package_session_ids: string[];
    destination_package_session_ids: string[];
    group_ids: string[];
    gender: MyFilterOption[];
    preferred_batch: MyFilterOption[];
    payment_statuses: MyFilterOption[];
    approval_statuses: MyFilterOption[];
    payment_option: MyFilterOption[];
    custom_fields: {
        [key: string]: string[];
    };
    sort_columns: {
        [key: string]: string;
    };
}

export const EnrollRequests = () => {
    const instituteId = getInstituteId();
    const { page, handlePageChange } = usePaginationState({
        initialPage: 0,
        initialPageSize: 10,
    });

    const [selectedFilter, setSelectedFilter] = useState<EnrollRequestsInterface>({
        name: '',
        statuses: ['INVITED', 'PENDING_FOR_APPROVAL'],
        institute_ids: [instituteId!],
        package_session_ids: [],
        destination_package_session_ids: [],
        group_ids: [],
        gender: [],
        preferred_batch: [],
        payment_statuses: [],
        approval_statuses: [],
        payment_option: [],
        custom_fields: {},
        sort_columns: {},
    });
    const [searchText, setSearchText] = useState('');
    const [allPagesData, setAllPagesData] = useState({
        content: [],
        total_pages: 0,
        page_no: 0,
        page_size: 0,
        total_elements: 0,
        last: false,
    });

    const [rowSelections, setRowSelections] = useState<Record<number, Record<string, boolean>>>({});
    const currentPageSelection = rowSelections[page] || {};
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const tableRef = useRef<HTMLDivElement>(null);
    const totalSelectedCount = Object.values(rowSelections).reduce(
        (count, pageSelection) => count + Object.keys(pageSelection).length,
        0
    );

    const getEnrollmentRequestsDataMutation = useMutation({
        mutationFn: ({
            pageNo,
            pageSize,
            selectedFilter,
        }: {
            pageNo: number;
            pageSize: number;
            selectedFilter: EnrollRequestsInterface;
        }) => getEnrollmentRequestsData({ pageNo, pageSize, requestBody: selectedFilter }),
        onSuccess: (data) => {
            setAllPagesData(data);
        },
        onError: (error: unknown) => {
            throw error;
        },
    });

    const getSelectedStudents = (): StudentTable[] => {
        return Object.entries(rowSelections).flatMap(([pageNum, selections]) => {
            const pageData = allPagesData.content[parseInt(pageNum)];
            if (!pageData) return [];

            return Object.entries(selections)
                .filter(([, isSelected]) => isSelected)
                .map(([index]) => pageData[parseInt(index)])
                .filter((student) => student !== undefined);
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
        getEnrollmentRequestsDataMutation.mutate({
            pageNo: page,
            pageSize: 10,
            selectedFilter: {
                ...selectedFilter,
                name: searchValue,
            },
        });
    };

    const clearSearch = () => {
        setSearchText('');
        getEnrollmentRequestsDataMutation.mutate({
            pageNo: page,
            pageSize: 10,
            selectedFilter: {
                ...selectedFilter,
                name: '',
            },
        });
    };

    const handleResetFilters = () => {
        setSelectedFilter((prevFilter) => ({
            ...prevFilter,
            name: '',
            statuses: ['INVITED', 'PENDING_FOR_APPROVAL'],
            institute_ids: [],
            package_session_ids: [],
            destination_package_session_ids: [],
            group_ids: [],
            gender: [],
            preferred_batch: [],
            payment_statuses: [],
            approval_statuses: [],
            payment_option: [],
            custom_fields: {},
            sort_columns: {},
        }));
        setSearchText('');
        getEnrollmentRequestsDataMutation.mutate({
            pageNo: page,
            pageSize: 10,
            selectedFilter: {
                ...selectedFilter,
                name: '',
                statuses: ['INVITED', 'PENDING_FOR_APPROVAL'],
                institute_ids: [],
                package_session_ids: [],
                destination_package_session_ids: [],
                group_ids: [],
                gender: [],
                preferred_batch: [],
                payment_statuses: [],
                approval_statuses: [],
                payment_option: [],
                custom_fields: {},
                sort_columns: {},
            },
        });
    };

    const handleFilterChange = (filterKey: string, selectedItems: MyFilterOption[]) => {
        setSelectedFilter((prev) => {
            const updatedFilters = { ...prev, [filterKey]: selectedItems };
            return updatedFilters;
        });
    };

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            getEnrollmentRequestsDataMutation.mutate({
                pageNo: page,
                pageSize: 10,
                selectedFilter,
            });
        }, 0);

        return () => {
            clearTimeout(timeoutId);
        };
    }, []);

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
                    <div className="flex flex-wrap items-center gap-4">
                        <ScheduleTestFilters
                            label="Preferred Batch"
                            data={[]}
                            selectedItems={selectedFilter['preferred_batch'] || []}
                            onSelectionChange={(items) =>
                                handleFilterChange('preferred_batch', items)
                            }
                        />
                        <ScheduleTestFilters
                            label="Payment Status"
                            data={[]}
                            selectedItems={selectedFilter['payment_statuses'] || []}
                            onSelectionChange={(items) =>
                                handleFilterChange('payment_statuses', items)
                            }
                        />
                        <ScheduleTestFilters
                            label="Approval Status"
                            data={[]}
                            selectedItems={selectedFilter['approval_statuses'] || []}
                            onSelectionChange={(items) =>
                                handleFilterChange('approval_statuses', items)
                            }
                        />
                        <ScheduleTestFilters
                            label="Payment Option"
                            data={[]}
                            selectedItems={selectedFilter['payment_option'] || []}
                            onSelectionChange={(items) =>
                                handleFilterChange('payment_option', items)
                            }
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
                            {/* eslint-disable-next-line @typescript-eslint/ban-ts-comment */}
                            {/* @ts-expect-error */}
                            <MyTable<StudentTable>
                                data={allPagesData}
                                columns={enrollRequestColumns}
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
                            totalPages={1}
                            onPageChange={handlePageChange}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};
