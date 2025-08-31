/* eslint-disable @typescript-eslint/no-unused-vars */
import QRCode from 'react-qr-code';
import { MyDialog } from '@/components/design-system/dialog';
import { Copy, DownloadSimple, LockSimple, DotsThree } from 'phosphor-react';
import { Badge } from '@/components/ui/badge';
import { MyButton } from '@/components/design-system/button';
import { copyToClipboard } from '@/routes/assessment/create-assessment/$assessmentId/$examtype/-utils/helper';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { LiveSession } from '../schedule/-services/utils';
import { handleDownloadQRCode } from '@/routes/homework-creation/create-assessment/$assessmentId/$examtype/-utils/helper';
import { useQueryClient } from '@tanstack/react-query';
import { useInstituteDetailsStore } from '@/stores/students/students-list/useInstituteDetailsStore';
import { useState } from 'react';
import { toast } from 'sonner';
import Papa from 'papaparse';
import { fetchSessionDetails, SessionDetailsResponse } from '../-hooks/useSessionDetails';
import { useLiveSessionReport } from '../-hooks/useLiveSessionReport';
import { useLiveSessionStore } from '../schedule/-store/sessionIdstore';
import { useNavigate } from '@tanstack/react-router';
import { useSessionDetailsStore } from '../-store/useSessionDetailsStore';
import { DraftSession, getSessionBySessionId } from '../-services/utils';
import { LiveSessionReport } from '../-services/utils';
import {
    registrationColumns,
    REGISTRATION_WIDTH,
    reportColumns,
    REPORT_WIDTH,
} from '../-constants/reportTable';
import { MyTable } from '@/components/design-system/table';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { DashboardLoader } from '@/components/core/dashboard-loader';
import DeleteSessionDialog from './delete-session-dialog';
import { getSessionJoinLink } from '../-utils/live-sesstions';
import { getTerminology } from '@/components/common/layout-container/sidebar/utils';
import { ContentTerms, SystemTerms } from '@/routes/settings/-components/NamingSettings';

interface LiveSessionCardProps {
    session: LiveSession;
    isDraft?: boolean;
}

