import { createFileRoute } from '@tanstack/react-router';
import { LayoutContainer } from '@/components/common/layout-container/layout-container';
import { useNavHeadingStore } from '@/stores/layout-container/useNavHeadingStore';
import { useEffect, useState, useRef } from 'react';
import { DownloadSimple, FileCsv, FileXls, FilePdf, CaretDown } from 'phosphor-react';
import { useMutation } from '@tanstack/react-query';
import { getLeadsData } from './-services/get-leads';
import { LeadsManagementInterface, LeadTable } from './-types/leads-types';
import { getInstituteId } from '@/constants/helper';
import { usePaginationState } from '@/hooks/pagination';

export const Route = createFileRoute('/manage-students/leads-management/')({
    component: RouteComponent,
});

function RouteComponent() {
    const { setNavHeading } = useNavHeadingStore();

    useEffect(() => {
        setNavHeading('Leads Management');
    }, []);

    return (
        <LayoutContainer>
            <LeadsManagementPage />
        </LayoutContainer>
    );
}

function LeadsManagementPage() {
    const instituteId = getInstituteId();
    const { page, handlePageChange } = usePaginationState({
        initialPage: 0,
        initialPageSize: 10,
    });

    const [isExporting, setIsExporting] = useState(false);
    const [showExportMenu, setShowExportMenu] = useState(false);
    const exportMenuRef = useRef<HTMLDivElement>(null);
    const [leadsData, setLeadsData] = useState<LeadTable[]>([]);
    const [totalElements, setTotalElements] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedLeads, setSelectedLeads] = useState<Set<string>>(new Set());

    // API request body with hardcoded values as per requirements
    const requestBody: LeadsManagementInterface = {
        name: '',
        statuses: ['INVITED'],
        institute_ids: [instituteId!],
        package_session_ids: [],
        destination_package_session_ids: [],
        group_ids: [],
        gender: [],
        preferred_batch: [],
        payment_statuses: [],
        approval_statuses: [],
        payment_option: [],
        custom_fields: [],
        sort_columns: {},
        sources: ['LEAD'],
        types: ['PUBLIC_LIVE_SESSION'],
        type_ids: [],
    };

    // API mutation
    const getLeadsDataMutation = useMutation({
        mutationFn: ({
            pageNo,
            pageSize,
            requestBody,
        }: {
            pageNo: number;
            pageSize: number;
            requestBody: LeadsManagementInterface;
        }) => getLeadsData({ pageNo, pageSize, requestBody }),
        onSuccess: (data) => {
            setLeadsData(data.content || []);
            setTotalElements(data.total_elements || 0);
            setIsLoading(false);
        },
        onError: (error) => {
            console.error('Error fetching leads data:', error);
            setIsLoading(false);
        },
    });

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (exportMenuRef.current && !exportMenuRef.current.contains(event.target as Node)) {
                setShowExportMenu(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    // Fetch data on component mount and page change
    useEffect(() => {
        setIsLoading(true);
        getLeadsDataMutation.mutate({
            pageNo: page,
            pageSize: 10,
            requestBody,
        });
    }, [page]);

    // Handle individual checkbox selection
    const handleLeadSelection = (leadId: string, isSelected: boolean) => {
        setSelectedLeads((prev) => {
            const newSelection = new Set(prev);
            if (isSelected) {
                newSelection.add(leadId);
            } else {
                newSelection.delete(leadId);
            }
            return newSelection;
        });
    };

    // Handle select all checkbox
    const handleSelectAll = (isSelected: boolean) => {
        if (isSelected) {
            const allLeadIds = new Set(leadsData.map((lead) => lead.id));
            setSelectedLeads(allLeadIds);
        } else {
            setSelectedLeads(new Set());
        }
    };

    // Clear all selections
    const handleClearSelection = () => {
        setSelectedLeads(new Set());
    };

    const exportData = (format: 'csv' | 'xlsx' | 'pdf') => {
        setIsExporting(true);
        setShowExportMenu(false);

        // Prepare data
        const headers = [
            'Full Name',
            'Username',
            'Email',
            'Mobile Number',
            'Institute Enrollment Number',
            'Source',
            'Type',
            'Type ID',
            'Created Date',
            'Updated Date',
            'Institute ID',
            'User ID',
        ];

        const data = leadsData.map((lead) => [
            lead.full_name || '-',
            lead.username || '-',
            lead.email || '-',
            lead.mobile_number || '-',
            lead.institute_enrollment_number || '-',
            lead.source || '-',
            lead.type || '-',
            lead.type_id || '-',
            new Date(lead.created_at).toLocaleDateString(),
            new Date(lead.updated_at).toLocaleDateString(),
            lead.institute_id || '-',
            lead.user_id || '-',
        ]);

        const timestamp = new Date().toISOString().split('T')[0];
        let filename = '';
        let content = '';
        let mimeType = '';

        switch (format) {
            case 'csv':
                filename = `leads-management-${timestamp}.csv`;
                content = [
                    headers.join(','),
                    ...data.map((row) => row.map((field) => `"${field}"`).join(',')),
                ].join('\n');
                mimeType = 'text/csv;charset=utf-8;';
                break;
            case 'xlsx':
                // For XLSX, we'll create a simple CSV that can be opened in Excel
                filename = `leads-management-${timestamp}.xlsx`;
                content = [headers.join('\t'), ...data.map((row) => row.join('\t'))].join('\n');
                mimeType = 'application/vnd.ms-excel;charset=utf-8;';
                break;
            case 'pdf':
                // For PDF, we'll create a simple HTML format that can be printed as PDF
                filename = `leads-management-${timestamp}.html`;
                content = `
<!DOCTYPE html>
<html>
<head>
    <title>Leads Management Report</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        h1 { color: #333; text-align: center; }
        .date { text-align: center; color: #666; margin-bottom: 20px; }
        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background-color: #f2f2f2; font-weight: bold; }
        tr:nth-child(even) { background-color: #f9f9f9; }
    </style>
</head>
<body>
    <h1>LEADS MANAGEMENT REPORT</h1>
    <div class="date">Generated on: ${new Date().toLocaleDateString()}</div>
    <table>
        <thead>
            <tr>
                ${headers.map((header) => `<th>${header}</th>`).join('')}
            </tr>
        </thead>
        <tbody>
            ${data.map((row) => `<tr>${row.map((cell) => `<td>${cell}</td>`).join('')}</tr>`).join('')}
        </tbody>
    </table>
</body>
</html>`;
                mimeType = 'text/html;charset=utf-8;';
                break;
        }

        // Create and download file
        const blob = new Blob([content], { type: mimeType });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', filename);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        // Reset loading state
        setTimeout(() => {
            setIsExporting(false);
        }, 1000);
    };

    return (
        <div className="flex h-full flex-col">
            <div className="flex flex-1 flex-col gap-4">
                {/* Header Section */}
                <div className="flex flex-col gap-4 rounded-lg border border-neutral-200/50 bg-gradient-to-r from-neutral-50/50 to-white p-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <h1 className="text-2xl font-semibold text-neutral-800">
                                Leads Management
                            </h1>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="text-sm text-neutral-600">
                                Total Leads: {totalElements}
                            </div>
                            <div className="relative" ref={exportMenuRef}>
                                <button
                                    onClick={() => setShowExportMenu(!showExportMenu)}
                                    disabled={isExporting}
                                    className="hover:bg-primary-600 flex items-center gap-2 rounded-lg border border-primary-500 bg-primary-500 px-4 py-2 text-sm font-medium text-white transition-colors disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    {isExporting ? (
                                        <>
                                            <div className="size-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                                            Exporting...
                                        </>
                                    ) : (
                                        <>
                                            <DownloadSimple className="size-4" />
                                            Export Data
                                            <CaretDown className="size-3" />
                                        </>
                                    )}
                                </button>

                                {showExportMenu && !isExporting && (
                                    <div className="absolute right-0 top-full z-10 mt-1 w-48 rounded-lg border border-neutral-200 bg-white shadow-lg">
                                        <div className="py-1">
                                            <button
                                                onClick={() => exportData('csv')}
                                                className="flex w-full items-center gap-3 px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-50"
                                            >
                                                <FileCsv className="size-4 text-green-600" />
                                                Export as CSV
                                            </button>
                                            <button
                                                onClick={() => exportData('xlsx')}
                                                className="flex w-full items-center gap-3 px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-50"
                                            >
                                                <FileXls className="size-4 text-green-600" />
                                                Export as Excel
                                            </button>
                                            <button
                                                onClick={() => exportData('pdf')}
                                                className="flex w-full items-center gap-3 px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-50"
                                            >
                                                <FilePdf className="size-4 text-red-600" />
                                                Export as PDF
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Search */}
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                        <div className="flex flex-1 items-center gap-4">
                            <input
                                type="text"
                                placeholder="Search leads by name, email, or phone..."
                                className="flex h-10 w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm placeholder:text-neutral-500 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-primary-500"
                            />
                        </div>
                    </div>
                </div>

                {/* Table Section */}
                <div className="flex flex-1 flex-col gap-4">
                    <div className="flex flex-1 flex-col gap-4 rounded-lg border border-neutral-200/50 bg-white p-4">
                        <div className="flex items-center justify-end">
                            <div className="text-sm text-neutral-600">
                                {leadsData.length} of {totalElements} leads
                            </div>
                        </div>

                        {/* Simple Table with Correct Header Colors and Column Borders */}
                        <div className="overflow-x-auto">
                            <table className="w-full border-collapse">
                                <thead>
                                    <tr className="border-b border-neutral-200 bg-primary-200">
                                        <th className="border-r border-neutral-200 bg-primary-100 p-3 text-left text-sm font-medium text-neutral-600">
                                            <input
                                                type="checkbox"
                                                className="rounded border-neutral-400"
                                                checked={
                                                    leadsData.length > 0 &&
                                                    selectedLeads.size === leadsData.length
                                                }
                                                onChange={(e) => handleSelectAll(e.target.checked)}
                                            />
                                        </th>
                                        <th className="border-r border-neutral-200 bg-primary-100 p-3 text-left text-sm font-medium text-neutral-600">
                                            Full Name
                                        </th>
                                        <th className="border-r border-neutral-200 bg-primary-100 p-3 text-left text-sm font-medium text-neutral-600">
                                            Username
                                        </th>
                                        <th className="border-r border-neutral-200 bg-primary-100 p-3 text-left text-sm font-medium text-neutral-600">
                                            Email
                                        </th>
                                        <th className="border-r border-neutral-200 bg-primary-100 p-3 text-left text-sm font-medium text-neutral-600">
                                            Mobile
                                        </th>
                                        <th className="border-r border-neutral-200 bg-primary-100 p-3 text-left text-sm font-medium text-neutral-600">
                                            Source
                                        </th>
                                        <th className="border-r border-neutral-200 bg-primary-100 p-3 text-left text-sm font-medium text-neutral-600">
                                            Type
                                        </th>
                                        <th className="border-r border-neutral-200 bg-primary-100 p-3 text-left text-sm font-medium text-neutral-600">
                                            Type ID
                                        </th>
                                        <th className="bg-primary-100 p-3 text-left text-sm font-medium text-neutral-600">
                                            Created Date
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {isLoading ? (
                                        <tr>
                                            <td colSpan={9} className="p-8 text-center">
                                                <div className="flex items-center justify-center">
                                                    <div className="size-8 animate-spin rounded-full border-4 border-primary-500 border-t-transparent"></div>
                                                    <span className="ml-2 text-sm text-neutral-600">
                                                        Loading leads...
                                                    </span>
                                                </div>
                                            </td>
                                        </tr>
                                    ) : leadsData.length === 0 ? (
                                        <tr>
                                            <td
                                                colSpan={9}
                                                className="p-8 text-center text-neutral-500"
                                            >
                                                No leads found
                                            </td>
                                        </tr>
                                    ) : (
                                        leadsData.map((lead) => (
                                            <tr
                                                key={lead.id}
                                                className="border-b border-neutral-100 hover:bg-neutral-50"
                                            >
                                                <td className="border-r border-neutral-200 p-3">
                                                    <input
                                                        type="checkbox"
                                                        className="rounded border-neutral-400"
                                                        checked={selectedLeads.has(lead.id)}
                                                        onChange={(e) =>
                                                            handleLeadSelection(
                                                                lead.id,
                                                                e.target.checked
                                                            )
                                                        }
                                                    />
                                                </td>
                                                <td className="border-r border-neutral-200 p-3 text-sm text-neutral-700">
                                                    {lead.full_name || '-'}
                                                </td>
                                                <td className="border-r border-neutral-200 p-3 text-sm text-neutral-700">
                                                    {lead.username || '-'}
                                                </td>
                                                <td className="border-r border-neutral-200 p-3 text-sm text-neutral-700">
                                                    {lead.email || '-'}
                                                </td>
                                                <td className="border-r border-neutral-200 p-3 text-sm text-neutral-700">
                                                    {lead.mobile_number || '-'}
                                                </td>
                                                <td className="border-r border-neutral-200 p-3">
                                                    <span className="rounded-full bg-blue-100 px-2 py-1 text-xs text-blue-800">
                                                        {lead.source || '-'}
                                                    </span>
                                                </td>
                                                <td className="border-r border-neutral-200 p-3 text-sm text-neutral-700">
                                                    {lead.type || '-'}
                                                </td>
                                                <td className="border-r border-neutral-200 p-3 text-sm text-neutral-700">
                                                    {lead.type_id || '-'}
                                                </td>
                                                <td className="p-3 text-sm text-neutral-600">
                                                    {new Date(lead.created_at).toLocaleDateString()}
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* Footer with bulk actions and pagination */}
                <div className="flex flex-col justify-between gap-4 rounded-lg border border-neutral-200/50 bg-gradient-to-r from-neutral-50/50 to-white p-4 lg:flex-row lg:items-center">
                    <div className="flex items-center gap-4">
                        <span className="text-sm font-medium text-neutral-700">
                            {selectedLeads.size} leads selected
                        </span>
                        <button
                            onClick={handleClearSelection}
                            className="h-8 px-2 text-xs text-neutral-500 hover:text-neutral-700"
                        >
                            Clear
                        </button>
                        <div className="h-4 w-px bg-neutral-300"></div>
                        <button
                            onClick={() => exportData('csv')}
                            disabled={isExporting}
                            className="flex items-center gap-1 rounded border border-neutral-300 bg-white px-3 py-1 text-xs text-neutral-600 transition-colors hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            <DownloadSimple className="size-3" />
                            Export All
                        </button>
                    </div>
                    <div className="flex justify-center lg:justify-end">
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => handlePageChange(page - 1)}
                                disabled={page === 0}
                                className="rounded border border-neutral-300 px-3 py-1 text-sm hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                Previous
                            </button>
                            <span className="px-3 py-1 text-sm text-neutral-600">
                                {page + 1} of {Math.ceil(totalElements / 10)}
                            </span>
                            <button
                                onClick={() => handlePageChange(page + 1)}
                                disabled={leadsData.length < 10}
                                className="rounded border border-neutral-300 px-3 py-1 text-sm hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                Next
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
