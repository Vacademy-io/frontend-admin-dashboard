/* eslint-disable */
// @ts-nocheck
'use client';

import React, { useState, useEffect, useRef } from 'react';
import { SlideRenderer } from './SlideRenderer'; // Assuming SlideRenderer is in the same directory
import { LiveSessionActionBar } from './components/LiveSessionActionBar';
import { useSlideStore } from '@/stores/Slides/useSlideStore'; // For participants count, total slides (optional)
import type { Slide as AppSlide } from './utils/types';
import type { SessionDetails } from './SlideEditorComponent'; // Assuming SessionDetails type is exported or define here
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Maximize, Minimize } from 'lucide-react';
import authenticatedAxiosInstance from '@/lib/auth/axiosInstance'; // For API calls
import { toast } from 'sonner'; // For notifications
import { ParticipantsSidePanel } from '../slides/components/ParticipantsSidePanel'; // Implied import for ParticipantsSidePanel component
import { QuickQuestionFAB, type InsertionBehavior } from './components/QuickQuestionFAB';
import { ResponseOverlay } from './components/ResponseOverlay';
import { SlideTypeEnum } from './utils/types';
import { SessionExcalidrawOverlay } from './components/SessionExcalidrawOverlay';

// Define Participant interface (copied from ParticipantsSidePanel)
interface Participant {
    username: string;
    user_id?: string | null;
    name?: string | null;
    email?: string | null;
    status: string;
    joined_at?: string; // ISO string
    last_active_at?: string; // ISO string, for INACTIVE participants
}

interface MinimalSessionDetails {
    session_id: string;
    invite_code: string;
    // other fields from SlideEditorComponent's sessionDetails state if needed
}

const MOVE_SLIDE_API_URL = 'https://backend-stage.vacademy.io/community-service/engage/admin/move';
// Define ADMIN_SSE_URL_BASE (copied from ParticipantsSidePanel)
const ADMIN_SSE_URL_BASE = 'https://backend-stage.vacademy.io/community-service/engage/admin/';

interface ActualPresentationDisplayProps {
    slides: AppSlide[];
    initialSlideId?: string;
    liveSessionData: MinimalSessionDetails | null;
    onExit: () => void;
    isAudioRecording?: boolean;
    isAudioPaused?: boolean;
    audioBlobUrl?: string | null;
    onPauseAudio?: () => void;
    onResumeAudio?: () => void;
    onDownloadAudio?: (format?: 'webm' | 'mp3') => void;
    recordingDuration?: number;
   

    // Props that will be passed to ParticipantsSidePanel if it's rendered as a child
    // and needs to be controlled from here regarding its visibility.
    isParticipantsPanelOpen?: boolean;
    onToggleParticipantsPanel?: () => void;
    onAddQuickQuestion?: (slideData: AppSlide, insertionBehavior: InsertionBehavior) => void;
    onGenerateTranscript?: () => void;
}

