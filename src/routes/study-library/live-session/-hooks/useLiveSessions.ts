import { useQuery } from '@tanstack/react-query';
import {
    getLiveSessions,
    getUpcomingSessions,
    getPastSessions,
    getDraftSessions,
    LiveSession,
    UpcomingSessionDay,
    PastSessionDay,
    DraftSessionDay,
} from '../-services/utils';

export function useLiveSessions(instituteId: string) {
    return useQuery<LiveSession[], Error>({
        queryKey: ['liveSessions', instituteId],
        queryFn: () => getLiveSessions(instituteId),
        staleTime: 5 * 60 * 1000, // Consider data stale after 5 minutes
    });
}

export function useUpcomingSessions(instituteId: string) {
    return useQuery<UpcomingSessionDay[], Error>({
        queryKey: ['upcomingSessions', instituteId],
        queryFn: () => getUpcomingSessions(instituteId),
        staleTime: 5 * 60 * 1000, // Consider data stale after 5 minutes
    });
}

export function usePastSessions(instituteId: string) {
    return useQuery<PastSessionDay[], Error>({
        queryKey: ['pastSessions', instituteId],
        queryFn: () => getPastSessions(instituteId),
        staleTime: 5 * 60 * 1000, // Consider data stale after 5 minutes
    });
}

export function useDraftSessions(instituteId: string) {
    return useQuery<DraftSessionDay[], Error>({
        queryKey: ['draftSessions', instituteId],
        queryFn: () => getDraftSessions(instituteId),
        staleTime: 5 * 60 * 1000, // Consider data stale after 5 minutes
    });
}
