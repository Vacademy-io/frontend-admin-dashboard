/* eslint-disable */
// @ts-nocheck
'useclient';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import Reveal from 'reveal.js';
import 'reveal.js/dist/reveal.css';
import 'reveal.js/dist/theme/white.css'; // Or your preferred theme

import { SlideEditor } from './SlideEditor'; // For rendering Excalidraw slides in view mode
import { QuizSlide } from './slidesTypes/QuizSlides'; // Ensure path is correct
import authenticatedAxiosInstance from '@/lib/auth/axiosInstance';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react'; // For loading state

import { LiveSessionActionBar } from './components/LiveSessionActionBar';
import { ParticipantsSidePanel } from './components/ParticipantsSidePanel';
import { SessionExcalidrawOverlay } from './components/SessionExcalidrawOverlay'; // Ensure path and naming

import type {
    Slide as AppSlide,
    ExcalidrawSlideData,
    QuizSlideData,
    FeedbackSlideData,
} from '././utils/types';

import type { QuestionFormData } from '@/components/common/slides/utils/types'; // Import QuestionFormData as type
import { SlideTypeEnum } from '@/components/common/slides/utils/types';

const MOVE_SESSION_API_URL =
    'https://backend-stage.vacademy.io/community-service/engage/admin/move';
const PARTICIPANTS_SSE_URL_BASE =
    'https://backend-stage.vacademy.io/community-service/engage/admin/'; // e.g., admin/${sessionId}/participants

interface PresentationViewProps {
    slides: AppSlide[];
    onExit: () => void;
    liveSessionData?: { session_id: string; invite_code: string; [key: string]: any };
    initialSlideId?: string; // To start Reveal.js on a specific slide
}

