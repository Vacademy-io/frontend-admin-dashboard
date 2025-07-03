import { LockSimple } from 'phosphor-react';
import { Badge } from '@/components/ui/badge';
import { LiveSession } from '../schedule/-services/utils';
import { useMemo, useState } from 'react';
import { MyDialog } from '@/components/design-system/dialog';
import { fetchSessionDetails, SessionDetailsResponse } from '../-hooks/useSessionDetails';
import { MyButton } from '@/components/design-system/button';
import { MyTable } from '@/components/design-system/table';
import { useLiveSessionReport } from '../-hooks/useLiveSessionReport';
import { reportColumns, REPORT_WIDTH } from '../-constants/reportTable';
import { LiveSessionReport } from '../-services/utils';
import { MyPieChart } from '@/components/design-system/charts/MyPieChart';
import { useInstituteDetailsStore } from '@/stores/students/students-list/useInstituteDetailsStore';
import { HOLISTIC_INSTITUTE_ID } from '@/constants/urls';

interface PreviousSessionCardProps {
    session: LiveSession;
}

export default function PreviousSessionCard({ session }: PreviousSessionCardProps) {
    const [openDialog, setOpenDialog] = useState<boolean>(false);
    const [scheduledSessionDetails, setScheduleSessionDetails] =
        useState<SessionDetailsResponse | null>(null);

    const { mutate: fetchReport, data: reportResponse, isPending, error } = useLiveSessionReport();
    const { showForInstitutes } = useInstituteDetailsStore();

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

    const convertToReportTableData = (data: LiveSessionReport[]) => {
        return data.map((item, idx) => ({
            index: idx + 1,
            username: item.fullName,
            attendanceStatus: item.attendanceStatus,
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
                <div
                    className="flex items-center gap-2 text-primary-500"
                    onClick={handleOpenDialog}
                >
                    <span>View Attendance Report</span>
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
                                    <h2 className="text-xl font-bold">
                                        {scheduledSessionDetails?.title}
                                    </h2>
                                    <p className="text-neutral-500">
                                        {scheduledSessionDetails?.meetingDate}{' '}
                                        {scheduledSessionDetails?.scheduleStartTime}
                                    </p>
                                </div>
                                <MyButton type="button" buttonType="secondary">
                                    Export
                                </MyButton>
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
                                    {/* 
                                    <div className="flex gap-2">
                                        <span className="font-bold">Time Zone:</span>
                                        <span>{}</span>
                                    </div> */}
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
                                <h3 className="mb-2 text-lg font-semibold">
                                    Participants Insights
                                </h3>
                                <div className="flex items-center justify-center rounded-md bg-neutral-100 p-4">
                                    <div className="flex w-1/2 flex-col items-center justify-center gap-3">
                                        <MyPieChart data={pieChartData} />
                                        <div>Total Participants: {attendanceSummary.total}</div>
                                    </div>
                                    <div className="flex w-1/2 flex-row gap-4 text-center">
                                        <div className="flex flex-row gap-2 text-success-600">
                                            <div className="size-4 rounded-full bg-success-400"></div>
                                            <div className="flex flex-row gap-2 text-black">
                                                <div>Attendees</div>
                                                <div>{`(${attendanceSummary.present})`}</div>
                                            </div>
                                        </div>
                                        <div className="flex flex-row gap-2 text-success-200">
                                            <div className="size-4 rounded-full bg-success-200"></div>
                                            <div className="flex flex-row gap-2 text-black">
                                                <div>Not Attendees</div>
                                                <div>{`(${attendanceSummary.absent})`}</div>
                                            </div>
                                        </div>
                                        <div className="font-bold">
                                            Attendance Percentage:{' '}
                                            {(attendanceSummary.present / attendanceSummary.total) *
                                                100}
                                            %
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-4 rounded-lg">
                                <h3 className="mb-2 text-lg font-semibold">Attendance</h3>
                                <MyTable
                                    data={tableData}
                                    columns={reportColumns}
                                    isLoading={isPending}
                                    error={error as Error | null}
                                    columnWidths={REPORT_WIDTH}
                                    currentPage={0}
                                    // className="!h-full"
                                />
                            </div>
                        </div>
                    </MyDialog>
                </div>
            </div>
        </div>
    );
}
