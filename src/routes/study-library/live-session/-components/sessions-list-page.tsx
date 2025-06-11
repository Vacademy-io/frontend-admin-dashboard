import { useNavHeadingStore } from '@/stores/layout-container/useNavHeadingStore';
import { useEffect, useState } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { MyButton } from '@/components/design-system/button';
import { SessionStatus, sessionStatusLabels } from '../-constants/enums';
import LiveSessionCard from './live-session-card';
import { useNavigate } from '@tanstack/react-router';
import {
    useLiveSessions,
    useUpcomingSessions,
    usePastSessions,
    useDraftSessions,
} from '../-hooks/useLiveSessions';
import { getTokenDecodedData, getTokenFromCookie } from '@/lib/auth/sessionUtility';
import { TokenKey } from '@/constants/auth/tokens';
import { LiveSession, SessionsByDate } from '../-services/utils';
import PreviousSessionCard from './previous-session-card';

export default function SessionListPage() {
    const { setNavHeading } = useNavHeadingStore();
    const [selectedTab, setSelectedTab] = useState<SessionStatus>(SessionStatus.LIVE);
    const navigate = useNavigate();

    const accessToken = getTokenFromCookie(TokenKey.accessToken);
    const tokenData = getTokenDecodedData(accessToken);
    const INSTITUTE_ID = (tokenData && Object.keys(tokenData.authorities)[0]) || '';

    // Fetch sessions data
    const {
        data: liveSessions,
        isLoading: isLiveLoading,
        error: liveError,
    } = useLiveSessions(INSTITUTE_ID);
    const {
        data: upcomingSessions,
        isLoading: isUpcomingLoading,
        error: upcomingError,
    } = useUpcomingSessions(INSTITUTE_ID);
    const {
        data: pastSessions,
        isLoading: isPastLoading,
        error: pastError,
    } = usePastSessions(INSTITUTE_ID);
    const {
        data: draftSessions,
        isLoading: isDraftLoading,
        error: draftError,
    } = useDraftSessions(INSTITUTE_ID);

    const handleTabChange = (value: string) => {
        setSelectedTab(value as SessionStatus);
    };

    useEffect(() => {
        setNavHeading('Live Session');
    }, []);

    const renderLiveSessions = (sessions: LiveSession[] | undefined) => {
        if (isLiveLoading) return <div>Loading...</div>;
        if (liveError) return <div>Error loading sessions: {liveError.message}</div>;
        if (!sessions?.length) return <div>No live sessions found</div>;
        return sessions.map((session) => (
            <LiveSessionCard key={session.session_id} session={session} />
        ));
    };

    const renderSessionsByDate = (
        sessions: SessionsByDate[] | undefined,
        isLoading: boolean,
        error: Error | null,
        emptyMessage: string
    ) => {
        if (isLoading) return <div>Loading...</div>;
        if (error) return <div>Error loading sessions: {error.message}</div>;
        if (!sessions?.length) return <div>{emptyMessage}</div>;

        return sessions.map((day) => (
            <div key={day.date} className="mb-4">
                <h2 className="mb-2 text-lg font-semibold">{day.date}</h2>
                {day.sessions.map((session) => (
                    <LiveSessionCard
                        key={`${session.session_id}-${session.schedule_id}`}
                        session={session}
                    />
                ))}
            </div>
        ));
    };
    const renderDraftSessions = (
        sessions: SessionsByDate[] | undefined,
        isLoading: boolean,
        error: Error | null,
        emptyMessage: string
    ) => {
        if (isLoading) return <div>Loading...</div>;
        if (error) return <div>Error loading sessions: {error.message}</div>;
        if (!sessions?.length) return <div>{emptyMessage}</div>;

        return sessions.map((day) => (
            <div key={day.date} className="mb-4">
                <h2 className="mb-2 text-lg font-semibold">{day.date}</h2>
                {day.sessions.map((session) => (
                    <LiveSessionCard
                        key={`${session.session_id}-${session.schedule_id}`}
                        session={session}
                    />
                ))}
            </div>
        ));
    };

    const renderPreviousSessions = (
        sessions: SessionsByDate[] | undefined,
        isLoading: boolean,
        error: Error | null,
        emptyMessage: string
    ) => {
        if (isLoading) return <div>Loading...</div>;
        if (error) return <div>Error loading sessions: {error.message}</div>;
        if (!sessions?.length) return <div>{emptyMessage}</div>;

        return sessions.map((day) => (
            <div key={day.date} className="mb-4">
                <h2 className="mb-2 text-lg font-semibold">{day.date}</h2>
                {day.sessions.map((session) => (
                    <PreviousSessionCard
                        key={`${session.session_id}-${session.schedule_id}`}
                        session={session}
                    />
                ))}
            </div>
        ));
    };

    return (
        <div>
            <Tabs value={selectedTab} onValueChange={handleTabChange}>
                <div className="flex flex-row justify-between">
                    <TabsList className="inline-flex h-auto justify-start gap-4 rounded-none border-b !bg-transparent p-0">
                        {Object.values(SessionStatus).map((status) => (
                            <TabsTrigger
                                key={status}
                                value={status}
                                className={`flex gap-1.5 rounded-none px-12 py-2 !shadow-none ${
                                    selectedTab === status
                                        ? 'rounded-t-sm border !border-b-0 border-primary-200 !bg-primary-50'
                                        : 'border-none bg-transparent'
                                }`}
                            >
                                {sessionStatusLabels[status]}
                            </TabsTrigger>
                        ))}
                    </TabsList>
                    <MyButton
                        onClick={() => navigate({ to: '/study-library/live-session/schedule' })}
                        buttonType="primary"
                    >
                        Schedule
                    </MyButton>
                </div>

                <TabsContent value={SessionStatus.LIVE} className="space-y-4">
                    {renderLiveSessions(liveSessions)}
                </TabsContent>
                <TabsContent value={SessionStatus.UPCOMING} className="space-y-4">
                    {renderSessionsByDate(
                        upcomingSessions,
                        isUpcomingLoading,
                        upcomingError,
                        'No upcoming sessions found'
                    )}
                </TabsContent>
                <TabsContent value={SessionStatus.PAST} className="space-y-4">
                    {renderPreviousSessions(
                        pastSessions,
                        isPastLoading,
                        pastError,
                        'No past sessions found'
                    )}
                </TabsContent>
                <TabsContent value={SessionStatus.DRAFTS} className="space-y-4">
                    {/* TODO: Add draft sessions component */}
                    {renderDraftSessions(
                        draftSessions,
                        isDraftLoading,
                        draftError,
                        'No draft sessions found'
                    )}
                </TabsContent>
            </Tabs>
        </div>
    );
}
