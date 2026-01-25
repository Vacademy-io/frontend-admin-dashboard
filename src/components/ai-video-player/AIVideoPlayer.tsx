import { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { Play, Pause, RotateCcw, Maximize2, Minimize2 } from 'lucide-react';
import '@/components/ai-course-builder/components/styles/AIVideoComponents.css';

/**
 * Frame interface matching the time_based_frame.json structure
 */
export interface Frame {
    inTime: number;
    exitTime: number;
    html: string;
    id: string;
    z: number;
    htmlStartX: number;
    htmlStartY: number;
    htmlEndX: number;
    htmlEndY: number;
}

/**
 * Props for AIVideoPlayer component
 */
export interface AIVideoPlayerProps {
    timelineUrl: string;
    audioUrl: string;
    className?: string;
    width?: number;
    height?: number;
}

/**
 * HTML Content Processor
 * Responsible for processing and fixing HTML content
 * Single Responsibility: HTML processing only
 */
class HtmlContentProcessor {
    /**
     * Fixes HTML content by injecting required libraries and fixing image paths
     */
    static fixHtmlContent(html: string): string {
        const libs = `
        <script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js"></script>
        <script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/MotionPathPlugin.min.js"></script>
        <script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/MorphSVGPlugin.min.js"></script>
        <script>
            // Fallback for MorphSVGPlugin to prevent ReferenceErrors if CDN fails (premium plugin)
            if (typeof window.MorphSVGPlugin === 'undefined') {
                window.MorphSVGPlugin = { version: '3.12.5', name: 'MorphSVGPlugin', default: {} };
            }
        </script>
        <script src="https://cdn.jsdelivr.net/npm/mermaid@10/dist/mermaid.min.js"></script>

        <!-- Rough Notation for Hand-drawn Annotations -->
        <script src="https://unpkg.com/rough-notation/lib/rough-notation.iife.js"></script>

        <!-- Vivus.js for SVG Path Animations -->
        <script src="https://cdn.jsdelivr.net/npm/vivus@0.4.6/dist/vivus.min.js"></script>

        <!-- KaTeX for Math Equations -->
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.css">
        <script src="https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.js"></script>
        <script src="https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/contrib/auto-render.min.js"></script>

        <!-- Prism.js for Syntax Highlighting -->
        <link href="https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/themes/prism-tomorrow.min.css" rel="stylesheet" />
        <script src="https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/prism.min.js"></script>
        <script src="https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/plugins/autoloader/prism-autoloader.min.js"></script>

        <style>
            /* Visual cues for interactive elements */
            .hover-target:hover {
                outline: 2px dashed #3b82f6;
                cursor: grab;
            }
            .is-dragging {
                outline: 2px solid #3b82f6;
                cursor: grabbing;
                user-select: none;
            }
            [contenteditable="true"] {
                outline: 2px solid #22c55e;
                cursor: text;
                min-width: 10px;
            }

            /* Key Takeaway Card */
            .key-takeaway {
              display: flex;
              align-items: center;
              gap: 20px;
              padding: 24px 32px;
              border-left: 5px solid #10b981;
              background: rgba(16, 185, 129, 0.1);
              margin: 20px 0;
            }
            .takeaway-icon { font-size: 48px; }
            .takeaway-label {
              font-size: 14px;
              text-transform: uppercase;
              letter-spacing: 0.1em;
              color: #10b981;
              font-weight: 700;
            }
            .takeaway-text {
              font-size: 28px;
              margin-top: 8px;
              font-weight: 600;
            }

            /* Wrong vs Right Pattern */
            .wrong-right-container {
              display: flex;
              gap: 40px;
              width: 100%;
            }
            .wrong-box, .right-box {
              flex: 1;
              padding: 24px;
              border-radius: 12px;
            }
            .wrong-box {
              border: 3px solid #ef4444;
              background: rgba(239, 68, 68, 0.1);
            }
            .right-box {
              border: 3px solid #10b981;
              background: rgba(16, 185, 129, 0.1);
            }
            .wr-header {
              font-size: 18px;
              font-weight: 700;
              margin-bottom: 12px;
            }
            .wrong-box .wr-header { color: #ef4444; }
            .right-box .wr-header { color: #10b981; }
            .wr-icon { font-size: 24px; margin-right: 8px; }
            .wr-text { font-size: 24px; }
        </style>
        <script>
            // ========== AI VIDEO HELPER FUNCTIONS ==========

            // Re-render Math using KaTeX
            window.renderMath = function(selector) {
                if (window.renderMathInElement && window.katex) {
                     const el = selector ? (typeof selector === 'string' ? document.querySelector(selector) : selector) : document.body;
                     if(el) {
                         try {
                             renderMathInElement(el, {
                                delimiters: [
                                    {left: '$$', right: '$$', display: true},
                                    {left: '$', right: '$', display: false},
                                    {left: '\\(', right: '\\)', display: false},
                                    {left: '\\[', right: '\\]', display: true}
                                ],
                                throwOnError : false
                            });
                         } catch (e) {
                             console.warn('KaTeX render error:', e);
                         }
                     }
                }
            };

            // Highlight Code using Prism
            window.highlightCode = function() {
                if (window.Prism) {
                    Prism.highlightAll();
                }
            };

            // SVG drawing animation
            window.animateSVG = function(svgId, duration, callback) {
              if (window.Vivus) {
                var cb = typeof callback === 'function' ? callback : undefined;
                try {
                    // Check if svgId is a selector string that isn't an ID, and if so, handle it to avoid Vivus constructor error if it expects ID or element
                    // The user requested simpler version matches: new Vivus(svgId, { ... }, cb);
                    // However, we must ensure 'svgId' is valid for Vivus (ID string or Element).
                    // Vivus constructor: new Vivus('my-svg-id', ...) OR new Vivus(document.getElementById('...'), ...)

                    let target = svgId;
                    if (typeof svgId === 'string' && !svgId.startsWith('#') && !document.getElementById(svgId)) {
                        // If it's a string but not an ID ref, maybe it's a query selector?
                        // User request: window.animateSVG = function(svgId, duration, callback) { ... new Vivus(svgId ... }
                        // I will implement exactly as requested but wrap in try-catch for safety
                        new Vivus(svgId, {
                          duration: duration || 100,
                          type: 'oneByOne',
                          animTimingFunction: Vivus.EASE_OUT
                        }, cb);
                    } else {
                         new Vivus(svgId, {
                          duration: duration || 100,
                          type: 'oneByOne',
                          animTimingFunction: Vivus.EASE_OUT
                        }, cb);
                    }
                } catch(e) { console.warn('Vivus init error', e); }
              }
            };

            // Hand-drawn annotation (underline, circle, highlight, box)
            window.annotate = function(selectorOrEl, options) {
              if (window.RoughNotation) {
                const el = typeof selectorOrEl === 'string' ? document.querySelector(selectorOrEl) : selectorOrEl;
                if (el) {
                  const annotation = RoughNotation.annotate(el, {
                    type: options.type || 'underline',
                    color: options.color || '#dc2626',
                    strokeWidth: options.strokeWidth || 3,
                    padding: options.padding || 5,
                    animationDuration: options.duration || 800
                  });
                  annotation.show();
                  return annotation;
                }
              }
              return null;
            };

            // Simple fade in
            window.fadeIn = function(selector, duration, delay) {
              try {
                  gsap.fromTo(selector,
                    {opacity: 0},
                    {opacity: 1, duration: duration || 0.5, delay: delay || 0, ease: 'power2.out'}
                  );
              } catch (e) { console.warn('fadeIn error', e); }
            };

            // Typewriter effect
            window.typewriter = function(selectorOrEl, duration, delay) {
              const el = typeof selectorOrEl === 'string' ? document.querySelector(selectorOrEl) : selectorOrEl;
              if (!el) return;
              const text = el.textContent;
              el.textContent = '';
              el.style.opacity = '1';
              let i = 0;
              const speed = (duration || 1) * 1000 / text.length;
              setTimeout(() => {
                const interval = setInterval(() => {
                  if (i < text.length) {
                    el.textContent += text.charAt(i);
                    i++;
                  } else {
                    clearInterval(interval);
                  }
                }, speed);
              }, (delay || 0) * 1000);
            };

            // Pop in with scale
            window.popIn = function(selector, duration, delay) {
              try {
                  gsap.fromTo(selector,
                    {opacity: 0, scale: 0.85},
                    {opacity: 1, scale: 1, duration: duration || 0.4, delay: delay || 0, ease: 'back.out(1.7)'}
                  );
              } catch (e) { console.warn('popIn error', e); }
            };

            // Slide up from below
            window.slideUp = function(selector, duration, delay) {
              try {
                  gsap.fromTo(selector,
                    {opacity: 0, y: 30},
                    {opacity: 1, y: 0, duration: duration || 0.5, delay: delay || 0, ease: 'power2.out'}
                  );
              } catch (e) { console.warn('slideUp error', e); }
            };

            // Reveal lines with stagger
            window.revealLines = function(selectorOrEl, staggerDelay) {
              const el = typeof selectorOrEl === 'string' ? document.querySelector(selectorOrEl) : selectorOrEl;
              if (!el) return;
              const lines = el.querySelectorAll('.line');
              if (lines.length === 0) {
                window.fadeIn(el, 0.5);
                return;
              }
              gsap.fromTo(lines,
                {opacity: 0, y: 20},
                {opacity: 1, y: 0, duration: 0.4, stagger: staggerDelay || 0.3, ease: 'power2.out'}
              );
            };

            // Show text then annotate a key term
            window.showThenAnnotate = function(textSelector, termSelector, annotationType, annotationColor, textDelay, annotationDelay) {
              window.fadeIn(textSelector, 0.5, textDelay || 0);
              setTimeout(() => {
                window.annotate(termSelector, {
                  type: annotationType || 'underline',
                  color: annotationColor || '#dc2626',
                  duration: 600
                });
              }, ((textDelay || 0) + (annotationDelay || 0.8)) * 1000);
            };

            // Sound effects (optional)
            window.sounds = {
              pop: 'https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3',
              click: 'https://assets.mixkit.co/active_storage/sfx/2571/2571-preview.mp3',
              whoosh: 'https://assets.mixkit.co/active_storage/sfx/209/209-preview.mp3',
              success: 'https://assets.mixkit.co/active_storage/sfx/1435/1435-preview.mp3'
            };

            // Play sound effect
            window.playSound = function(soundName) {
              if (window.sounds && window.sounds[soundName]) {
                const audio = new Audio(window.sounds[soundName]);
                audio.volume = 0.5;
                audio.play().catch(e => console.log('Sound play failed:', e));
              }
            };

            // Render Mermaid
            window.renderMermaid = function(selector) {
                if (window.mermaid) {
                    try {
                        mermaid.init(undefined, selector ? document.querySelectorAll(selector) : document.querySelectorAll('.mermaid'));
                    } catch (e) {
                        console.error('Mermaid render error:', e);
                    }
                }
            };

            window.addEventListener('load', () => {
                // Initialize Libraries
                if(window.gsap) {
                   if(window.MotionPathPlugin) gsap.registerPlugin(MotionPathPlugin);
                   if(window.MorphSVGPlugin && typeof window.MorphSVGPlugin.version === 'string') {
                       // Only register if it looks like a real plugin (or our mock if safe)
                       // If it's the mock, registering it might fail if GSAP expects specific structure.
                       // Actually, registerPlugin simply adds it.
                       try { gsap.registerPlugin(MorphSVGPlugin); } catch(e) { console.warn('MorphSVG registration failed', e); }
                   }
                }

                // Shim RoughNotation.annotateAll if missing
                if (window.RoughNotation && !window.RoughNotation.annotateAll) {
                    window.RoughNotation.annotateAll = function(annotations) {
                        if (Array.isArray(annotations) && window.RoughNotation.annotationGroup) {
                             const group = window.RoughNotation.annotationGroup(annotations);
                             group.show();
                        } else if (Array.isArray(annotations)) {
                             annotations.forEach(a => a.show && a.show());
                        }
                    };
                }

                if(window.mermaid) mermaid.initialize({startOnLoad:true});
                if(window.renderMathInElement && window.katex) window.renderMath();
                if(window.Prism) window.highlightCode();
            });
        </script>
    `;

        // Fix any absolute file paths in the HTML
        // This handles cases where HTML might reference local file paths
        const fixedPathHtml = html.replace(/file:\/\/\/.*\/generated_images\//g, '');

        return libs + fixedPathHtml;
    }
}

/**
 * Frame Manager
 * Responsible for managing frame data and finding current frame
 * Single Responsibility: Frame management only
 */
class FrameManager {
    private frames: Frame[];

    constructor(frames: Frame[]) {
        this.frames = frames;
    }

    /**
     * Find the current frame index based on time
     */
    findCurrentFrameIndex(currentTime: number): number {
        const index = this.frames.findIndex(
            (f) => currentTime >= f.inTime && currentTime < f.exitTime
        );
        return index !== -1 ? index : 0;
    }

    /**
     * Get frame by index
     */
    getFrame(index: number): Frame | undefined {
        return this.frames[index];
    }

    /**
     * Get all frames
     */
    getAllFrames(): Frame[] {
        return this.frames;
    }
}

/**
 * Scale Calculator
 * Responsible for calculating scale to fit video in container
 * Single Responsibility: Scale calculation only
 */
class ScaleCalculator {
    private targetWidth: number;
    private targetHeight: number;

    constructor(targetWidth: number = 1920, targetHeight: number = 1080) {
        this.targetWidth = targetWidth;
        this.targetHeight = targetHeight;
    }

    /**
     * Calculate scale to fit target dimensions into container
     * @param containerWidth - Width of the container
     * @param containerHeight - Height of the container
     * @param mode - 'contain' (fit within container) or 'cover' (fill container, may clip)
     */
    calculateScale(
        containerWidth: number,
        containerHeight: number,
        mode: 'contain' | 'cover' = 'contain'
    ): number {
        const targetRatio = this.targetWidth / this.targetHeight;
        const containerRatio = containerWidth / containerHeight;

        let newScale: number;

        if (mode === 'cover') {
            // Cover mode: fill container, content may be clipped
            if (containerRatio > targetRatio) {
                // Container is wider than target; scale by width (clip height)
                newScale = containerWidth / this.targetWidth;
            } else {
                // Container is taller than target; scale by height (clip width)
                newScale = containerHeight / this.targetHeight;
            }
        } else {
            // Contain mode: fit entirely within container
            if (containerRatio > targetRatio) {
                // Container is wider than target; constrain by height
                newScale = containerHeight / this.targetHeight;
            } else {
                // Container is taller than target; constrain by width
                newScale = containerWidth / this.targetWidth;
            }
        }

        return newScale;
    }
}

/**
 * Format time in seconds to MM:SS format
 */
const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
};

/**
 * Main AIVideoPlayer Component
 * Orchestrates all the pieces together
 * Similar experience to YouTube player with white background
 */
export const AIVideoPlayer: React.FC<AIVideoPlayerProps> = ({
    timelineUrl,
    audioUrl,
    className = '',
    width = 1920,
    height = 1080,
}) => {
    const [frames, setFrames] = useState<Frame[]>([]);
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [currentFrameIndex, setCurrentFrameIndex] = useState(0);
    const [duration, setDuration] = useState(0);
    const [scale, setScale] = useState(1);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isFullscreen, setIsFullscreen] = useState(false);

    const audioRef = useRef<HTMLAudioElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const playerRef = useRef<HTMLDivElement>(null);

    // Initialize frame manager and scale calculator
    const frameManager = useMemo(() => new FrameManager(frames), [frames]);
    const scaleCalculator = useMemo(() => new ScaleCalculator(width, height), [width, height]);

    // Load timeline data
    useEffect(() => {
        const loadTimeline = async () => {
            try {
                setIsLoading(true);
                setError(null);
                console.log('🎬 AIVideoPlayer: Loading timeline from URL:', timelineUrl);

                const response = await fetch(timelineUrl);
                console.log(
                    '🎬 AIVideoPlayer: Timeline response status:',
                    response.status,
                    response.statusText
                );

                if (!response.ok) {
                    throw new Error(
                        `Failed to load timeline: ${response.status} ${response.statusText}`
                    );
                }

                const data: Frame[] = await response.json();
                console.log('🎬 AIVideoPlayer: Timeline data loaded:', {
                    frameCount: data.length,
                    firstFrame: data[0]
                        ? {
                              id: data[0].id,
                              inTime: data[0].inTime,
                              exitTime: data[0].exitTime,
                              hasHtml: !!data[0].html,
                          }
                        : null,
                    sampleHtml: data[0]?.html?.substring(0, 100) || 'No HTML',
                });

                if (!Array.isArray(data) || data.length === 0) {
                    throw new Error('Timeline data is empty or invalid format');
                }

                setFrames(data);
            } catch (err) {
                console.error('❌ AIVideoPlayer: Error loading timeline:', err);
                console.error('❌ AIVideoPlayer: Timeline URL was:', timelineUrl);
                setError(err instanceof Error ? err.message : 'Failed to load timeline');
            } finally {
                setIsLoading(false);
            }
        };

        if (timelineUrl) {
            loadTimeline();
        } else {
            console.warn('⚠️ AIVideoPlayer: No timelineUrl provided');
            setError('No timeline URL provided');
            setIsLoading(false);
        }
    }, [timelineUrl]);

    // Sync current frame based on time
    useEffect(() => {
        if (frames.length === 0) return;

        const index = frameManager.findCurrentFrameIndex(currentTime);
        if (index !== currentFrameIndex) {
            console.log(
                `🎬 AIVideoPlayer: Frame changed from ${currentFrameIndex} to ${index} at time ${currentTime.toFixed(2)}s`
            );
            setCurrentFrameIndex(index);
        }
    }, [currentTime, frames, currentFrameIndex, frameManager]);

    // Initialize to first frame when frames are loaded
    useEffect(() => {
        if (frames.length > 0 && currentFrameIndex === 0 && currentTime === 0) {
            console.log('🎬 AIVideoPlayer: Initializing to first frame');
            const firstFrame = frames[0];
            if (firstFrame) {
                setCurrentFrameIndex(0);
            }
        }
    }, [frames, currentFrameIndex, currentTime]);

    // Calculate scale to fit video into container
    useEffect(() => {
        const updateScale = () => {
            if (containerRef.current) {
                const { clientWidth, clientHeight } = containerRef.current;
                if (clientWidth > 0 && clientHeight > 0) {
                    // Always use 'contain' mode to ensure full video is visible
                    const newScale = scaleCalculator.calculateScale(
                        clientWidth,
                        clientHeight,
                        'contain'
                    );
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
    }, [scaleCalculator, frames.length, isFullscreen]);

    // Audio event handlers
    const handleTimeUpdate = () => {
        if (audioRef.current) {
            setCurrentTime(audioRef.current.currentTime);
        }
    };

    const handleLoadedMetadata = () => {
        if (audioRef.current) {
            setDuration(audioRef.current.duration);
        }
    };

    const handlePlayPause = () => {
        if (audioRef.current) {
            if (isPlaying) {
                audioRef.current.pause();
            } else {
                audioRef.current.play();
            }
            setIsPlaying(!isPlaying);
        }
    };

    const handleReset = () => {
        if (audioRef.current) {
            audioRef.current.currentTime = 0;
            setCurrentTime(0);
        }
    };

    const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (duration === 0) return;

        const rect = e.currentTarget.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const progressWidth = rect.width;
        const newTime = (x / progressWidth) * duration;

        if (audioRef.current) {
            audioRef.current.currentTime = newTime;
            setCurrentTime(newTime);
        }
    };

    // Fullscreen toggle function
    const handleFullscreenToggle = useCallback(() => {
        if (!playerRef.current) return;

        if (!document.fullscreenElement) {
            // Enter fullscreen
            playerRef.current
                .requestFullscreen()
                .then(() => {
                    setIsFullscreen(true);
                })
                .catch((err) => {
                    console.error('Error entering fullscreen:', err);
                });
        } else {
            // Exit fullscreen
            document
                .exitFullscreen()
                .then(() => {
                    setIsFullscreen(false);
                })
                .catch((err) => {
                    console.error('Error exiting fullscreen:', err);
                });
        }
    }, []);

    // Listen for fullscreen changes (e.g., user presses Escape)
    useEffect(() => {
        const handleFullscreenChange = () => {
            setIsFullscreen(!!document.fullscreenElement);
        };

        document.addEventListener('fullscreenchange', handleFullscreenChange);
        return () => {
            document.removeEventListener('fullscreenchange', handleFullscreenChange);
        };
    }, []);

    // Get current HTML to render
    const currentHtml = useMemo(() => {
        if (frames.length === 0) {
            console.log('⚠️ AIVideoPlayer: No frames available for rendering');
            return '';
        }

        const validIndex = Math.max(0, Math.min(currentFrameIndex, frames.length - 1));
        const frame = frames[validIndex];

        if (!frame) {
            console.log(
                `⚠️ AIVideoPlayer: Frame at index ${validIndex} not found, using first frame`
            );
            const firstFrame = frames[0];
            if (firstFrame && firstFrame.html) {
                const html = HtmlContentProcessor.fixHtmlContent(firstFrame.html);
                console.log(`🎬 AIVideoPlayer: Using first frame, HTML length: ${html.length}`);
                return html;
            }
            return '';
        }

        if (!frame.html) {
            console.warn(`⚠️ AIVideoPlayer: Frame ${validIndex} has no HTML content`);
            return '';
        }

        const html = HtmlContentProcessor.fixHtmlContent(frame.html);
        console.log(`🎬 AIVideoPlayer: Rendering frame ${validIndex + 1}/${frames.length}`, {
            id: frame.id,
            inTime: frame.inTime,
            exitTime: frame.exitTime,
            htmlLength: html.length,
            hasHtml: !!frame.html,
        });

        return html;
    }, [frames, currentFrameIndex]);

    // Loading state - matching YouTube player pattern
    if (isLoading) {
        return (
            <div className={`ai-video-player ${className}`}>
                <div className="video-container">
                    <div className="loading-overlay">
                        <div className="loading-spinner">
                            <div className="spinner"></div>
                            <p>Loading AI video...</p>
                            <p style={{ fontSize: '0.75rem', marginTop: '0.5rem', color: '#666' }}>
                                Fetching timeline data
                            </p>
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
                        <p>Error Loading AI Video</p>
                        <p style={{ fontSize: '0.875rem', color: '#666' }}>{error}</p>
                    </div>
                </div>
            </div>
        );
    }

    // No frames state
    if (frames.length === 0) {
        return (
            <div className={`ai-video-player ${className}`}>
                <div className="video-placeholder">
                    <div className="video-placeholder-content">
                        <p>No Video Frames Available</p>
                        <p style={{ fontSize: '0.875rem', color: '#666' }}>
                            Timeline data is empty
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

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
            {/* Video Container - Fills screen in fullscreen, constrained otherwise */}
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
                onClick={handlePlayPause}
            >
                {/* Video Frame - Full size */}
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
                    {currentHtml ? (
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
                            <iframe
                                key={`frame-${currentFrameIndex}-${currentHtml.length}`}
                                srcDoc={currentHtml}
                                style={{
                                    width: '100%',
                                    height: '100%',
                                    border: 'none',
                                    background: '#ffffff',
                                }}
                                title="AI Video Preview"
                                sandbox="allow-scripts allow-same-origin"
                                onLoad={() => {
                                    console.log('🎬 AIVideoPlayer: iframe loaded successfully', {
                                        frameIndex: currentFrameIndex,
                                        htmlLength: currentHtml.length,
                                        frameId: frames[currentFrameIndex]?.id,
                                    });
                                }}
                                onError={(e) => {
                                    console.error('❌ AIVideoPlayer: iframe error:', e);
                                }}
                            />
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
                            <p>No frame content available</p>
                        </div>
                    )}
                </div>

                {/* Center Play Button - Shows when paused */}
                {!isPlaying && (
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
                            transition: 'transform 0.2s, background 0.2s',
                            zIndex: 5,
                        }}
                        onClick={(e) => {
                            e.stopPropagation();
                            handlePlayPause();
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'translate(-50%, -50%) scale(1.1)';
                            e.currentTarget.style.background = 'rgba(0, 0, 0, 0.85)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'translate(-50%, -50%)';
                            e.currentTarget.style.background = 'rgba(0, 0, 0, 0.7)';
                        }}
                    >
                        <Play className="size-10 text-white" style={{ marginLeft: '4px' }} />
                    </div>
                )}

                {/* Video Controls Overlay - Top in normal mode, bottom in fullscreen */}
                <div
                    className="video-controls-overlay"
                    style={{
                        position: 'absolute',
                        // Top in normal mode, bottom in fullscreen
                        top: isFullscreen ? 'auto' : 0,
                        bottom: isFullscreen ? 0 : 'auto',
                        left: 0,
                        right: 0,
                        // Gradient direction based on position
                        background: isFullscreen
                            ? 'linear-gradient(transparent, rgba(0,0,0,0.8))'
                            : 'linear-gradient(rgba(0,0,0,0.8), transparent)',
                        // Padding: more on the side away from edge
                        padding: isFullscreen ? '40px 16px 16px 16px' : '16px 16px 40px 16px',
                        opacity: isFullscreen ? 1 : 0,
                        transition: 'opacity 0.3s ease',
                        zIndex: 10,
                    }}
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Progress Bar */}
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
                                position: 'relative',
                                transition: 'height 0.1s',
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.height = '8px';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.height = '5px';
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

                    {/* Playback Controls */}
                    <div
                        className="playback-controls"
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '16px',
                        }}
                    >
                        <button
                            onClick={handlePlayPause}
                            style={{
                                background: 'none',
                                border: 'none',
                                cursor: 'pointer',
                                padding: '4px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                            }}
                        >
                            {isPlaying ? (
                                <Pause className="size-6 text-white" />
                            ) : (
                                <Play className="size-6 text-white" style={{ marginLeft: '2px' }} />
                            )}
                        </button>
                        <button
                            onClick={handleReset}
                            style={{
                                background: 'none',
                                border: 'none',
                                cursor: 'pointer',
                                padding: '4px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                            }}
                            title="Restart"
                        >
                            <RotateCcw className="size-5 text-white" />
                        </button>
                        <span
                            className="current-time"
                            style={{
                                fontFamily: 'monospace',
                                fontSize: '0.875rem',
                                color: '#ffffff',
                                fontWeight: 500,
                            }}
                        >
                            {formatTime(currentTime)} / {formatTime(duration)}
                        </span>
                        <span
                            className="frame-indicator"
                            style={{
                                marginLeft: 'auto',
                                fontSize: '0.75rem',
                                color: 'rgba(255, 255, 255, 0.8)',
                                background: 'rgba(255, 255, 255, 0.2)',
                                padding: '4px 10px',
                                borderRadius: '4px',
                            }}
                        >
                            Frame {currentFrameIndex + 1} / {frames.length}
                        </span>
                        <button
                            onClick={handleFullscreenToggle}
                            style={{
                                background: 'none',
                                border: 'none',
                                cursor: 'pointer',
                                padding: '4px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                marginLeft: '8px',
                            }}
                            title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
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

            {/* Hidden Audio Element */}
            <audio
                ref={audioRef}
                src={audioUrl}
                onTimeUpdate={handleTimeUpdate}
                onLoadedMetadata={handleLoadedMetadata}
                onEnded={() => setIsPlaying(false)}
                crossOrigin="anonymous"
            />
        </div>
    );
};
