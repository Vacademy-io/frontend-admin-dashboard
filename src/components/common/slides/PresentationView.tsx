/* eslint-disable */
// @ts-nocheck
'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import Reveal from 'reveal.js';
import 'reveal.js/dist/reveal.css';
import 'reveal.js/dist/theme/white.css';

import { SlideEditor } from './SlideEditor';
import { QuizSlide } from './slidesTypes/QuizSlides';
import authenticatedAxiosInstance from '@/lib/auth/axiosInstance';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Loader2, Wifi, WifiOff } from 'lucide-react';

import { LiveSessionActionBar } from './components/LiveSessionActionBar';
import { ParticipantsSidePanel } from './components/ParticipantsSidePanel';
import { SessionExcalidrawOverlay } from './components/SessionExcalidrawOverlay';

import type {
    Slide as AppSlide,
    ExcalidrawSlideData,
    QuizSlideData,
    FeedbackSlideData,
} from '././utils/types';

import type { QuestionFormData } from '@/components/common/slides/utils/types';
import { SlideTypeEnum } from '@/components/common/slides/utils/types';

const MOVE_SESSION_API_URL =
    'https://backend-stage.vacademy.io/community-service/engage/admin/move';
const FINISH_SESSION_API_URL =
    'https://backend-stage.vacademy.io/community-service/engage/admin/finish';
const ADMIN_SSE_URL_BASE = 'https://backend-stage.vacademy.io/community-service/engage/admin/'; // Used by PresentationView for its own stream

interface PresentationViewProps {
    slides: AppSlide[];
    onExit: () => void;
    liveSessionData?: { session_id: string; invite_code: string; [key: string]: any };
    initialSlideId?: string;
}

