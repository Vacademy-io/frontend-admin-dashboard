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
import { ScheduleTestFilters } from '@/routes/assessment/assessment-list/-components/ScheduleTestFilters';
import { MyFilterOption } from '@/types/assessments/my-filter';
import { Step3ParticipantsFilterButtons } from '@/routes/assessment/assessment-list/assessment-details/$assessmentId/$examType/$assesssmentType/$assessmentTab/-components/AssessmentParticipantsList';
import { Users } from 'phosphor-react';
import { cn } from '@/lib/utils';
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

    const [leadsTableData, setLeadsTableData] = useState({
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
            // Mock data with more comprehensive examples
            const mockLeads = [
                {
                    id: '1',
                    name: 'John Doe',
                    email: 'john.doe@example.com',
                    phone: '+1234567890',
                    status: 'NEW',
                    source: 'Website',
                    created_at: '2024-01-15T10:30:00Z',
                    last_contacted: null,
                    priority: 'HIGH',
                    notes: 'Interested in Python course',
                    assigned_to: 'Admin',
                    tags: ['hot-lead', 'python']
                },
                {
                    id: '2',
                    name: 'Jane Smith',
                    email: 'jane.smith@example.com',
                    phone: '+1234567891',
                    status: 'CONTACTED',
                    source: 'Referral',
                    created_at: '2024-01-14T14:20:00Z',
                    last_contacted: '2024-01-16T09:15:00Z',
                    priority: 'MEDIUM',
                    notes: 'Follow up scheduled',
                    assigned_to: 'Admin',
                    tags: ['referral', 'follow-up']
                },
                {
                    id: '3',
                    name: 'Mike Johnson',
                    email: 'mike.johnson@example.com',
                    phone: '+1234567892',
                    status: 'QUALIFIED',
                    source: 'Social Media',
                    created_at: '2024-01-13T16:45:00Z',
                    last_contacted: '2024-01-15T11:30:00Z',
                    priority: 'HIGH',
                    notes: 'Ready to enroll',
                    assigned_to: 'Admin',
                    tags: ['qualified', 'ready']
                },
                {
                    id: '4',
                    name: 'Sarah Wilson',
                    email: 'sarah.wilson@example.com',
                    phone: '+1234567893',
                    status: 'CONVERTED',
                    source: 'Email Campaign',
                    created_at: '2024-01-12T09:15:00Z',
                    last_contacted: '2024-01-14T14:30:00Z',
                    priority: 'LOW',
                    notes: 'Successfully converted to student',
                    assigned_to: 'Admin',
                    tags: ['converted', 'email']
                },
                {
                    id: '5',
                    name: 'David Brown',
                    email: 'david.brown@example.com',
                    phone: '+1234567894',
                    status: 'LOST',
                    source: 'Cold Call',
                    created_at: '2024-01-11T16:20:00Z',
                    last_contacted: '2024-01-13T10:45:00Z',
                    priority: 'LOW',
                    notes: 'Not interested in current offerings',
                    assigned_to: 'Admin',
                    tags: ['lost', 'cold-call']
                },
                {
                    id: '6',
                    name: 'Emily Davis',
                    email: 'emily.davis@example.com',
                    phone: '+1234567895',
                    status: 'NEW',
                    source: 'Website',
                    created_at: '2024-01-10T11:30:00Z',
                    last_contacted: null,
                    priority: 'MEDIUM',
                    notes: 'Interested in data science course',
                    assigned_to: 'Admin',
                    tags: ['data-science', 'new-lead']
                }
            ];

            // Filter based on selected status
            let filteredLeads = mockLeads;
            if (selectedFilter.statuses.length > 0 && !selectedFilter.statuses.includes('ALL')) {
                filteredLeads = mockLeads.filter(lead => 
                    selectedFilter.statuses.includes(lead.status)
                );
            }

            // Filter based on search text
            if (selectedFilter.name) {
                filteredLeads = filteredLeads.filter(lead => 
                    lead.name.toLowerCase().includes(selectedFilter.name.toLowerCase()) ||
                    lead.email.toLowerCase().includes(selectedFilter.name.toLowerCase()) ||
                    lead.phone.includes(selectedFilter.name)
                );
            }

            // Pagination
            const startIndex = pageNo * pageSize;
            const endIndex = startIndex + pageSize;
            const paginatedLeads = filteredLeads.slice(startIndex, endIndex);

            return Promise.resolve({
                content: paginatedLeads,
                total_pages: Math.ceil(filteredLeads.length / pageSize),
                page_no: pageNo,
                page_size: pageSize,
                total_elements: filteredLeads.length,
                last: endIndex >= filteredLeads.length
            });
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
                last: true
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
                    <h2 className="text-xl font-semibold text-red-600 mb-2">Error Loading Leads</h2>
                    <p className="text-neutral-600">There was an error loading the leads data.</p>
                    <button 
                        onClick={() => window.location.reload()} 
                        className="mt-4 rounded bg-primary-500 px-4 py-2 text-white hover:bg-primary-600"
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
                            <Users className="h-6 w-6 text-primary-500" />
                            <h1 className="text-2xl font-semibold text-neutral-800">Leads Management</h1>
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
                                placeholder="Search leads by name, email, or phone..."
                            />
                        </div>
                        <div className="flex items-center gap-2">
                            <select
                                className="rounded border border-neutral-300 px-3 py-2 text-sm"
                                value={selectedFilter.statuses[0] || 'ALL'}
                                onChange={(e) => {
                                    const value = e.target.value;
                                    if (value === 'ALL') {
                                        setSelectedFilter(prev => ({ ...prev, statuses: ['NEW', 'CONTACTED', 'QUALIFIED', 'CONVERTED'] }));
                                    } else {
                                        setSelectedFilter(prev => ({ ...prev, statuses: [value] }));
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
                                        selectedFilter.statuses.includes('ALL') || selectedFilter.statuses.length === 4
                                            ? 'bg-primary-500 text-white'
                                            : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                                    }`}
                                    onClick={() => setSelectedFilter(prev => ({ ...prev, statuses: ['NEW', 'CONTACTED', 'QUALIFIED', 'CONVERTED'] }))}
                                >
                                    All
                                </button>
                                <button
                                    className={`rounded px-3 py-1 text-sm ${
                                        selectedFilter.statuses.includes('NEW') && selectedFilter.statuses.length === 1
                                            ? 'bg-primary-500 text-white'
                                            : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                                    }`}
                                    onClick={() => setSelectedFilter(prev => ({ ...prev, statuses: ['NEW'] }))}
                                >
                                    New
                                </button>
                                <button
                                    className={`rounded px-3 py-1 text-sm ${
                                        selectedFilter.statuses.includes('CONTACTED') && selectedFilter.statuses.length === 1
                                            ? 'bg-primary-500 text-white'
                                            : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                                    }`}
                                    onClick={() => setSelectedFilter(prev => ({ ...prev, statuses: ['CONTACTED'] }))}
                                >
                                    Contacted
                                </button>
                                <button
                                    className={`rounded px-3 py-1 text-sm ${
                                        selectedFilter.statuses.includes('QUALIFIED') && selectedFilter.statuses.length === 1
                                            ? 'bg-primary-500 text-white'
                                            : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                                    }`}
                                    onClick={() => setSelectedFilter(prev => ({ ...prev, statuses: ['QUALIFIED'] }))}
                                >
                                    Qualified
                                </button>
                                <button
                                    className={`rounded px-3 py-1 text-sm ${
                                        selectedFilter.statuses.includes('CONVERTED') && selectedFilter.statuses.length === 1
                                            ? 'bg-primary-500 text-white'
                                            : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                                    }`}
                                    onClick={() => setSelectedFilter(prev => ({ ...prev, statuses: ['CONVERTED'] }))}
                                >
                                    Converted
                                </button>
                            </div>
                            <div className="text-sm text-neutral-600">
                                {leadsTableData.content.length} of {leadsTableData.total_elements} leads
                            </div>
                        </div>

                        <div ref={tableRef} className="flex-1">
                            <SidebarProvider>
                                <div className="flex gap-4">
                                    <div className="flex-1">
                                        <MyTable
                                            data={leadsTableData.content}
                                            columns={leadsColumns}
                                            columnWidths={STUDENT_LIST_COLUMN_WIDTHS}
                                            onRowSelectionChange={handleRowSelectionChange}
                                            rowSelection={currentPageSelection}
                                            isLoading={getLeadsDataMutation.isPending}
                                            emptyMessage="No leads found"
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
