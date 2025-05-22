// components/LiveSessionActionBar.tsx
import React from 'react';
import { Button } from '@/components/ui/button';
import { Users, Tv2, X, Edit3, Copy } from 'lucide-react'; // Added more icons
import { toast } from 'sonner';

interface LiveSessionActionBarProps {
    inviteCode: string;
    currentSlideIndex: number;
    totalSlides: number;
    participantsCount: number;
    onToggleParticipantsView: () => void;
    isParticipantsPanelOpen: boolean; // To show active state
    onToggleWhiteboard: () => void;
    isWhiteboardOpen: boolean; // To show active state
    onEndSession: () => void;
    // Optional: Add more controls as needed
    // onToggleMic?: () => void;
    // isMicOn?: boolean;
    // onToggleCamera?: () => void;
    // isCameraOn?: boolean;
    // onToggleHandRaise?: () => void; // For presenter to acknowledge
    // handRaisesCount?: number;
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
}) => {
    // Assuming window.location.origin is accessible and correct for the invite link
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

    return (
        <div
            className="fixed inset-x-0 top-0 z-[1001] flex h-14 items-center justify-between bg-slate-800 px-3 text-white shadow-md sm:px-4"
            // Ensure z-index is high enough to be above Reveal.js (z-index 50) but below modals (z-index > 1001)
        >
            {/* Left Section: Session Info & Invite */}
            <div className="flex items-center gap-2 sm:gap-3">
                <Tv2 size={20} className="shrink-0 text-orange-400" />
                <span className="hidden text-xs font-medium sm:text-sm md:inline">
                    Live Session
                </span>
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

            {/* Center Section: Slide Navigation Info */}
            <div className="flex items-center text-xs sm:text-sm">
                <span className="font-mono">
                    Slide: {currentSlideIndex + 1} / {totalSlides}
                </span>
            </div>

            {/* Right Section: Controls */}
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
                {/* Placeholder for more controls 
                <Button variant="ghost" size="icon" className="text-slate-200 hover:bg-slate-700 hover:text-white"><Mic size={16}/></Button>
                <Button variant="ghost" size="icon" className="text-slate-200 hover:bg-slate-700 hover:text-white"><Video size={16}/></Button>
                <Button variant="ghost" size="icon" className="text-slate-200 hover:bg-slate-700 hover:text-white relative">
                    <Hand size={16}/>
                    {handRaisesCount > 0 && <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">{handRaisesCount}</span>}
                </Button>
                */}
                <Button
                    variant="destructive"
                    size="sm"
                    onClick={onEndSession}
                    className="bg-red-500 text-white hover:bg-red-600 focus-visible:ring-red-400"
                    title="End Session"
                >
                    <X size={16} className="mr-0 sm:mr-1.5" />
                    <span className="hidden sm:inline">End</span>
                </Button>
            </div>
        </div>
    );
};
