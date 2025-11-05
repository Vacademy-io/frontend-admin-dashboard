import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useEffect, useState, useMemo } from 'react';
import { getSessionBySessionId } from '../-services/utils';
import type { SessionBySessionIdResponse } from '../-services/utils';
import {
    Loader2,
    Calendar,
    Clock,
    Users,
    Link as LinkIcon,
    Video,
    Globe,
    Edit,
    ArrowLeft,
} from 'lucide-react';
import { format } from 'date-fns';
import { MyButton } from '@/components/design-system/button';
import { useLiveSessionStore } from '../schedule/-store/sessionIdstore';
import { useSessionDetailsStore } from '../-store/useSessionDetailsStore';
import { toast } from 'sonner';

export const Route = createFileRoute('/study-library/live-session/view/$sessionId')({
    component: ViewLiveSession,
});

interface GroupedSchedule {
    date: string;
    sessions: Array<{
        time: string;
        duration: string;
        link: string;
        id: string;
    }>;
}

function ViewLiveSession() {
    const { sessionId } = Route.useParams();
    const navigate = useNavigate();
    const [sessionData, setSessionData] = useState<SessionBySessionIdResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const { setSessionId, setIsEdit } = useLiveSessionStore();
    const { setSessionDetails } = useSessionDetailsStore();

    useEffect(() => {
        const fetchSessionDetails = async () => {
            try {
                setLoading(true);
                const data = await getSessionBySessionId(sessionId);
                setSessionData(data);
            } catch (err) {
                console.error('Error fetching session details:', err);
                setError('Failed to load session details');
            } finally {
                setLoading(false);
            }
        };

        fetchSessionDetails();
    }, [sessionId]);

    const handleEditSession = async () => {
        try {
            // If sessionData is already loaded, use it. Otherwise fetch it.
            const details = sessionData || (await getSessionBySessionId(sessionId));
            setSessionId(details.schedule.session_id);
            setSessionDetails(details);
            setIsEdit(true);
            navigate({ to: '/study-library/live-session/schedule/step1' });
        } catch (err) {
            console.error('Failed to load session for editing:', err);
            toast.error('Failed to load session for editing');
        }
    };

    // Group schedules by date for calendar view
    const groupedSchedules = useMemo(() => {
        if (!sessionData?.schedule?.added_schedules) return [];

        const grouped = new Map<string, GroupedSchedule['sessions']>();

        sessionData.schedule.added_schedules.forEach((schedule) => {
            const date = (schedule as { meetingDate?: string }).meetingDate || '';
            if (!date) return;

            if (!grouped.has(date)) {
                grouped.set(date, []);
            }

            grouped.get(date)!.push({
                time: schedule.startTime,
                duration: schedule.duration,
                link: schedule.link,
                id: schedule.id,
            });
        });

        // Convert to array and sort by date
        return Array.from(grouped.entries())
            .map(([date, sessions]) => ({
                date,
                sessions: sessions.sort((a, b) => a.time.localeCompare(b.time)),
            }))
            .sort((a, b) => a.date.localeCompare(b.date));
    }, [sessionData]);

    if (loading) {
        return (
            <div className="flex h-96 items-center justify-center">
                <Loader2 className="size-8 animate-spin text-primary-600" />
            </div>
        );
    }

    if (error || !sessionData) {
        return (
            <div className="flex h-96 items-center justify-center">
                <div className="text-center">
                    <p className="text-lg font-medium text-red-600">
                        {error || 'Session not found'}
                    </p>
                </div>
            </div>
        );
    }

    const { schedule } = sessionData;
    const isRecurring = schedule.recurrence_type === 'weekly';

    return (
        <div className="mx-auto max-w-7xl p-6">
            {/* Header */}
            <div className="mb-8">
                <div className="mb-4 flex items-center justify-between">
                    <button
                        onClick={() => navigate({ to: '/study-library/live-session' })}
                        className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
                    >
                        <ArrowLeft className="size-4" />
                        Back to Sessions
                    </button>
                    <MyButton onClick={handleEditSession} className="flex items-center gap-2">
                        <Edit className="size-4" />
                        Edit Session
                    </MyButton>
                </div>
                <h1 className="text-3xl font-bold text-gray-900">{schedule.title}</h1>
                {schedule.subject && schedule.subject !== 'none' && (
                    <p className="mt-2 text-lg text-gray-600">Subject: {schedule.subject}</p>
                )}
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                {/* Main Content - Left Side */}
                <div className="space-y-6 lg:col-span-2">
                    {/* Basic Information Card */}
                    <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
                        <h2 className="mb-4 text-xl font-semibold text-gray-900">
                            Session Details
                        </h2>
                        <div className="space-y-4">
                            <InfoRow
                                icon={<Calendar className="size-5 text-gray-400" />}
                                label="Session Type"
                                value={isRecurring ? 'Weekly Recurring' : 'One-Time Session'}
                            />
                            <InfoRow
                                icon={<Globe className="size-5 text-gray-400" />}
                                label="Timezone"
                                value={schedule.timezone || 'Not specified'}
                            />
                            <InfoRow
                                icon={<Clock className="size-5 text-gray-400" />}
                                label="Start Date & Time"
                                value={format(new Date(schedule.start_time), 'PPpp')}
                            />
                            {isRecurring && schedule.session_end_date && (
                                <InfoRow
                                    icon={<Calendar className="size-5 text-gray-400" />}
                                    label="End Date"
                                    value={format(new Date(schedule.session_end_date), 'PP')}
                                />
                            )}
                            <InfoRow
                                icon={<LinkIcon className="size-5 text-gray-400" />}
                                label="Default Meeting Link"
                                value={
                                    <a
                                        href={schedule.default_meet_link}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-primary-600 hover:underline"
                                    >
                                        {schedule.default_meet_link}
                                    </a>
                                }
                            />
                            <InfoRow
                                icon={<Video className="size-5 text-gray-400" />}
                                label="Platform"
                                value={schedule.link_type || 'Other'}
                            />
                            <InfoRow
                                icon={<Users className="size-5 text-gray-400" />}
                                label="Access Type"
                                value={schedule.access_type === 'private' ? 'Private' : 'Public'}
                            />
                        </div>
                    </div>

                    {/* Description Card */}
                    {schedule.description_html && (
                        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
                            <h2 className="mb-4 text-xl font-semibold text-gray-900">
                                Description
                            </h2>
                            <div
                                className="prose max-w-none"
                                dangerouslySetInnerHTML={{ __html: schedule.description_html }}
                            />
                        </div>
                    )}

                    {/* Calendar View for Recurring Sessions */}
                    {isRecurring && groupedSchedules.length > 0 && (
                        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
                            <h2 className="mb-4 text-xl font-semibold text-gray-900">
                                Scheduled Sessions ({groupedSchedules.length} days)
                            </h2>
                            <div className="space-y-4">
                                {groupedSchedules.map((daySchedule) => (
                                    <div
                                        key={daySchedule.date}
                                        className="rounded-md border border-gray-100 bg-gray-50 p-4"
                                    >
                                        <div className="mb-3 flex items-center justify-between">
                                            <h3 className="text-lg font-medium text-gray-900">
                                                {format(
                                                    new Date(daySchedule.date),
                                                    'EEEE, MMMM d, yyyy'
                                                )}
                                            </h3>
                                            <span className="text-sm text-gray-500">
                                                {daySchedule.sessions.length} session
                                                {daySchedule.sessions.length !== 1 ? 's' : ''}
                                            </span>
                                        </div>
                                        <div className="space-y-2">
                                            {daySchedule.sessions.map((session) => (
                                                <div
                                                    key={session.id}
                                                    className="flex items-center justify-between rounded border border-white bg-white p-3"
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <div className="flex items-center gap-2">
                                                            <Clock className="size-4 text-primary-600" />
                                                            <span className="font-medium text-gray-900">
                                                                {session.time}
                                                            </span>
                                                        </div>
                                                        <span className="text-sm text-gray-500">
                                                            ({session.duration} minutes)
                                                        </span>
                                                    </div>
                                                    <a
                                                        href={session.link}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="text-sm text-primary-600 hover:underline"
                                                    >
                                                        Join Link →
                                                    </a>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Sidebar - Right Side */}
                <div className="space-y-6">
                    {/* Settings Card */}
                    <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
                        <h2 className="mb-4 text-xl font-semibold text-gray-900">Settings</h2>
                        <div className="space-y-3">
                            <SettingRow
                                label="Waiting Room"
                                value={
                                    schedule.waiting_room_time &&
                                    Number(schedule.waiting_room_time) > 0
                                        ? `${schedule.waiting_room_time} minutes before`
                                        : 'Disabled'
                                }
                            />
                            <SettingRow
                                label="Allow Rewind"
                                value={schedule.allow_rewind ? 'Yes' : 'No'}
                            />
                            <SettingRow
                                label="Allow Pause"
                                value={schedule.allow_play_pause ? 'Yes' : 'No'}
                            />
                            <SettingRow
                                label="Streaming Type"
                                value={
                                    schedule.session_streaming_service_type === 'embed'
                                        ? 'Embed in App'
                                        : 'Redirect to Platform'
                                }
                            />
                        </div>
                    </div>

                    {/* Media Card */}
                    {(schedule.thumbnail_file_id || schedule.background_score_file_id) && (
                        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
                            <h2 className="mb-4 text-xl font-semibold text-gray-900">
                                Media Files
                            </h2>
                            <div className="space-y-2">
                                {schedule.thumbnail_file_id && (
                                    <div className="text-sm text-gray-600">
                                        ✓ Thumbnail attached
                                    </div>
                                )}
                                {schedule.background_score_file_id && (
                                    <div className="text-sm text-gray-600">
                                        ✓ Background music attached
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Batch Info */}
                    {schedule.package_session_ids && schedule.package_session_ids.length > 0 && (
                        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
                            <h2 className="mb-4 text-xl font-semibold text-gray-900">
                                Associated Batches
                            </h2>
                            <div className="text-sm text-gray-600">
                                {schedule.package_session_ids.length} batch
                                {schedule.package_session_ids.length !== 1 ? 'es' : ''} linked
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

// Helper Components
function InfoRow({
    icon,
    label,
    value,
}: {
    icon: React.ReactNode;
    label: string;
    value: React.ReactNode;
}) {
    return (
        <div className="flex items-start gap-3">
            <div className="mt-0.5">{icon}</div>
            <div className="flex-1">
                <div className="text-sm font-medium text-gray-500">{label}</div>
                <div className="mt-1 text-base text-gray-900">{value}</div>
            </div>
        </div>
    );
}

function SettingRow({ label, value }: { label: string; value: string }) {
    return (
        <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">{label}</span>
            <span className="text-sm font-medium text-gray-900">{value}</span>
        </div>
    );
}
