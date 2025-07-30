import QRCode from 'react-qr-code';
import { MyDialog } from '@/components/design-system/dialog';
import { Copy, DownloadSimple, LockSimple, DotsThree } from 'phosphor-react';
import { Badge } from '@/components/ui/badge';
import { MyButton } from '@/components/design-system/button';
import { BASE_URL_LEARNER_DASHBOARD, HOLISTIC_INSTITUTE_ID } from '@/constants/urls';
import { copyToClipboard } from '@/routes/assessment/create-assessment/$assessmentId/$examtype/-utils/helper';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { deleteLiveSession, LiveSession } from '../schedule/-services/utils';
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
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { DraftSession, getSessionBySessionId } from '../-services/utils';
import { LiveSessionReport } from '../-services/utils';
import {
    registrationColumns,
    REGISTRATION_WIDTH,
    reportColumns,
    REPORT_WIDTH,
} from '../-constants/reportTable';
import { MyTable } from '@/components/design-system/table';
import DeleteRecurringDialog from './delete-recurring-dialog';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { DashboardLoader } from '@/components/core/dashboard-loader';

interface LiveSessionCardProps {
    session: LiveSession;
    isDraft?: boolean;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export default function LiveSessionCard({ session, isDraft = false }: LiveSessionCardProps) {
    const [openDialog, setOpenDialog] = useState<boolean>(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState<boolean>(false);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [openDeleteDialog, setOpenDeleteDialog] = useState<boolean>(false);
    const [selectedTab, setSelectedTab] = useState<string>('Registration');
    const [isRegistrationExporting, setIsRegistrationExporting] = useState<boolean>(false);
    const [isAttendanceExporting, setIsAttendanceExporting] = useState<boolean>(false);
    // using Sonner toast for notifications

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [scheduledSessionDetails, setScheduleSessionDetails] =
        useState<SessionDetailsResponse | null>(null);
    const queryClient = useQueryClient();
    const { showForInstitutes } = useInstituteDetailsStore();
    const { mutate: fetchReport, data: reportResponse, isPending, error } = useLiveSessionReport();

    const joinLink =
        session.registration_form_link_for_public_sessions ||
        `${BASE_URL_LEARNER_DASHBOARD}/register/live-class?sessionId=${session.session_id}`;
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

    const handleDelete = async (e: React.MouseEvent, type: string) => {
        e.stopPropagation();
        if (session.recurrence_type && session.recurrence_type !== 'once') {
            // Open recurring delete dialog for recurring sessions
            setDeleteDialogOpen(true);
            return;
        }

        // For non-recurring sessions, delete directly
        try {
            await deleteLiveSession(session.session_id, type);
            await queryClient.invalidateQueries({ queryKey: ['liveSessions'] });
            await queryClient.invalidateQueries({ queryKey: ['upcomingSessions'] });
        } catch (error) {
            console.error('Error deleting session:', error);
        }
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
                {!showForInstitutes([HOLISTIC_INSTITUTE_ID]) && (
                    <div className="flex items-center gap-2">
                        <span className="text-black">Subject:</span>
                        <span>{session.subject}</span>
                    </div>
                )}

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
                <div className="flex items-center gap-2 text-sm text-neutral-500">
                    <h1 className="!font-normal text-black">Join Link:</h1>
                    <span className="px-3 py-2 text-sm underline">{joinLink}</span>
                    <MyButton
                        type="button"
                        scale="small"
                        buttonType="secondary"
                        className="h-8 min-w-8"
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
                heading="Attendance Report"
                open={openDialog}
                onOpenChange={handleOpenDialog}
                className="w-[80vw] max-w-4xl"
            >
                <div className="flex h-full flex-col gap-3 p-4 text-sm">
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
                                    <>
                                        <DashboardLoader></DashboardLoader>
                                    </>
                                ) : (
                                    <>
                                        <div className="flex items-center justify-between">
                                            <h3 className="mb-2 text-lg font-semibold">Registrations</h3>
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
                                                        <DownloadSimple size={20} className="mr-2" />
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
                                    <>
                                        <DashboardLoader></DashboardLoader>
                                    </>
                                ) : (
                                    <>
                                        <div className="flex items-center justify-between">
                                            <h3 className="mb-2 text-lg font-semibold">Attendance</h3>
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
                                                        <DownloadSimple size={20} className="mr-2" />
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
            <MyDialog
                heading="Attendance Report"
                open={openDeleteDialog}
                onOpenChange={handleOpenDeleteDialog}
                className="w-fit max-w-4xl"
            >
                <div className="flex h-full flex-col gap-3 p-4 ">
                    <div className="text-lg">
                        Do you want to delete every class for this session
                    </div>
                    <div className="flex flex-row items-center justify-between gap-4">
                        <MyButton
                            onClick={(e) => {
                                handleDelete(e, 'session');
                            }}
                        >
                            Yes
                        </MyButton>
                        <MyButton
                            onClick={(e) => {
                                handleDelete(e, 'schedule');
                            }}
                        >
                            No
                        </MyButton>
                    </div>
                </div>
            </MyDialog>

            {/* Delete recurring dialog */}
            <DeleteRecurringDialog
                open={deleteDialogOpen}
                onOpenChange={setDeleteDialogOpen}
                sessionId={session.session_id}
            />
        </div>
    );
}
