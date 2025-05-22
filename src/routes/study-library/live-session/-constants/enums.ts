export enum SessionStatus {
    UPCOMING = 'Upcoming',
    PAST = 'Past',
    DRAFTS = 'Drafts',
}
export enum RecurringType {
    ONCE = 'once',
    WEEKLY = 'weekly',
    MONTHLY = 'monthly',
}
export enum AccessType {
    PUBLIC = 'public',
    PRIVATE = 'private',
}
export enum InputType {
    TEXT = 'text',
    DROPDOWN = 'dropdown',
}
export const sessionStatusLabels: Record<SessionStatus, string> = {
    [SessionStatus.UPCOMING]: 'Upcoming',
    [SessionStatus.PAST]: 'Past',
    [SessionStatus.DRAFTS]: 'Drafts',
};
