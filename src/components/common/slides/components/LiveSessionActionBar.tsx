// components/LiveSessionActionBar.tsx
import React, { useState, useEffect, useRef } from 'react'; // Added useEffect, useRef
import { Button } from '@/components/ui/button';
import {
    Users,
    Tv2,
    X,
    Edit3,
    Copy,
    Loader2,
    Wifi,
    WifiOff,
    Mic,
    MicOff,
    PauseCircle,
    PlayCircle as PlayIcon,
    Download,
    Settings2,
    ChevronDown,
    MessageSquareText,
    FileText,
    Lightbulb,
} from 'lucide-react'; // Removed QrCodeIcon since we won't need it
import { toast } from 'sonner';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import QRCodeStyling from 'qr-code-styling'; // Import QRCodeStyling
import { PRODUCT_NAME } from '@/config/branding';

// QR Code instance (similar to SessionWaitingRoom)
const qrCodeInstance = new QRCodeStyling({
    width: 140, // Slightly bigger size for better visibility
    height: 140,
    type: 'svg',
    dotsOptions: { color: '#1E293B', type: 'rounded' }, // Darker dots for better contrast
    backgroundOptions: { color: 'transparent' }, // Transparent background
    imageOptions: { crossOrigin: 'anonymous', margin: 4, imageSize: 0.2 },
    cornersSquareOptions: { type: 'extra-rounded', color: '#F97316' }, // Orange accents
    cornersDotOptions: { type: 'dot', color: '#EA580C' },
});