export const ActualPresentationDisplay: React.FC<ActualPresentationDisplayProps> = ({
    slides,
    initialSlideId,
    liveSessionData,
    onExit,
    isAudioRecording,
    isAudioPaused,
    audioBlobUrl,
    onPauseAudio,
    onResumeAudio,
    onDownloadAudio,
    recordingDuration,
    // Defaulting these if not provided, though they might be controlled by a parent of ActualPresentationDisplay
    isParticipantsPanelOpen = false, 
    onToggleParticipantsPanel,
    onAddQuickQuestion,
    onGenerateTranscript,
}) => {
    const { setCurrentSlideId: setGlobalCurrentSlideId } = useSlideStore();
    const [currentSlideId, setCurrentSlideId] = useState<string | undefined>(initialSlideId);
    // const [participantsCount, setParticipantsCount] = useState(0); // Replaced by participantsList.length
    const [isWhiteboardOpen, setIsWhiteboardOpen] = useState(false);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const presentationContainerRef = useRef<HTMLDivElement>(null);

    // State for SSE managed participants and connection status
    const [participantsList, setParticipantsList] = useState<Participant[]>([]);
    const [sseStatus, setSseStatus] = useState<'connecting' | 'connected' | 'disconnected'>('disconnected');
    const eventSourceRef = useRef<EventSource | null>(null);
    const previousParticipantsRef = useRef<Participant[]>([]); // Ref to store previous participants

    // New useEffect to keep the global state in sync with the presentation view's active slide.
    useEffect(() => {
        if (currentSlideId) {
            setGlobalCurrentSlideId(currentSlideId);
        }
    }, [currentSlideId, setGlobalCurrentSlideId]);

    // SSE Connection useEffect (adapted from ParticipantsSidePanel)
    useEffect(() => {
        if (!liveSessionData?.session_id) {
            if (eventSourceRef.current) {
                console.log('[ActualPresentationDisplay] Closing SSE: No session_id.');
                eventSourceRef.current.close();
                eventSourceRef.current = null;
            }
            setParticipantsList([]);
            setSseStatus('disconnected');
            return;
        }

        const sessionId = liveSessionData.session_id;

        if (eventSourceRef.current) { // Close existing connection if sessionId changes or on re-connect logic
            console.log('[ActualPresentationDisplay] Closing existing SSE before new one.');
            eventSourceRef.current.close();
        }

        setSseStatus('connecting');
        setParticipantsList([]); 
        console.log(`[ActualPresentationDisplay] SSE init. Session ID: ${sessionId}`);
        const sseUrl = `${ADMIN_SSE_URL_BASE}${sessionId}`;
        console.log(`[ActualPresentationDisplay] SSE connecting to: ${sseUrl}`);
        const newEventSource = new EventSource(sseUrl, { withCredentials: true });
        eventSourceRef.current = newEventSource;

        newEventSource.onopen = () => {
            console.log('[ActualPresentationDisplay] SSE Connection Established.');
            setSseStatus('connected');
        };

        const directParticipantsListener = (event: MessageEvent) => {
            console.log("[ActualPresentationDisplay] Received 'participants' event data:", event.data);
            try {
                const newParticipants = JSON.parse(event.data) as Participant[];
                if (Array.isArray(newParticipants)) {
                    // Compare with previous participants to detect joins/leaves
                    if (previousParticipantsRef.current && previousParticipantsRef.current.length > 0) {
                        const currentIds = new Set(newParticipants.map(p => p.user_id || p.username));
                        const previousIds = new Set(previousParticipantsRef.current.map(p => p.user_id || p.username));

                        // Detect joins
                        newParticipants.forEach(p => {
                            const participantKey = p.user_id || p.username;
                            if (!previousIds.has(participantKey)) {
                                toast.success(`${p.name || p.username} joined the session.`);
                            }
                        });

                        // Detect leaves
                        previousParticipantsRef.current.forEach(p => {
                            const participantKey = p.user_id || p.username;
                            if (!currentIds.has(participantKey)) {
                                toast.error(`${p.name || p.username} left the session.`);
                            }
                        });
                    }
                    setParticipantsList(newParticipants);
                    previousParticipantsRef.current = newParticipants; // Update ref after processing
                } else {
                    console.warn("[ActualPresentationDisplay] 'participants' data received is not an array:", newParticipants);
                     // Still update refs even if data is not an array to prevent stale comparisons on next valid array
                    previousParticipantsRef.current = Array.isArray(newParticipants) ? newParticipants : []; 
                }
            } catch (error) {
                console.error("[ActualPresentationDisplay] Error parsing 'participants' data:", error);
            }
        };
        newEventSource.addEventListener('participants', directParticipantsListener);

        const sessionStateListener = (event: MessageEvent) => {
            try {
                const data = JSON.parse(event.data);
                console.log("[ActualPresentationDisplay] SSE: 'session_state_presenter' received", data);
                if (data.participants && Array.isArray(data.participants)) {
                    // Similar join/leave detection for session_state_presenter if it can also change participant list
                    const newParticipants = data.participants as Participant[];
                     if (previousParticipantsRef.current && previousParticipantsRef.current.length > 0) {
                        const currentIds = new Set(newParticipants.map(p => p.user_id || p.username));
                        const previousIds = new Set(previousParticipantsRef.current.map(p => p.user_id || p.username));

                        newParticipants.forEach(p => {
                            const participantKey = p.user_id || p.username;
                            if (!previousIds.has(participantKey)) {
                                toast.success(`${p.name || p.username} joined the session.`);
                            }
                        });
                        previousParticipantsRef.current.forEach(p => {
                            const participantKey = p.user_id || p.username;
                            if (!currentIds.has(participantKey)) {
                                toast.error(`${p.name || p.username} left the session.`);
                            }
                        });
                    }
                    setParticipantsList(newParticipants);
                    previousParticipantsRef.current = newParticipants; // Update ref
                }
                // Potentially handle other session state updates here if needed
            } catch (e) {
                console.warn("[ActualPresentationDisplay] SSE: Error parsing 'session_state_presenter' data:", e);
            }
        };
        newEventSource.addEventListener('session_state_presenter', sessionStateListener);

        newEventSource.onerror = (error) => {
            console.error('[ActualPresentationDisplay] SSE Error. Browser will attempt to reconnect.', error);
            setSseStatus('disconnected');
            previousParticipantsRef.current = []; // Clear ref on disconnect
        };

        return () => {
            if (newEventSource) {
                console.log('[ActualPresentationDisplay] Closing SSE Connection and removing listeners.');
                newEventSource.removeEventListener('participants', directParticipantsListener);
                newEventSource.removeEventListener('session_state_presenter', sessionStateListener);
                newEventSource.close();
                eventSourceRef.current = null;
            }
            setSseStatus('disconnected');
        };
    }, [liveSessionData?.session_id]); // Effect reruns if session_id changes

    // Effect to initialize previousParticipantsRef on first load to avoid false join notifications
    useEffect(() => {
        if (participantsList.length > 0 && previousParticipantsRef.current.length === 0) {
            previousParticipantsRef.current = participantsList;
        }
    }, [participantsList]);

    useEffect(() => {
        const isCurrentSlideValid = slides.some(s => s.id === currentSlideId);

        if (!isCurrentSlideValid) {
            // If the current slide ID is no longer in the list (e.g., it was deleted),
            // fall back to the initialSlideId or the first slide.
            if (initialSlideId && slides.some(s => s.id === initialSlideId)) {
                setCurrentSlideId(initialSlideId);
            } else if (slides.length > 0) {
                setCurrentSlideId(slides[0].id);
            } else {
                setCurrentSlideId(undefined);
            }
        }
        // If the current slide is still valid, we do nothing, preserving the user's position.
    }, [slides, initialSlideId, currentSlideId]);

    const currentSlideIndex = slides.findIndex((s) => s.id === currentSlideId);
    const currentSlideData = slides[currentSlideIndex];
    const isQuestionSlideForResponses = 
        currentSlideData?.type === SlideTypeEnum.Quiz || 
        currentSlideData?.type === SlideTypeEnum.Feedback;

    const goToNextSlide = async () => {
        if (currentSlideIndex < slides.length - 1) {
            const nextSlide = slides[currentSlideIndex + 1];
            if (!nextSlide || typeof nextSlide.slide_order === 'undefined') {
                console.error('[ActualPresentationDisplay] Next slide is invalid or missing slide_order:', nextSlide);
                toast.error("Cannot navigate: Next slide data is invalid.");
                return;
            }
            setCurrentSlideId(nextSlide.id);
            if (liveSessionData?.session_id) {
                try {
                    await authenticatedAxiosInstance.post(MOVE_SLIDE_API_URL, {
                        session_id: liveSessionData.session_id,
                        move_to: nextSlide.slide_order,
                    });
                    // toast.success(`Moved to slide ${nextSlide.slide_order + 1}`);
                } catch (error) {
                    console.error('Error moving to next slide (API):', error);
                    toast.error('Failed to sync slide change with server.');
                }
            }
        }
    };

    const goToPreviousSlide = async () => {
        if (currentSlideIndex > 0) {
            const prevSlide = slides[currentSlideIndex - 1];
            if (!prevSlide || typeof prevSlide.slide_order === 'undefined') {
                console.error('[ActualPresentationDisplay] Previous slide is invalid or missing slide_order:', prevSlide);
                toast.error("Cannot navigate: Previous slide data is invalid.");
                return;
            }
            setCurrentSlideId(prevSlide.id);
            if (liveSessionData?.session_id) {
                try {
                    await authenticatedAxiosInstance.post(MOVE_SLIDE_API_URL, {
                        session_id: liveSessionData.session_id,
                        move_to: prevSlide.slide_order,
                    });
                    // toast.success(`Moved to slide ${prevSlide.slide_order + 1}`);
                } catch (error) {
                    console.error('Error moving to previous slide (API):', error);
                    toast.error('Failed to sync slide change with server.');
                }
            }
        }
    };

    const handleDownloadAudio = (format: 'webm' | 'mp3' = 'webm') => {
        if (onDownloadAudio) {
            onDownloadAudio(format); // Pass the format to the function received from props
        } else {
            toast.error("Download function not available.");
        }
    };

    const toggleFullscreen = () => {
        if (!presentationContainerRef.current) return;
        if (!document.fullscreenElement) {
            presentationContainerRef.current.requestFullscreen().catch(err => {
                alert(`Error attempting to enable full-screen mode: ${err.message} (${err.name})`);
            });
            setIsFullscreen(true);
        } else {
            document.exitFullscreen();
            setIsFullscreen(false);
        }
    };

    useEffect(() => {
        const handleFullscreenChange = () => {
            setIsFullscreen(!!document.fullscreenElement);
        };
        document.addEventListener('fullscreenchange', handleFullscreenChange);
        return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
    }, []);


    if (!currentSlideData) {
        return (
            <div className="flex h-screen w-screen flex-col items-center justify-center bg-slate-900 text-white">
                <p>No slide to display or slide not found.</p>
                <Button onClick={onExit} className="mt-4">Exit Presentation</Button>
            </div>
        );
    }

    return (
        <div ref={presentationContainerRef} className="flex h-screen w-screen flex-col bg-slate-800 outline-none">
            <LiveSessionActionBar
                inviteCode={liveSessionData?.invite_code || 'N/A'}
                currentSlideIndex={currentSlideIndex}
                totalSlides={slides.length}
                participantsCount={participantsList.length} // Use length of the new state
                onToggleParticipantsView={() => onToggleParticipantsPanel && onToggleParticipantsPanel()}
                isParticipantsPanelOpen={isParticipantsPanelOpen}
                onToggleWhiteboard={() => setIsWhiteboardOpen(!isWhiteboardOpen)} 
                isWhiteboardOpen={isWhiteboardOpen} 
                onEndSession={onExit} 
                isAudioRecording={isAudioRecording}
                isAudioPaused={isAudioPaused}
                onPauseAudio={onPauseAudio}
                onResumeAudio={onResumeAudio}
                audioBlobUrl={audioBlobUrl}
                onDownloadAudio={handleDownloadAudio}
                recordingDuration={recordingDuration}
                sseStatus={sseStatus} // Pass the new sseStatus state
                onGenerateTranscript={onGenerateTranscript}
            />

            {/* Main content area for the slide */}
            <div className="flex-grow overflow-hidden relative" style={{ paddingTop: '3.5rem' }}> {/* Adjust padding to be below action bar */}
                 {currentSlideId && (
                    <SlideRenderer currentSlideId={currentSlideId} editMode={false} />
                )}
                {isQuestionSlideForResponses && liveSessionData && currentSlideData && (
                    <ResponseOverlay sessionId={liveSessionData.session_id} slideData={currentSlideData} />
                )}
            </div>

            {/* Bottom Navigation / Controls for Presentation View */}
            <div className="fixed bottom-0 left-0 right-0 z-[1002] flex items-center justify-between bg-slate-800/80 p-2 text-white backdrop-blur-sm">
                <Button 
                    onClick={goToPreviousSlide} 
                    disabled={currentSlideIndex === 0}
                    variant="ghost" 
                    size="icon"
                    className="hover:bg-slate-700"
                 >
                    <ChevronLeft size={28} />
                </Button>
                <span className="text-sm">{currentSlideIndex + 1} / {slides.length}</span>
                <Button 
                    onClick={toggleFullscreen} 
                    variant="ghost" 
                    size="icon" 
                    className="hover:bg-slate-700"
                    title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
                >
                    {isFullscreen ? <Minimize size={24} /> : <Maximize size={24} />}
                </Button>
                <Button 
                    onClick={goToNextSlide} 
                    disabled={currentSlideIndex === slides.length - 1}
                    variant="ghost" 
                    size="icon"
                    className="hover:bg-slate-700"
                >
                    <ChevronRight size={28} />
                </Button>
            </div>

            {/* Floating Action Button for Quick Questions */}
            {liveSessionData?.session_id && onAddQuickQuestion && (
                <QuickQuestionFAB onAddQuickQuestion={onAddQuickQuestion} />
            )}

            {/* Conditionally render ParticipantsSidePanel */}
            {liveSessionData?.session_id && (
                <ParticipantsSidePanel
                    sessionId={liveSessionData.session_id}
                    isOpen={isParticipantsPanelOpen} // Prop from parent (SlideEditorComponent)
                    onClose={() => onToggleParticipantsPanel && onToggleParticipantsPanel()} // Prop from parent
                    participants={participantsList} // From ActualPresentationDisplay's state
                    sseStatus={sseStatus} // From ActualPresentationDisplay's state
                    topOffset="3.5rem" // Height of the LiveSessionActionBar (h-14)
                />
            )}

            {/* SessionExcalidrawOverlay would be conditionally rendered here if used */}
            {isWhiteboardOpen && liveSessionData?.session_id && (
                <SessionExcalidrawOverlay
                    sessionId={liveSessionData.session_id}
                    isOpen={isWhiteboardOpen}
                    onClose={() => setIsWhiteboardOpen(false)}
                />
            )}
        </div>
    );
}; 