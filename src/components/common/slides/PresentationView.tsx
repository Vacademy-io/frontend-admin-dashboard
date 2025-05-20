// PresentationView.tsx
/* eslint-disable */
// @ts-nocheck
'use client';

import React, { useEffect, useRef } from 'react';
import Reveal from 'reveal.js';
import 'reveal.js/dist/reveal.css';
import 'reveal.js/dist/theme/white.css';
import type { Slide } from './types'; // Ensure this path and type definition are correct
import { SlideType } from './constant/slideType';
import { QuizeSlide } from './slidesTypes/QuizSlides';
import { ExcalidrawViewer } from './ExcalidrawViewer';

interface PresentationViewProps {
    slides: Slide[];
    onExit: () => void;
}

export const PresentationView: React.FC<PresentationViewProps> = ({ slides, onExit }) => {
    console.log('[PresentationView] Component rendered. Props:', {
        slidesLength: slides?.length,
        slidesData: slides,
        onExit,
    });

    const revealContainerRef = useRef<HTMLDivElement>(null);
    const deckInstanceRef = useRef<Reveal.Api | null>(null);
    console.log('hello');
    console.log(slides);
    useEffect(() => {
        if (revealContainerRef.current && !deckInstanceRef.current && slides && slides.length > 0) {
            console.log('[PresentationView] Initializing Reveal.js...');
            const deck = new Reveal(revealContainerRef.current, {
                controls: true,
                progress: true,
                slideNumber: true,

                history: false,
                center: true,

                width: '100%',
                height: '100%',
                margin: 0,
                minScale: 0.2,
                display: true,
                maxScale: 1.5,
                embedded: true,
                keyboard: true, // Explicitly enable keyboard navigation
                // Optionally, you can set a default background transition
                backgroundTransition: 'fade', // 'fade', 'slide', 'convex', 'concave', 'zoom'
            });

            deck.initialize()
                .then(() => {
                    console.log('[PresentationView] Reveal.js initialized successfully.');
                    deckInstanceRef.current = deck;
                    // Ensure current slide is visible after initialization
                    deck.layout(); // Recalculate layout
                    deck.sync(); // Sync internal state
                    // deck.slide(deck.getIndices().h || 0, deck.getIndices().v || 0); // Optionally force re-evaluation of current slide
                    console.log(
                        '[PresentationView] Reveal.js layout and sync call after initialize. Current indices:',
                        deck.getIndices()
                    );

                    // Try to force z-index of controls
                    const controlsElement = revealContainerRef.current?.querySelector(
                        '.controls'
                    ) as HTMLElement;
                    if (controlsElement) {
                        console.log('[PresentationView] Forcing z-index on controls element.');
                        controlsElement.style.zIndex = '450'; // Or a higher value if needed
                    }
                })
                .catch((error) => {
                    console.error('[PresentationView] Reveal.js initialization failed:', error);
                });

            const handleKeyDown = (event: KeyboardEvent) => {
                if (event.key === 'Escape') {
                    onExit();
                }
            };
            window.addEventListener('keydown', handleKeyDown);

            return () => {
                console.log('[PresentationView] Cleaning up Reveal.js instance.');
                window.removeEventListener('keydown', handleKeyDown);
                const currentDeck = deckInstanceRef.current;
                if (currentDeck && typeof (currentDeck as any).destroy === 'function') {
                    try {
                        (currentDeck as any).destroy();
                        console.log('[PresentationView] Reveal.js instance destroyed.');
                    } catch (e) {
                        console.error('[PresentationView] Error destroying Reveal.js instance:', e);
                    }
                }
                deckInstanceRef.current = null;
            };
        } else if (deckInstanceRef.current && (!slides || slides.length === 0)) {
            console.log(
                '[PresentationView] No slides or slides removed, destroying existing Reveal.js instance.'
            );
            if (typeof (deckInstanceRef.current as any).destroy === 'function') {
                (deckInstanceRef.current as any).destroy();
            }
            deckInstanceRef.current = null;
        }
    }, [slides, onExit]); // Re-initialize if 'slides' array reference changes or onExit changes.

    // Effect for syncing/layouting when slides array content might change
    useEffect(() => {
        if (
            deckInstanceRef.current &&
            deckInstanceRef.current.isReady &&
            deckInstanceRef.current.isReady()
        ) {
            // Check isReady before sync/layout
            console.log('[PresentationView] Slides data changed, syncing/layouting Reveal.js.');
            deckInstanceRef.current.sync();
            deckInstanceRef.current.layout();
        }
    }, [slides]); // This effect depends on the 'slides' prop.

    if (!slides || slides.length === 0) {
        return (
            <div
                style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    zIndex: 1000,
                    backgroundColor: '#111',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                }}
            >
                <p>No slides to present.</p>
                <button
                    onClick={onExit}
                    style={{
                        marginTop: '20px',
                        padding: '10px 20px',
                        color: '#333',
                        backgroundColor: 'white',
                        border: 'none',
                        borderRadius: '5px',
                        cursor: 'pointer',
                    }}
                >
                    Exit Presentation Mode
                </button>
            </div>
        );
    }

    return (
        <div
            ref={revealContainerRef}
            className="reveal"
            style={{
                position: 'fixed',
                width: '100vw', // Correct: defines the full viewport width
                height: '100vh',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                zIndex: 50,
                backgroundColor: '#111',
            }}
        >
            <div className="slides">
                {slides.map((slide, index) => {
                    const slideIdForLog = slide.id;
                    const slideType = slide.type;
                    const elementsForSlide = slide.elements;
                    const appStateForSlide = slide.appState;
                    const filesForSlide = slide.files; // This is your raw files data for the slide

                    return (
                        <section
                            key={slideIdForLog}
                            data-background-color={
                                slideType === SlideType.Quiz || slideType === SlideType.Feedback
                                    ? '#FFFFFF' // Explicitly set white background for Quiz/Feedback sections
                                    : appStateForSlide?.viewBackgroundColor || '#FFFFFF' // Existing logic for other types
                            }
                        >
                            <div
                                style={{
                                    // This div centers the content within the section
                                    width: '100%',
                                    height: '100%',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                }}
                            >
                                {slideType === SlideType.Quiz ||
                                slideType === SlideType.Feedback ? (
                                    <div
                                        style={{
                                            width: '80%', // The "card" for the quiz
                                            height: '80%',
                                            backgroundColor: 'white', // Card background
                                            padding: '20px',
                                            borderRadius: '8px',
                                            overflowY: 'auto',
                                            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                                            display: 'flex', // Important: Use flex to allow QuizeSlide to grow
                                            flexDirection: 'column', // Stack content vertically
                                        }}
                                    >
                                        <QuizeSlide
                                            formdata={elementsForSlide}
                                            // Pass a className that helps QuizeSlide fill this container
                                            className={'flex flex-grow flex-col'} // `flex-grow` is key if QuizeSlide root should expand
                                            questionType={slideType}
                                            currentSlideId={slideIdForLog}
                                            isPresentationMode={true}
                                        />
                                    </div>
                                ) : (
                                    // Excalidraw rendering part - ensure its container is also 100% width/height
                                    <div
                                        style={{
                                            width: '100%',
                                            height: '100%',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            alignItems: 'stretch', // Stretch children (ExcalidrawViewer)
                                            justifyContent: 'stretch',
                                        }}
                                    >
                                        {(() => {
                                            // console.log(`[PresentationView] Preparing Excalidraw slide ID: ${slideIdForLog}`, "Type:", slideType);

                                            const finalElements = Array.isArray(elementsForSlide)
                                                ? elementsForSlide
                                                : [];
                                            // ... (warning for non-array elements)

                                            console.log('hello 7878');
                                            console.log(finalElements);

                                            const finalFiles = filesForSlide || {}; // Default to empty object if null/undefined
                                            // ... (warning for null/undefined files)

                                            // ... (appState logic remains the same)
                                            const baseAppState = appStateForSlide || {};
                                            let finalAppState = {
                                                /* ... */
                                            };
                                            // ... (problematicSlideId logic) ...
                                            // ... (collaborators correction) ...
                                            finalAppState.viewModeEnabled = true;
                                            finalAppState.zenModeEnabled = true;

                                            // Log what's being passed to ExcalidrawViewer
                                            if (
                                                slideType !== SlideType.Quiz &&
                                                slideType !== SlideType.Feedback
                                            ) {
                                                const imageElsInFinal = finalElements.filter(
                                                    (el) => el.type === 'image'
                                                );
                                                if (imageElsInFinal.length > 0) {
                                                    console.log(
                                                        `  Passing to ExcalidrawViewer - Image elements fileIds:`,
                                                        JSON.stringify(
                                                            imageElsInFinal.map(
                                                                (el) => (el as any).fileId
                                                            ),
                                                            null,
                                                            2
                                                        )
                                                    );
                                                }
                                                console.log(
                                                    `  Passing to ExcalidrawViewer - finalFiles keys:`,
                                                    Object.keys(finalFiles)
                                                );
                                                if (Object.keys(finalFiles).length > 0) {
                                                    const firstFileId = Object.keys(finalFiles)[0];
                                                    const firstFile = finalFiles[firstFileId];
                                                    console.log(
                                                        `  Passing to ExcalidrawViewer - Data for first file ('${firstFileId}'): mimeType=${firstFile?.mimeType}, dataURL exists?=${!!firstFile?.dataURL}, dataURL length=${firstFile?.dataURL?.length}`
                                                    );
                                                }
                                            }
                                            return (
                                                <ExcalidrawViewer
                                                    elements={finalElements} // finalElements already defaults to []
                                                    appState={finalAppState}
                                                    files={finalFiles} // finalFiles already defaults to {}
                                                />
                                            );
                                        })()}
                                    </div>
                                )}
                            </div>
                        </section>
                    );
                })}
            </div>
        </div>
    );
};
