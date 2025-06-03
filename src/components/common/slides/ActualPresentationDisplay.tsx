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
import { SessionExcalidrawOverlay } from './components/SessionExcalidrawOverlay';
import { SlideTypeEnum } from './utils/types'; // Import SlideTypeEnum

interface MinimalSessionDetails {
    session_id: string;
    invite_code: string;
    // other fields from SlideEditorComponent's sessionDetails state if needed
}

const MOVE_SLIDE_API_URL = 'http://localhost:8073/community-service/engage/admin/move';
const RESPONSES_API_BASE_URL = 'http://localhost:8073/community-service/engage/admin/'; // As per user

// Define API response types
interface ResponseDataItem {
  type: "ONE_WORD" | "MCQS" | "MCQM" | "LONG_ANSWER" | "NUMERICAL";
  selected_option_ids?: string[] | null;
  text_answer?: string | null;
}

export interface LiveSlideResponse { // Exporting for potential use in QuizSlide
  username: string;
  time_to_response_millis: number;
  submitted_at: number;
  response_data: ResponseDataItem;
  is_correct?: boolean;
}

interface ActualPresentationDisplayProps {
    slides: AppSlide[];
    initialSlideId?: string;
    liveSessionData: MinimalSessionDetails | null; // Using MinimalSessionDetails
    onExit: () => void;
    isAudioRecording?: boolean;
    isAudioPaused?: boolean;
    audioBlobUrl?: string | null;
    onPauseAudio?: () => void;
    onResumeAudio?: () => void;
    onDownloadAudio?: (format?: 'webm' | 'mp3') => void; // Modified to accept format
    recordingDuration?: number; // New prop for duration
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
    onDownloadAudio, // Prop from SlideEditorComponent (which is downloadCurrentAudioSnapshot)
    recordingDuration, // Destructure new prop
}) => {
    const [currentSlideId, setCurrentSlideId] = useState<string | undefined>(initialSlideId);
    const [participantsCount, setParticipantsCount] = useState(0); // Placeholder, SSE would update this
    const [isParticipantsPanelOpen, setIsParticipantsPanelOpen] = useState(false);
    const [isWhiteboardOpen, setIsWhiteboardOpen] = useState(false);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const presentationContainerRef = useRef<HTMLDivElement>(null);

    const [liveResponses, setLiveResponses] = useState<LiveSlideResponse[] | null>(null);
    const [isLoadingResponses, setIsLoadingResponses] = useState<boolean>(false);
    const responseFetchIntervalRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        if (slides.length > 0 && !initialSlideId) {
            setCurrentSlideId(slides[0].id);
        } else {
            setCurrentSlideId(initialSlideId);
        }
    }, [slides, initialSlideId]);

    const currentSlideIndex = slides.findIndex((s) => s.id === currentSlideId);
    const currentSlideData = slides[currentSlideIndex];

    // Effect for fetching live responses
    useEffect(() => {
        // Function to clear the existing interval
        const clearIntervalRef = () => {
            if (responseFetchIntervalRef.current) {
                clearInterval(responseFetchIntervalRef.current);
                responseFetchIntervalRef.current = null;
            }
        };

        if (
            liveSessionData?.session_id &&
            currentSlideData?.id &&
            (currentSlideData.type === SlideTypeEnum.Quiz || currentSlideData.type === SlideTypeEnum.Feedback)
        ) {
            const sessionId = liveSessionData.session_id;
            const slideId = currentSlideData.id;

            const fetchResponses = async () => {
                console.log(`[ActualPresentationDisplay] Fetching responses for session ${sessionId}, slide ${slideId}`);
                setIsLoadingResponses(true);
                try {
                    const response = await authenticatedAxiosInstance.get(
                        `${RESPONSES_API_BASE_URL}${sessionId}/slide/${slideId}/responses`
                    );
                    if (response.data && Array.isArray(response.data)) {
                        setLiveResponses(response.data);
                    } else {
                        console.warn('[ActualPresentationDisplay] Invalid response data:', response.data);
                        setLiveResponses([]); // Set to empty array if data is not as expected
                    }
                } catch (error) {
                    console.error('[ActualPresentationDisplay] Error fetching responses:', error);
                    // toast.error('Failed to fetch live responses.'); // Potentially noisy
                    setLiveResponses(null); // Or keep previous state, depending on desired behavior on error
                } finally {
                    setIsLoadingResponses(false);
                }
            };

            fetchResponses(); // Initial fetch
            responseFetchIntervalRef.current = setInterval(fetchResponses, 5000); // Poll every 5 seconds

            // Cleanup on unmount or when dependencies change
            return () => {
                clearIntervalRef();
                setLiveResponses(null); // Clear responses when slide/session changes
                setIsLoadingResponses(false);
            };
        } else {
            // If conditions are not met, clear any existing interval and responses
            clearIntervalRef();
            setLiveResponses(null);
            setIsLoadingResponses(false);
        }

        // Dependency array for the effect
    }, [currentSlideData, liveSessionData]); // Simplified dependency array

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
                participantsCount={participantsCount} // Replace with actual data if available
                onToggleParticipantsView={() => setIsParticipantsPanelOpen(!isParticipantsPanelOpen)}
                isParticipantsPanelOpen={isParticipantsPanelOpen}
                onToggleWhiteboard={() => setIsWhiteboardOpen(!isWhiteboardOpen)} // Placeholder
                isWhiteboardOpen={isWhiteboardOpen} // Placeholder
                onEndSession={onExit} // onEndSession can just be onExit for now
                isAudioRecording={isAudioRecording}
                isAudioPaused={isAudioPaused}
                onPauseAudio={onPauseAudio}
                onResumeAudio={onResumeAudio}
                audioBlobUrl={audioBlobUrl}
                onDownloadAudio={handleDownloadAudio}
                recordingDuration={recordingDuration} // Pass duration to action bar
                // sseStatus will need to be plumbed if needed
            />

            {/* Main content area for the slide */}
            <div className="flex-grow overflow-hidden" style={{ paddingTop: '3.5rem' }}> {/* Adjust padding to be below action bar */}
                 {currentSlideId && (
                    <SlideRenderer
                        currentSlideId={currentSlideId}
                        editMode={false}
                        liveResponses={liveResponses}
                        isLoadingLiveResponses={isLoadingResponses}
                        liveSessionId={liveSessionData?.session_id} // Pass session ID
                    />
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

            {/* ParticipantsSidePanel and SessionExcalidrawOverlay would be conditionally rendered here if used */}
            {/* e.g., isParticipantsPanelOpen && <ParticipantsSidePanel ... /> */}
            {isWhiteboardOpen && liveSessionData?.session_id && (
                <SessionExcalidrawOverlay
                    isOpen={isWhiteboardOpen}
                    onClose={() => setIsWhiteboardOpen(false)}
                    sessionId={liveSessionData.session_id}
                />
            )}
        </div>
    );
}; 