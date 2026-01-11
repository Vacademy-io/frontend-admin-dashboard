import { useState, useRef, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Play, Pause, RotateCcw } from 'lucide-react';

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
        <script src="https://cdn.jsdelivr.net/npm/mermaid@10/dist/mermaid.min.js"></script>
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
        </style>
        <script>
            window.addEventListener('load', () => {
                // Initialize Libraries
                if(window.gsap && window.MotionPathPlugin) gsap.registerPlugin(MotionPathPlugin);
                if(window.mermaid) mermaid.initialize({startOnLoad:true});
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
     * Uses a buffer to ensure content fits while matching resolution
     */
    calculateScale(containerWidth: number, containerHeight: number, buffer: number = 0.7): number {
        const targetRatio = this.targetWidth / this.targetHeight;
        const containerRatio = containerWidth / containerHeight;

        let newScale: number;
        if (containerRatio > targetRatio) {
            // Container is wider than target; constrain by height
            newScale = containerHeight / this.targetHeight;
        } else {
            // Container is taller than target; constrain by width
            newScale = containerWidth / this.targetWidth;
        }
        
        // Apply buffer to zoom out and ensure entire frame fits exactly within the player screen
        // Using 0.7 for better frame visibility
        // Removed minHeight/maxHeight constraints to allow container to use full available space
        return newScale * buffer;
    }
}

/**
 * Main AIVideoPlayer Component
 * Orchestrates all the pieces together
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
    const [scale, setScale] = useState(0.7); // Initialize with buffer value to prevent zoomed-in initial state
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const audioRef = useRef<HTMLAudioElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

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
                console.log('🎬 AIVideoPlayer: Timeline response status:', response.status, response.statusText);
                
                if (!response.ok) {
                    throw new Error(`Failed to load timeline: ${response.status} ${response.statusText}`);
                }
                
                const data: Frame[] = await response.json();
                console.log('🎬 AIVideoPlayer: Timeline data loaded:', {
                    frameCount: data.length,
                    firstFrame: data[0] ? {
                        id: data[0].id,
                        inTime: data[0].inTime,
                        exitTime: data[0].exitTime,
                        hasHtml: !!data[0].html
                    } : null,
                    sampleHtml: data[0]?.html?.substring(0, 100) || 'No HTML'
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
            console.log(`🎬 AIVideoPlayer: Frame changed from ${currentFrameIndex} to ${index} at time ${currentTime.toFixed(2)}s`);
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
                // Only calculate if container has valid dimensions
                if (clientWidth > 0 && clientHeight > 0) {
                    const newScale = scaleCalculator.calculateScale(clientWidth, clientHeight);
                    setScale(newScale);
                }
            }
        };

        // Use requestAnimationFrame to ensure container is rendered and has dimensions
        const rafId = requestAnimationFrame(() => {
            updateScale();
            // Also try after a small delay to ensure dimensions are stable
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
    }, [scaleCalculator, frames.length]); // Also recalculate when frames are loaded

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

    const handleSeek = (value: number[]) => {
        const newTime = value[0];
        if (newTime !== undefined && audioRef.current) {
            audioRef.current.currentTime = newTime;
            setCurrentTime(newTime);
        }
    };

    const handleReset = () => {
        if (audioRef.current) {
            audioRef.current.currentTime = 0;
            setCurrentTime(0);
        }
    };

    const handleTimelineClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (duration === 0) return;
        
        const rect = e.currentTarget.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const width = rect.width;
        const newTime = (x / width) * duration;
        
        if (audioRef.current) {
            audioRef.current.currentTime = newTime;
            setCurrentTime(newTime);
        }
    };

    // Get current HTML to render
    const currentHtml = useMemo(() => {
        if (frames.length === 0) {
            console.log('⚠️ AIVideoPlayer: No frames available for rendering');
            return '';
        }
        
        // Ensure currentFrameIndex is valid
        const validIndex = Math.max(0, Math.min(currentFrameIndex, frames.length - 1));
        const frame = frames[validIndex];
        
        if (!frame) {
            console.log(`⚠️ AIVideoPlayer: Frame at index ${validIndex} not found, using first frame`);
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
            hasHtml: !!frame.html
        });
        
        return html;
    }, [frames, currentFrameIndex]);

    if (isLoading) {
        return (
            <div className={`flex items-center justify-center bg-gray-900 rounded-lg p-8 ${className}`}>
                <div className="text-white text-center">
                    <div className="mb-2">Loading video frames...</div>
                    <div className="text-sm text-gray-400">Fetching timeline data from S3</div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className={`flex flex-col items-center justify-center bg-gray-900 rounded-lg p-8 ${className}`}>
                <div className="text-red-500 text-center mb-2">Error loading video: {error}</div>
                <div className="text-sm text-gray-400 text-center">
                    Timeline URL: <code className="bg-gray-800 px-2 py-1 rounded text-xs break-all">{timelineUrl}</code>
                </div>
            </div>
        );
    }

    if (frames.length === 0) {
        return (
            <div className={`flex items-center justify-center bg-gray-900 rounded-lg p-8 ${className}`}>
                <div className="text-white text-center">
                    <div className="mb-2">No frames available</div>
                    <div className="text-sm text-gray-400">Timeline data is empty</div>
                </div>
            </div>
        );
    }

    return (
        <div className={`flex flex-col gap-2.5 w-full max-w-full overflow-hidden ${className}`} style={{ maxHeight: 'calc(100vh - 150px)', height: 'calc(100vh - 150px)' }}>
            {/* Controls */}
            <div className="flex items-center justify-between bg-card p-2 rounded-lg border shadow-sm w-full min-w-0 flex-shrink-0">
                <div className="flex items-center gap-4">
                    <Button variant="outline" size="icon" onClick={handleReset}>
                        <RotateCcw className="h-4 w-4" />
                    </Button>
                    <Button onClick={handlePlayPause}>
                        {isPlaying ? <Pause className="h-4 w-4 mr-2" /> : <Play className="h-4 w-4 mr-2" />}
                        {isPlaying ? 'Pause' : 'Play'}
                    </Button>
                    <span className="font-mono text-sm">
                        {currentTime.toFixed(2)}s / {duration.toFixed(2)}s
                    </span>
                </div>
            </div>

            {/* Video Preview */}
            <div
                className="w-full bg-gray-900 rounded-lg relative overflow-hidden flex-1"
                ref={containerRef}
                style={{ 
                    aspectRatio: '16/9',
                    minHeight: '500px',
                    maxHeight: '600px'
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
                        className="bg-black shadow-2xl"
                    >
                        <iframe
                            key={`frame-${currentFrameIndex}-${currentHtml.length}`}
                            srcDoc={currentHtml}
                            className="w-full h-full border-0"
                            title="AI Video Preview"
                            sandbox="allow-scripts allow-same-origin"
                            onLoad={() => {
                                console.log('🎬 AIVideoPlayer: iframe loaded successfully', {
                                    frameIndex: currentFrameIndex,
                                    htmlLength: currentHtml.length,
                                    frameId: frames[currentFrameIndex]?.id
                                });
                            }}
                            onError={(e) => {
                                console.error('❌ AIVideoPlayer: iframe error:', e);
                            }}
                        />
                        <div className="absolute top-2 left-2 bg-black/50 text-white px-4 py-2 text-xl rounded pointer-events-none z-50">
                            Frame {currentFrameIndex + 1} / {frames.length}
                        </div>
                    </div>
                ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-white">
                        <div>No frame content available</div>
                    </div>
                )}
            </div>

            {/* Timeline */}
            <div className="h-24 bg-card border rounded-lg p-2.5 flex flex-col justify-center gap-2.5 shadow-sm relative overflow-hidden w-full min-w-0 flex-shrink-0">
                {/* Timeline Visualization */}
                <div
                    className="flex w-full h-12 bg-muted rounded overflow-hidden relative cursor-pointer min-w-0"
                    onClick={handleTimelineClick}
                >
                    {frames.map((frame, idx) => {
                        const widthPercent = duration > 0 ? ((frame.exitTime - frame.inTime) / duration) * 100 : 0;
                        const isActive = idx === currentFrameIndex;
                        return (
                            <div
                                key={frame.id}
                                style={{ width: `${widthPercent}%` }}
                                className={`h-full border-r border-white/20 text-[10px] p-1 truncate transition-colors
                                    ${isActive ? 'bg-blue-500 text-white' : 'bg-slate-200 text-slate-600 hover:bg-slate-300'}
                                `}
                                title={`Frame ${idx + 1}: ${frame.inTime}s - ${frame.exitTime}s`}
                            >
                                <span className="font-bold">#{idx + 1}</span>
                            </div>
                        );
                    })}

                    {/* Playhead */}
                    {duration > 0 && (
                        <div
                            className="absolute top-0 bottom-0 w-0.5 bg-red-500 z-10 pointer-events-none"
                            style={{ left: `${(currentTime / duration) * 100}%` }}
                        />
                    )}
                </div>

                <Slider
                    value={[currentTime]}
                    max={duration || 100}
                    step={0.1}
                    onValueChange={handleSeek}
                    className="w-full min-w-0"
                />
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

