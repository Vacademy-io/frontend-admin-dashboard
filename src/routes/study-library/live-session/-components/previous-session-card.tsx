import { LockSimple } from 'phosphor-react';
import { Badge } from '@/components/ui/badge';
import { LiveSession } from '../schedule/-services/utils';
import React, { useMemo, useState } from 'react';
import Papa from 'papaparse';
import { toast } from 'sonner';
import { DownloadSimple } from 'phosphor-react';
import { DashboardLoader } from '@/components/core/dashboard-loader';
import { MyDialog } from '@/components/design-system/dialog';
import { fetchSessionDetails, SessionDetailsResponse } from '../-hooks/useSessionDetails';
import { MyButton } from '@/components/design-system/button';
import { MyTable } from '@/components/design-system/table';
import { useLiveSessionReport } from '../-hooks/useLiveSessionReport';
import {
    attendanceReportColumnsWithCheckbox,
    AttendanceReportTableData,
    ATTENDANCE_REPORT_WIDTH,
} from '../-constants/attendance-report-with-checkbox';
import { LiveSessionReport } from '../-services/utils';
import { MyPieChart } from '@/components/design-system/charts/MyPieChart';
import { getTerminology } from '@/components/common/layout-container/sidebar/utils';
import { ContentTerms, SystemTerms } from '@/routes/settings/-components/NamingSettings';
import { AttendanceBulkActions } from './attendance-bulk-actions';
import { SendMessageDialog } from '@/routes/manage-students/students-list/-components/students-list/student-list-section/bulk-actions/send-message-dialog';
import { SendEmailDialog } from '@/routes/manage-students/students-list/-components/students-list/student-list-section/bulk-actions/send-email-dialog';
import { useDialogStore } from '@/routes/manage-students/students-list/-hooks/useDialogStore';
import { StudentTable } from '@/types/student-table-types';
import { BulkActionInfo } from '@/routes/manage-students/students-list/-types/bulk-actions-types';

interface PreviousSessionCardProps {
    session: LiveSession;
}

