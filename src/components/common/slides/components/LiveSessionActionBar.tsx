// components/LiveSessionActionBar.tsx
import React from 'react';
import { Button } from '@/components/ui/button';
import { Users, Tv2, X, Edit3, Copy, Loader2, Wifi, WifiOff } from 'lucide-react'; // Added more icons
import { toast } from 'sonner';

interface LiveSessionActionBarProps {
    inviteCode: string;
    currentSlideIndex: number;
    totalSlides: number;
    participantsCount: number;
    onToggleParticipantsView: () => void;
    isParticipantsPanelOpen: boolean;
    onToggleWhiteboard: () => void;
    isWhiteboardOpen: boolean;
    onEndSession: () => void;
    isEndingSession?: boolean; // New prop for loading state
    sseStatus?: 'connecting' | 'connected' | 'disconnected'; // New prop for SSE status
}

export const LiveSessionActionBar: React.FC<LiveSessionActionBarProps> = ({
    inviteCode,
    currentSlideIndex,
    totalSlides,
    participantsCount,
    onToggleParticipantsView,
    isParticipantsPanelOpen,
    onToggleWhiteboard,
    isWhiteboardOpen,
    onEndSession,
    isEndingSession, // Destructure new prop
    sseStatus, // Destructure new prop
}) => {
    const invitationLink =
        typeof window !== 'undefined'
            ? `${window.location.origin}/engage/${inviteCode}`
            : `/engage/${inviteCode}`;

    const handleCopyInvite = () => {
        if (navigator.clipboard) {
            navigator.clipboard
                .writeText(invitationLink)
                .then(() => toast.success('Invite link copied!'))
                .catch(() => toast.error('Failed to copy link.'));
        } else {
            toast.error('Clipboard not available.');
        }
    };

    const SseStatusIndicator = () => {
        if (sseStatus === 'connected') {
            return <Wifi size={14} className="text-green-400" />;
        }
        if (sseStatus === 'connecting') {
            return <Loader2 size={14} className="animate-spin text-yellow-400" />;
        }
        return <WifiOff size={14} className="text-red-400" />;
    };

    return (
        <div className="fixed inset-x-0 top-0 z-[1001] flex h-14 items-center justify-between bg-slate-800 px-3 text-white shadow-md sm:px-4">
            <div className="flex items-center gap-2 sm:gap-3">
                <Tv2 size={20} className="shrink-0 text-orange-400" />
                <span className="hidden text-xs font-medium sm:text-sm md:inline">
                    Live Session
                </span>
                <div className="ml-1">
                    {' '}
                    <SseStatusIndicator />
                </div>{' '}
                {/* SSE Status */}
                <div className="flex items-center rounded-full bg-slate-700 px-2 py-1 text-xs">
                    <span className="mr-1 hidden sm:inline">Code:</span>
                    <span className="font-mono tracking-wider">{inviteCode}</span>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="ml-1 size-6 text-slate-300 hover:bg-slate-600 hover:text-orange-400"
                        onClick={handleCopyInvite}
                        title="Copy invite link"
                    >
                        <Copy size={12} />
                    </Button>
                </div>
            </div>

            <div className="flex items-center text-xs sm:text-sm">
                <span className="font-mono">
                    Slide: {currentSlideIndex + 1} / {totalSlides}
                </span>
            </div>

            <div className="flex items-center gap-1 sm:gap-2">
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={onToggleParticipantsView}
                    className={`text-slate-200 hover:bg-slate-700 hover:text-white ${isParticipantsPanelOpen ? 'bg-slate-700 text-orange-400' : ''}`}
                    title="Toggle Participants Panel"
                >
                    <Users size={16} className="mr-0 sm:mr-1.5" />
                    <span className="hidden sm:inline">({participantsCount})</span>
                </Button>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={onToggleWhiteboard}
                    className={`text-slate-200 hover:bg-slate-700 hover:text-white ${isWhiteboardOpen ? 'bg-slate-700 text-orange-400' : ''}`}
                    title="Toggle Whiteboard"
                >
                    <Edit3 size={16} className="mr-0 sm:mr-1.5" />
                    <span className="hidden sm:inline">Whiteboard</span>
                </Button>
                <Button
                    variant="destructive"
                    size="sm"
                    onClick={onEndSession}
                    disabled={isEndingSession} // Disable when ending
                    className="min-w-[70px] bg-red-500 text-white hover:bg-red-600 focus-visible:ring-red-400 sm:min-w-[80px]"
                    title="End Session"
                >
                    {isEndingSession ? (
                        <Loader2 size={16} className="animate-spin" />
                    ) : (
                        <>
                            <X size={16} className="mr-0 sm:mr-1.5" />
                            <span className="hidden sm:inline">End</span>
                        </>
                    )}
                </Button>
            </div>
        </div>
    );
};
