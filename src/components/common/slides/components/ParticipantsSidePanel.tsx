// components/ParticipantsSidePanel.tsx
import React from 'react';
import { Button } from '@/components/ui/button';
import { X, Users, Loader2, WifiOff, Wifi, Clock, UserCheck, UserX } from 'lucide-react';
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
    sseStatus, // Now from props
}) => {
    // Removed local state for participants and sseStatus
    // Removed eventSourceRef
    // Removed SSE connection useEffect

    if (!isOpen) return null;

    const StatusIndicator = () => {
        // Uses sseStatus from props
        if (sseStatus === 'connecting') {
            return (
                <div className="flex items-center gap-1.5 bg-yellow-500/20 border border-yellow-400/30 rounded-lg px-2 py-1 backdrop-blur-sm">
                    <Loader2 size={14} className="animate-spin text-yellow-400" />
                    <span className="text-xs font-medium text-yellow-300 hidden lg:inline">Connecting</span>
                </div>
            );
        }
        if (sseStatus === 'connected') {
            return (
                <div className="flex items-center gap-1.5 bg-green-500/20 border border-green-400/30 rounded-lg px-2 py-1 backdrop-blur-sm">
                    <Wifi size={14} className="text-green-400" />
                    <span className="text-xs font-medium text-green-300 hidden lg:inline">Live</span>
                </div>
            );
        }
        return (
            <div className="flex items-center gap-1.5 bg-red-500/20 border border-red-400/30 rounded-lg px-2 py-1 backdrop-blur-sm">
                <WifiOff size={14} className="text-red-400" />
                <span className="text-xs font-medium text-red-300 hidden lg:inline">Offline</span>
            </div>
        );
    };

    return (
        <div
            className="fixed right-0 top-0 z-[1000] flex h-screen w-80 sm:w-96 flex-col border-l border-white/20 bg-black/20 backdrop-blur-xl shadow-2xl transition-transform duration-500 ease-out"
            style={{
                transform: isOpen ? 'translateX(0)' : 'translateX(100%)',
                height: `calc(100vh - ${topOffset})`, // Adjusted to use topOffset correctly if header is outside
                top: topOffset, // Position panel below any fixed header
            }}
        >
            {/* Enhanced background effects */}
            <div className="absolute inset-0 bg-gradient-to-b from-slate-900/50 via-slate-800/30 to-slate-900/50 pointer-events-none" />
            <div className="absolute top-1/4 right-0 w-32 h-64 bg-blue-500/5 blur-2xl" />
            <div className="absolute bottom-1/4 left-0 w-32 h-64 bg-purple-500/5 blur-2xl" />
            
            {/* Enhanced header */}
            <div className="relative z-10 flex shrink-0 items-center justify-between border-b border-white/10 bg-white/10 backdrop-blur-sm p-4 shadow-lg">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl shadow-lg">
                        <Users size={20} className="text-white" />
                    </div>
                    <div>
                        <h3 className="font-bold text-white text-lg flex items-center gap-2">
                            Participants
                            <span className="px-2 py-1 bg-white/20 backdrop-blur-sm rounded-lg text-sm font-mono">
                    {sseStatus === 'connected' ? (
                        participants.length
                    ) : (
                        <span className="text-xs font-normal italic">...</span>
                    )}
                    </span>
                </h3>
                        <div className="mt-1">
                            <StatusIndicator />
                        </div>
                    </div>
                </div>
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={onClose}
                    className="rounded-xl text-white/70 hover:bg-white/10 hover:text-white transition-all duration-200 hover:scale-105"
                >
                    <X size={20} />
                </Button>
            </div>

            <ScrollArea className="grow relative z-10">
                <div className="space-y-3 p-4">
                    {/* Enhanced loading state */}
                    {sseStatus === 'connecting' && participants.length === 0 && (
                        <div className="flex flex-col items-center justify-center py-12 text-center">
                            <div className="relative mb-4">
                                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center shadow-lg">
                                    <Loader2 className="animate-spin text-white" size={24} />
                                </div>
                                <div className="absolute inset-0 bg-blue-500/20 rounded-full blur-xl animate-pulse" />
                            </div>
                            <p className="text-white font-medium mb-1">Loading participants...</p>
                            <p className="text-white/60 text-sm">Connecting to live session</p>
                        </div>
                    )}
                    
                    {/* Enhanced disconnected state */}
                    {sseStatus === 'disconnected' && participants.length === 0 && (
                        <div className="flex flex-col items-center justify-center rounded-2xl border border-red-400/30 bg-red-500/10 backdrop-blur-sm p-6 text-center shadow-lg">
                            <div className="relative mb-4">
                                <div className="w-12 h-12 bg-gradient-to-r from-red-500 to-red-600 rounded-full flex items-center justify-center shadow-lg">
                                    <WifiOff size={24} className="text-white" />
                                </div>
                                <div className="absolute inset-0 bg-red-500/20 rounded-full blur-xl" />
                            </div>
                            <p className="text-red-300 font-semibold mb-2">Connection Lost</p>
                            <p className="text-red-200/80 text-sm leading-relaxed">
                                Attempting to reconnect to participant updates...
                            </p>
                        </div>
                    )}
                    
                    {/* Enhanced empty state */}
                    {sseStatus === 'connected' && participants.length === 0 && (
                        <div className="flex flex-col items-center justify-center py-12 text-center">
                            <div className="relative mb-4">
                                <div className="w-16 h-16 bg-gradient-to-r from-slate-600 to-slate-700 rounded-2xl flex items-center justify-center shadow-xl">
                                    <Users size={32} className="text-white/80" />
                                </div>
                                <div className="absolute inset-0 bg-slate-500/10 rounded-2xl blur-xl" />
                            </div>
                            <p className="text-white font-medium mb-2">Waiting for participants</p>
                            <p className="text-white/60 text-sm leading-relaxed max-w-xs">
                                Share the session code for participants to join this live session.
                            </p>
                        </div>
                    )}
                    
                    {/* Enhanced participant list */}
                    {participants.length > 0 &&
                        participants.map((p, index) => (
                            <div
                                key={p.user_id || p.username + index}
                                className="group relative rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm p-4 shadow-lg transition-all duration-300 hover:bg-white/10 hover:border-white/20 hover:shadow-xl hover:scale-[1.02]"
                            >
                                {/* Subtle gradient overlay */}
                                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-transparent to-purple-500/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                
                                <div className="relative flex flex-col">
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center gap-3">
                                            {/* Avatar */}
                                            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white shadow-lg ${
                                                p.status?.toLowerCase() === 'active' 
                                                    ? 'bg-gradient-to-r from-green-500 to-green-600' 
                                                    : 'bg-gradient-to-r from-slate-500 to-slate-600'
                                            }`}>
                                                {(p.name || p.username).charAt(0).toUpperCase()}
                                            </div>
                                            
                                            <div className="flex-1 min-w-0">
                                    <span
                                                    className="block font-semibold text-white text-sm truncate"
                                        title={p.username}
                                    >
                                        {p.name || p.username}
                                    </span>
                                                {p.email && (
                                                    <span className="block text-white/60 text-xs truncate">
                                                        {p.email}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        
                                        {/* Enhanced status badge */}
                                        <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border backdrop-blur-sm ${
                                                p.status?.toLowerCase() === 'active'
                                                ? 'border-green-400/30 bg-green-500/20 text-green-300'
                                                    : p.status?.toLowerCase() === 'inactive' ||
                                                    p.status?.toLowerCase() === 'inactive_disconnected'
                                                  ? 'border-yellow-400/30 bg-yellow-500/20 text-yellow-300'
                                                  : 'border-slate-400/30 bg-slate-500/20 text-slate-300'
                                        }`}>
                                            {p.status?.toLowerCase() === 'active' ? (
                                                <UserCheck size={12} />
                                            ) : (
                                                <UserX size={12} />
                                            )}
                                            <span className="capitalize tracking-wide">
                                                {p.status ? p.status.toLowerCase().replace('_', ' ') : 'Unknown'}
                                    </span>
                                </div>
                                    </div>
                                    
                                    {/* Enhanced time information */}
                                {(p.status?.toLowerCase() === 'inactive' ||
                                    p.status?.toLowerCase() === 'inactive_disconnected') &&
                                    p.last_active_at && (
                                            <div className="flex items-center gap-2 mt-2 px-3 py-2 bg-white/5 backdrop-blur-sm rounded-lg border border-white/10">
                                                <Clock size={12} className="text-yellow-400 flex-shrink-0" />
                                                <span className="text-white/70 text-xs">
                                                    Last active: <span className="font-medium text-white/90">{formatDateTime(p.last_active_at)}</span>
                                                </span>
                                            </div>
                                        )}
                                    {p.status?.toLowerCase() === 'active' && p.joined_at && (
                                        <div className="flex items-center gap-2 mt-2 px-3 py-2 bg-white/5 backdrop-blur-sm rounded-lg border border-white/10">
                                            <UserCheck size={12} className="text-green-400 flex-shrink-0" />
                                            <span className="text-white/70 text-xs">
                                                Joined: <span className="font-medium text-white/90">{formatDateTime(p.joined_at)}</span>
                                            </span>
                                        </div>
                                    )}
                                    </div>
                            </div>
                        ))}
                </div>
            </ScrollArea>
        </div>
    );
};
