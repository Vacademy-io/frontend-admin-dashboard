import { MyTable } from '@/components/design-system/table';
import { SidebarProvider } from '@/components/ui/sidebar';
import { LeadTable } from '../-types/leads-types';
import { useEffect, useRef, useState } from 'react';
import { StudentSidebar } from '../../students-list/-components/students-list/student-side-view/student-side-view';
import { leadsColumns } from '@/components/design-system/utils/constants/table-column-data';
import { STUDENT_LIST_COLUMN_WIDTHS } from '@/components/design-system/utils/constants/table-layout';
import { OnChangeFn, RowSelectionState } from '@tanstack/react-table';
import { MyPagination } from '@/components/design-system/pagination';
import { AssessmentDetailsSearchComponent } from '@/routes/evaluation/evaluations/assessment-details/$assessmentId/$examType/$assesssmentType/-components/SearchComponent';
import { MyFilterOption } from '@/types/assessments/my-filter';
import { Users } from 'phosphor-react';
import { getLeadsData } from '../-services/get-leads';
import { useMutation } from '@tanstack/react-query';
import { usePaginationState } from '@/hooks/pagination';
import { getInstituteId } from '@/constants/helper';
import { LeadsBulkActions } from './bulk-actions/leads-bulk-actions';

export interface LeadsManagementInterface {
    name: string;
    statuses: string[];
    institute_ids: string[];
    package_session_ids: string[];
    group_ids: string[];
    gender: MyFilterOption[];
    preferred_batch: MyFilterOption[];
    custom_fields: MyFilterOption[];
    sort_columns: {
        [key: string]: string;
    };
    destination_package_session_ids: string[];
    payment_statuses: string[];
    approval_statuses: string[];
    payment_option: string[];
    sources: string[];
    types: string[];
    type_ids: string[];
}

