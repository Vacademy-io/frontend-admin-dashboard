import { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { Play, Pause, RotateCcw, Maximize2, Minimize2, Subtitles } from 'lucide-react';
import '@/components/ai-course-builder/components/styles/AIVideoComponents.css';
import { useCaptions } from './hooks/useCaptions';
import { CaptionDisplay, CaptionSettingsPopover } from './components';

/**
 * Frame interface matching the time_based_frame.json structure
 */
export interface Frame {
    inTime: number;
    exitTime: number;
    html: string;
    id: string;
    z: number;
    htmlStartX?: number;
    htmlStartY?: number;
    htmlEndX?: number;
    htmlEndY?: number;
}

/**
 * Timeline metadata for video branding integration
 */
export interface TimelineMeta {
    audio_start_at: number;
    total_duration: number;
    intro_duration?: number;
    outro_duration?: number;
    content_starts_at?: number;
    content_ends_at?: number;
}

/**
 * New timeline data structure supporting branding
 */
export interface TimelineData {
    meta: TimelineMeta;
    entries: Frame[];
}

/**
 * Props for AIVideoPlayer component
 */
export interface AIVideoPlayerProps {
    timelineUrl: string;
    audioUrl: string;
    wordsUrl?: string; // Optional - for captions/subtitles
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
            @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@700;900&family=Inter:wght@400;600&family=Fira+Code&display=swap');

            /* --- THEME VARIABLES (Default to Light/White Theme) --- */
            :root {
                --text-color: #1e293b;
                --text-secondary: #475569;
                --primary-color: #2563eb;
                --accent-color: #f59e0b;
                --background-color: #ffffff;
            }
            /* For Dark Mode (Optional) */
            /*
            [data-theme="dark"] {
                --text-color: #f8fafc;
                --text-secondary: #cbd5e1;
                --primary-color: #3b82f6;
                --background-color: #0f172a;
            }
            */

            /* --- TYPOGRAPHY MATCHING BACKEND --- */
            .text-display { font-family: 'Montserrat', sans-serif; font-size: 64px; font-weight: 800; line-height: 1.1; letter-spacing: -0.02em; color: var(--text-color); }
            .text-h2 { font-family: 'Montserrat', sans-serif; font-size: 48px; font-weight: 700; margin-bottom: 16px; color: var(--text-color); }
            .text-body { font-family: 'Inter', sans-serif; font-size: 28px; font-weight: 400; color: var(--text-secondary); line-height: 1.5; }
            .text-label { font-family: 'Fira Code', monospace; font-size: 18px; color: var(--accent-color); text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 12px; display: block; }

            /* --- REQUIRED UTILITY CLASSES --- */
            .full-screen-center {
                width: 100%;
                height: 100%;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                text-align: center;
                box-sizing: border-box;
                padding: 60px 80px;
            }
            .highlight {
                background: linear-gradient(120deg, rgba(255, 226, 89, 0.6) 0%, rgba(255, 233, 148, 0.4) 100%);
                padding: 0 4px;
                border-radius: 4px;
                display: inline-block;
                box-decoration-break: clone;
                -webkit-box-decoration-break: clone;
            }
            .emphasis { color: var(--primary-color); font-weight: bold; }
            .mermaid { display: flex; justify-content: center; width: 100%; margin: 20px auto; }

            /* --- LAYOUT GRIDS --- */
            .layout-split {
                display: grid; grid-template-columns: 1fr 1fr; gap: 60px;
                width: 90%; max-width: 1700px; align-items: center; justify-items: center;
                text-align: left;
            }
            .layout-split.reverse { direction: rtl; }
            .layout-split.reverse > * { direction: ltr; }
            .layout-split.golden-left { grid-template-columns: 1.2fr 0.8fr; }
            .layout-split.golden-right { grid-template-columns: 0.8fr 1.2fr; }
            .layout-hero {
                display: flex; flex-direction: column; align-items: center; justify-content: center;
                text-align: center; width: 80%; max-width: 1200px; gap: 32px;
            }
            .layout-code-split {
                display: grid; grid-template-columns: 40% 60%; gap: 40px;
                width: 95%; max-width: 1800px; align-items: center;
                text-align: left;
            }
            .layout-bento {
                display: grid; grid-template-columns: repeat(2, 1fr);
                gap: 40px; width: 90%; max-width: 1600px; align-content: center;
            }

            /* --- COMPONENTS --- */
            .content-section, .bento-card {
                padding: 24px;
                color: var(--text-color);
            }
            .bento-card { border-left: 3px solid var(--primary-color); }
            .bento-card.center { text-align: center; }
            .key-term {
                color: var(--accent-color);
                font-weight: 700;
                border-bottom: 3px solid var(--accent-color);
            }
            .step-item {
                display: flex; align-items: flex-start; margin: 20px 0; color: var(--text-color);
            }
            .step-number {
                display: inline-flex; align-items: center; justify-content: center;
                width: 48px; height: 48px;
                background: var(--primary-color);
                color: #fff; font-weight: 800; font-size: 24px;
                border-radius: 50%; margin-right: 16px; flex-shrink: 0;
            }
            .divider {
                width: 100%; height: 2px;
                background: var(--primary-color);
                margin: 24px 0; opacity: 0.5;
            }
            .arrow-right {
                display: inline-block; width: 0; height: 0;
                border-top: 12px solid transparent;
                border-bottom: 12px solid transparent;
                border-left: 20px solid var(--primary-color);
                margin: 0 16px;
            }
            .label-tag {
                display: inline-block; padding: 4px 12px;
                background: var(--primary-color);
                color: #fff; font-size: 14px;
                border-radius: 4px; font-weight: 600; text-transform: uppercase;
                margin-right: 8px; margin-bottom: 8px;
            }

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

                // Helper to resolve the actual SVG element
                var findSvg = function(id) {
                    try {
                        var el = null;
                        if (typeof id === 'string') {
                            if (id.startsWith('#')) {
                                el = document.querySelector(id);
                            } else {
                                el = document.getElementById(id);
                            }
                        } else {
                            el = id;
                        }

                        if (!el) return null;

                        // Strict check: if it is explicitly an SVG element
                        if (el.tagName && el.tagName.toLowerCase() === 'svg') return el;

                        // If element is a container, look inside for an SVG
                        if (el.querySelector) {
                            var inner = el.querySelector('svg');
                            if (inner) return inner;
                        }

                        return null;
                    } catch(e) { return null; }
                };

                var initVivus = function() {
                    try {
                        var targetSvg = findSvg(svgId);

                        // Strict validation before passing to Vivus
                        var isValidSvg = targetSvg && (
                            (window.SVGElement && targetSvg instanceof window.SVGElement) ||
                            (targetSvg.tagName && targetSvg.tagName.toLowerCase() === 'svg')
                        );

                        if (isValidSvg) {
                             new Vivus(targetSvg, {
                              duration: duration || 100,
                              type: 'oneByOne',
                              animTimingFunction: Vivus.EASE_OUT
                            }, cb);
                        } else if (document.readyState === 'loading') {
                            document.addEventListener('DOMContentLoaded', function() {
                                var retrySvg = findSvg(svgId);
                                var retryValid = retrySvg && (
                                    (window.SVGElement && retrySvg instanceof window.SVGElement) ||
                                    (retrySvg.tagName && retrySvg.tagName.toLowerCase() === 'svg')
                                );

                                if (retryValid) {
                                    new Vivus(retrySvg, {
                                      duration: duration || 100,
                                      type: 'oneByOne',
                                      animTimingFunction: Vivus.EASE_OUT
                                    }, cb);
                                } else {
                                    // Debug only, don't warn as it might be expected
                                    console.debug('Vivus init skipped: SVG not found after load', svgId);
                                }
                            });
                        } else {
                            console.debug('Vivus init skipped: SVG not found', svgId);
                        }
                    } catch(e) {
                        // Only log real errors, not anticipated "element missing" ones
                        console.warn('Vivus init error', e);
                    }
                };

                initVivus();
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
    wordsUrl,
    className = '',
    width = 1920,
    height = 1080,
}) => {
    const [frames, setFrames] = useState<Frame[]>([]);
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0); // Timeline time (includes intro)
    const [duration, setDuration] = useState(0); // Total video duration (from meta or audio)
    const [scale, setScale] = useState(1);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [timelineMeta, setTimelineMeta] = useState<TimelineMeta>({
        audio_start_at: 0,
        total_duration: 0,
    });

    const audioRef = useRef<HTMLAudioElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const playerRef = useRef<HTMLDivElement>(null);
    const audioStartedRef = useRef<boolean>(false); // Track if audio has started after intro

    // Initialize scale calculator
    const scaleCalculator = useMemo(() => new ScaleCalculator(width, height), [width, height]);

    // Captions hook
    const {
        currentWords,
        currentPhrase,
        currentWordIndex,
        settings: captionSettings,
        updateSettings: updateCaptionSettings,
        toggleCaptions,
    } = useCaptions({
        wordsUrl,
        currentTime,
        audioStartAt: timelineMeta.audio_start_at,
    });

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

                const rawData = await response.json();

                // Parse new structure vs old array format
                let entries: Frame[];
                let meta: TimelineMeta;

                if (Array.isArray(rawData)) {
                    // Old format: array of frames
                    entries = rawData;
                    meta = { audio_start_at: 0, total_duration: 0 };
                    console.log('🎬 AIVideoPlayer: Using old timeline format (array)');
                } else if (rawData.entries && Array.isArray(rawData.entries)) {
                    // New format: { meta, entries }
                    entries = rawData.entries;
                    meta = rawData.meta || { audio_start_at: 0, total_duration: 0 };
                    console.log('🎬 AIVideoPlayer: Using new timeline format with meta:', meta);
                } else {
                    throw new Error('Timeline data is in an unrecognized format');
                }

                console.log('🎬 AIVideoPlayer: Timeline data loaded:', {
                    frameCount: entries.length,
                    meta: meta,
                    firstFrame: entries[0]
                        ? {
                              id: entries[0].id,
                              inTime: entries[0].inTime,
                              exitTime: entries[0].exitTime,
                              z: entries[0].z,
                              hasHtml: !!entries[0].html,
                          }
                        : null,
                    sampleHtml: entries[0]?.html?.substring(0, 100) || 'No HTML',
                });

                if (entries.length === 0) {
                    throw new Error('Timeline data is empty');
                }

                // Set timeline meta (for audio sync and duration)
                setTimelineMeta(meta);

                // Set duration from meta if available
                if (meta.total_duration && meta.total_duration > 0) {
                    setDuration(meta.total_duration);
                }

                // Reset audio started state
                audioStartedRef.current = false;

                setFrames(entries);
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

    // Audio event handlers with intro silence support
    const handleTimeUpdate = () => {
        if (audioRef.current && audioStartedRef.current) {
            // Timeline time = audio time + audio_start_at offset
            const timelineTime = audioRef.current.currentTime + timelineMeta.audio_start_at;
            setCurrentTime(timelineTime);
        }
    };

    const handleLoadedMetadata = () => {
        if (audioRef.current) {
            // Only set duration from audio if meta.total_duration is not set
            if (!timelineMeta.total_duration || timelineMeta.total_duration === 0) {
                // For old format, use audio duration
                setDuration(audioRef.current.duration);
            }
        }
    };

    // Timeline animation for intro period (before audio starts)
    const animationFrameRef = useRef<number | null>(null);
    const playStartTimeRef = useRef<number>(0);
    const introStartTimeRef = useRef<number>(0);
    const isPlayingRef = useRef<boolean>(false); // Ref to avoid stale closure issues

    // Keep ref in sync with state
    useEffect(() => {
        isPlayingRef.current = isPlaying;
    }, [isPlaying]);

    const animateIntro = useCallback(() => {
        // Use ref instead of state to avoid stale closure issues
        if (!isPlayingRef.current) return;

        const elapsed = (performance.now() - playStartTimeRef.current) / 1000;
        const newTimelineTime = introStartTimeRef.current + elapsed;

        // Check if we've reached the point where audio should start
        if (newTimelineTime >= timelineMeta.audio_start_at && !audioStartedRef.current) {
            // Start audio from beginning
            if (audioRef.current) {
                audioRef.current.currentTime = 0;
                audioRef.current.play().catch((err) => {
                    console.error('❌ AIVideoPlayer: Error starting audio:', err);
                });
                audioStartedRef.current = true;
            }
            setCurrentTime(newTimelineTime);
        } else if (!audioStartedRef.current) {
            // Still in intro, continue animation
            setCurrentTime(newTimelineTime);
            animationFrameRef.current = requestAnimationFrame(animateIntro);
        }
    }, [timelineMeta.audio_start_at]);

    const handlePlayPause = () => {
        if (isPlaying) {
            // Pause
            isPlayingRef.current = false; // Update ref immediately
            if (audioStartedRef.current && audioRef.current) {
                audioRef.current.pause();
            }
            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current);
                animationFrameRef.current = null;
            }
            setIsPlaying(false);
        } else {
            // Play
            isPlayingRef.current = true; // Update ref immediately before scheduling animation
            setIsPlaying(true);

            if (currentTime >= timelineMeta.audio_start_at) {
                // Already past intro, start/resume audio
                if (audioRef.current) {
                    // Calculate audio time from timeline time
                    const audioTime = currentTime - timelineMeta.audio_start_at;
                    audioRef.current.currentTime = Math.max(0, audioTime);
                    audioRef.current.play().catch((err) => {
                        console.error('❌ AIVideoPlayer: Error playing audio:', err);
                    });
                    audioStartedRef.current = true;
                }
            } else {
                // In intro period, start animation
                audioStartedRef.current = false;
                playStartTimeRef.current = performance.now();
                introStartTimeRef.current = currentTime;
                // Schedule the animation loop
                animationFrameRef.current = requestAnimationFrame(animateIntro);
            }
        }
    };

    // Cleanup animation frame on unmount
    useEffect(() => {
        return () => {
            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current);
            }
        };
    }, []);

    const handleReset = () => {
        // Reset to beginning of timeline (including intro)
        isPlayingRef.current = false;
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
    };

    const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (duration === 0) return;

        const rect = e.currentTarget.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const progressWidth = rect.width;
        const newTimelineTime = (x / progressWidth) * duration;

        // Update timeline time
        setCurrentTime(newTimelineTime);

        // Determine audio state based on where user clicked
        if (newTimelineTime >= timelineMeta.audio_start_at) {
            // User clicked past intro - sync audio
            const audioTime = newTimelineTime - timelineMeta.audio_start_at;
            if (audioRef.current) {
                audioRef.current.currentTime = audioTime;
                audioStartedRef.current = true;

                // If currently playing, ensure audio is playing too
                if (isPlaying) {
                    audioRef.current.play().catch((err) => {
                        console.error('❌ AIVideoPlayer: Error resuming audio:', err);
                    });
                }
            }
            // Stop intro animation if running
            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current);
                animationFrameRef.current = null;
            }
        } else {
            // User clicked in intro region
            audioStartedRef.current = false;
            if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current.currentTime = 0;
            }

            // If playing, start intro animation from new position
            if (isPlaying) {
                playStartTimeRef.current = performance.now();
                introStartTimeRef.current = newTimelineTime;
                if (animationFrameRef.current) {
                    cancelAnimationFrame(animationFrameRef.current);
                }
                animationFrameRef.current = requestAnimationFrame(animateIntro);
            }
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

    // Get ALL active frames at current time, sorted by z-index (lowest first for stacking)
    const activeFrames = useMemo(() => {
        if (frames.length === 0) {
            console.log('⚠️ AIVideoPlayer: No frames available for rendering');
            return [];
        }

        // Find all frames that are active at the current time
        const active = frames.filter(
            (frame) => currentTime >= frame.inTime && currentTime < frame.exitTime
        );

        // Sort by z-index (lowest first, so highest z renders on top when stacked)
        active.sort((a, b) => (a.z || 0) - (b.z || 0));

        // Process HTML for each active frame
        const processedFrames = active.map((frame) => ({
            ...frame,
            processedHtml: frame.html ? HtmlContentProcessor.fixHtmlContent(frame.html) : '',
        }));

        console.log(`🎬 AIVideoPlayer: Active frames at ${currentTime.toFixed(2)}s:`, {
            count: processedFrames.length,
            frameIds: processedFrames.map((f) => ({ id: f.id, z: f.z })),
            scale,
            containerDimensions: containerRef.current
                ? {
                      width: containerRef.current.clientWidth,
                      height: containerRef.current.clientHeight,
                  }
                : null,
            sampleHtml: processedFrames[0]?.processedHtml?.substring(0, 200),
        });

        return processedFrames;
    }, [frames, currentTime]);

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
                    {activeFrames.length > 0 ? (
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
                            {/* Render all active frames with proper z-index layering */}
                            {activeFrames.map((frame, index) => (
                                <iframe
                                    key={`frame-${frame.id}-${index}`}
                                    srcDoc={frame.processedHtml}
                                    style={{
                                        width: '100%',
                                        height: '100%',
                                        border: 'none',
                                        background: index === 0 ? '#ffffff' : 'transparent',
                                        position: 'absolute',
                                        top: 0,
                                        left: 0,
                                        zIndex: frame.z || 0,
                                        pointerEvents: frame.id?.startsWith('branding-watermark')
                                            ? 'none'
                                            : 'auto',
                                    }}
                                    title={`AI Video Layer ${frame.id}`}
                                    sandbox="allow-scripts allow-same-origin"
                                    onLoad={() => {
                                        console.log(
                                            '🎬 AIVideoPlayer: iframe loaded successfully',
                                            {
                                                frameId: frame.id,
                                                zIndex: frame.z,
                                            }
                                        );
                                    }}
                                    onError={(e) => {
                                        console.error('❌ AIVideoPlayer: iframe error:', e);
                                    }}
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

                {/* Captions / Subtitles Display */}
                {wordsUrl && (
                    <CaptionDisplay
                        words={currentWords}
                        currentTime={currentTime}
                        audioStartAt={timelineMeta.audio_start_at}
                        settings={captionSettings}
                        currentPhrase={currentPhrase}
                        currentWordIndex={currentWordIndex}
                    />
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
                            {activeFrames.length} layer{activeFrames.length !== 1 ? 's' : ''} active
                        </span>

                        {/* Captions toggle (CC button) - only when words are available */}
                        {wordsUrl && (
                            <>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        toggleCaptions();
                                    }}
                                    style={{
                                        background: captionSettings.enabled
                                            ? 'rgba(255, 255, 255, 0.2)'
                                            : 'none',
                                        border: 'none',
                                        cursor: 'pointer',
                                        padding: '4px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        marginLeft: '8px',
                                        borderRadius: '4px',
                                        opacity: captionSettings.enabled ? 1 : 0.6,
                                    }}
                                    title={
                                        captionSettings.enabled
                                            ? 'Turn off captions'
                                            : 'Turn on captions'
                                    }
                                >
                                    <Subtitles className="size-5 text-white" />
                                </button>
                                {captionSettings.enabled && (
                                    <CaptionSettingsPopover
                                        settings={captionSettings}
                                        onUpdate={updateCaptionSettings}
                                    />
                                )}
                            </>
                        )}

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
                onEnded={() => {
                    // Audio ended - check if we need to continue for outro
                    if (timelineMeta.total_duration && currentTime < timelineMeta.total_duration) {
                        // Continue timeline for outro
                        console.log('🎬 AIVideoPlayer: Audio ended, continuing for outro');
                        audioStartedRef.current = false;
                        playStartTimeRef.current = performance.now();
                        introStartTimeRef.current = currentTime;

                        // Animate through outro until total_duration
                        const animateOutro = () => {
                            if (!isPlayingRef.current) return;

                            const elapsed = (performance.now() - playStartTimeRef.current) / 1000;
                            const newTime = introStartTimeRef.current + elapsed;

                            if (newTime >= timelineMeta.total_duration) {
                                setCurrentTime(timelineMeta.total_duration);
                                isPlayingRef.current = false;
                                setIsPlaying(false);
                            } else {
                                setCurrentTime(newTime);
                                requestAnimationFrame(animateOutro);
                            }
                        };
                        requestAnimationFrame(animateOutro);
                    } else {
                        setIsPlaying(false);
                    }
                }}
                crossOrigin="anonymous"
            />
        </div>
    );
};
