import { useNavHeadingStore } from '@/stores/layout-container/useNavHeadingStore';
import { useEffect, useState, useMemo } from 'react';
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
import DraftSessionCard from './draft-session-card';
import { useSessionDetailsStore } from '../-store/useSessionDetailsStore';
import { useLiveSessionStore } from '../schedule/-store/sessionIdstore';
import { CalendarIcon } from '@radix-ui/react-icons';
import { CaretDown } from 'phosphor-react';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { useQuery } from '@tanstack/react-query';
import { useInstituteQuery } from '@/services/student-list-section/getInstituteDetails';
import { useFilterDataForAssesment } from '@/routes/assessment/assessment-list/-utils.ts/useFiltersData';
import { MyPagination } from '@/components/design-system/pagination';
import { RecurringType, AccessType } from '../-constants/enums';

export default function SessionListPage() {
    const { setNavHeading } = useNavHeadingStore();
    const { clearSessionDetails } = useSessionDetailsStore();
    const { clearSessionId } = useLiveSessionStore();

    // Filter state
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [startDate, setStartDate] = useState<Date | undefined>(undefined);
    const [endDate, setEndDate] = useState<Date | undefined>(undefined);
    const [meetingTypeFilter, setMeetingTypeFilter] = useState<string>('');
    const [subjectFilter, setSubjectFilter] = useState<string>('');
    const [accessFilter, setAccessFilter] = useState<string>('');
    const [datePopoverOpen, setDatePopoverOpen] = useState(false);
    const { data: instituteDetails } = useQuery(useInstituteQuery());
    const { SubjectFilterData } = useFilterDataForAssesment(instituteDetails!);

    // Pagination state
    const ITEMS_PER_PAGE = 4;
    const [currentPages, setCurrentPages] = useState({
        [SessionStatus.LIVE]: 1,
        [SessionStatus.UPCOMING]: 1,
        [SessionStatus.PAST]: 1,
        [SessionStatus.DRAFTS]: 1,
    });
    const paginateArray = <T,>(array: T[], page: number): T[] =>
        array.slice((page - 1) * ITEMS_PER_PAGE, (page - 1) * ITEMS_PER_PAGE + ITEMS_PER_PAGE);
    const handlePageChange = (tab: SessionStatus, pageIndex: number) =>
        setCurrentPages((prev) => ({ ...prev, [tab]: pageIndex + 1 }));

    // Tab state
    const [selectedTab, setSelectedTab] = useState<SessionStatus>(SessionStatus.LIVE);

    // Auth institute id
    const accessToken = getTokenFromCookie(TokenKey.accessToken);
    const tokenData = getTokenDecodedData(accessToken);
    const INSTITUTE_ID = (tokenData && Object.keys(tokenData.authorities)[0]) || '';

    // Flatten helper
    const flattenByDate = (sessionsByDate: SessionsByDate[]): LiveSession[] =>
        sessionsByDate.flatMap((day) => day.sessions);

    // Session data hooks
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

    // Filtered sessions
    const filteredLive = useMemo(
        () =>
            liveSessions?.filter((s) => {
                const matchName = s.title.toLowerCase().includes(searchQuery.toLowerCase());
                const date = new Date(s.meeting_date);
                const matchDate =
                    (!startDate || date >= startDate) && (!endDate || date <= endDate);
                const matchType = !meetingTypeFilter || s.recurrence_type === meetingTypeFilter;
                const matchSubject = !subjectFilter || s.subject === subjectFilter;
                const matchAccess = !accessFilter || s.access_level === accessFilter;
                return matchName && matchDate && matchType && matchSubject && matchAccess;
            }) || [],
        [
            liveSessions,
            searchQuery,
            startDate,
            endDate,
            meetingTypeFilter,
            subjectFilter,
            accessFilter,
        ]
    );
    const filteredUpcoming = useMemo(
        () =>
            flattenByDate(upcomingSessions || []).filter((s) => {
                const matchName = s.title.toLowerCase().includes(searchQuery.toLowerCase());
                const date = new Date(s.meeting_date);
                return (
                    matchName &&
                    (!startDate || date >= startDate) &&
                    (!endDate || date <= endDate) &&
                    (!meetingTypeFilter || s.recurrence_type === meetingTypeFilter) &&
                    (!subjectFilter || s.subject === subjectFilter) &&
                    (!accessFilter || s.access_level === accessFilter)
                );
            }),
        [
            upcomingSessions,
            searchQuery,
            startDate,
            endDate,
            meetingTypeFilter,
            subjectFilter,
            accessFilter,
        ]
    );
    const filteredPast = useMemo(
        () =>
            flattenByDate(pastSessions || []).filter((s) => {
                const matchName = s.title.toLowerCase().includes(searchQuery.toLowerCase());
                const date = new Date(s.meeting_date);
                return (
                    matchName &&
                    (!startDate || date >= startDate) &&
                    (!endDate || date <= endDate) &&
                    (!meetingTypeFilter || s.recurrence_type === meetingTypeFilter) &&
                    (!subjectFilter || s.subject === subjectFilter) &&
                    (!accessFilter || s.access_level === accessFilter)
                );
            }),
        [
            pastSessions,
            searchQuery,
            startDate,
            endDate,
            meetingTypeFilter,
            subjectFilter,
            accessFilter,
        ]
    );
    const filteredDraft = useMemo(
        () =>
            draftSessions?.filter((d) => {
                const matchName = d.title.toLowerCase().includes(searchQuery.toLowerCase());
                const date = d.meeting_date ? new Date(d.meeting_date) : null;
                return (
                    matchName &&
                    (!startDate || (date && date >= startDate)) &&
                    (!endDate || (date && date <= endDate)) &&
                    (!meetingTypeFilter || d.recurrence_type === meetingTypeFilter) &&
                    (!subjectFilter || d.subject === subjectFilter) &&
                    (!accessFilter || d.access_level === accessFilter)
                );
            }) || [],
        [
            draftSessions,
            searchQuery,
            startDate,
            endDate,
            meetingTypeFilter,
            subjectFilter,
            accessFilter,
        ]
    );

    const handleTabChange = (value: string) => {
        setSelectedTab(value as SessionStatus);
    };

    // Fixed search handler - removed debouncing for simplicity
    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchQuery(e.target.value);
    };

    // Filter bar component
    const FilterBar = () => (
        <div className="mb-6 rounded-lg border bg-white p-4">
            <div className="flex flex-wrap gap-3">
                {/* Search - Fixed implementation */}
                <div className="relative min-w-[200px] flex-1">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="text-neutral-400"
                        >
                            <circle cx="11" cy="11" r="8"></circle>
                            <path d="m21 21-4.3-4.3"></path>
                        </svg>
                    </div>
                    <input
                        autoFocus
                        type="text"
                        value={searchQuery}
                        onChange={handleSearchChange}
                        placeholder="Search sessions..."
                        className="h-9 w-full rounded-md border border-neutral-300 bg-white py-2 pl-10 pr-3 text-sm text-neutral-900 placeholder:text-neutral-500 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                    />
                </div>

                {/* Rest of the filter components remain the same */}
                {/* Date range */}
                <div className="w-[220px]">
                    <Popover open={datePopoverOpen} onOpenChange={setDatePopoverOpen}>
                        <PopoverTrigger asChild>
                            <button
                                className={`flex h-9 w-full items-center justify-between rounded-md border px-3 ${meetingTypeFilter ? 'border-primary-500' : 'border-neutral-300'} focus:border-primary-500 focus:ring-1 focus:ring-primary-500`}
                            >
                                {startDate && endDate
                                    ? `${format(startDate, 'dd/MM/yy')} - ${format(endDate, 'dd/MM/yy')}`
                                    : 'Select date range'}
                                <CalendarIcon className="text-neutral-500" />
                            </button>
                        </PopoverTrigger>
                        <PopoverContent align="start" className="w-auto p-3">
                            <div className="flex gap-3">
                                <Calendar
                                    mode="range"
                                    className="border-r pr-3"
                                    selected={{ from: startDate, to: endDate }}
                                    onSelect={(r) => {
                                        setStartDate(r?.from);
                                        setEndDate(r?.to);
                                        if (
                                            r?.from &&
                                            r?.to &&
                                            r.to.getTime() !== r.from.getTime()
                                        ) {
                                            setDatePopoverOpen(false);
                                        }
                                    }}
                                />
                                {/* Quick presets */}
                                <div className="flex flex-col gap-2 pt-1">
                                    <h4 className="mb-1 text-xs font-medium text-neutral-500">
                                        Quick Select
                                    </h4>
                                    {[
                                        { label: 'Past Day', days: 1 },
                                        { label: 'Past Week', days: 7 },
                                        { label: 'Past Month', days: 30 },
                                        { label: 'Past 6 Months', days: 182 },
                                        { label: 'Past Year', days: 365 },
                                    ].map((preset) => (
                                        <button
                                            key={preset.label}
                                            onClick={() => {
                                                const end = new Date();
                                                const start = new Date();
                                                start.setDate(start.getDate() - (preset.days - 1));
                                                setStartDate(start);
                                                setEndDate(end);
                                            }}
                                            className={`w-full rounded-md border px-3 py-1.5 text-left text-xs hover:bg-neutral-50 ${startDate && endDate && format(startDate, 'dd/MM/yy') === format(new Date(new Date().setDate(new Date().getDate() - (preset.days - 1))), 'dd/MM/yy') ? 'text-primary-600 bg-primary-50' : ''}`}
                                        >
                                            {preset.label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </PopoverContent>
                    </Popover>
                </div>
                {/* Meeting Type */}
                <div className="w-[180px]">
                    <Popover>
                        <PopoverTrigger asChild>
                            <button
                                className={`flex h-9 w-full items-center justify-between rounded-md border px-3 ${subjectFilter ? 'border-primary-500' : 'border-neutral-300'} focus:border-primary-500 focus:ring-1 focus:ring-primary-500`}
                            >
                                {meetingTypeFilter || 'Meeting Type'}
                                <CaretDown size={20} className="text-neutral-500" />
                            </button>
                        </PopoverTrigger>
                        <PopoverContent align="start" className="w-auto p-3">
                            <div className="flex flex-col gap-2">
                                <h4 className="mb-1 text-xs font-medium text-neutral-500">
                                    Meeting Type
                                </h4>
                                {[
                                    { label: 'All', value: '' },
                                    ...Object.values(RecurringType).map((r) => ({
                                        label: r,
                                        value: r,
                                    })),
                                ].map((opt) => (
                                    <button
                                        key={opt.label}
                                        onClick={() => setMeetingTypeFilter(opt.value)}
                                        className={`w-full rounded-md border px-3 py-1.5 text-left text-sm ${meetingTypeFilter === opt.value ? 'text-primary-600 border-primary-500 bg-primary-50' : 'border-neutral-200 bg-white hover:bg-neutral-50'}`}
                                    >
                                        {opt.label}
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
                            <button
                                className={`flex h-9 w-full items-center justify-between rounded-md border px-3 ${accessFilter ? 'border-primary-500' : 'border-neutral-300'} focus:border-primary-500 focus:ring-1 focus:ring-primary-500`}
                            >
                                {subjectFilter || 'Subject'}
                                <CaretDown size={20} className="text-neutral-500" />
                            </button>
                        </PopoverTrigger>
                        <PopoverContent align="start" className="w-auto p-3">
                            <div className="flex flex-col gap-2">
                                <h4 className="mb-1 text-xs font-medium text-neutral-500">
                                    Subject
                                </h4>
                                <div className="max-h-[140px] w-[200px] overflow-y-auto">
                                    {[
                                        { id: 'all', name: 'All' },
                                        ...SubjectFilterData.sort((a, b) =>
                                            a.name.localeCompare(b.name)
                                        ),
                                    ].map((opt) => (
                                        <button
                                            key={opt.id}
                                            onClick={() =>
                                                setSubjectFilter(opt.name === 'All' ? '' : opt.name)
                                            }
                                            className={`mb-2 w-full rounded-md border px-3 py-1.5 text-left text-sm ${subjectFilter === opt.name ? 'text-primary-600 border-primary-500 bg-primary-50' : 'border-neutral-200 bg-white hover:bg-neutral-50'}`}
                                        >
                                            {opt.name}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </PopoverContent>
                    </Popover>
                </div>
                {/* Access */}
                <div className="w-[180px]">
                    <Popover>
                        <PopoverTrigger asChild>
                            <button
                                className={`flex h-9 w-full items-center justify-between rounded-md border px-3 ${accessFilter ? 'border-primary-500' : 'border-neutral-300'} focus:border-primary-500 focus:ring-1 focus:ring-primary-500`}
                            >
                                {accessFilter || 'Access Type'}
                                <CaretDown size={20} className="text-neutral-500" />
                            </button>
                        </PopoverTrigger>
                        <PopoverContent align="start" className="w-auto p-3">
                            <div className="flex flex-col gap-2">
                                <h4 className="mb-1 text-xs font-medium text-neutral-500">
                                    Access Type
                                </h4>
                                {[
                                    { label: 'All', value: '' },
                                    ...Object.values(AccessType).map((a) => ({
                                        label: a,
                                        value: a,
                                    })),
                                ].map((opt) => (
                                    <button
                                        key={opt.label}
                                        onClick={() => setAccessFilter(opt.value)}
                                        className={`w-full rounded-md border px-3 py-1.5 text-left text-sm ${accessFilter === opt.value ? 'text-primary-600 border-primary-500 bg-primary-50' : 'border-neutral-200 bg-white hover:bg-neutral-50'}`}
                                    >
                                        {opt.label}
                                    </button>
                                ))}
                            </div>
                        </PopoverContent>
                    </Popover>
                </div>
                {/* Clear filters */}
                <button
                    onClick={() => {
                        setSearchQuery('');
                        setStartDate(undefined);
                        setEndDate(undefined);
                        setMeetingTypeFilter('');
                        setSubjectFilter('');
                        setAccessFilter('');
                        setDatePopoverOpen(false);
                    }}
                    className="h-9 rounded-md bg-neutral-100 px-3"
                >
                    Clear
                </button>
            </div>
        </div>
    );

    // Helper to render flat paginated sessions
    function renderFlatSessions<T>(
        sessions: T[],
        isLoading: boolean,
        error: Error | null,
        tab: SessionStatus,
        Card: React.ComponentType<{ session: T }>
    ) {
        if (isLoading) return <div>Loading...</div>;
        if (error) return <div>Error loading sessions</div>;
        if (!sessions.length) return <div className="py-8 text-center">No sessions found</div>;
        const page = currentPages[tab];
        const total = Math.ceil(sessions.length / ITEMS_PER_PAGE);
        const pageItems = paginateArray(sessions, page);
        return (
            <div>
                <div className="space-y-4">
                    {pageItems.map((item, index) => (
                        <Card key={index} session={item} />
                    ))}
                </div>
                <div className="mt-6">
                    <MyPagination
                        currentPage={page - 1}
                        totalPages={total}
                        onPageChange={(idx) => handlePageChange(tab, idx)}
                    />
                </div>
            </div>
        );
    }

    const navigate = useNavigate();

    useEffect(() => {
        setNavHeading('Live Sessions');
        clearSessionDetails();
        clearSessionId();
    }, []);

    return (
        <>
            <FilterBar />
            <Tabs value={selectedTab} onValueChange={handleTabChange}>
                <div className="flex justify-between">
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
                    {renderFlatSessions(
                        filteredLive,
                        isLiveLoading,
                        liveError,
                        SessionStatus.LIVE,
                        LiveSessionCard
                    )}
                </TabsContent>
                <TabsContent value={SessionStatus.UPCOMING} className="space-y-4">
                    {renderFlatSessions(
                        filteredUpcoming,
                        isUpcomingLoading,
                        upcomingError,
                        SessionStatus.UPCOMING,
                        LiveSessionCard
                    )}
                </TabsContent>
                <TabsContent value={SessionStatus.PAST} className="space-y-4">
                    {renderFlatSessions(
                        filteredPast,
                        isPastLoading,
                        pastError,
                        SessionStatus.PAST,
                        PreviousSessionCard
                    )}
                </TabsContent>
                <TabsContent value={SessionStatus.DRAFTS} className="space-y-4">
                    {renderFlatSessions(
                        filteredDraft,
                        isDraftLoading,
                        draftError,
                        SessionStatus.DRAFTS,
                        DraftSessionCard
                    )}
                </TabsContent>
            </Tabs>
        </>
    );
}