export default function LiveSessionCard({ session, isDraft = false }: LiveSessionCardProps) {
    const [openDialog, setOpenDialog] = useState<boolean>(false);
    const [openDeleteDialog, setOpenDeleteDialog] = useState<boolean>(false);
    const [selectedTab, setSelectedTab] = useState<string>('Registration');
    const [isRegistrationExporting, setIsRegistrationExporting] = useState<boolean>(false);
    const [isAttendanceExporting, setIsAttendanceExporting] = useState<boolean>(false);
    // using Sonner toast for notifications

    const [scheduledSessionDetails, setScheduleSessionDetails] =
        useState<SessionDetailsResponse | null>(null);
    const queryClient = useQueryClient();
    const { instituteDetails } = useInstituteDetailsStore();
    // Use mutateAsync to ensure data is fetched before opening dialog
    const {
        mutateAsync: fetchReportAsync,
        data: reportResponse,
        isPending,
        error,
    } = useLiveSessionReport();

    const joinLink = getSessionJoinLink(session, instituteDetails?.learner_portal_base_url ?? '');
    const formattedDateTime = `${session.meeting_date} ${session.start_time}`;

    const navigate = useNavigate();
    const { setSessionId, setIsEdit } = useLiveSessionStore();
    const { setSessionDetails } = useSessionDetailsStore();

    const handleTabChange = (value: string) => {
        setSelectedTab(value);
    };

    const handleEditSession = async () => {
        try {
            const details = await getSessionBySessionId(session?.session_id || '');
            setSessionId(details.sessionId);
            setSessionDetails(details);
            setIsEdit(true);
            console.log('Session Details:', details);
            navigate({ to: `/study-library/live-session/schedule/step1` });
        } catch (error) {
            console.error('Failed to fetch session details:', error);
        }
    };

    const handleDeleteSuccess = () => {
        // Close the confirmation dialog automatically
        setOpenDeleteDialog(false);
    };

    const convertToReportTableData = (data: LiveSessionReport[]) => {
        return data.map((item, idx) => ({
            index: idx + 1,
            username: item.fullName,
            phoneNumber: item.mobileNumber,
            email: item.email,
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

    const convertToReportTableAttedanceData = (data: LiveSessionReport[]) => {
        return data.map((item, idx) => ({
            index: idx + 1,
            username: item.fullName,
            attendanceStatus: item.attendanceStatus,
        }));
    };

    const tableAttendanceData = {
        content: reportResponse ? convertToReportTableAttedanceData(reportResponse) : [],
        total_pages: 0,
        page_no: 0,
        page_size: 10,
        total_elements: 0,
        last: true,
    };

    // Fetch details and report, then open dialog
    const handleOpenDialog = async () => {
        try {
            const details = await fetchSessionDetails(session.schedule_id);
            setScheduleSessionDetails(details);
            await fetchReportAsync({
                sessionId: session.session_id,
                scheduleId: session.schedule_id,
                accessType: session.access_level,
            });
            setOpenDialog(true);
        } catch (err) {
            console.error('Error loading participant details:', err);
        }
    };

    const handleOpenDeleteDialog = () => {
        setOpenDeleteDialog(!openDeleteDialog);
    };
    // Adding export handlers
    const handleExportRegistration = () => {
        setIsRegistrationExporting(true);
        const csv = Papa.unparse(tableData.content);
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `registrations_session_${session.session_id}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        setIsRegistrationExporting(false);
        toast.success('Registrations downloaded successfully.');
    };
    const handleExportAttendance = () => {
        setIsAttendanceExporting(true);
        const csvData = tableAttendanceData.content.map((item) => ({
            index: item.index,
            username: item.username,
            attendanceStatus: item.attendanceStatus === 'PRESENT' ? 'Present' : 'Absent',
        }));
        const csv = Papa.unparse(csvData);
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `attendance_session_${session.session_id}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        setIsAttendanceExporting(false);
        toast.success('Attendance report downloaded successfully.');
    };

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

                <div className="flex items-center gap-4">
                    <DropdownMenu>
                        <DropdownMenuTrigger>
                            <MyButton
                                type="button"
                                scale="small"
                                buttonType="secondary"
                                className="w-6 !min-w-6"
                            >
                                <DotsThree size={32} />
                            </MyButton>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                            <DropdownMenuItem
                                className="cursor-pointer"
                                onClick={handleOpenDeleteDialog}
                            >
                                Delete Live Session
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                className="cursor-pointer"
                                onClick={() => {
                                    handleOpenDialog();
                                }}
                            >
                                View Participant Details
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                className="cursor-pointer"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleEditSession();
                                }}
                            >
                                Edit Live Session
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
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

                <div className="flex items-center gap-2">
                    <span className="text-black">Meeting Type:</span>
                    <span>{session.recurrence_type}</span>
                </div>
            </div>

            <div className="flex justify-between">
                <div className="flex items-center gap-4 overflow-hidden text-sm text-neutral-500">
                    <h1 className="!font-normal text-black">Join Link:</h1>
                    <span className="flex-1 truncate px-2 py-1 text-sm underline" title={joinLink}>
                        {joinLink}
                    </span>
                    <MyButton
                        type="button"
                        scale="small"
                        buttonType="secondary"
                        className="mr-4 h-8 min-w-8"
                        onClick={(e) => {
                            e.stopPropagation();
                            copyToClipboard(joinLink);
                        }}
                    >
                        <Copy size={32} />
                    </MyButton>
                </div>

                <div className="flex items-center gap-4">
                    <QRCode
                        value={joinLink}
                        className="size-16"
                        id={`qr-code-svg-live-session-${session.session_id}`}
                    />
                    <MyButton
                        type="button"
                        scale="small"
                        buttonType="secondary"
                        className="h-8 min-w-8"
                        onClick={() =>
                            handleDownloadQRCode(`qr-code-svg-live-session-${session.session_id}`)
                        }
                    >
                        <DownloadSimple size={32} />
                    </MyButton>
                </div>
            </div>
            <MyDialog
                heading="Participant Details"
                open={openDialog}
                onOpenChange={(open) => setOpenDialog(open)}
                className="w-[80vw] max-w-4xl"
            >
                <div className="flex h-full flex-col gap-3 p-4 text-sm">
                    {/* Registration Count Display */}
                    <div className="flex items-center justify-between rounded-lg bg-primary-50 p-4">
                        <div className="flex items-center gap-6">
                            <div className="text-lg font-semibold text-primary-500">
                                Total Registrations: {reportResponse?.length || 0}
                            </div>
                            {reportResponse && reportResponse.length > 0 && (
                                <>
                                    <div className="h-6 w-px bg-neutral-300" />
                                    <div className="flex items-center gap-4 text-sm">
                                        <div className="font-medium text-success-500">
                                            Present:{' '}
                                            {
                                                reportResponse.filter(
                                                    (item) => item.attendanceStatus === 'PRESENT'
                                                ).length
                                            }
                                        </div>
                                        <div className="font-medium text-neutral-500">
                                            Absent:{' '}
                                            {
                                                reportResponse.filter(
                                                    (item) => item.attendanceStatus !== 'PRESENT'
                                                ).length
                                            }
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                        <div className="text-sm text-neutral-600">
                            {reportResponse && reportResponse.length > 0
                                ? 'Participants summary for this session'
                                : 'No registrations yet'}
                        </div>
                    </div>
                    <div className="mt-4 h-full rounded-lg">
                        <Tabs value={selectedTab} onValueChange={handleTabChange}>
                            <div className="flex flex-row justify-between">
                                <TabsList className="inline-flex h-auto justify-start gap-4 rounded-none border-b !bg-transparent p-0">
                                    <TabsTrigger
                                        key={'Registration'}
                                        value={'Registration'}
                                        className={`flex gap-1.5 rounded-none px-12 py-2 !shadow-none ${
                                            selectedTab === 'Registration'
                                                ? 'rounded-t-sm border !border-b-0 border-primary-200 !bg-primary-50'
                                                : 'border-none bg-transparent'
                                        }`}
                                    >
                                        Registered Users
                                    </TabsTrigger>
                                    <TabsTrigger
                                        key={'Attendance'}
                                        value={'Attendance'}
                                        className={`flex gap-1.5 rounded-none px-12 py-2 !shadow-none ${
                                            selectedTab === 'Attendance'
                                                ? 'rounded-t-sm border !border-b-0 border-primary-200 !bg-primary-50'
                                                : 'border-none bg-transparent'
                                        }`}
                                    >
                                        Attendance
                                    </TabsTrigger>
                                </TabsList>
                            </div>

                            <TabsContent value={'Registration'} className="space-y-4">
                                {isPending ? (
                                    <DashboardLoader />
                                ) : (
                                    <>
                                        <div className="flex items-center justify-between">
                                            <h3 className="mb-2 text-lg font-semibold">
                                                Registrations
                                            </h3>
                                            <MyButton
                                                type="button"
                                                scale="large"
                                                buttonType="secondary"
                                                className="flex items-center font-medium"
                                                onClick={handleExportRegistration}
                                            >
                                                {isRegistrationExporting ? (
                                                    <DashboardLoader></DashboardLoader>
                                                ) : (
                                                    <>
                                                        <DownloadSimple
                                                            size={20}
                                                            className="mr-2"
                                                        />
                                                        Export
                                                    </>
                                                )}
                                            </MyButton>
                                        </div>
                                        <MyTable
                                            data={tableData}
                                            columns={registrationColumns}
                                            isLoading={isPending}
                                            error={error as Error | null}
                                            columnWidths={REGISTRATION_WIDTH}
                                            currentPage={0}
                                            className="!h-[70%] !w-fit"
                                        />
                                    </>
                                )}
                            </TabsContent>
                            <TabsContent value={'Attendance'} className="space-y-4">
                                {isPending ? (
                                    <DashboardLoader />
                                ) : (
                                    <>
                                        <div className="flex items-center justify-between">
                                            <h3 className="mb-2 text-lg font-semibold">
                                                Attendance
                                            </h3>
                                            <MyButton
                                                type="button"
                                                scale="large"
                                                buttonType="secondary"
                                                className="flex items-center font-medium"
                                                onClick={handleExportAttendance}
                                            >
                                                {isAttendanceExporting ? (
                                                    <DashboardLoader></DashboardLoader>
                                                ) : (
                                                    <>
                                                        <DownloadSimple
                                                            size={20}
                                                            className="mr-2"
                                                        />
                                                        Export
                                                    </>
                                                )}
                                            </MyButton>
                                        </div>
                                        <MyTable
                                            data={tableAttendanceData}
                                            columns={reportColumns}
                                            isLoading={isPending}
                                            error={error as Error | null}
                                            columnWidths={REPORT_WIDTH}
                                            currentPage={0}
                                            className="!h-[70%] !w-fit"
                                        />
                                    </>
                                )}
                            </TabsContent>
                        </Tabs>
                    </div>
                </div>
            </MyDialog>
            <DeleteSessionDialog
                open={openDeleteDialog}
                onOpenChange={setOpenDeleteDialog}
                sessionId={session.session_id}
                scheduleId={session.schedule_id}
                isRecurring={session.recurrence_type !== 'once'}
                onSuccess={handleDeleteSuccess}
            />
        </div>
    );
}
