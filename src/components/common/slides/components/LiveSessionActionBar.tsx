// components/LiveSessionActionBar.tsx
import React, { useState } from 'react'; // Added useState for dropdown
import { Button } from '@/components/ui/button';
import { Users, Tv2, X, Edit3, Copy, Loader2, Wifi, WifiOff, Mic, MicOff, PauseCircle, PlayCircle as PlayIcon, Download, Settings2, ChevronDown } from 'lucide-react'; // Added Download, Settings2, ChevronDown
import { toast } from 'sonner';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"


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
    isEndingSession?: boolean;
    sseStatus?: 'connecting' | 'connected' | 'disconnected';
    // Audio Recording Props
    isAudioRecording?: boolean;
    isAudioPaused?: boolean;
    onPauseAudio?: () => void;
    onResumeAudio?: () => void;
    audioBlobUrl?: string | null; // Still needed for download link
    onDownloadAudio?: (format?: 'webm' | 'mp3') => void; // Modified to accept format
    recordingDuration?: number; // New prop
}

// Helper to format seconds into MM:SS
const formatDuration = (totalSeconds: number = 0) => {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
};

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
    isEndingSession,
    sseStatus,
    // Audio Recording Props
    isAudioRecording,
    isAudioPaused,
    onPauseAudio,
    onResumeAudio,
    audioBlobUrl, // Keep for download
    onDownloadAudio, // New prop
    recordingDuration,
}) => {
    const [isAudioMenuOpen, setIsAudioMenuOpen] = useState(false);

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
            {/* Left Section: Session Info & Invite */}
            <div className="flex items-center gap-2 sm:gap-3">
                <Tv2 size={20} className="shrink-0 text-orange-400" />
                <span className="hidden text-xs font-medium sm:text-sm md:inline">
                    Live Session
                </span>
                <div className="ml-1"> <SseStatusIndicator /></div>
                {isAudioRecording && (
                    <div className="flex items-center gap-1 rounded-full bg-red-500 px-2 py-0.5 text-xs font-semibold">
                        <Mic size={12} />
                        <span>REC</span>
                        <span className="ml-1 font-mono tabular-nums">{formatDuration(recordingDuration)}</span>
                        {isAudioPaused && <span className="ml-1">(Paused)</span>}
                    </div>
                )}
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

            {/* Center Section: Slide Counter */}
            <div className="flex items-center text-xs sm:text-sm">
                <span className="font-mono">
                    Slide: {currentSlideIndex + 1} / {totalSlides}
                </span>
            </div>

            {/* Right Section: Action Buttons */}
            <div className="flex items-center gap-1 sm:gap-2">
                {/* Audio Controls Menu */}
                {isAudioRecording && (onPauseAudio || onResumeAudio || (audioBlobUrl && onDownloadAudio)) && (
                     <DropdownMenu open={isAudioMenuOpen} onOpenChange={setIsAudioMenuOpen}>
                        <DropdownMenuTrigger asChild>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="text-sky-400 hover:bg-slate-700 hover:text-sky-300"
                                title="Audio Options"
                            >
                                <Settings2 size={18} />
                                {/* <ChevronDown size={16} className=\"ml-1 opacity-70\" /> */}
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="bg-slate-700 border-slate-600 text-white">
                            {isAudioRecording && !isAudioPaused && onPauseAudio && (
                                <DropdownMenuItem onClick={onPauseAudio} className="hover:!bg-slate-600 focus:!bg-slate-600 cursor-pointer">
                                    <PauseCircle size={16} className="mr-2 text-yellow-400" /> Pause Recording
                                </DropdownMenuItem>
                            )}
                            {isAudioRecording && isAudioPaused && onResumeAudio && (
                                <DropdownMenuItem onClick={onResumeAudio} className="hover:!bg-slate-600 focus:!bg-slate-600 cursor-pointer">
                                    <PlayIcon size={16} className="mr-2 text-green-400" /> Resume Recording
                                </DropdownMenuItem>
                            )}
                            {/* Show download if a download function is provided and recording is active/has been active */}
                            {isAudioRecording && onDownloadAudio && (
                                <>
                                    <DropdownMenuItem onClick={() => onDownloadAudio('webm')} className="hover:!bg-slate-600 focus:!bg-slate-600 cursor-pointer">
                                        <Download size={16} className="mr-2 text-blue-400" /> Download as WebM
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => onDownloadAudio('mp3')} className="hover:!bg-slate-600 focus:!bg-slate-600 cursor-pointer">
                                        <Download size={16} className="mr-2 text-purple-400" /> Download as MP3
                                    </DropdownMenuItem>
                                </>    
                            )}
                        </DropdownMenuContent>
                    </DropdownMenu>
                )}

                {/* Original Buttons */}
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
                    disabled={isEndingSession}
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