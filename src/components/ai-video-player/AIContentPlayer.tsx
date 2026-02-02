/**
 * AI Content Player Component
 * Unified player supporting 12 content types with 3 navigation modes
 *
 * Content Types: VIDEO, QUIZ, STORYBOOK, INTERACTIVE_GAME, PUZZLE_BOOK,
 *                SIMULATION, FLASHCARDS, MAP_EXPLORATION, WORKSHEET,
 *                CODE_PLAYGROUND, TIMELINE, CONVERSATION
 *
 * Navigation Modes: time_driven, user_driven, self_contained
 */

import { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import {
    Play,
    Pause,
    RotateCcw,
    Maximize2,
    Minimize2,
    ChevronLeft,
    ChevronRight,
    Printer,
    Volume2,
} from 'lucide-react';
import {
    Entry,
    TimelineMeta,
    AIContentPlayerProps,
    CONTENT_TYPE_LABELS,
    formatEntryLabel,
    getDefaultMeta,
} from './types';
import { processHtmlContent } from './html-processor';
import { initializeLibraries } from './library-loader';
import '@/components/ai-course-builder/components/styles/AIVideoComponents.css';

/**
 * ScaleCalculator - Calculates scale to fit video in container
 */
class ScaleCalculator {
    private targetWidth: number;
    private targetHeight: number;

    constructor(targetWidth: number = 1920, targetHeight: number = 1080) {
        this.targetWidth = targetWidth;
        this.targetHeight = targetHeight;
    }

    calculateScale(containerWidth: number, containerHeight: number): number {
        const targetRatio = this.targetWidth / this.targetHeight;
        const containerRatio = containerWidth / containerHeight;

        if (containerRatio > targetRatio) {
            return containerHeight / this.targetHeight;
        }
        return containerWidth / this.targetWidth;
    }
}

/**
 * Format time in seconds to MM:SS
 */
const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
};

/**
 * Main AIContentPlayer Component
 */
