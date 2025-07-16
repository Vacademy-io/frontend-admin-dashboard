import { useNavHeadingStore } from '@/stores/layout-container/useNavHeadingStore';
import { useEffect, useState, useMemo } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { MyButton } from '@/components/design-system/button';
import { SessionStatus, sessionStatusLabels, RecurringType, AccessType } from '../-constants/enums';
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
import { DraftSessionDay, LiveSession, SessionsByDate } from '../-services/utils';
import PreviousSessionCard from './previous-session-card';
import DraftSessionCard from './draft-session-card';
import { useSessionDetailsStore } from '../-store/useSessionDetailsStore';
import Pagination from './pagination';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { CalendarIcon } from '@radix-ui/react-icons';
import { CaretDownIcon } from '@radix-ui/react-icons';
import { useQuery } from '@tanstack/react-query';
import { useInstituteQuery } from '@/services/student-list-section/getInstituteDetails';
import { useFilterDataForAssesment } from '@/routes/assessment/assessment-list/-utils.ts/useFiltersData';

export default function SessionListPage() {
    const { setNavHeading } = useNavHeadingStore();
    const { clearSessionDetails } = useSessionDetailsStore();
    const [selectedTab, setSelectedTab] = useState<SessionStatus>(SessionStatus.LIVE);
    const navigate = useNavigate();

    // Filter state
    const [searchQuery, setSearchQuery] = useState('');
    const [startDate, setStartDate] = useState<Date | undefined>(undefined);
    const [endDate, setEndDate] = useState<Date | undefined>(undefined);
    const [meetingTypeFilter, setMeetingTypeFilter] = useState<RecurringType | ''>('');
    const [subjectFilter, setSubjectFilter] = useState<string>('');
    const [accessFilter, setAccessFilter] = useState<AccessType | ''>('');
    const { data: instituteDetails } = useQuery(useInstituteQuery());
    const { SubjectFilterData } = useFilterDataForAssesment(instituteDetails);

    // Pagination state for each tab
    const [currentPages, setCurrentPages] = useState({
        [SessionStatus.LIVE]: 1,
        [SessionStatus.UPCOMING]: 1,
        [SessionStatus.PAST]: 1,
        [SessionStatus.DRAFTS]: 1,
    });

    const ITEMS_PER_PAGE = 4;

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

    // Prepare filtered data
    const filteredLiveSessions = useMemo(() => {
        if (!liveSessions) return [];
        return liveSessions.filter(sess => {
            const matchName = sess.title.toLowerCase().includes(searchQuery.toLowerCase());
            const sessDate = new Date(sess.meeting_date);
            const matchDate = (!startDate || sessDate >= startDate) && (!endDate || sessDate <= endDate);
            const matchType = !meetingTypeFilter || sess.recurrence_type === meetingTypeFilter;
            const matchSubject = !subjectFilter || sess.subject === subjectFilter;
            const matchAccess = !accessFilter || sess.access_level === accessFilter;
            return matchName && matchDate && matchType && matchSubject && matchAccess;
        });
    }, [liveSessions, searchQuery, startDate, endDate, meetingTypeFilter, subjectFilter, accessFilter]);

    const flattenedUpcoming = upcomingSessions ? flattenSessionsByDate(upcomingSessions) : [];
    const filteredUpcomingSessions = useMemo(() => flattenedUpcoming.filter(sess => {
        const matchName = sess.title.toLowerCase().includes(searchQuery.toLowerCase());
        const sessDate = new Date(sess.meeting_date);
        const matchDate = (!startDate || sessDate >= startDate) && (!endDate || sessDate <= endDate);
        const matchType = !meetingTypeFilter || sess.recurrence_type === meetingTypeFilter;
        const matchSubject = !subjectFilter || sess.subject === subjectFilter;
        const matchAccess = !accessFilter || sess.access_level === accessFilter;
        return matchName && matchDate && matchType && matchSubject && matchAccess;
    }), [flattenedUpcoming, searchQuery, startDate, endDate, meetingTypeFilter, subjectFilter, accessFilter]);

    const flattenedPast = pastSessions ? flattenSessionsByDate(pastSessions) : [];
    const filteredPastSessions = useMemo(() => flattenedPast.filter(sess => {
        /* same filter logic as above */
        const matchName = sess.title.toLowerCase().includes(searchQuery.toLowerCase());
        const sessDate = new Date(sess.meeting_date);
        const matchDate = (!startDate || sessDate >= startDate) && (!endDate || sessDate <= endDate);
        const matchType = !meetingTypeFilter || sess.recurrence_type === meetingTypeFilter;
        const matchSubject = !subjectFilter || sess.subject === subjectFilter;
        const matchAccess = !accessFilter || sess.access_level === accessFilter;
        return matchName && matchDate && matchType && matchSubject && matchAccess;
    }), [flattenedPast, searchQuery, startDate, endDate, meetingTypeFilter, subjectFilter, accessFilter]);

    const filteredDraftSessions = useMemo(() => {
        if (!draftSessions) return [];
        return draftSessions.filter(sess => {
            const matchName = sess.title.toLowerCase().includes(searchQuery.toLowerCase());
            const sessDate = sess.meeting_date ? new Date(sess.meeting_date) : null;
            const matchDate = (!startDate || (sessDate && sessDate >= startDate)) && (!endDate || (sessDate && sessDate <= endDate));
            const matchType = !meetingTypeFilter || sess.recurrence_type === meetingTypeFilter;
            const matchSubject = !subjectFilter || sess.subject === subjectFilter;
            const matchAccess = !accessFilter || sess.access_level === accessFilter;
            return matchName && matchDate && matchType && matchSubject && matchAccess;
        });
    }, [draftSessions, searchQuery, startDate, endDate, meetingTypeFilter, subjectFilter, accessFilter]);

    const handleTabChange = (value: string) => {
        const newTab = value as SessionStatus;
        setSelectedTab(newTab);
        // Reset to page 1 when switching tabs
        setCurrentPages(prev => ({
            ...prev,
            [newTab]: 1
        }));
    };

    // Pagination helper functions
    const handlePageChange = (tab: SessionStatus, page: number) => {
        setCurrentPages(prev => ({
            ...prev,
            [tab]: page
        }));
    };

    const handlePrevious = (tab: SessionStatus) => {
        setCurrentPages(prev => ({
            ...prev,
            [tab]: Math.max(1, prev[tab] - 1)
        }));
    };

    const handleNext = (tab: SessionStatus, totalPages: number) => {
        setCurrentPages(prev => ({
            ...prev,
            [tab]: Math.min(totalPages, prev[tab] + 1)
        }));
    };

    // Helper function to paginate any array
    const paginateArray = <T,>(array: T[], currentPage: number): T[] => {
        const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
        const endIndex = startIndex + ITEMS_PER_PAGE;
        return array.slice(startIndex, endIndex);
    };

    // Helper function to flatten sessions by date for pagination
    const flattenSessionsByDate = (sessionsByDate: SessionsByDate[]): LiveSession[] => {
        return sessionsByDate.flatMap(day => day.sessions);
    };

    useEffect(() => {
        setNavHeading('Live Session');
        clearSessionDetails();
    }, []);

    const renderLiveSessions = (sessions: LiveSession[] | undefined) => {
        if (isLiveLoading) return <div>Loading...</div>;
        if (liveError) return <div>Error loading sessions: {liveError.message}</div>;
        if (!sessions?.length) return <div className="text-2xl font-bold text-center py-8 bg-gradient-to-r from-primary-500 to-primary-600 bg-clip-text text-transparent">No Live Session</div>;

        const currentPage = currentPages[SessionStatus.LIVE];
        const totalPages = Math.ceil(sessions.length / ITEMS_PER_PAGE);
        const paginatedSessions = paginateArray(sessions, currentPage);

        return (
            <div>
                <div className="space-y-4">
                    {paginatedSessions.map((session) => (
                        <LiveSessionCard key={session.session_id} session={session} />
                    ))}
                </div>
                <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={(page) => handlePageChange(SessionStatus.LIVE, page)}
                    onPrevious={() => handlePrevious(SessionStatus.LIVE)}
                    onNext={() => handleNext(SessionStatus.LIVE, totalPages)}
                />
            </div>
        );
    };

    const renderSessionsByDate = (
        sessions: SessionsByDate[] | undefined,
        isLoading: boolean,
        error: Error | null,
        emptyMessage: string,
        tabType: SessionStatus
    ) => {
        if (isLoading) return <div>Loading...</div>;
        if (error) return <div>Error loading sessions: {error.message}</div>;
        if (!sessions?.length) return <div className="text-2xl font-bold text-center py-8 bg-gradient-to-r from-primary-500 to-primary-600 bg-clip-text text-transparent">{emptyMessage}</div>;

        // Flatten all sessions for pagination
        const allSessions = flattenSessionsByDate(sessions);
        const currentPage = currentPages[tabType];
        const totalPages = Math.ceil(allSessions.length / ITEMS_PER_PAGE);
        const paginatedSessions = paginateArray(allSessions, currentPage);

        return (
            <div>
                <div className="space-y-4">
                    {paginatedSessions.map((session) => (
                        <LiveSessionCard
                            key={`${session.session_id}-${session.schedule_id}`}
                            session={session}
                        />
                    ))}
                </div>
                <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={(page) => handlePageChange(tabType, page)}
                    onPrevious={() => handlePrevious(tabType)}
                    onNext={() => handleNext(tabType, totalPages)}
                />
            </div>
        );
    };
    const renderDraftSessions = (
        sessions: DraftSessionDay[] | undefined,
        isLoading: boolean,
        error: Error | null,
        emptyMessage: string
    ) => {
        if (isLoading) return <div>Loading...</div>;
        if (error) return <div>Error loading sessions: {error.message}</div>;
        if (!sessions?.length) return <div className="text-2xl font-bold text-center py-8 bg-gradient-to-r from-primary-500 to-primary-600 bg-clip-text text-transparent">{emptyMessage}</div>;

        const currentPage = currentPages[SessionStatus.DRAFTS];
        const totalPages = Math.ceil(sessions.length / ITEMS_PER_PAGE);
        const paginatedSessions = paginateArray(sessions, currentPage);

        return (
            <div>
                <div className="space-y-4">
                    {paginatedSessions.map((session) => (
                        <DraftSessionCard key={session.session_id} session={session} />
                    ))}
                </div>
                <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={(page) => handlePageChange(SessionStatus.DRAFTS, page)}
                    onPrevious={() => handlePrevious(SessionStatus.DRAFTS)}
                    onNext={() => handleNext(SessionStatus.DRAFTS, totalPages)}
                />
            </div>
        );
    };

    const renderPreviousSessions = (
        sessions: SessionsByDate[] | undefined,
        isLoading: boolean,
        error: Error | null,
        emptyMessage: string
    ) => {
        if (isLoading) return <div>Loading...</div>;
        if (error) return <div>Error loading sessions: {error.message}</div>;
        if (!sessions?.length) return <div className="text-2xl font-bold text-center py-8 bg-gradient-to-r from-primary-500 to-primary-600 bg-clip-text text-transparent">{emptyMessage}</div>;

        // Flatten all sessions for pagination
        const allSessions = flattenSessionsByDate(sessions);
        const currentPage = currentPages[SessionStatus.PAST];
        const totalPages = Math.ceil(allSessions.length / ITEMS_PER_PAGE);
        const paginatedSessions = paginateArray(allSessions, currentPage);

        return (
            <div>
                <div className="space-y-4">
                    {paginatedSessions.map((session) => (
                        <PreviousSessionCard
                            key={`${session.session_id}-${session.schedule_id}`}
                            session={session}
                        />
                    ))}
                </div>
                <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={(page) => handlePageChange(SessionStatus.PAST, page)}
                    onPrevious={() => handlePrevious(SessionStatus.PAST)}
                    onNext={() => handleNext(SessionStatus.PAST, totalPages)}
                />
            </div>
        );
    };

    return (
        <>
        {/* Filter Bar */}
        <div className="rounded-lg border border-neutral-200 bg-white p-4 mb-6">
            <div className="flex flex-wrap items-center gap-3">
                {/* Session Name Search */}
                <div className="relative min-w-[240px] flex-1">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                        <svg className="text-neutral-400" />
                    </div>
                    <input
                        type="text"
                        placeholder="Search sessions..."
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        className="h-9 w-full rounded-md border border-neutral-300 bg-white py-2 pl-10 pr-3 text-sm text-neutral-900 placeholder:text-neutral-500 focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
                    />
                </div>
                {/* Date Range */}
                <div className="w-[220px]">
                    <Popover>
                        <PopoverTrigger asChild>
                            <button className="flex h-9 w-full items-center justify-between rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-500 focus:border-primary-500 focus:ring-1 focus:ring-primary-500">
                                {startDate && endDate
                                    ? `${format(startDate, 'dd/MM/yy')} - ${format(endDate, 'dd/MM/yy')}`
                                    : 'Select date range'}
                                <CalendarIcon className="ml-2 size-4 text-neutral-500" />
                            </button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-3" align="start">
                            <Calendar
                                mode="range"
                                selected={{ from: startDate, to: endDate }}
                                onSelect={range => { setStartDate(range?.from); setEndDate(range?.to); }}
                                initialFocus
                            />
                        </PopoverContent>
                    </Popover>
                </div>
                {/* Meeting Type */}
                <div className="w-[180px]">
                    <Popover>
                        <PopoverTrigger asChild>
                            <button className="flex h-9 w-full items-center justify-between rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-500 focus:border-primary-500 focus:ring-1 focus:ring-primary-500">
                                {meetingTypeFilter || 'Meeting Type'}
                                <CaretDownIcon className="ml-2 size-4 text-neutral-500" />
                            </button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-3" align="start">
                            <div className="flex flex-col gap-2">
                                <button onClick={() => setMeetingTypeFilter('')} className="text-sm">All</button>
                                {Object.values(RecurringType).map(type => (
                                    <button key={type} onClick={() => setMeetingTypeFilter(type as RecurringType)} className="text-sm">
                                        {type}
                                    </button>
                                ))}
                            </div>
                        </PopoverContent>
                    </Popover>
                </div>
                {/* Subject */}
                <div className="w-[180px]">
                    <Popover>
                        <PopoverTrigger asChild>
                            <button className="flex h-9 w-full items-center justify-between rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-500 focus:border-primary-500 focus:ring-1 focus:ring-primary-500">
                                {subjectFilter || 'Subject'}
                                <CaretDownIcon className="ml-2 size-4 text-neutral-500" />
                            </button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-3" align="start">
                            <div className="flex flex-col gap-2">
                                <button onClick={() => setSubjectFilter('')} className="text-sm">All</button>
                                {SubjectFilterData.map(sub => (
                                    <button key={sub.id} onClick={() => setSubjectFilter(sub.name)} className="text-sm">
                                        {sub.name}
                                    </button>
                                ))}
                            </div>
                        </PopoverContent>
                    </Popover>
                </div>
                {/* Access Type */}
                <div className="w-[180px]">
                    <Popover>
                        <PopoverTrigger asChild>
                            <button className="flex h-9 w-full items-center justify-between rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-500 focus:border-primary-500 focus:ring-1 focus:ring-primary-500">
                                {accessFilter || 'Access Type'}
                                <CaretDownIcon className="ml-2 size-4 text-neutral-500" />
                            </button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-3" align="start">
                            <div className="flex flex-col gap-2">
                                <button onClick={() => setAccessFilter('')} className="text-sm">All</button>
                                {Object.values(AccessType).map(level => (
                                    <button key={level} onClick={() => setAccessFilter(level as AccessType)} className="text-sm">
                                        {level}
                                    </button>
                                ))}
                            </div>
                        </PopoverContent>
                    </Popover>
                </div>
                {/* Clear Filters */}
                <button onClick={() => { setSearchQuery(''); setStartDate(undefined); setEndDate(undefined); setMeetingTypeFilter(''); setSubjectFilter(''); setAccessFilter(''); }} className="h-9 rounded-md bg-neutral-100 px-3 py-2 text-sm">
                    Clear
                </button>
            </div>
        </div>

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

                <TabsContent value={SessionStatus.LIVE}>
                    {renderLiveSessions(filteredLiveSessions)}
                </TabsContent>
                <TabsContent value={SessionStatus.UPCOMING}>
                    {renderSessionsByDate(
                        upcomingSessions,
                        isUpcomingLoading,
                        upcomingError,
                        'No Upcoming Session',
                        SessionStatus.UPCOMING
                    )}
                </TabsContent>
                <TabsContent value={SessionStatus.PAST}>
                    {renderPreviousSessions(
                        pastSessions,
                        isPastLoading,
                        pastError,
                        'No Past Session'
                    )}
                </TabsContent>
                <TabsContent value={SessionStatus.DRAFTS}>
                    {renderDraftSessions(
                        draftSessions,
                        isDraftLoading,
                        draftError,
                        'No Draft Session'
                    )}
                </TabsContent>
            </Tabs>
        </>
    );
}
