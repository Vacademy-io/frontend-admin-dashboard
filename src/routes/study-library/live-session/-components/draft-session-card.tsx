import QRCode from 'react-qr-code';
import { Copy, DownloadSimple, DotsThree } from 'phosphor-react';
import { MyButton } from '@/components/design-system/button';
import { BASE_URL_LEARNER_DASHBOARD, HOLISTIC_INSTITUTE_ID } from '@/constants/urls';
import { copyToClipboard } from '@/routes/assessment/create-assessment/$assessmentId/$examtype/-utils/helper';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { deleteLiveSession } from '../schedule/-services/utils';
import { DraftSession, getSessionBySessionId } from '../-services/utils';
import { useLiveSessionStore } from '../schedule/-store/sessionIdstore';
import { useNavigate } from '@tanstack/react-router';
import { useSessionDetailsStore } from '../-store/useSessionDetailsStore';
import { useQueryClient } from '@tanstack/react-query';
import { useInstituteDetailsStore } from '@/stores/students/students-list/useInstituteDetailsStore';
import { useState, useEffect } from 'react';
import DeleteRecurringDialog from './delete-recurring-dialog';
import type { SessionBySessionIdResponse } from '../-services/utils';

interface DraftSessionCardProps {
    session: DraftSession;
}

export default function DraftSessionCard({ session }: DraftSessionCardProps) {
    const queryClient = useQueryClient();
    // Local state for fetched session details
    const [scheduleInfo, setScheduleInfo] = useState<SessionBySessionIdResponse['schedule'] | null>(null);

    const joinLink =
        session.registration_form_link_for_public_sessions ||
        `${BASE_URL_LEARNER_DASHBOARD}/register/live-class?sessionId=${session.session_id}`;
    // Fetch detailed session info for draft to get accurate date/time
    useEffect(() => {
        getSessionBySessionId(session.session_id)
            .then((res) => setScheduleInfo(res.schedule))
            .catch((err) => console.error('Failed to fetch draft session details:', err));
    }, [session.session_id]);
    const displayDate = scheduleInfo?.meeting_date ?? session.meeting_date;
    const displayTime = scheduleInfo?.start_time ?? session.start_time;
    const formattedDateTime = `${displayDate || ''} ${displayTime || ''}`.trim();

    const navigate = useNavigate();
    const { setSessionId } = useLiveSessionStore();
    const { setSessionDetails } = useSessionDetailsStore();
    const { showForInstitutes } = useInstituteDetailsStore();
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

    const handleEditSession = async () => {
        try {
            const details = await getSessionBySessionId(session?.session_id || '');
            setSessionId(details.sessionId);
            setSessionDetails(details);
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
            await queryClient.invalidateQueries({ queryKey: ['draftSessions'] });
            await queryClient.invalidateQueries({ queryKey: ['upcomingSessions'] });
        } catch (error) {
            console.error('Error deleting session:', error);
        }
    };

    return (
        <div className="my-6 flex cursor-pointer flex-col gap-4 rounded-xl border bg-neutral-50 p-4">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <h1 className="font-semibold">{session.title}</h1>
                    {/* <Badge className="rounded-md border border-neutral-300 bg-primary-50 py-1.5 shadow-none">
                        <LockSimple size={16} className="mr-2" />
                        {session.access_level}
                    </Badge> */}
                </div>

                <div className="flex items-center gap-4">
                    {/* <Badge className="rounded-md border border-primary-200 bg-primary-50 py-1.5 shadow-none">
                        {batchIdsList[0]}
                    </Badge> */}

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
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleEditSession();
                                }}
                            >
                                Edit Live Session
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                className="cursor-pointer"
                                onClick={(e) => {
                                    handleDelete(e, 'session');
                                }}
                            >
                                Delete Live Session
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>

            <div className="flex w-full items-center justify-start gap-8 text-sm text-neutral-500">
                {!showForInstitutes([HOLISTIC_INSTITUTE_ID])}
                <div className="flex items-center gap-2">
                    <span className="text-black">Subject:</span>
                    <span>{session.subject}</span>
                </div>

                <div className="flex items-center gap-2">
                    <span className="text-black">Start Date & Time:</span>
                    <span>{formattedDateTime || 'N/A'}</span>
                </div>

                <div className="flex items-center gap-2">
                    <span className="text-black">Last Entry:</span>
                    <span>{scheduleInfo?.last_entry_time ?? session.last_entry_time ?? 'N/A'}</span>
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
                        onClick={(e) => {
                            e.stopPropagation();
                            // TODO: implement download QR code
                        }}
                    >
                        <DownloadSimple size={32} />
                    </MyButton>
                </div>
            </div>
            <DeleteRecurringDialog
                open={deleteDialogOpen}
                onOpenChange={setDeleteDialogOpen}
                sessionId={session.session_id}
            />
        </div>
    );
}