export const PresentationView: React.FC<PresentationViewProps> = ({
    slides,
    onExit,
    liveSessionData,
    initialSlideId,
}) => {
    const revealContainerRef = useRef<HTMLDivElement>(null);
    const deckInstanceRef = useRef<Reveal.Api | null>(null);
    const eventSourceRef = useRef<EventSource | null>(null);
    const isLiveSession = !!liveSessionData?.session_id;

    const [currentRevealVisualIndex, setCurrentRevealVisualIndex] = useState(0);
    // This 'participants' state is for PresentationView's direct needs, like count for ActionBar.
    // ParticipantsSidePanel fetches and manages its own detailed list.
    const [participantsForCount, setParticipantsForCount] = useState<any[]>([]);
    const [isParticipantsPanelOpen, setIsParticipantsPanelOpen] = useState(false);
    const [isSessionWhiteboardOpen, setIsSessionWhiteboardOpen] = useState(false);
    const [isRevealInitialized, setIsRevealInitialized] = useState(false);
    const [isFinishingSession, setIsFinishingSession] = useState(false);
    const [adminSseStatus, setAdminSseStatus] = useState<
        'connecting' | 'connected' | 'disconnected'
    >('connecting');
    const [receivedSlideIndexFromSSE, setReceivedSlideIndexFromSSE] = useState<number | null>(null);

    const debouncedMoveApiCall = useCallback(
        (() => {
            let timeoutId: NodeJS.Timeout;
            return async (sessionId: string, slideOrder: number, visualIndex: number) => {
                clearTimeout(timeoutId);
                timeoutId = setTimeout(async () => {
                    try {
                        await authenticatedAxiosInstance.post(MOVE_SESSION_API_URL, {
                            session_id: sessionId,
                            move_to: slideOrder,
                        });
                    } catch (error: any) {
                        console.error('Error moving slide in live session:', error);
                        // toast.error(
                        //     error.response?.data?.message || 'Failed to sync slide movement.'
                        // );
                    }
                }, 300);
            };
        })(),
        []
    );

    // Main Admin SSE (Presenter's stream for general session events)
    useEffect(() => {
        if (!isLiveSession || !liveSessionData?.session_id) {
            if (eventSourceRef.current) {
                eventSourceRef.current.close();
                eventSourceRef.current = null;
            }
            setAdminSseStatus('disconnected');
            setParticipantsForCount([]); // Clear count data
            return;
        }

        if (eventSourceRef.current) {
            console.log('[PresentationView] Admin SSE: Closing existing EventSource.');
            eventSourceRef.current.close();
        }

        const sseUrl = `${ADMIN_SSE_URL_BASE}${liveSessionData.session_id}`;
        const newEventSource = new EventSource(sseUrl, { withCredentials: true });
        eventSourceRef.current = newEventSource;
        setAdminSseStatus('connecting');
        console.log(`[PresentationView] Admin SSE: Attempting to connect to: ${sseUrl}`);

        newEventSource.onopen = () => {
            console.log('[PresentationView] Admin SSE: Connection established.');
            setAdminSseStatus('connected');
            // toast.info("Presenter live connection active.", { duration: 1500, id: "presenter-sse-status" });
        };

        newEventSource.onerror = (errorEvent: Event) => {
            console.error(
                '[PresentationView] Admin SSE: Error occurred with EventSource. Allowing browser to retry.',
                errorEvent
            );
            setAdminSseStatus('disconnected');
            // toast.error("Presenter live connection issue. Auto-retrying...", { duration: 2500, id: "presenter-sse-status" });
        };

        // Listener for 'participants' event on the main admin stream
        const directParticipantsListener = (event: MessageEvent) => {
            console.log(
                "[PresentationView] Main Admin SSE received 'participants' event data:",
                event.data
            );
            try {
                const data = JSON.parse(event.data);
                if (Array.isArray(data)) {
                    setParticipantsForCount(data); // Update PresentationView's participant count data
                }
            } catch (e) {
                console.warn(
                    "[PresentationView] Main Admin SSE: Error parsing 'participants' (direct) data:",
                    e
                );
            }
        };
        newEventSource.addEventListener('participants', directParticipantsListener);

        // Listener for 'participants_update' (if backend sends this specifically on this stream)
        const participantsUpdateListener = (event: MessageEvent) => {
            console.log(
                "[PresentationView] Main Admin SSE received 'participants_update' event data:",
                event.data
            );
            try {
                const data = JSON.parse(event.data);
                if (Array.isArray(data)) {
                    setParticipantsForCount(data);
                }
            } catch (e) {
                console.warn(
                    "[PresentationView] Main Admin SSE: Error parsing 'participants_update' data:",
                    e
                );
            }
        };
        newEventSource.addEventListener('participants_update', participantsUpdateListener);

        const sessionStateListener = (event: MessageEvent) => {
            try {
                const data = JSON.parse(event.data);
                console.log(
                    "[PresentationView] Main Admin SSE: 'session_state_presenter' received",
                    data
                );

                if (data.currentSlideIndex !== undefined && data.currentSlideIndex !== null) {
                    if (isRevealInitialized && deckInstanceRef.current) {
                        const currentDeckIndices = deckInstanceRef.current.getIndices();
                        if (currentDeckIndices.h !== data.currentSlideIndex) {
                            console.log(
                                `[PresentationView] Main Admin SSE: Syncing Reveal slide to index ${data.currentSlideIndex}`
                            );
                            deckInstanceRef.current.slide(
                                data.currentSlideIndex,
                                undefined,
                                undefined
                            );
                        }
                    } else {
                        console.warn(
                            `[PresentationView] Main Admin SSE: Received slide index ${data.currentSlideIndex}, but Reveal not ready. Storing.`
                        );
                        setReceivedSlideIndexFromSSE(data.currentSlideIndex);
                    }
                }
                if (data.participants && Array.isArray(data.participants)) {
                    setParticipantsForCount(data.participants); // Update from full state
                }
            } catch (e) {
                console.warn(
                    "[PresentationView] Main Admin SSE: Error parsing 'session_state_presenter' data:",
                    e
                );
            }
        };
        newEventSource.addEventListener('session_state_presenter', sessionStateListener);

        const heartbeatListener = (event: MessageEvent) => {
            /* console.log("[PresentationView] Admin SSE: Heartbeat received", event.data); */
        };
        newEventSource.addEventListener('presenter_heartbeat', heartbeatListener);
        newEventSource.addEventListener('heartbeat_presenter', heartbeatListener);
        newEventSource.addEventListener('heartbeat', heartbeatListener);

        return () => {
            if (newEventSource) {
                console.log(
                    '[PresentationView] Main Admin SSE: Cleaning up and closing EventSource.'
                );
                newEventSource.removeEventListener('participants', directParticipantsListener);
                newEventSource.removeEventListener(
                    'participants_update',
                    participantsUpdateListener
                );
                newEventSource.removeEventListener('session_state_presenter', sessionStateListener);
                newEventSource.removeEventListener('presenter_heartbeat', heartbeatListener);
                newEventSource.removeEventListener('heartbeat_presenter', heartbeatListener);
                newEventSource.removeEventListener('heartbeat', heartbeatListener);
                newEventSource.close();
                eventSourceRef.current = null;
            }
        };
    }, [isLiveSession, liveSessionData?.session_id]);

    // Reveal.js initialization
    useEffect(() => {
        if (revealContainerRef.current && slides && slides.length > 0 && !isRevealInitialized) {
            console.log('[PresentationView] Reveal: Initializing...');
            const deck = new Reveal(revealContainerRef.current, {
                controls: true,
                progress: true,
                history: false,
                center: true,
                width: '100%',
                height: '100%',
                margin: 0,
                minScale: 0.2,
                maxScale: 1.5,
                embedded: true,
                keyboard: true,
                touch: true,
                navigationMode: 'linear',
                slideNumber: isLiveSession ? 'c/t' : false,
            });

            let revealInitialH = 0;
            if (receivedSlideIndexFromSSE !== null) {
                revealInitialH = receivedSlideIndexFromSSE;
                console.log(
                    `[PresentationView] Reveal: Using stored SSE slide index for init: ${revealInitialH}`
                );
            } else if (initialSlideId) {
                const startIndex = slides.findIndex((s) => s.id === initialSlideId);
                if (startIndex !== -1) {
                    revealInitialH = startIndex;
                    console.log(
                        `[PresentationView] Reveal: Using initialSlideId prop for init: ${revealInitialH}`
                    );
                }
            } else if (slides.length > 0) {
                revealInitialH = 0;
                console.log(
                    `[PresentationView] Reveal: Defaulting to first slide for init: ${revealInitialH}`
                );
            }

            deck.initialize({ h: revealInitialH }).then(() => {
                deckInstanceRef.current = deck;
                setIsRevealInitialized(true);
                console.log(
                    '[PresentationView] Reveal: Initialized successfully at slide index:',
                    revealInitialH
                );
                const indices = deck.getIndices();
                setCurrentRevealVisualIndex(indices.h || 0);

                deck.on('slidechanged', (event: any) => {
                    const visualIndex = event.indexh;
                    console.log(
                        '[PresentationView] Reveal: Slide changed to visual index:',
                        visualIndex
                    );
                    setCurrentRevealVisualIndex(visualIndex);

                    if (isLiveSession && liveSessionData) {
                        const currentSlideData = slides[visualIndex];
                        if (currentSlideData && typeof currentSlideData.slide_order === 'number') {
                            debouncedMoveApiCall(
                                liveSessionData.session_id,
                                currentSlideData.slide_order,
                                visualIndex
                            );
                        } else if (currentSlideData) {
                            // Slide exists but slide_order is missing/invalid
                            console.warn(
                                `[PresentationView] Reveal: slide_order missing or invalid for slide at index ${visualIndex}. Using visualIndex as fallback for move API.`
                            );
                            debouncedMoveApiCall(
                                liveSessionData.session_id,
                                visualIndex, // Fallback to visualIndex for slide_order
                                visualIndex
                            );
                        } else {
                            // currentSlideData is undefined/null
                            console.error(
                                `[PresentationView] Reveal: Slide data not found for visual index ${visualIndex}. Cannot sync slide movement.`
                            );
                            toast.error('Slide data missing for live sync.');
                        }
                    }
                });
            });

            const handleGlobalKeyDown = (event: KeyboardEvent) => {
                if (event.key === 'Escape') {
                    if (isSessionWhiteboardOpen) setIsSessionWhiteboardOpen(false);
                    else if (isParticipantsPanelOpen) setIsParticipantsPanelOpen(false);
                    else onExit();
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
                        console.log('[PresentationView] Reveal: Instance destroyed.');
                    } catch (e) {
                        /* console.error("[PresentationView] Reveal: Error destroying instance:", e); */
                    }
                }
                deckInstanceRef.current = null;
                setIsRevealInitialized(false);
            };
        }
    }, [slides, onExit, isLiveSession, liveSessionData, initialSlideId, debouncedMoveApiCall]);

    useEffect(() => {
        if (isRevealInitialized && deckInstanceRef.current && receivedSlideIndexFromSSE !== null) {
            const currentDeckIndices = deckInstanceRef.current.getIndices();
            if (currentDeckIndices.h !== receivedSlideIndexFromSSE) {
                console.log(
                    `[PresentationView] Syncing Reveal to stored SSE slide index post-init: ${receivedSlideIndexFromSSE}`
                );
                deckInstanceRef.current.slide(receivedSlideIndexFromSSE, undefined, undefined);
            }
            setReceivedSlideIndexFromSSE(null);
        }
    }, [isRevealInitialized, receivedSlideIndexFromSSE]);

    const handleEndSession = async () => {
        // ... (handleEndSession remains the same)
        if (!isLiveSession || !liveSessionData?.session_id) return;
        setIsFinishingSession(true);
        toast.promise(
            authenticatedAxiosInstance.post(FINISH_SESSION_API_URL, {
                session_id: liveSessionData.session_id,
            }),
            {
                loading: 'Ending session...',
                success: (response) => {
                    setIsFinishingSession(false);
                    if (eventSourceRef.current) {
                        eventSourceRef.current.close();
                        eventSourceRef.current = null;
                    }
                    onExit();
                    return response.data?.message || 'Session ended successfully!';
                },
                error: (error) => {
                    setIsFinishingSession(false);
                    console.error('Error ending session:', error);
                    return error.response?.data?.message || 'Failed to end session.';
                },
            }
        );
    };

    const actionBarHeight = isLiveSession ? '3.5rem' : '0px';

    if (!slides || slides.length === 0) {
        // ... (no slides view remains same)
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
                    participantsCount={participantsForCount.length} // Use participantsForCount
                    onToggleParticipantsView={() => setIsParticipantsPanelOpen((prev) => !prev)}
                    isParticipantsPanelOpen={isParticipantsPanelOpen}
                    onToggleWhiteboard={() => setIsSessionWhiteboardOpen((prev) => !prev)}
                    isWhiteboardOpen={isSessionWhiteboardOpen}
                    onEndSession={handleEndSession}
                    isEndingSession={isFinishingSession}
                    sseStatus={adminSseStatus}
                />
            )}

            <div
                ref={revealContainerRef}
                className="reveal"
                style={{
                    width: '100vw',
                    height: '100vh',
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    zIndex: 50,
                }}
            >
                <div className="slides">
                    {/* ... (slide mapping remains same) ... */}
                    {slides.map((slide) => (
                        <section
                            key={slide.id}
                            data-background-color={
                                slide.type === SlideTypeEnum.Quiz ||
                                slide.type === SlideTypeEnum.Feedback
                                    ? '#FFFFFF'
                                    : (slide as ExcalidrawSlideData).appState
                                          ?.viewBackgroundColor || '#F8F9FA'
                            }
                            style={{
                                paddingTop: actionBarHeight,
                                boxSizing: 'border-box',
                                height: '100vh',
                            }}
                        >
                            <div
                                style={{
                                    width: '100%',
                                    height: `calc(100% - ${isLiveSession ? '0px' : '0px'})`,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    boxSizing: 'border-box',
                                }}
                            >
                                {slide.type === SlideTypeEnum.Quiz ||
                                slide.type === SlideTypeEnum.Feedback ? (
                                    <div
                                        style={{
                                            width: 'clamp(320px, 70%, 800px)',
                                            maxHeight: '80vh',
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
                                            className={'flex flex-grow flex-col'}
                                            questionType={
                                                slide.type as
                                                    | SlideTypeEnum.Quiz
                                                    | SlideTypeEnum.Feedback
                                            }
                                            currentSlideId={slide.id}
                                            isPresentationMode={true}
                                        />
                                    </div>
                                ) : (
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
                                            editMode={false}
                                            slide={slide as ExcalidrawSlideData}
                                            onSlideChange={() => {}}
                                            key={`${slide.id}-viewer`}
                                        />
                                    </div>
                                )}
                            </div>
                        </section>
                    ))}
                </div>
            </div>

            {!isRevealInitialized && slides && slides.length > 0 && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center bg-white/70 backdrop-blur-sm">
                    <Loader2 className="size-10 animate-spin text-orange-500" />
                    <p className="ml-3 text-slate-700">Loading presentation...</p>
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
                        sessionId={liveSessionData.session_id}
                        isOpen={isSessionWhiteboardOpen}
                        onClose={() => setIsSessionWhiteboardOpen(false)}
                    />
                </>
            )}
        </>
    );
};