interface LiveSessionActionBarProps {
    inviteCode: string;
    currentSlideIndex: number;
    totalSlides: number;
    participantsCount: number;
    onToggleParticipantsView: () => void;
    isParticipantsPanelOpen: boolean;
    onToggleWhiteboard: () => void;
    onGenerateTranscript?: () => void; // Add this line
    isTranscribing?: boolean; // Add this
    hasTranscript?: boolean; // Add this
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
    // Recommendations Props
    onToggleRecommendations?: () => void;
    isRecommendationsPanelOpen?: boolean;
    recommendationsCount?: number;
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
    onGenerateTranscript,
    isTranscribing,
    hasTranscript,
    isAudioRecording,
    isAudioPaused,
    onPauseAudio,
    onResumeAudio,
    audioBlobUrl, // Keep for download
    onDownloadAudio, // New prop
    recordingDuration,
    onToggleRecommendations,
    isRecommendationsPanelOpen,
    recommendationsCount,
}) => {
    const [isAudioMenuOpen, setIsAudioMenuOpen] = useState(false);
    const qrRef = useRef<HTMLDivElement>(null); // Ref for QR code display

    // Corrected invitationLink construction
            const invitationLink = `https://${import.meta.env.VITE_ENGAGE_DOMAIN || 'engage.vacademy.io'}/${inviteCode}`;

    useEffect(() => {
        if (!invitationLink || !qrRef.current) {
            return; // Exit if there's no link or ref isn't ready
        }

                try {
                    qrCodeInstance.update({ data: invitationLink });
            qrRef.current.innerHTML = '';
            qrCodeInstance.append(qrRef.current);
                } catch (error) {
                    console.error('Error during QR code generation/append:', error);
                }
    }, [invitationLink]);

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
            return (
                <div className="flex items-center gap-1.5 bg-green-500/20 border border-green-400/30 rounded-lg px-2 py-1 backdrop-blur-sm">
                    <Wifi size={14} className="text-green-400" />
                    <span className="text-xs font-medium text-green-300 hidden lg:inline">Connected</span>
                </div>
            );
        }
        if (sseStatus === 'connecting') {
            return (
                <div className="flex items-center gap-1.5 bg-yellow-500/20 border border-yellow-400/30 rounded-lg px-2 py-1 backdrop-blur-sm">
                    <Loader2 size={14} className="animate-spin text-yellow-400" />
                    <span className="text-xs font-medium text-yellow-300 hidden lg:inline">Connecting</span>
                </div>
            );
        }
        return (
            <div className="flex items-center gap-1.5 bg-red-500/20 border border-red-400/30 rounded-lg px-2 py-1 backdrop-blur-sm">
                <WifiOff size={14} className="text-red-400" />
                <span className="text-xs font-medium text-red-300 hidden lg:inline">Disconnected</span>
            </div>
        );
    };

    return (
        <div className="fixed inset-x-0 top-0 z-[1001] flex h-16 items-center justify-between bg-black/30 backdrop-blur-xl border-b border-white/10 px-4 text-white shadow-2xl transition-all duration-300 ease-in-out lg:px-6">
            {/* Subtle gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-r from-blue-900/20 via-transparent to-purple-900/20 pointer-events-none" />

            {/* Left Section: Session Info & QR Code */}
            <div className="relative flex items-center gap-3 lg:gap-4">
                {/* Live indicator with pulsing animation */}
                <div className="flex items-center gap-2">
                    <div className="relative">
                        <Tv2 size={22} className="shrink-0 text-orange-400 transition-transform duration-200 hover:scale-110" />
                        <div className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full animate-pulse shadow-lg shadow-red-500/50" />
                    </div>
                    <span className="hidden text-sm font-semibold tracking-wide sm:text-base md:inline bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent">
                    Live {PRODUCT_NAME}
                </span>
                </div>

                {/* Connection status with enhanced styling */}
                <div className="flex items-center gap-2">
                    <div className="transition-all duration-200">
                    <SseStatusIndicator />
                    </div>
                </div>

                {/* Recording indicator with modern styling */}
                {isAudioRecording && (
                    <div className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-red-500 to-red-600 px-3 py-1.5 text-xs font-bold shadow-lg shadow-red-500/25 border border-red-400/30 backdrop-blur-sm transition-all duration-300 ease-in-out animate-pulse">
                        <div className="relative">
                            <Mic size={14} className="animate-pulse" />
                            <div className="absolute inset-0 bg-white/20 rounded-full blur-sm" />
                        </div>
                        <span className="tracking-wider">REC</span>
                        <span className="ml-1 font-mono tabular-nums bg-black/20 px-2 py-0.5 rounded-md">
                            {formatDuration(recordingDuration)}
                        </span>
                        {isAudioPaused && (
                            <span className="ml-1 text-yellow-200 font-medium">(Paused)</span>
                        )}
                    </div>
                )}

                {/* Always visible QR Code with invite code */}
                <div className="flex items-center gap-4 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl px-4 py-2 shadow-lg">
                    {/* QR Code - Centered and Bigger */}
                    <div className="relative flex items-center justify-center">
                        <div
                            ref={qrRef}
                            className="w-14 h-14 bg-white rounded-lg p-1 shadow-lg border border-orange-400/50 overflow-hidden flex items-center justify-center"
                            style={{
                                width: '56px',
                                height: '56px',
                            }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-r from-orange-400/10 to-orange-600/10 rounded-lg pointer-events-none" />
                    </div>

                    {/* Invite code and copy button */}
                    <div className="flex items-center gap-3">
                        <div className="flex flex-col">
                            <span className="text-xs text-white/60 font-medium hidden sm:block">Scan to Join</span>
                            <span className="font-mono tracking-wider text-orange-300 font-bold text-sm">{inviteCode}</span>
                        </div>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={handleCopyInvite}
                            className="h-8 w-8 rounded-lg bg-white/10 hover:bg-white/20 border border-white/20 hover:border-orange-400/50 text-white/60 hover:text-orange-300 backdrop-blur-sm transition-all duration-200 hover:scale-105 shadow-sm"
                            title="Copy Invite Link"
                        >
                            <Copy size={14} />
                        </Button>
                    </div>
                </div>
            </div>

            {/* Center Section: Modern Slide Counter */}
            <div className="relative flex items-center">
                <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl px-4 py-2 shadow-lg">
                    <span className="text-sm lg:text-base font-medium text-white/90">
                        <span className="hidden sm:inline text-white/60 mr-2">Slide</span>
                        <span className="font-mono text-blue-300 font-bold">{currentSlideIndex + 1}</span>
                        <span className="text-white/40 mx-2">/</span>
                        <span className="font-mono text-white/80">{totalSlides}</span>
                </span>
                </div>
            </div>

            {/* Right Section: Modern Action Buttons */}
            <div className="relative flex items-center gap-2 lg:gap-3">
                {/* Audio Controls Menu */}
                {isAudioRecording &&
                    (onPauseAudio || onResumeAudio || (audioBlobUrl && onDownloadAudio)) && (
                        <DropdownMenu open={isAudioMenuOpen} onOpenChange={setIsAudioMenuOpen}>
                            <DropdownMenuTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-10 w-10 rounded-xl bg-sky-500/20 hover:bg-sky-500/30 border border-sky-400/30 text-sky-300 hover:text-sky-200 backdrop-blur-sm transition-all duration-300 ease-out hover:scale-105 shadow-lg"
                                    title="Audio Options"
                                >
                                    <Settings2 size={18} className="transition-transform duration-200 hover:rotate-90" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent
                                align="end"
                                className="border-white/20 bg-black/50 backdrop-blur-xl text-white rounded-xl shadow-2xl"
                            >
                                {isAudioRecording && !isAudioPaused && onPauseAudio && (
                                    <DropdownMenuItem
                                        onClick={onPauseAudio}
                                        className="cursor-pointer hover:!bg-white/10 focus:!bg-white/10 transition-all duration-200 rounded-lg mx-1"
                                    >
                                        <PauseCircle size={16} className="mr-3 text-yellow-400" />
                                        <span className="font-medium">Pause Recording</span>
                                    </DropdownMenuItem>
                                )}
                                {isAudioRecording && isAudioPaused && onResumeAudio && (
                                    <DropdownMenuItem
                                        onClick={onResumeAudio}
                                        className="cursor-pointer hover:!bg-white/10 focus:!bg-white/10 transition-all duration-200 rounded-lg mx-1"
                                    >
                                        <PlayIcon size={16} className="mr-3 text-green-400" />
                                        <span className="font-medium">Resume Recording</span>
                                    </DropdownMenuItem>
                                )}
                                {/* Show download if a download function is provided and recording is active/has been active */}
                                {isAudioRecording && onDownloadAudio && (
                                    <>
                                        <DropdownMenuItem
                                            onClick={() => onDownloadAudio('webm')}
                                            className="cursor-pointer hover:!bg-white/10 focus:!bg-white/10 transition-all duration-200 rounded-lg mx-1"
                                        >
                                            <Download size={16} className="mr-3 text-blue-400" />
                                            <span className="font-medium">Download as WebM</span>
                                        </DropdownMenuItem>
                                        <DropdownMenuItem
                                            onClick={() => onDownloadAudio('mp3')}
                                            className="cursor-pointer hover:!bg-white/10 focus:!bg-white/10 transition-all duration-200 rounded-lg mx-1"
                                        >
                                            <Download size={16} className="mr-3 text-purple-400" />
                                            <span className="font-medium">Download as MP3</span>
                                        </DropdownMenuItem>
                                    </>
                                )}
                                {isAudioRecording && onGenerateTranscript && (
                                    <DropdownMenuItem
                                        onClick={onGenerateTranscript}
                                        disabled={isTranscribing}
                                        className="cursor-pointer hover:!bg-white/10 focus:!bg-white/10 disabled:hover:!bg-transparent transition-all duration-200 rounded-lg mx-1"
                                    >
                                        {isTranscribing ? (
                                            <Loader2 size={16} className="mr-3 animate-spin text-teal-400" />
                                        ) : hasTranscript ? (
                                            <FileText size={16} className="mr-3 text-green-400" />
                                        ) : (
                                            <MessageSquareText
                                                size={16}
                                                className="mr-3 text-teal-400"
                                            />
                                        )}
                                        <span className="font-medium">
                                        {isTranscribing
                                            ? 'Transcribing...'
                                            : hasTranscript
                                              ? 'View Transcript'
                                              : 'Generate Transcript'}
                                        </span>
                                    </DropdownMenuItem>
                                )}
                            </DropdownMenuContent>
                        </DropdownMenu>
                    )}

                {/* Modern Action Buttons */}
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={onToggleParticipantsView}
                    className={`h-10 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white backdrop-blur-sm transition-all duration-300 ease-out hover:scale-105 shadow-lg px-3 lg:px-4 ${
                        isParticipantsPanelOpen
                            ? 'bg-blue-500/30 border-blue-400/50 text-blue-200 shadow-blue-500/25'
                            : 'hover:border-blue-400/30'
                    }`}
                    title="Toggle Participants Panel"
                >
                    <Users size={16} className="mr-0 sm:mr-2 transition-transform duration-200 group-hover:scale-110" />
                    <span className="hidden sm:inline font-medium">
                        <span className="text-blue-300 font-bold">({participantsCount})</span>
                    </span>
                </Button>

                {/* Recommendations Button */}
                {onToggleRecommendations && (
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={onToggleRecommendations}
                        className={`h-10 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white backdrop-blur-sm transition-all duration-300 ease-out hover:scale-105 shadow-lg px-3 lg:px-4 ${
                            isRecommendationsPanelOpen
                                ? 'bg-orange-500/30 border-orange-400/50 text-orange-200 shadow-orange-500/25'
                                : 'hover:border-orange-400/30'
                        }`}
                        title="Toggle AI Recommendations"
                    >
                        <Lightbulb size={16} className="mr-0 sm:mr-2 transition-transform duration-200 group-hover:scale-110" />
                        <span className="hidden sm:inline font-medium">
                            {recommendationsCount !== undefined && recommendationsCount > 0 && (
                                <span className="text-orange-300 font-bold">({recommendationsCount})</span>
                            )}
                            <span className="hidden lg:inline ml-1">AI Ideas</span>
                        </span>
                    </Button>
                )}

                <Button
                    variant="ghost"
                    size="sm"
                    onClick={onToggleWhiteboard}
                    className={`h-10 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white backdrop-blur-sm transition-all duration-300 ease-out hover:scale-105 shadow-lg px-3 lg:px-4 ${
                        isWhiteboardOpen
                            ? 'bg-purple-500/30 border-purple-400/50 text-purple-200 shadow-purple-500/25'
                            : 'hover:border-purple-400/30'
                    }`}
                    title="Toggle Whiteboard"
                >
                    <Edit3 size={16} className="mr-0 sm:mr-2 transition-transform duration-200 group-hover:rotate-12" />
                    <span className="hidden sm:inline font-medium">Whiteboard</span>
                </Button>

                {onGenerateTranscript && (
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={onGenerateTranscript}
                        disabled={isTranscribing}
                        className="h-10 rounded-xl bg-white/10 hover:bg-white/20 disabled:bg-white/5 border border-white/20 hover:border-teal-400/30 text-white hover:text-teal-200 disabled:text-white/30 backdrop-blur-sm transition-all duration-300 ease-out hover:scale-105 disabled:scale-100 shadow-lg px-3 lg:px-4"
                        title={
                            isTranscribing
                                ? 'Transcribing...'
                                : hasTranscript
                                  ? 'View Transcript'
                                  : 'Generate Transcript'
                        }
                    >
                        {isTranscribing ? (
                            <Loader2 size={16} className="mr-0 sm:mr-2 animate-spin text-teal-400" />
                        ) : hasTranscript ? (
                            <FileText size={16} className="mr-0 sm:mr-2 text-green-400 transition-transform duration-200 group-hover:scale-110" />
                        ) : (
                            <MessageSquareText size={16} className="mr-0 sm:mr-2 text-teal-400 transition-transform duration-200 group-hover:scale-110" />
                        )}
                        <span className="hidden sm:inline font-medium">
                            {isTranscribing
                                ? 'Transcribing...'
                                : hasTranscript
                                  ? 'Transcript'
                                  : 'Transcript'}
                        </span>
                    </Button>
                )}

                {/* Modern End Session Button */}
                <Button
                    variant="destructive"
                    size="sm"
                    onClick={onEndSession}
                    disabled={isEndingSession}
                    className="h-10 min-w-[80px] lg:min-w-[100px] rounded-xl bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 border border-red-400/30 text-white font-semibold backdrop-blur-sm transition-all duration-300 ease-out hover:scale-105 disabled:scale-100 shadow-lg shadow-red-500/25 px-4"
                    title="End Session"
                >
                    {isEndingSession ? (
                        <Loader2 size={16} className="animate-spin mr-0 sm:mr-2" />
                    ) : (
                        <>
                            <X size={16} className="mr-0 sm:mr-2 transition-transform duration-200 group-hover:rotate-90" />
                            <span className="hidden sm:inline">End Session</span>
                        </>
                    )}
                </Button>
            </div>
        </div>
    );
};