export const LeadsManagement = () => {
    console.log('LeadsManagement component is rendering');
    const instituteId = getInstituteId();
    const { page, handlePageChange } = usePaginationState({
        initialPage: 0,
        initialPageSize: 10,
    });

    const [selectedFilter, setSelectedFilter] = useState<LeadsManagementInterface>({
        name: '',
        statuses: ['NEW', 'CONTACTED', 'QUALIFIED', 'CONVERTED'],
        institute_ids: [instituteId!],
        package_session_ids: [],
        group_ids: [],
        gender: [],
        preferred_batch: [],
        custom_fields: [],
        sort_columns: {},
        destination_package_session_ids: [],
        payment_statuses: [],
        approval_statuses: [],
        payment_option: [],
        sources: [],
        types: [],
        type_ids: [],
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

    const [leadsTableData, setLeadsTableData] = useState<{
        content: LeadTable[];
        total_pages: number;
        page_no: number;
        page_size: number;
        total_elements: number;
        last: boolean;
    }>({
        content: [],
        total_pages: 0,
        page_no: 0,
        page_size: 0,
        total_elements: 0,
        last: false,
    });
    const [rowSelections, setRowSelections] = useState<Record<number, Record<string, boolean>>>({});
    const currentPageSelection = rowSelections[page] || {};
    const tableRef = useRef<HTMLDivElement>(null);
    const totalSelectedCount = Object.values(rowSelections).reduce(
        (count, pageSelection) => count + Object.keys(pageSelection).length,
        0
    );

    const getLeadsDataMutation = useMutation({
        mutationFn: ({
            pageNo,
            pageSize,
            selectedFilter,
        }: {
            pageNo: number;
            pageSize: number;
            selectedFilter: LeadsManagementInterface;
        }) => {
            // Use real API call instead of mock data
            return getLeadsData({ pageNo, pageSize, requestBody: selectedFilter });
        },
        onSuccess: (data) => {
            setLeadsTableData(data);
        },
        onError: (error: unknown) => {
            console.error('Error fetching leads:', error);
            setLeadsTableData({
                content: [],
                total_pages: 0,
                page_no: 0,
                page_size: 10,
                total_elements: 0,
                last: true,
            });
        },
    });

    const getSelectedLeads = (): LeadTable[] => {
        return Object.entries(rowSelections).flatMap(([pageNum, selections]) => {
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-expect-error
            const pageData = allPagesData[parseInt(pageNum)];
            if (!pageData) return [];

            return Object.entries(selections)
                .filter(([, isSelected]) => isSelected)
                .map(([index]) => pageData[parseInt(index)])
                .filter((lead) => lead !== undefined);
        });
    };

    const getSelectedLeadIds = (): string[] => {
        return getSelectedLeads().map((lead) => lead.id);
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
        setSelectedFilter((prev) => ({
            ...prev,
            name: searchValue,
        }));
    };

    const handleFilterChange = (newFilter: Partial<LeadsManagementInterface>) => {
        setSelectedFilter((prev) => ({
            ...prev,
            ...newFilter,
        }));
    };

    useEffect(() => {
        getLeadsDataMutation.mutate({
            pageNo: page,
            pageSize: 10,
            selectedFilter,
        });
    }, [page, selectedFilter]);

    useEffect(() => {
        if (getLeadsDataMutation.data) {
            setAllPagesData((prev) => ({
                ...prev,
                [page]: getLeadsDataMutation.data?.content || [],
            }));
        }
    }, [getLeadsDataMutation.data, page]);

    // Simple fallback for debugging
    if (getLeadsDataMutation.isError) {
        return (
            <div className="flex h-full flex-col items-center justify-center">
                <div className="text-center">
                    <h2 className="mb-2 text-xl font-semibold text-red-600">Error Loading Leads</h2>
                    <p className="text-neutral-600">There was an error loading the leads data.</p>
                    <button
                        onClick={() => window.location.reload()}
                        className="mt-4 rounded bg-primary-400 px-4 py-2 text-white hover:bg-primary-500"
                    >
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="flex h-full flex-col">
            <div className="flex flex-1 flex-col gap-4">
                {/* Header Section */}
                <div className="flex flex-col gap-4 rounded-lg border border-neutral-200/50 bg-gradient-to-r from-neutral-50/50 to-white p-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Users className="size-6 text-primary-500" />
                            <h1 className="text-2xl font-semibold text-neutral-800">
                                Leads Management
                            </h1>
                        </div>
                        <div className="text-sm text-neutral-600">
                            Total Leads: {leadsTableData.total_elements}
                        </div>
                    </div>

                    {/* Search and Filters */}
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                        <div className="flex flex-1 items-center gap-4">
                            <AssessmentDetailsSearchComponent
                                onSearch={handleSearch}
                                searchText={searchText}
                                clearSearch={() => handleSearch('')}
                                setSearchText={setSearchText}
                                placeholderText="Search leads by name, email, or phone..."
                            />
                        </div>
                        <div className="flex items-center gap-2">
                            <select
                                className="rounded border border-neutral-300 px-3 py-2 text-sm"
                                value={selectedFilter.statuses[0] || 'ALL'}
                                onChange={(e) => {
                                    const value = e.target.value;
                                    if (value === 'ALL') {
                                        setSelectedFilter((prev) => ({
                                            ...prev,
                                            statuses: [
                                                'NEW',
                                                'CONTACTED',
                                                'QUALIFIED',
                                                'CONVERTED',
                                            ],
                                        }));
                                    } else {
                                        setSelectedFilter((prev) => ({
                                            ...prev,
                                            statuses: [value],
                                        }));
                                    }
                                }}
                            >
                                <option value="ALL">All Status</option>
                                <option value="NEW">New</option>
                                <option value="CONTACTED">Contacted</option>
                                <option value="QUALIFIED">Qualified</option>
                                <option value="CONVERTED">Converted</option>
                                <option value="LOST">Lost</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Table Section */}
                <div className="flex flex-1 flex-col gap-4">
                    <div className="flex flex-1 flex-col gap-4 rounded-lg border border-neutral-200/50 bg-white p-4">
                        <div className="flex items-center justify-between">
                            <div className="flex gap-2">
                                <button
                                    className={`rounded px-3 py-1 text-sm ${
                                        selectedFilter.statuses.includes('ALL') ||
                                        selectedFilter.statuses.length === 4
                                            ? 'bg-primary-500 text-white'
                                            : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                                    }`}
                                    onClick={() =>
                                        setSelectedFilter((prev) => ({
                                            ...prev,
                                            statuses: [
                                                'NEW',
                                                'CONTACTED',
                                                'QUALIFIED',
                                                'CONVERTED',
                                            ],
                                        }))
                                    }
                                >
                                    All
                                </button>
                                <button
                                    className={`rounded px-3 py-1 text-sm ${
                                        selectedFilter.statuses.includes('NEW') &&
                                        selectedFilter.statuses.length === 1
                                            ? 'bg-primary-500 text-white'
                                            : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                                    }`}
                                    onClick={() =>
                                        setSelectedFilter((prev) => ({
                                            ...prev,
                                            statuses: ['NEW'],
                                        }))
                                    }
                                >
                                    New
                                </button>
                                <button
                                    className={`rounded px-3 py-1 text-sm ${
                                        selectedFilter.statuses.includes('CONTACTED') &&
                                        selectedFilter.statuses.length === 1
                                            ? 'bg-primary-500 text-white'
                                            : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                                    }`}
                                    onClick={() =>
                                        setSelectedFilter((prev) => ({
                                            ...prev,
                                            statuses: ['CONTACTED'],
                                        }))
                                    }
                                >
                                    Contacted
                                </button>
                                <button
                                    className={`rounded px-3 py-1 text-sm ${
                                        selectedFilter.statuses.includes('QUALIFIED') &&
                                        selectedFilter.statuses.length === 1
                                            ? 'bg-primary-500 text-white'
                                            : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                                    }`}
                                    onClick={() =>
                                        setSelectedFilter((prev) => ({
                                            ...prev,
                                            statuses: ['QUALIFIED'],
                                        }))
                                    }
                                >
                                    Qualified
                                </button>
                                <button
                                    className={`rounded px-3 py-1 text-sm ${
                                        selectedFilter.statuses.includes('CONVERTED') &&
                                        selectedFilter.statuses.length === 1
                                            ? 'bg-primary-500 text-white'
                                            : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                                    }`}
                                    onClick={() =>
                                        setSelectedFilter((prev) => ({
                                            ...prev,
                                            statuses: ['CONVERTED'],
                                        }))
                                    }
                                >
                                    Converted
                                </button>
                            </div>
                            <div className="text-sm text-neutral-600">
                                {leadsTableData.content.length} of {leadsTableData.total_elements}{' '}
                                leads
                            </div>
                        </div>

                        <div ref={tableRef} className="flex-1">
                            <SidebarProvider>
                                <div className="flex gap-4">
                                    <div className="flex-1">
                                        <MyTable
                                            data={leadsTableData}
                                            columns={leadsColumns}
                                            columnWidths={STUDENT_LIST_COLUMN_WIDTHS}
                                            onRowSelectionChange={handleRowSelectionChange}
                                            rowSelection={currentPageSelection}
                                            isLoading={getLeadsDataMutation.isPending}
                                            error={getLeadsDataMutation.isError}
                                            currentPage={page}
                                            className="min-h-[400px]"
                                        />
                                    </div>
                                    <div>
                                        <StudentSidebar
                                            selectedTab={'ENDED,PENDING,LIVE'}
                                            examType={'EXAM'}
                                            isStudentList={true}
                                            isEnrollRequestStudentList={true}
                                        />
                                    </div>
                                </div>
                            </SidebarProvider>
                        </div>
                    </div>
                </div>

                {/* Enhanced footer with bulk actions and pagination */}
                <div className="flex flex-col justify-between gap-4 rounded-lg border border-neutral-200/50 bg-gradient-to-r from-neutral-50/50 to-white p-4 lg:flex-row lg:items-center">
                    <LeadsBulkActions
                        selectedCount={totalSelectedCount}
                        selectedLeadIds={getSelectedLeadIds()}
                        selectedLeads={getSelectedLeads()}
                        onReset={handleResetSelections}
                    />
                    <div className="flex justify-center lg:justify-end">
                        <MyPagination
                            currentPage={page}
                            totalPages={leadsTableData.total_pages}
                            onPageChange={handlePageChange}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};