export const AIContentPlayer: React.FC<AIContentPlayerProps> = ({
    timelineUrl,
    audioUrl,
    className = '',
    width = 1920,
    height = 1080,
    onEntryChange,
    onComplete,
}) => {
    // Core state
    const [entries, setEntries] = useState<Entry[]>([]);
    const [meta, setMeta] = useState<TimelineMeta>(getDefaultMeta('VIDEO'));
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [scale, setScale] = useState(1);
    const [isFullscreen, setIsFullscreen] = useState(false);

    // Time-driven state (for VIDEO)
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);

    // User-driven state (for QUIZ, STORYBOOK, etc.)
    const [currentIndex, setCurrentIndex] = useState(0);

    // Refs
    const audioRef = useRef<HTMLAudioElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const playerRef = useRef<HTMLDivElement>(null);
    const audioStartedRef = useRef(false);
    const animationFrameRef = useRef<number | null>(null);
    const playStartTimeRef = useRef(0);
    const introStartTimeRef = useRef(0);

    const scaleCalculator = useMemo(() => new ScaleCalculator(width, height), [width, height]);

    // Computed values
    const contentType = meta.content_type;
    const navigationMode = meta.navigation;

    // Load timeline data
    useEffect(() => {
        const loadTimeline = async () => {
            try {
                setIsLoading(true);
                setError(null);

                const response = await fetch(timelineUrl);
                if (!response.ok) {
                    throw new Error(`Failed to load timeline: ${response.status}`);
                }

                const rawData = await response.json();

                let loadedEntries: Entry[];
                let loadedMeta: TimelineMeta;

                // Parse structure
                if (Array.isArray(rawData)) {
                    // Old format: array of frames
                    loadedEntries = rawData;
                    loadedMeta = getDefaultMeta('VIDEO');
                } else if (rawData.entries && Array.isArray(rawData.entries)) {
                    // New format: { meta, entries }
                    loadedEntries = rawData.entries;
                    loadedMeta = {
                        ...getDefaultMeta(rawData.meta?.content_type || 'VIDEO'),
                        ...rawData.meta,
                    };
                } else {
                    throw new Error('Timeline data is in an unrecognized format');
                }

                if (loadedEntries.length === 0) {
                    throw new Error('Timeline data is empty');
                }

                // Initialize libraries for content type
                await initializeLibraries(loadedMeta.content_type);

                setMeta(loadedMeta);
                setEntries(loadedEntries);

                // Set duration
                if (loadedMeta.total_duration && loadedMeta.total_duration > 0) {
                    setDuration(loadedMeta.total_duration);
                }

                console.log(
                    `🎬 Loaded ${loadedMeta.content_type} with ${loadedEntries.length} entries`
                );
            } catch (err) {
                console.error('Error loading timeline:', err);
                setError(err instanceof Error ? err.message : 'Failed to load timeline');
            } finally {
                setIsLoading(false);
            }
        };

        if (timelineUrl) {
            loadTimeline();
        } else {
            setError('No timeline URL provided');
            setIsLoading(false);
        }
    }, [timelineUrl]);

    // Scale calculation
    useEffect(() => {
        const updateScale = () => {
            if (containerRef.current) {
                const { clientWidth, clientHeight } = containerRef.current;
                if (clientWidth > 0 && clientHeight > 0) {
                    const newScale = scaleCalculator.calculateScale(clientWidth, clientHeight);
                    setScale(newScale);
                }
            }
        };

        const rafId = requestAnimationFrame(() => {
            updateScale();
            setTimeout(updateScale, 100);
        });

        const observer = new ResizeObserver(updateScale);
        if (containerRef.current) {
            observer.observe(containerRef.current);
        }

        return () => {
            cancelAnimationFrame(rafId);
            observer.disconnect();
        };
    }, [scaleCalculator, entries.length, isFullscreen]);

    // =====================================================
    // TIME-DRIVEN NAVIGATION (VIDEO)
    // =====================================================

    const animateIntro = useCallback(() => {
        if (!isPlaying) return;

        const elapsed = (performance.now() - playStartTimeRef.current) / 1000;
        const newTime = introStartTimeRef.current + elapsed;

        if (newTime >= meta.audio_start_at && !audioStartedRef.current) {
            if (audioRef.current) {
                audioRef.current.currentTime = 0;
                audioRef.current.play().catch(console.error);
                audioStartedRef.current = true;
            }
            setCurrentTime(newTime);
        } else if (!audioStartedRef.current) {
            setCurrentTime(newTime);
            animationFrameRef.current = requestAnimationFrame(animateIntro);
        }
    }, [isPlaying, meta.audio_start_at]);

    const handleTimeDrivenPlayPause = useCallback(() => {
        if (isPlaying) {
            if (audioStartedRef.current && audioRef.current) {
                audioRef.current.pause();
            }
            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current);
                animationFrameRef.current = null;
            }
            setIsPlaying(false);
        } else {
            setIsPlaying(true);
            if (currentTime >= meta.audio_start_at) {
                if (audioRef.current) {
                    const audioTime = currentTime - meta.audio_start_at;
                    audioRef.current.currentTime = Math.max(0, audioTime);
                    audioRef.current.play().catch(console.error);
                    audioStartedRef.current = true;
                }
            } else {
                audioStartedRef.current = false;
                playStartTimeRef.current = performance.now();
                introStartTimeRef.current = currentTime;
                animationFrameRef.current = requestAnimationFrame(animateIntro);
            }
        }
    }, [isPlaying, currentTime, meta.audio_start_at, animateIntro]);

    const handleTimeUpdate = useCallback(() => {
        if (audioRef.current && audioStartedRef.current) {
            const time = audioRef.current.currentTime + meta.audio_start_at;
            setCurrentTime(time);
        }
    }, [meta.audio_start_at]);

    const handleLoadedMetadata = useCallback(() => {
        if (audioRef.current && (!meta.total_duration || meta.total_duration === 0)) {
            setDuration(audioRef.current.duration);
        }
    }, [meta.total_duration]);

    const handleAudioEnded = useCallback(() => {
        if (meta.total_duration && currentTime < meta.total_duration) {
            audioStartedRef.current = false;
            playStartTimeRef.current = performance.now();
            introStartTimeRef.current = currentTime;

            const animateOutro = () => {
                if (!isPlaying) return;

                const elapsed = (performance.now() - playStartTimeRef.current) / 1000;
                const newTime = introStartTimeRef.current + elapsed;

                if (newTime >= meta.total_duration!) {
                    setCurrentTime(meta.total_duration!);
                    setIsPlaying(false);
                    onComplete?.();
                } else {
                    setCurrentTime(newTime);
                    requestAnimationFrame(animateOutro);
                }
            };
            requestAnimationFrame(animateOutro);
        } else {
            setIsPlaying(false);
            onComplete?.();
        }
    }, [meta.total_duration, currentTime, isPlaying, onComplete]);

    const handleProgressClick = useCallback(
        (e: React.MouseEvent<HTMLDivElement>) => {
            if (duration === 0) return;

            const rect = e.currentTarget.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const newTime = (x / rect.width) * duration;

            setCurrentTime(newTime);

            if (newTime >= meta.audio_start_at) {
                const audioTime = newTime - meta.audio_start_at;
                if (audioRef.current) {
                    audioRef.current.currentTime = audioTime;
                    audioStartedRef.current = true;
                    if (isPlaying) {
                        audioRef.current.play().catch(console.error);
                    }
                }
                if (animationFrameRef.current) {
                    cancelAnimationFrame(animationFrameRef.current);
                    animationFrameRef.current = null;
                }
            } else {
                audioStartedRef.current = false;
                if (audioRef.current) {
                    audioRef.current.pause();
                    audioRef.current.currentTime = 0;
                }
                if (isPlaying) {
                    playStartTimeRef.current = performance.now();
                    introStartTimeRef.current = newTime;
                    animationFrameRef.current = requestAnimationFrame(animateIntro);
                }
            }
        },
        [duration, meta.audio_start_at, isPlaying, animateIntro]
    );

    // =====================================================
    // USER-DRIVEN NAVIGATION (QUIZ, STORYBOOK, etc.)
    // =====================================================

    const handleNext = useCallback(() => {
        if (currentIndex < entries.length - 1) {
            const newIndex = currentIndex + 1;
            setCurrentIndex(newIndex);
            onEntryChange?.(newIndex, entries[newIndex]!);
        } else {
            onComplete?.();
        }
    }, [currentIndex, entries, onEntryChange, onComplete]);

    const handlePrev = useCallback(() => {
        if (currentIndex > 0) {
            const newIndex = currentIndex - 1;
            setCurrentIndex(newIndex);
            onEntryChange?.(newIndex, entries[newIndex]!);
        }
    }, [currentIndex, entries, onEntryChange]);

    // =====================================================
    // COMMON HANDLERS
    // =====================================================

    const handleReset = useCallback(() => {
        if (navigationMode === 'time_driven') {
            if (audioRef.current) {
                audioRef.current.currentTime = 0;
                audioRef.current.pause();
            }
            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current);
                animationFrameRef.current = null;
            }
            audioStartedRef.current = false;
            setCurrentTime(0);
            setIsPlaying(false);
        } else {
            setCurrentIndex(0);
            if (entries[0]) {
                onEntryChange?.(0, entries[0]);
            }
        }
    }, [navigationMode, entries, onEntryChange]);

    const handleFullscreenToggle = useCallback(() => {
        if (!playerRef.current) return;

        if (!document.fullscreenElement) {
            playerRef.current.requestFullscreen().then(() => setIsFullscreen(true));
        } else {
            document.exitFullscreen().then(() => setIsFullscreen(false));
        }
    }, []);

    // Print handler for WORKSHEET
    const handlePrint = useCallback(() => {
        window.print();
    }, []);

    // Text-to-speech for CONVERSATION
    const handleSpeak = useCallback((text: string) => {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'en-US';
        speechSynthesis.speak(utterance);
    }, []);

    // Fullscreen change listener
    useEffect(() => {
        const handleFullscreenChange = () => {
            setIsFullscreen(!!document.fullscreenElement);
        };

        document.addEventListener('fullscreenchange', handleFullscreenChange);
        return () => {
            document.removeEventListener('fullscreenchange', handleFullscreenChange);
        };
    }, []);

    // Cleanup
    useEffect(() => {
        return () => {
            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current);
            }
        };
    }, []);

    // =====================================================
    // ACTIVE ENTRIES COMPUTATION
    // =====================================================

    const activeEntries = useMemo(() => {
        if (entries.length === 0) return [];

        if (navigationMode === 'time_driven') {
            // For VIDEO: find all entries active at current time
            const active = entries.filter((entry) => {
                const start = entry.inTime ?? entry.start ?? 0;
                const end = entry.exitTime ?? entry.end ?? Infinity;
                return currentTime >= start && currentTime < end;
            });

            active.sort((a, b) => (a.z ?? 0) - (b.z ?? 0));

            return active.map((entry) => ({
                ...entry,
                processedHtml: processHtmlContent(entry.html, contentType),
            }));
        } else if (navigationMode === 'user_driven') {
            // For QUIZ, STORYBOOK, etc.: show current entry
            const entry = entries[currentIndex];
            if (!entry) return [];

            return [
                {
                    ...entry,
                    processedHtml: processHtmlContent(entry.html, contentType),
                },
            ];
        } else {
            // For GAME, SIMULATION, CODE_PLAYGROUND: show first entry only
            const entry = entries[0];
            if (!entry) return [];

            return [
                {
                    ...entry,
                    processedHtml: processHtmlContent(entry.html, contentType),
                },
            ];
        }
    }, [entries, currentTime, currentIndex, navigationMode, contentType]);

    // =====================================================
    // RENDER
    // =====================================================

    // Loading state
    if (isLoading) {
        return (
            <div className={`ai-video-player ${className}`}>
                <div className="video-container">
                    <div className="loading-overlay">
                        <div className="loading-spinner">
                            <div className="spinner"></div>
                            <p>Loading content...</p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Error state
    if (error) {
        return (
            <div className={`ai-video-player ${className}`}>
                <div className="video-placeholder">
                    <div className="video-placeholder-content">
                        <p>Error Loading Content</p>
                        <p style={{ fontSize: '0.875rem', color: '#666' }}>{error}</p>
                    </div>
                </div>
            </div>
        );
    }

    // No entries
    if (entries.length === 0) {
        return (
            <div className={`ai-video-player ${className}`}>
                <div className="video-placeholder">
                    <div className="video-placeholder-content">
                        <p>No Content Available</p>
                    </div>
                </div>
            </div>
        );
    }

    const progressPercent =
        navigationMode === 'time_driven'
            ? duration > 0
                ? (currentTime / duration) * 100
                : 0
            : ((currentIndex + 1) / entries.length) * 100;

    return (
        <div
            ref={playerRef}
            className={`ai-video-player ${className} ${isFullscreen ? 'fullscreen' : ''}`}
            style={{
                width: '100%',
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: isFullscreen ? '#000' : 'transparent',
            }}
        >
            {/* Video Container */}
            <div
                className="video-container"
                style={{
                    width: '100%',
                    height: isFullscreen ? '100%' : 'auto',
                    maxWidth: '100%',
                    aspectRatio: isFullscreen ? 'auto' : '16/9',
                    maxHeight: '100%',
                    borderRadius: isFullscreen ? '0' : '8px',
                    overflow: 'hidden',
                    boxShadow: isFullscreen ? 'none' : '0 2px 8px rgba(0, 0, 0, 0.1)',
                    position: 'relative',
                }}
                onMouseEnter={(e) => {
                    const controls = e.currentTarget.querySelector(
                        '.video-controls-overlay'
                    ) as HTMLElement;
                    if (controls) controls.style.opacity = '1';
                }}
                onMouseLeave={(e) => {
                    const controls = e.currentTarget.querySelector(
                        '.video-controls-overlay'
                    ) as HTMLElement;
                    if (controls) controls.style.opacity = '0';
                }}
                onClick={navigationMode === 'time_driven' ? handleTimeDrivenPlayPause : undefined}
            >
                {/* Content Frame */}
                <div
                    ref={containerRef}
                    className="video-frame-container"
                    style={{
                        width: '100%',
                        height: '100%',
                        background: '#ffffff',
                        position: 'relative',
                        overflow: 'hidden',
                    }}
                >
                    {activeEntries.length > 0 ? (
                        <div
                            style={{
                                width: `${width}px`,
                                height: `${height}px`,
                                transform: `scale(${scale})`,
                                transformOrigin: 'center center',
                                position: 'absolute',
                                top: '50%',
                                left: '50%',
                                marginTop: `-${height / 2}px`,
                                marginLeft: `-${width / 2}px`,
                            }}
                            className="frame-wrapper"
                        >
                            {activeEntries.map((entry, index) => (
                                <iframe
                                    key={`entry-${entry.id}-${index}`}
                                    srcDoc={entry.processedHtml}
                                    style={{
                                        width: '100%',
                                        height: '100%',
                                        border: 'none',
                                        background: index === 0 ? '#ffffff' : 'transparent',
                                        position: 'absolute',
                                        top: 0,
                                        left: 0,
                                        zIndex: entry.z ?? 0,
                                        pointerEvents:
                                            entry.id?.startsWith('branding-watermark') ||
                                            navigationMode === 'time_driven'
                                                ? 'none'
                                                : 'auto',
                                    }}
                                    title={`Content Layer ${entry.id}`}
                                    sandbox="allow-scripts allow-same-origin"
                                />
                            ))}
                        </div>
                    ) : (
                        <div
                            style={{
                                position: 'absolute',
                                inset: 0,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: '#666',
                            }}
                        >
                            <p>No content available</p>
                        </div>
                    )}
                </div>

                {/* Center Play Button (only for time_driven and when paused) */}
                {navigationMode === 'time_driven' && !isPlaying && (
                    <div
                        style={{
                            position: 'absolute',
                            top: '50%',
                            left: '50%',
                            transform: 'translate(-50%, -50%)',
                            background: 'rgba(0, 0, 0, 0.7)',
                            borderRadius: '50%',
                            width: '80px',
                            height: '80px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            zIndex: 5,
                        }}
                        onClick={(e) => {
                            e.stopPropagation();
                            handleTimeDrivenPlayPause();
                        }}
                    >
                        <Play className="size-10 text-white" style={{ marginLeft: '4px' }} />
                    </div>
                )}

                {/* Controls Overlay */}
                <div
                    className="video-controls-overlay"
                    style={{
                        position: 'absolute',
                        top: isFullscreen ? 'auto' : 0,
                        bottom: isFullscreen ? 0 : 'auto',
                        left: 0,
                        right: 0,
                        background: isFullscreen
                            ? 'linear-gradient(transparent, rgba(0,0,0,0.8))'
                            : 'linear-gradient(rgba(0,0,0,0.8), transparent)',
                        padding: isFullscreen ? '40px 16px 16px 16px' : '16px 16px 40px 16px',
                        opacity: isFullscreen ? 1 : 0,
                        transition: 'opacity 0.3s ease',
                        zIndex: 10,
                    }}
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Progress Bar (only for time_driven) */}
                    {navigationMode === 'time_driven' && (
                        <div
                            className="video-progress"
                            onClick={handleProgressClick}
                            style={{
                                marginBottom: '12px',
                                cursor: 'pointer',
                                padding: '4px 0',
                            }}
                        >
                            <div
                                className="progress-bar"
                                style={{
                                    height: '5px',
                                    background: 'rgba(255, 255, 255, 0.3)',
                                    borderRadius: '3px',
                                    overflow: 'hidden',
                                }}
                            >
                                <div
                                    className="progress-fill"
                                    style={{
                                        width: `${progressPercent}%`,
                                        height: '100%',
                                        background: '#ef4444',
                                        borderRadius: '3px',
                                        transition: 'width 0.1s ease',
                                    }}
                                />
                            </div>
                        </div>
                    )}

                    {/* Controls */}
                    <div
                        className="playback-controls"
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '16px',
                        }}
                    >
                        {/* Time-driven controls */}
                        {navigationMode === 'time_driven' && (
                            <>
                                <button
                                    onClick={handleTimeDrivenPlayPause}
                                    style={btnStyle}
                                    aria-label={isPlaying ? 'Pause' : 'Play'}
                                >
                                    {isPlaying ? (
                                        <Pause className="size-6 text-white" />
                                    ) : (
                                        <Play className="size-6 text-white" />
                                    )}
                                </button>
                                <button onClick={handleReset} style={btnStyle} title="Restart">
                                    <RotateCcw className="size-5 text-white" />
                                </button>
                                <span style={timeStyle}>
                                    {formatTime(currentTime)} / {formatTime(duration)}
                                </span>
                            </>
                        )}

                        {/* User-driven controls */}
                        {navigationMode === 'user_driven' && (
                            <>
                                <button
                                    onClick={handlePrev}
                                    disabled={currentIndex === 0}
                                    style={{
                                        ...btnStyle,
                                        opacity: currentIndex === 0 ? 0.5 : 1,
                                    }}
                                    aria-label="Previous"
                                >
                                    <ChevronLeft className="size-6 text-white" />
                                </button>
                                <span style={timeStyle}>
                                    {formatEntryLabel(
                                        meta.entry_label,
                                        currentIndex,
                                        entries.length
                                    )}
                                </span>
                                <button
                                    onClick={handleNext}
                                    disabled={currentIndex === entries.length - 1}
                                    style={{
                                        ...btnStyle,
                                        opacity: currentIndex === entries.length - 1 ? 0.5 : 1,
                                    }}
                                    aria-label="Next"
                                >
                                    <ChevronRight className="size-6 text-white" />
                                </button>
                            </>
                        )}

                        {/* Content type badge */}
                        <span style={badgeStyle}>{CONTENT_TYPE_LABELS[contentType]}</span>

                        {/* Spacer */}
                        <div style={{ flex: 1 }} />

                        {/* WORKSHEET: Print button */}
                        {contentType === 'WORKSHEET' && (
                            <button onClick={handlePrint} style={btnStyle} title="Print Worksheet">
                                <Printer className="size-5 text-white" />
                            </button>
                        )}

                        {/* CONVERSATION: TTS button */}
                        {contentType === 'CONVERSATION' && (
                            <button
                                onClick={() => {
                                    const entry = entries[currentIndex];
                                    if (entry) {
                                        // Extract text from HTML (simple approach)
                                        const div = document.createElement('div');
                                        div.innerHTML = entry.html;
                                        const text = div.textContent || '';
                                        handleSpeak(text);
                                    }
                                }}
                                style={btnStyle}
                                title="Read Aloud"
                            >
                                <Volume2 className="size-5 text-white" />
                            </button>
                        )}

                        {/* Fullscreen button */}
                        <button
                            onClick={handleFullscreenToggle}
                            style={btnStyle}
                            title="Fullscreen"
                        >
                            {isFullscreen ? (
                                <Minimize2 className="size-5 text-white" />
                            ) : (
                                <Maximize2 className="size-5 text-white" />
                            )}
                        </button>
                    </div>
                </div>
            </div>

            {/* Audio Element (only for time_driven) */}
            {navigationMode === 'time_driven' && audioUrl && (
                <audio
                    ref={audioRef}
                    src={audioUrl}
                    onTimeUpdate={handleTimeUpdate}
                    onLoadedMetadata={handleLoadedMetadata}
                    onEnded={handleAudioEnded}
                    crossOrigin="anonymous"
                />
            )}
        </div>
    );
};

// Shared styles
const btnStyle: React.CSSProperties = {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: '4px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
};

const timeStyle: React.CSSProperties = {
    fontFamily: 'monospace',
    fontSize: '0.875rem',
    color: '#ffffff',
    fontWeight: 500,
};

const badgeStyle: React.CSSProperties = {
    fontSize: '0.75rem',
    color: 'rgba(255, 255, 255, 0.8)',
    background: 'rgba(255, 255, 255, 0.2)',
    padding: '4px 10px',
    borderRadius: '4px',
};

// Legacy export for backward compatibility
export { AIContentPlayer as AIVideoPlayer };
export default AIContentPlayer;
