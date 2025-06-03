// components/ParticipantsSidePanel.tsx
import React, { useEffect, useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { X, Users, Loader2, WifiOff, Wifi, Clock } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
// import { toast } from 'sonner'; // Optional: for connection status toasts

interface Participant {
    username: string;
    user_id?: string | null;
    name?: string | null;
    email?: string | null;
    status: string;
    joined_at?: string; // ISO string
    last_active_at?: string; // ISO string, for INACTIVE participants
}

interface ParticipantsSidePanelProps {
    sessionId: string;
    isOpen: boolean;
    onClose: () => void;
    topOffset?: string;
}

const ADMIN_SSE_URL_BASE_PARTICIPANTS =
    'http://localhost:8073/community-service/engage/admin/';

// Helper to format date/time
const formatDateTime = (isoString?: string) => {
    if (!isoString) return 'N/A';
    try {
        // More robust formatting, show date if not today
        const date = new Date(isoString);
        const today = new Date();
        if (
            date.getFullYear() === today.getFullYear() &&
            date.getMonth() === today.getMonth() &&
            date.getDate() === today.getDate()
        ) {
            return date.toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
                hour12: true,
            });
        }
        return (
            date.toLocaleDateString([], { month: 'short', day: 'numeric' }) +
            ' ' +
            date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })
        );
    } catch (e) {
        console.warn('Failed to format date:', isoString, e);
        return 'Invalid Date';
    }
};

