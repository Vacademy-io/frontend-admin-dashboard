// components/ParticipantsSidePanel.tsx
import React from 'react';
import { Button } from '@/components/ui/button';
import { X, Users, Loader2, WifiOff, Wifi, Clock } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

// Participant interface should ideally be imported from a shared types file if used elsewhere,
// or defined in the parent component (ActualPresentationDisplay) that fetches the data.
// For this refactor, assuming ActualPresentationDisplay will pass typed participants.
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
    sessionId: string; // Still needed for context, potentially for actions within the panel
    isOpen: boolean;
    onClose: () => void;
    topOffset?: string;
    participants: Participant[]; // Received from parent
    sseStatus: 'connecting' | 'connected' | 'disconnected'; // Received from parent
}

// const ADMIN_SSE_URL_BASE_PARTICIPANTS = ...; // Removed, SSE logic is now in parent

// Helper to format date/time (can remain if not duplicated elsewhere)
const formatDateTime = (isoString?: string) => {
    if (!isoString) return 'N/A';
    try {
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
    sessionId, // Retained for now, might be removed if no participant-specific actions need it directly
    isOpen,
    onClose,
    topOffset = '0px',
    participants, // Now from props
    sseStatus,    // Now from props
}) => {
    // Removed local state for participants and sseStatus
    // Removed eventSourceRef
    // Removed SSE connection useEffect

    if (!isOpen) return null;

    const StatusIndicator = () => {
        // Uses sseStatus from props
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
                height: `calc(100vh - ${topOffset})`, // Adjusted to use topOffset correctly if header is outside
                top: topOffset, // Position panel below any fixed header
            }}
        >
            <div
                className="flex shrink-0 items-center justify-between border-b border-slate-200 bg-white p-3"
                // style={{ paddingTop: `calc(${topOffset} + 0.75rem)`, paddingBottom: '0.75rem' }} // Removed if topOffset handled by parent div style
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

            <ScrollArea className="grow">
                <div className="space-y-2 p-3">
                    {/* Render logic remains the same, using props participants and sseStatus */}
                    {sseStatus === 'connecting' && participants.length === 0 && (
                        <div className="flex flex-col items-center justify-center py-10 text-center">
                            <Loader2 className="mb-2 size-7 animate-spin text-orange-500" />
                            <p className="text-sm text-slate-500">Loading participants...</p>
                        </div>
                    )}
                    {/* ... rest of the rendering logic for participants ... */}
                     {sseStatus === 'disconnected' && participants.length === 0 && (
                            <div className="flex flex-col items-center justify-center rounded-md border border-red-200 bg-red-50 p-4 text-center text-red-500">
                                <WifiOff size={28} className="mb-2" />
                                <p className="text-sm font-medium">Connection lost</p>
                                <p className="text-xs">
                                    Attempting to reconnect to participant updates.
                                </p>
                            </div>
                        )}
                    {sseStatus === 'connected' && participants.length === 0 && (
                        <div className="px-4 py-10 text-center">
                            <Users size={36} className="mx-auto mb-3 text-slate-400" />
                            <p className="text-sm text-slate-500">
                                No participants have joined this session yet.
                            </p>
                        </div>
                    )}
                    {participants.length > 0 &&
                        participants.map((p, index) => (
                            <div
                                key={p.user_id || p.username + index}
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
                                                      : 'border border-slate-300 bg-slate-100 text-slate-600'
                                            }`}
                                    >
                                        {p.status
                                            ? p.status.toLowerCase().replace('_', ' ')
                                            : 'Unknown'}
                                    </span>
                                </div>
                                {(p.status?.toLowerCase() === 'inactive' ||
                                    p.status?.toLowerCase() === 'inactive_disconnected') &&
                                    p.last_active_at && (
                                        <div className="mt-1.5 flex items-center text-xs text-slate-500">
                                            <Clock size={12} className="mr-1 shrink-0" />
                                            Last active: {formatDateTime(p.last_active_at)}
                                        </div>
                                    )}
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
