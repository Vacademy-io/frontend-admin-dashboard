// components/LiveSessionActionBar.tsx
import React, { useState, useEffect, useRef } from 'react'; // Added useEffect, useRef
import { Button } from '@/components/ui/button';
import { Users, Tv2, X, Edit3, Copy, Loader2, Wifi, WifiOff, Mic, MicOff, PauseCircle, PlayCircle as PlayIcon, Download, Settings2, ChevronDown, QrCodeIcon, MessageSquareText, FileText } from 'lucide-react'; // Added QrCodeIcon
import { toast } from 'sonner';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"; // Import Popover components
import QRCodeStyling from 'qr-code-styling'; // Import QRCodeStyling
import { PRODUCT_NAME } from '@/config/branding';

// QR Code instance (similar to SessionWaitingRoom)
const qrCodeInstance = new QRCodeStyling({
    width: 180, // Adjusted size for popover
    height: 180,
    type: 'svg',
    dotsOptions: { color: '#1E293B', type: 'rounded' }, // Darker dots for better contrast on potentially light popover
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
}) => {
    const [isAudioMenuOpen, setIsAudioMenuOpen] = useState(false);
    const qrRefPopover = useRef<HTMLDivElement>(null); // Ref for QR code in Popover
    const [isQrPopoverOpen, setIsQrPopoverOpen] = useState(false);

    // Corrected invitationLink construction
    const invitationLink = `https://engage.vacademy.io/${inviteCode}`;

    useEffect(() => {
        if (!isQrPopoverOpen || !invitationLink) {
            return; // Exit if the popover isn't open or there's no link
        }

        // Use a short timeout to ensure the ref is attached after PopoverContent renders
        const timerId = setTimeout(() => {
            if (qrRefPopover.current) {
                try {
                    qrCodeInstance.update({ data: invitationLink });
                    qrRefPopover.current.innerHTML = ''; 
                    qrCodeInstance.append(qrRefPopover.current);
                } catch (error) {
                    console.error("Error during QR code generation/append:", error);
                }
            }
        }, 0); // 0ms timeout pushes to end of event loop

        // Return the cleanup function
        return () => clearTimeout(timerId);
    }, [isQrPopoverOpen, invitationLink]);

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
                    Live {PRODUCT_NAME}
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
                <Popover open={isQrPopoverOpen} onOpenChange={setIsQrPopoverOpen}>
                    <PopoverTrigger asChild>
                        <Button 
                            variant="ghost" 
                            className="flex items-center rounded-full bg-slate-700 px-2 py-1 text-xs text-slate-200 hover:bg-slate-600 hover:text-orange-400 h-auto group"
                            title="Show Invite QR Code / Copy Link"
                        >
                    <span className="mr-1 hidden sm:inline">Code:</span>
                    <span className="font-mono tracking-wider">{inviteCode}</span>
                            <QrCodeIcon size={14} className="ml-1.5 text-slate-400 group-hover:text-orange-300 transition-colors" />
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto bg-slate-50 p-3 shadow-xl border-slate-300" align="start">
                        <div className="text-center text-sm font-medium text-slate-700 mb-2">Scan to Join Session</div>
                        <div 
                            ref={qrRefPopover} 
                            className="rounded-md overflow-hidden border-2 border-orange-400 bg-white p-1 shadow-inner mx-auto"
                            style={{ 
                                width: `${qrCodeInstance._options.width}px`, 
                                height: `${qrCodeInstance._options.height}px` 
                            }}
                        />
                    <Button
                            variant="outline"
                            size="sm"
                            className="w-full mt-3 border-slate-300 text-slate-600 hover:bg-slate-200 hover:text-slate-800"
                        onClick={handleCopyInvite}
                    >
                            <Copy size={14} className="mr-1.5" /> Copy Invite Link
                    </Button>
                    </PopoverContent>
                </Popover>
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
                            {isAudioRecording && onGenerateTranscript && (
                                <DropdownMenuItem onClick={onGenerateTranscript} disabled={isTranscribing} className="hover:!bg-slate-600 focus:!bg-slate-600 cursor-pointer">
                                {isTranscribing ? (
                                    <Loader2 size={16} className="mr-2 animate-spin" />
                                ) : hasTranscript ? (
                                    <FileText size={16} className="mr-2 text-green-400" />
                                ) : (
                                    <MessageSquareText size={16} className="mr-2 text-teal-400" />
                                )}
                                {isTranscribing ? 'Transcribing...' : hasTranscript ? 'View Transcript' : 'Generate Transcript'}
                            </DropdownMenuItem>
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
                {onGenerateTranscript && (
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={onGenerateTranscript}
                        disabled={isTranscribing}
                        className="text-slate-200 hover:bg-slate-700 hover:text-white"
                        title={isTranscribing ? "Transcribing..." : hasTranscript ? "View Transcript" : "Generate Transcript"}
                    >
                        {isTranscribing ? (
                            <Loader2 size={16} className="mr-0 sm:mr-1.5 animate-spin" />
                        ) : hasTranscript ? (
                            <FileText size={16} className="mr-0 sm:mr-1.5 text-green-400" />
                        ) : (
                            <MessageSquareText size={16} className="mr-0 sm:mr-1.5 text-teal-400" />
                        )}
                        <span className="hidden sm:inline">
                            {isTranscribing ? "Transcribing..." : hasTranscript ? "View Transcript" : "Generate Transcript"}
                        </span>
                    </Button>
                )}
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

// Effect to update QR code when popover opens and link is available
const LiveSessionActionBarWithQRCodeLogic: React.FC<LiveSessionActionBarProps> = (props) => {
    const { inviteCode } = props;
    const qrRefPopover = useRef<HTMLDivElement>(null); // This ref is local to this wrapper
    const [localIsQrPopoverOpen, setLocalIsQrPopoverOpen] = useState(false);

    const invitationLink = 
        typeof window !== 'undefined'
            ? `${window.location.origin}/engage/${inviteCode}`
            : `/engage/${inviteCode}`;

    useEffect(() => {
        if (localIsQrPopoverOpen && qrRefPopover.current && invitationLink) {
            qrCodeInstance.update({ data: invitationLink });
            qrRefPopover.current.innerHTML = ''; // Clear previous QR code
            qrCodeInstance.append(qrRefPopover.current);
        }
    }, [localIsQrPopoverOpen, invitationLink]);

    // This is a bit of a workaround. We need to pass the ref and popover state to the main component.
    // A cleaner way might involve context or lifting state further, but for this isolated change:
    const ActionBarWithPassedRefs = React.cloneElement(<LiveSessionActionBar {...props} />, {
        // @ts-ignore
        qrRefPopover: qrRefPopover, 
        // @ts-ignore
        isQrPopoverOpen: localIsQrPopoverOpen, 
        // @ts-ignore
        setIsQrPopoverOpen: setLocalIsQrPopoverOpen 
    });

    // The issue is that LiveSessionActionBar is defined above, and we can't directly put the useEffect inside it
    // without restructuring. The Popover trigger is inside LiveSessionActionBar. We need the QR to update when that popover opens.

    // A simpler approach: The QR generation logic should be inside LiveSessionActionBar, and it needs its own ref.
    // The Popover open state will trigger the useEffect within LiveSessionActionBar itself.
    // Let's correct the initial implementation by moving the useEffect into LiveSessionActionBar and ensuring it uses its OWN ref.

    return <LiveSessionActionBar {...props} />;
}; 

// The above wrapper `LiveSessionActionBarWithQRCodeLogic` is not ideal. 
// The useEffect for QR code generation should be directly within LiveSessionActionBar itself, triggered by popover state changes.
// The provided diff for LiveSessionActionBar already added a local qrRefPopover and isQrPopoverOpen state.
// I will now ensure the useEffect that uses these is directly within LiveSessionActionBar.

// Corrected LiveSessionActionBar.tsx (Conceptual - the tool will apply to the original definition)
// The tool will apply the changes to the existing LiveSessionActionBar. 
// The useEffect for QR Code generation will be added to it.