export const PresentationView: React.FC<PresentationViewProps> = ({
    slides,
    onExit,
    liveSessionData,
    initialSlideId,
}) => {
    const revealContainerRef = useRef<HTMLDivElement>(null);
    const deckInstanceRef = useRef<Reveal.Api | null>(null);
    const isLiveSession = !!liveSessionData?.session_id;

    const [currentRevealVisualIndex, setCurrentRevealVisualIndex] = useState(0); // 0-based visual index
    const [participantsCount, setParticipantsCount] = useState(0);
    const [isParticipantsPanelOpen, setIsParticipantsPanelOpen] = useState(false);
    const [isSessionWhiteboardOpen, setIsSessionWhiteboardOpen] = useState(false);
    const [isRevealInitialized, setIsRevealInitialized] = useState(false);

    // Debounced API call for moving slide in live session
    const debouncedMoveApiCall = useCallback(
        // Basic debounce implementation
        (() => {
            let timeoutId: NodeJS.Timeout;
            return async (sessionId: string, slideOrder: number, visualIndex: number) => {
                clearTimeout(timeoutId);
                timeoutId = setTimeout(async () => {
                    try {
                        await authenticatedAxiosInstance.post(MOVE_SESSION_API_URL, {
                            session_id: sessionId,
                            move_to: slideOrder, // This should be the logical slide_order
                        });
                        // Minimal toast or none to avoid clutter during presentation
                        // toast.info(`Synced to slide ${visualIndex + 1}`, { duration: 700, id: "slide-sync" });
                    } catch (error: any) {
                        console.error('Error moving slide in live session:', error);
                        toast.error(
                            error.response?.data?.message || 'Failed to sync slide movement.'
                        );
                    }
                }, 300); // 300ms debounce
            };
        })(),
        []
    );

    // SSE for participants count
    useEffect(() => {
        if (!isLiveSession || !liveSessionData?.session_id) return;

        const sseUrl = `${PARTICIPANTS_SSE_URL_BASE}${liveSessionData.session_id}`; // Example: ensure correct endpoint
        const eventSource = new EventSource(sseUrl, { withCredentials: true });

        const participantListener = (event: MessageEvent) => {
            try {
                const data = JSON.parse(event.data);
                if (Array.isArray(data)) {
                    setParticipantsCount(data.length);
                } else if (typeof data.count === 'number') {
                    // If backend sends { count: X }
                    setParticipantsCount(data.count);
                }
            } catch (e) {
                /* console.warn("Error parsing participants count from SSE:", e); */
            }
        };

        eventSource.addEventListener('participants', participantListener); // Ensure backend sends 'participants' event

        eventSource.onopen = () => {
            /* console.log("PresentationView SSE for count: Connection open."); */
        };
        eventSource.onerror = () => {
            eventSource.close(); /* console.error("PresentationView SSE for count: Error. Closing."); */
        };

        return () => {
            eventSource.removeEventListener('participants', participantListener);
            eventSource.close();
        };
    }, [isLiveSession, liveSessionData?.session_id]);

    // Reveal.js initialization and slide change handling
    useEffect(() => {
        if (revealContainerRef.current && slides && slides.length > 0 && !deckInstanceRef.current) {
            const deck = new Reveal(revealContainerRef.current, {
                controls: true,
                progress: true,
                history: false, // Manage history via app state if needed
                center: true,
                width: '100%',
                height: '100%',
                margin: 0,
                minScale: 0.2,
                maxScale: 1.5, // Adjusted for typical presentation
                embedded: true, // Important for containing within the div
                keyboard: true,
                touch: true,
                navigationMode: 'linear',
                slideNumber: isLiveSession ? 'c/t' : false, // Show slide numbers in live session
                // fragments: true, // Enable if you use fragments within slides
                // Consider plugins: e.g. RevealMarkdown, RevealNotes, RevealHighlight
            });

            let initialH = 0;
            if (initialSlideId) {
                const startIndex = slides.findIndex((s) => s.id === initialSlideId);
                if (startIndex !== -1) initialH = startIndex;
            }

            deck.initialize({ H: initialH }).then(() => {
                deckInstanceRef.current = deck;
                setIsRevealInitialized(true);
                const indices = deck.getIndices();
                setCurrentRevealVisualIndex(indices.h || 0);

                // Initial sync if live session (optional, depends on backend logic)
                if (isLiveSession && liveSessionData) {
                    const initialSlideData = slides[indices.h || 0];
                    if (initialSlideData && typeof initialSlideData.slide_order === 'number') {
                        // debouncedMoveApiCall(liveSessionData.session_id, initialSlideData.slide_order, indices.h || 0);
                    }
                }

                deck.on('slidechanged', (event: any) => {
                    // { indexh, indexv, previousSlide, currentSlide, ... }
                    const visualIndex = event.indexh;
                    setCurrentRevealVisualIndex(visualIndex);

                    if (isLiveSession && liveSessionData) {
                        const currentSlideData = slides[visualIndex];
                        if (currentSlideData && typeof currentSlideData.slide_order === 'number') {
                            debouncedMoveApiCall(
                                liveSessionData.session_id,
                                currentSlideData.slide_order,
                                visualIndex
                            );
                        } else {
                            toast.error('Slide data missing for live sync.');
                        }
                    }
                });
            });

            const handleGlobalKeyDown = (event: KeyboardEvent) => {
                if (event.key === 'Escape') {
                    if (isSessionWhiteboardOpen) setIsSessionWhiteboardOpen(false);
                    else if (isParticipantsPanelOpen) setIsParticipantsPanelOpen(false);
                    else onExit(); // Exit presentation on Escape if no overlays are open
                }
            };
            window.addEventListener('keydown', handleGlobalKeyDown);

            return () => {
                window.removeEventListener('keydown', handleGlobalKeyDown);
                if (
                    deckInstanceRef.current &&
                    typeof (deckInstanceRef.current as any).destroy === 'function'
                ) {
                    try {
                        (deckInstanceRef.current as any).destroy();
                    } catch (e) {
                        /* console.error("Error destroying Reveal.js on cleanup:", e); */
                    }
                }
                deckInstanceRef.current = null;
                setIsRevealInitialized(false);
            };
        }
    }, [
        slides,
        onExit,
        isLiveSession,
        liveSessionData?.session_id,
        debouncedMoveApiCall,
        initialSlideId,
    ]);

    const handleEndSession = async () => {
        if (!isLiveSession || !liveSessionData) return;
        // API call to end/archive session on backend (optional)
        // e.g., await authenticatedAxiosInstance.post(`${END_SESSION_API_URL}`, { session_id: liveSessionData.session_id });
        toast.info('Session ended by administrator.', { duration: 2000 });
        onExit(); // Return to editor or previous screen
    };

    const actionBarHeight = isLiveSession ? '3.5rem' : '0px'; // 56px for h-14

    if (!slides || slides.length === 0) {
        return (
            <div className="fixed inset-0 z-[1000] flex flex-col items-center justify-center bg-slate-100 p-6 text-slate-700">
                <img
                    src="/placeholder-empty-slides.svg"
                    alt="No Slides"
                    className="mb-6 h-44 w-44 opacity-60"
                />
                <p className="mb-8 text-xl font-medium">
                    No slides available for this presentation.
                </p>
                <Button
                    onClick={onExit}
                    variant="outline"
                    className="border-slate-300 px-6 py-2 text-base hover:bg-slate-200"
                >
                    Return to Editor
                </Button>
            </div>
        );
    }

    return (
        <>
            {isLiveSession && liveSessionData && (
                <LiveSessionActionBar
                    inviteCode={liveSessionData.invite_code}
                    currentSlideIndex={currentRevealVisualIndex}
                    totalSlides={slides.length}
                    participantsCount={participantsCount}
                    onToggleParticipantsView={() => setIsParticipantsPanelOpen((prev) => !prev)}
                    isParticipantsPanelOpen={isParticipantsPanelOpen}
                    onToggleWhiteboard={() => setIsSessionWhiteboardOpen((prev) => !prev)}
                    isWhiteboardOpen={isSessionWhiteboardOpen}
                    onEndSession={handleEndSession}
                />
            )}

            <div
                ref={revealContainerRef}
                className="reveal" // Reveal.js root
                style={{
                    width: '100vw',
                    height: '100vh',
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    zIndex: 50, // Ensure it's below action bar and overlays
                    // backgroundColor: '#F0F2F5', // Default background for the reveal area
                }}
            >
                <div className="slides">
                    {' '}
                    {/* Reveal.js slides container */}
                    {slides.map((slide) => (
                        <section
                            key={slide.id}
                            // Reveal handles background color per slide if set, or use global theme
                            data-background-color={
                                slide.type === SlideTypeEnum.Quiz ||
                                slide.type === SlideTypeEnum.Feedback
                                    ? '#FFFFFF' // White for quiz/feedback slides
                                    : (slide as ExcalidrawSlideData).appState
                                          ?.viewBackgroundColor || '#F8F9FA' // Light neutral for Excalidraw
                            }
                            // Padding for content area to not be obscured by fixed action bar
                            style={{
                                paddingTop: actionBarHeight,
                                boxSizing: 'border-box',
                                height: '100vh',
                            }}
                        >
                            {/* Wrapper to control content sizing and centering within the padded section */}
                            <div
                                style={{
                                    width: '100%', // Full width of the padded section
                                    height: `calc(100% - ${isLiveSession ? '0px' : '0px'})`, // Full height, padding handled by section
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    boxSizing: 'border-box',
                                    // padding: '1rem 2rem', // Optional general padding around content
                                }}
                            >
                                {slide.type === SlideTypeEnum.Quiz ||
                                slide.type === SlideTypeEnum.Feedback ? (
                                    <div
                                        style={{
                                            width: 'clamp(320px, 70%, 800px)',
                                            maxHeight: '80vh', // Ensure it fits viewport
                                            backgroundColor: 'white',
                                            padding: '2rem 2.5rem',
                                            borderRadius: '12px',
                                            boxShadow: '0 10px 30px rgba(0,0,0,0.08)',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            overflowY: 'auto',
                                            scrollbarWidth: 'thin',
                                        }}
                                    >
                                        <QuizSlide
                                            formdata={
                                                (slide as QuizSlideData | FeedbackSlideData)
                                                    .elements as QuestionFormData
                                            }
                                            className={'flex flex-grow flex-col'} // quiz slide takes available space
                                            questionType={
                                                slide.type as
                                                    | SlideTypeEnum.Quiz
                                                    | SlideTypeEnum.Feedback
                                            }
                                            currentSlideId={slide.id}
                                            isPresentationMode={true} // Always true in PresentationView
                                        />
                                    </div>
                                ) : (
                                    // Excalidraw or other rich content types
                                    <div
                                        style={{
                                            width: '100%',
                                            height: '100%',
                                            display: 'flex',
                                            alignItems: 'stretch',
                                            justifyContent: 'stretch',
                                        }}
                                    >
                                        <SlideEditor
                                            editMode={false} // View mode for presentation
                                            slide={slide as ExcalidrawSlideData} // Pass Excalidraw specific data
                                            onSlideChange={() => {
                                                /* No changes in view mode */
                                            }}
                                            key={`${slide.id}-viewer`}
                                        />
                                    </div>
                                )}
                            </div>
                        </section>
                    ))}
                </div>
            </div>

            {/* Loading overlay for Reveal.js initialization */}
            {!isRevealInitialized && slides && slides.length > 0 && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center bg-white/70 backdrop-blur-sm">
                    <Loader2 className="size-10 animate-spin text-orange-500" />
                </div>
            )}

            {isLiveSession && liveSessionData && (
                <>
                    <ParticipantsSidePanel
                        sessionId={liveSessionData.session_id}
                        isOpen={isParticipantsPanelOpen}
                        onClose={() => setIsParticipantsPanelOpen(false)}
                        topOffset={actionBarHeight}
                    />
                    <SessionExcalidrawOverlay
                        sessionId={liveSessionData.session_id} // Assuming it needs session ID
                        isOpen={isSessionWhiteboardOpen}
                        onClose={() => setIsSessionWhiteboardOpen(false)}
                        // Pass other necessary props for SessionExcalidrawOverlay
                    />
                </>
            )}
        </>
    );
};
