export enum SessionStatus {
    UPCOMING = 'Upcoming',
    PAST = 'Past',
    DRAFTS = 'Drafts',
}
export const sessionStatusLabels: Record<SessionStatus, string> = {
    [SessionStatus.UPCOMING]: 'Upcoming',
    [SessionStatus.PAST]: 'Past',
    [SessionStatus.DRAFTS]: 'Drafts',
};