export default function PreviousSessionCard({ session }: PreviousSessionCardProps) {
    const [openDialog, setOpenDialog] = useState<boolean>(false);
    const [scheduledSessionDetails, setScheduleSessionDetails] =
        useState<SessionDetailsResponse | null>(null);
    const [isAttendanceExporting, setIsAttendanceExporting] = useState<boolean>(false);
    const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);
    const [selectedStudents, setSelectedStudents] = useState<StudentTable[]>([]);
    // using Sonner toast for notifications

    const { mutate: fetchReport, data: reportResponse, isPending, error } = useLiveSessionReport();
    const { openBulkSendMessageDialog, openBulkSendEmailDialog } = useDialogStore();

    const fetchSessionDetail = async () => {
        const response = await fetchSessionDetails(session.schedule_id);
        setScheduleSessionDetails(response);
        fetchReport({
            sessionId: session.session_id,
            scheduleId: session.schedule_id,
            accessType: session.access_level,
        });
    };
    const handleOpenDialog = () => {
        fetchSessionDetail();
        setOpenDialog(!openDialog);
    };

    const attendanceSummary = useMemo(() => {
        if (!reportResponse) {
            return { present: 0, absent: 0, total: 0 };
        }
        const present = reportResponse.filter((r) => r.attendanceStatus === 'PRESENT').length;
        const total = reportResponse.length;
        const absent = total - present;
        return { present, absent, total };
    }, [reportResponse]);

    const pieChartData = [
        { name: 'Present', value: attendanceSummary.present },
        { name: 'Absent', value: attendanceSummary.absent },
    ];

    const convertToReportTableData = (data: LiveSessionReport[]): AttendanceReportTableData[] => {
        return data.map((item, idx) => ({
            index: idx + 1,
            username: item.fullName,
            attendanceStatus: item.attendanceStatus,
            studentId: item.studentId,
            isSelected: selectedStudentIds.includes(item.studentId),
        }));
    };

    const tableData = {
        content: reportResponse ? convertToReportTableData(reportResponse) : [],
        total_pages: 0,
        page_no: 0,
        page_size: 10,
        total_elements: 0,
        last: true,
    };

    // Calculate selection states
    const isAllSelected = reportResponse
        ? selectedStudentIds.length === reportResponse.length
        : false;
    const isIndeterminate =
        selectedStudentIds.length > 0 && selectedStudentIds.length < (reportResponse?.length || 0);

    const handleExportPastAttendance = () => {
        setIsAttendanceExporting(true);
        const csvData = tableData.content.map((item) => ({
            index: item.index,
            username: item.username,
            attendanceStatus: item.attendanceStatus === 'PRESENT' ? 'Present' : 'Absent',
        }));
        const csv = Papa.unparse(csvData);
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `past_attendance_session_${session.session_id}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        setIsAttendanceExporting(false);
        toast.success('Attendance report downloaded successfully.');
    };

    // Convert LiveSessionReport to StudentTable format
    const convertToStudentTable = (reportData: LiveSessionReport[]): StudentTable[] => {
        return reportData.map((report) => ({
            id: report.studentId,
            username: report.instituteEnrollmentNumber || null,
            user_id: report.studentId,
            email: report.email,
            full_name: report.fullName,
            address_line: '',
            region: null,
            city: '',
            pin_code: '',
            mobile_number: report.mobileNumber,
            date_of_birth: '',
            gender: '',
            father_name: '',
            mother_name: '',
            father_mobile_number: '',
            father_email: '',
            mother_mobile_number: '',
            mother_email: '',
            linked_institute_name: null,
            created_at: '',
            updated_at: '',
            package_session_id: '',
            institute_enrollment_id: report.instituteEnrollmentNumber || '',
            status: 'ACTIVE' as const,
            session_expiry_days: 0,
            institute_id: '',
            country: '',
            expiry_date: 0,
            face_file_id: null,
            parents_email: '',
            parents_mobile_number: '',
            parents_to_mother_email: '',
            parents_to_mother_mobile_number: '',
            destination_package_session_id: '',
            enroll_invite_id: '',
            payment_status: '',
            attendance_percent: 0,
            referral_count: 0,
        }));
    };

    // Checkbox selection handlers
    const handleSelectStudent = (studentId: string, isSelected: boolean) => {
        if (isSelected) {
            setSelectedStudentIds((prev) => [...prev, studentId]);
        } else {
            setSelectedStudentIds((prev) => prev.filter((id) => id !== studentId));
        }
    };

    const handleSelectAll = () => {
        if (!reportResponse) return;
        const allIds = reportResponse.map((report) => report.studentId);
        setSelectedStudentIds(allIds);
    };

    const handleClearAll = () => {
        setSelectedStudentIds([]);
    };

    const handleSendWhatsApp = () => {
        if (selectedStudents.length === 0) {
            toast.error('Please select at least one student');
            return;
        }

        const bulkActionInfo: BulkActionInfo = {
            selectedStudentIds,
            selectedStudents,
            displayText: `${selectedStudents.length} students`,
        };

        openBulkSendMessageDialog(bulkActionInfo);
    };

    const handleSendEmail = () => {
        if (selectedStudents.length === 0) {
            toast.error('Please select at least one student');
            return;
        }

        // Store session ID and schedule ID for attendance context
        localStorage.setItem('currentSessionId', session.session_id);
        localStorage.setItem('currentScheduleId', session.schedule_id);
        console.log('📋 Stored session ID for attendance context:', session.session_id);
        console.log('📋 Stored schedule ID for attendance context:', session.schedule_id);

        const bulkActionInfo: BulkActionInfo = {
            selectedStudentIds,
            selectedStudents,
            displayText: `${selectedStudents.length} students`,
        };

        openBulkSendEmailDialog(bulkActionInfo);
    };

    // Update selected students when selectedStudentIds changes
    React.useEffect(() => {
        if (reportResponse) {
            const studentTableData = convertToStudentTable(reportResponse);
            const filtered = studentTableData.filter((student) =>
                selectedStudentIds.includes(student.user_id)
            );
            setSelectedStudents(filtered);
        }
    }, [selectedStudentIds, reportResponse]);

    // Focus management for dialog
    React.useEffect(() => {
        if (openDialog && reportResponse && reportResponse.length > 0) {
            // Small delay to ensure the table is rendered
            setTimeout(() => {
                const firstCheckbox = document.querySelector('[role="checkbox"]') as HTMLElement;
                if (firstCheckbox) {
                    firstCheckbox.focus();
                }
            }, 100);
        }
    }, [openDialog, reportResponse]);

    const duration = useMemo(() => {
        if (
            !scheduledSessionDetails?.scheduleStartTime ||
            !scheduledSessionDetails?.scheduleLastEntryTime
        ) {
            return '';
        }

        try {
            const startTime = new Date(`1970-01-01T${scheduledSessionDetails.scheduleStartTime}`);
            const endTime = new Date(`1970-01-01T${scheduledSessionDetails.scheduleLastEntryTime}`);

            if (isNaN(startTime.getTime()) || isNaN(endTime.getTime())) {
                return '';
            }

            const diffMs = endTime.getTime() - startTime.getTime();

            if (diffMs < 0) return '';

            const hours = Math.floor(diffMs / 3600000);
            const minutes = Math.round((diffMs % 3600000) / 60000);

            const parts = [];
            if (hours > 0) {
                parts.push(`${hours} hr`);
            }
            if (minutes > 0) {
                parts.push(`${minutes} min`);
            }
            return parts.join(' ');
        } catch (error) {
            return '';
        }
    }, [scheduledSessionDetails]);

    const formattedDateTime = `${session.meeting_date} ${session.start_time}`;
    return (
        <div className="my-6 flex cursor-pointer flex-col gap-4 rounded-xl border bg-neutral-50 p-4">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <h1 className="font-semibold">{session.title}</h1>
                    <Badge className="rounded-md border border-neutral-300 bg-primary-50 py-1.5 shadow-none">
                        <LockSimple size={16} className="mr-2" />
                        {session.access_level}
                    </Badge>
                </div>
            </div>

            <div className="flex w-full items-center justify-start gap-8 text-sm text-neutral-500">
                <div className="flex items-center gap-2">
                    <span className="text-black">
                        {getTerminology(ContentTerms.Subjects, SystemTerms.Subjects)}:
                    </span>
                    <span>{session.subject}</span>
                </div>

                <div className="flex items-center gap-2">
                    <span className="text-black">Start Date & Time:</span>
                    <span>{formattedDateTime}</span>
                </div>

                <div className="flex items-center gap-2">
                    <span className="text-black">End Time:</span>
                    <span>{session.last_entry_time}</span>
                </div>
                <div className="flex items-center gap-2 text-primary-500">
                    <button
                        type="button"
                        className="hover:text-primary-600 flex items-center gap-2 rounded-sm text-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                        onClick={handleOpenDialog}
                    >
                        <span>View Attendance Report</span>
                    </button>
                </div>
            </div>

            {/* Attendance Report Dialog */}
            <MyDialog
                heading="Attendance Report"
                open={openDialog}
                onOpenChange={handleOpenDialog}
                className="w-[80vw] max-w-4xl"
            >
                <div className="flex flex-col gap-3 p-4 text-sm">
                    {/* Header */}
                    <div className="flex items-start justify-between">
                        <div>
                            <h2 className="text-xl font-bold">{scheduledSessionDetails?.title}</h2>
                            <p className="text-neutral-500">
                                {scheduledSessionDetails?.meetingDate}{' '}
                                {scheduledSessionDetails?.scheduleStartTime}
                            </p>
                        </div>
                    </div>

                    {/* Basic Details */}
                    <div className="rounded-lg">
                        <h3 className="mb-1 font-semibold">Basic Class Details</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2">
                            <div className="flex gap-2">
                                <span className="font-bold">Session:</span>
                                <span>
                                    {scheduledSessionDetails?.accessLevel === 'private'
                                        ? 'Paid Members'
                                        : 'Open Session'}
                                </span>
                            </div>
                            <div className="flex gap-2">
                                <span className="font-bold">Occurrence:</span>
                                <span>{scheduledSessionDetails?.recurrenceType}</span>
                            </div>
                            <div className="flex gap-2">
                                <span className="font-bold">Type:</span>
                                <span>{scheduledSessionDetails?.accessLevel}</span>
                            </div>
                            <div className="flex gap-2">
                                <span className="font-bold">Duration:</span>
                                <span>{duration}</span>
                            </div>
                        </div>
                    </div>

                    {/* Description */}
                    <div className="rounded-lg">
                        <h3 className="mb-1 text-lg font-semibold">Description</h3>
                        <div className="prose prose-sm max-w-none text-neutral-600">
                            {scheduledSessionDetails?.descriptionHtml ? (
                                <div
                                    dangerouslySetInnerHTML={{
                                        __html: scheduledSessionDetails?.descriptionHtml,
                                    }}
                                />
                            ) : (
                                'No description available.'
                            )}
                        </div>
                    </div>

                    {/* Insights & Attendance */}
                    <div className="rounded-lg">
                        <h3 className="mb-2 text-lg font-semibold">Participants Insights</h3>
                        <div className="flex items-center justify-center rounded-md bg-neutral-100 p-4">
                            <div className="flex w-1/2 flex-col items-center justify-center gap-3">
                                <MyPieChart data={pieChartData} />
                                <div className="text-lg font-semibold">
                                    Total Participants: {attendanceSummary.total}
                                </div>
                            </div>
                            <div className="flex w-1/2 flex-col gap-4">
                                <div className="flex flex-col gap-3">
                                    <div className="flex items-center gap-2">
                                        <div className="size-4 rounded-full bg-success-400"></div>
                                        <div className="flex items-center gap-2 text-black">
                                            <span className="font-medium">Attendees:</span>
                                            <span className="font-semibold text-success-600">
                                                {attendanceSummary.present}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="size-4 rounded-full bg-success-200"></div>
                                        <div className="flex items-center gap-2 text-black">
                                            <span className="font-medium">Not Attendees:</span>
                                            <span className="font-semibold text-red-600">
                                                {attendanceSummary.absent}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <div className="rounded-lg p-3">
                                    <div className="text-left">
                                        <div className="text-sm font-medium text-neutral-600">
                                            Attendance Percentage
                                        </div>
                                        <div className="text-xl font-bold text-primary-500">
                                            {attendanceSummary.total > 0
                                                ? (
                                                      (attendanceSummary.present /
                                                          attendanceSummary.total) *
                                                      100
                                                  ).toFixed(2)
                                                : '0.00'}
                                            %
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="mt-4 rounded-lg">
                        <div className="mb-4 flex items-center justify-between">
                            <h3 className="text-lg font-semibold">Attendance</h3>
                            <div className="flex items-center gap-2">
                                {/* Bulk Actions */}
                                {reportResponse && reportResponse.length > 0 && (
                                    <AttendanceBulkActions
                                        selectedCount={selectedStudentIds.length}
                                        selectedStudentIds={selectedStudentIds}
                                        selectedStudents={selectedStudents}
                                        onReset={handleClearAll}
                                        onSendWhatsApp={handleSendWhatsApp}
                                        onSendEmail={handleSendEmail}
                                    />
                                )}
                                <MyButton
                                    type="button"
                                    scale="medium"
                                    buttonType="primary"
                                    className="flex items-center"
                                    onClick={handleExportPastAttendance}
                                >
                                    {isAttendanceExporting ? (
                                        <DashboardLoader />
                                    ) : (
                                        <>
                                            <DownloadSimple size={20} className="mr-2" />
                                            CSV
                                        </>
                                    )}
                                </MyButton>
                            </div>
                        </div>

                        <MyTable
                            data={tableData}
                            columns={attendanceReportColumnsWithCheckbox(
                                selectedStudentIds,
                                handleSelectStudent,
                                handleSelectAll,
                                handleClearAll,
                                isAllSelected,
                                isIndeterminate
                            )}
                            isLoading={isPending}
                            error={error as Error | null}
                            columnWidths={ATTENDANCE_REPORT_WIDTH}
                            currentPage={0}
                        />
                    </div>
                </div>
            </MyDialog>

            {/* Bulk Action Dialogs */}
            <SendMessageDialog />
            <SendEmailDialog />
        </div>
    );
}