export const ParticipantsSidePanel: React.FC<ParticipantsSidePanelProps> = ({
    sessionId,
    isOpen,
    onClose,
    topOffset = '0px',
}) => {
    const [participants, setParticipants] = useState<Participant[]>([]);
    const [sseStatus, setSseStatus] = useState<'connecting' | 'connected' | 'disconnected'>(
        'connecting'
    );
    const eventSourceRef = useRef<EventSource | null>(null);

    useEffect(() => {
        if (!isOpen || !sessionId) {
            if (eventSourceRef.current) {
                eventSourceRef.current.close();
                eventSourceRef.current = null;
            }
            setParticipants([]); // Clear participants when panel is closed or no session ID
            setSseStatus('disconnected'); // Set status to disconnected
            return;
        }

        // Close existing connection if any, before opening a new one
        if (eventSourceRef.current) {
            eventSourceRef.current.close();
        }

        setSseStatus('connecting');
        setParticipants([]); // Clear participants while (re)connecting
        console.log(`[ParticipantsPanel] SSE init. isOpen: ${isOpen}, sessionId: ${sessionId}`);
        const sseUrl = `${ADMIN_SSE_URL_BASE_PARTICIPANTS}${sessionId}`;
        console.log(`[ParticipantsPanel] SSE connecting to: ${sseUrl}`);
        const newEventSource = new EventSource(sseUrl, { withCredentials: true });
        eventSourceRef.current = newEventSource;

        newEventSource.onopen = () => {
            console.log('[ParticipantsPanel] SSE Connection Established.');
            setSseStatus('connected');
        };

        // Listener for 'participants' event (primary for this panel)
        const directParticipantsListener = (event: MessageEvent) => {
            console.log("[ParticipantsPanel] Received 'participants' event data:", event.data);
            try {
                const parsedData = JSON.parse(event.data);
                if (Array.isArray(parsedData)) {
                    setParticipants(parsedData);
                } else {
                    console.warn(
                        "[ParticipantsPanel] 'participants' data received is not an array:",
                        parsedData
                    );
                }
            } catch (error) {
                console.error("[ParticipantsPanel] Error parsing 'participants' data:", error);
            }
        };
        newEventSource.addEventListener('participants', directParticipantsListener);

        // Listener for 'session_state_presenter' (e.g., on connect/reconnect to get full state)
        const sessionStateListener = (event: MessageEvent) => {
            try {
                const data = JSON.parse(event.data);
                console.log("[ParticipantsPanel] SSE: 'session_state_presenter' received", data);
                if (data.participants && Array.isArray(data.participants)) {
                    setParticipants(data.participants); // Update from full state if provided
                }
            } catch (e) {
                console.warn(
                    "[ParticipantsPanel] SSE: Error parsing 'session_state_presenter' data:",
                    e
                );
            }
        };
        newEventSource.addEventListener('session_state_presenter', sessionStateListener);

        // If your backend also sends 'participants_update' specifically for changes.
        // For now, relying on 'participants' and 'session_state_presenter.participants'.
        // newEventSource.addEventListener('participants_update', directParticipantsListener);

        newEventSource.onerror = (error) => {
            console.error(
                '[ParticipantsPanel] SSE Error. Browser will attempt to reconnect.',
                error
            );
            setSseStatus('disconnected');
            // Do not call eventSource.close() here, allow browser to retry.
        };

        return () => {
            if (newEventSource) {
                console.log('[ParticipantsPanel] Closing SSE Connection and removing listeners.');
                newEventSource.removeEventListener('participants', directParticipantsListener);
                newEventSource.removeEventListener('session_state_presenter', sessionStateListener);
                // newEventSource.removeEventListener('participants_update', directParticipantsListener);
                newEventSource.close();
                eventSourceRef.current = null;
            }
            setSseStatus('disconnected'); // Ensure status is updated on cleanup
        };
    }, [isOpen, sessionId]); // Effect reruns if isOpen or sessionId changes

    if (!isOpen) return null;

    const StatusIndicator = () => {
        if (sseStatus === 'connecting') {
            return (
                <span title="Connecting for participant updates...">
                    <Loader2 size={16} className="mr-1 animate-spin text-yellow-500" />
                </span>
            );
        }
        if (sseStatus === 'connected') {
            return (
                <span title="Participant updates active">
                    <Wifi size={16} className="mr-1 text-green-500" />
                </span>
            );
        }
        return (
            <span title="Participant updates disconnected. Retrying...">
                <WifiOff size={16} className="mr-1 text-red-500" />
            </span>
        );
    };

    return (
        <div
            className="fixed right-0 top-0 z-[1000] flex h-screen w-72 flex-col border-l border-slate-200 bg-slate-50 shadow-xl transition-transform duration-300 ease-in-out sm:w-80"
            style={{
                transform: isOpen ? 'translateX(0)' : 'translateX(100%)',
                height: `100vh`, // Full viewport height
            }}
        >
            {/* Panel Header: Uses flex to position content correctly, accounting for topOffset via padding */}
            <div
                className="flex shrink-0 items-center justify-between border-b border-slate-200 bg-white p-3"
                style={{ paddingTop: `calc(${topOffset} + 0.75rem)`, paddingBottom: '0.75rem' }}
            >
                <h3 className="flex items-center text-sm font-semibold text-slate-700">
                    <Users size={18} className="mr-2 text-orange-500" /> Participants (
                    {sseStatus === 'connected' ? (
                        participants.length
                    ) : (
                        <span className="text-xs font-normal italic">...</span>
                    )}
                    )
                    <span className="ml-2">
                        <StatusIndicator />
                    </span>
                </h3>
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={onClose}
                    className="rounded-full text-slate-500 hover:bg-slate-200 hover:text-slate-700"
                >
                    <X size={20} />
                </Button>
            </div>

            {/* Participant List: ScrollArea takes remaining vertical space */}
            <ScrollArea className="grow">
                <div className="space-y-2 p-3">
                    {sseStatus === 'connecting' && participants.length === 0 && (
                        <div className="flex flex-col items-center justify-center py-10 text-center">
                            <Loader2 className="mb-2 size-7 animate-spin text-orange-500" />
                            <p className="text-sm text-slate-500">Loading participants...</p>
                        </div>
                    )}
                    {sseStatus === 'disconnected' &&
                        participants.length === 0 && ( // Show only if no participants loaded yet
                            <div className="flex flex-col items-center justify-center rounded-md border border-red-200 bg-red-50 p-4 text-center text-red-500">
                                <WifiOff size={28} className="mb-2" />
                                <p className="text-sm font-medium">Connection lost</p>
                                <p className="text-xs">
                                    Attempting to reconnect to participant updates.
                                </p>
                            </div>
                        )}
                    {/* Show "No participants" only if connected and list is empty */}
                    {sseStatus === 'connected' && participants.length === 0 && (
                        <div className="px-4 py-10 text-center">
                            <Users size={36} className="mx-auto mb-3 text-slate-400" />
                            <p className="text-sm text-slate-500">
                                No participants have joined this session yet.
                            </p>
                        </div>
                    )}
                    {/* Always render participants if the array has items, regardless of sseStatus (to keep last known state visible during brief disconnects) */}
                    {participants.length > 0 &&
                        participants.map((p, index) => (
                            <div
                                key={p.user_id || p.username + index} // Prefer user_id if available
                                className="flex flex-col items-start justify-between rounded-md border border-slate-200 bg-white p-2.5 text-sm shadow-sm transition-colors hover:bg-slate-50"
                            >
                                <div className="flex w-full items-center justify-between">
                                    <span
                                        className="truncate font-medium text-slate-700"
                                        title={p.username}
                                    >
                                        {p.name || p.username}
                                    </span>
                                    <span
                                        className={`min-w-[70px] rounded-full px-2 py-0.5 text-center text-xs font-semibold capitalize
                                            ${
                                                p.status?.toLowerCase() === 'active'
                                                    ? 'border border-green-300 bg-green-100 text-green-700'
                                                    : p.status?.toLowerCase() === 'inactive' ||
                                                        p.status?.toLowerCase() ===
                                                            'inactive_disconnected'
                                                      ? 'border border-yellow-300 bg-yellow-100 text-yellow-700'
                                                      : 'border border-slate-300 bg-slate-100 text-slate-600' // Default for 'INIT' or other statuses
                                            }`}
                                    >
                                        {p.status
                                            ? p.status.toLowerCase().replace('_', ' ')
                                            : 'Unknown'}
                                    </span>
                                </div>
                                {/* Display last_active_at for inactive users */}
                                {(p.status?.toLowerCase() === 'inactive' ||
                                    p.status?.toLowerCase() === 'inactive_disconnected') &&
                                    p.last_active_at && (
                                        <div className="mt-1.5 flex items-center text-xs text-slate-500">
                                            <Clock size={12} className="mr-1 shrink-0" />
                                            Last active: {formatDateTime(p.last_active_at)}
                                        </div>
                                    )}
                                {/* Display joined_at for active users if available and different from last_active_at (or if last_active_at is not shown) */}
                                {p.status?.toLowerCase() === 'active' && p.joined_at && (
                                    <div className="mt-1.5 flex items-center text-xs text-slate-400">
                                        Joined: {formatDateTime(p.joined_at)}
                                    </div>
                                )}
                            </div>
                        ))}
                </div>
            </ScrollArea>
        </div>
    );
};
