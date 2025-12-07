import { LayoutContainer } from '@/components/common/layout-container/layout-container';
import { createFileRoute } from '@tanstack/react-router';
import { useState, useRef, useEffect, useMemo } from 'react';
import initialFramesData from './runs/dna_gene_editing/time_based_frame.json';
import narrationUrl from './runs/dna_gene_editing/narration.mp3';
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Play, Pause, RotateCcw } from 'lucide-react';

export const Route = createFileRoute('/ai-video-studio/')({
    component: AIVideoStudio,
});

interface Frame {
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

const fixHtmlContent = (html: string) => {
    // Inject required libraries (GSAP, MotionPath, Mermaid) + Interaction Script
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

                // --- Interaction Logic ---
                const postUpdate = () => {
                    // Robust serialization to preserve styles (which might move to HEAD) and content
                    let result = "";

                    const isInjection = (node) => {
                        // Check scripts
                        if (node.tagName === 'SCRIPT') {
                            if (node.src && (node.src.includes('gsap') || node.src.includes('mermaid'))) return true;
                            if (node.innerHTML.includes('Interaction Logic')) return true;
                            if (node.innerHTML.includes('gsap.registerPlugin(MotionPathPlugin)')) return true; 
                        }
                        // Check interaction style
                        if (node.tagName === 'STYLE') {
                            if (node.innerHTML.includes('Visual cues for interactive elements')) return true;
                        }
                        return false;
                    }

                    // 1. Process HEAD (Styles often end up here)
                    if (document.head) {
                        Array.from(document.head.childNodes).forEach(node => {
                            if (!isInjection(node)) {
                                result += (node.nodeType === 3 ? node.nodeValue : node.outerHTML) || "";
                            }
                        });
                    }

                    // 2. Process BODY
                    // Clone body to clean up interaction markers on elements (classes/attributes)
                    const bodyClone = document.body.cloneNode(true);
                    
                    // Clean attributes
                    bodyClone.querySelectorAll('*').forEach(el => {
                        el.classList.remove('hover-target', 'is-dragging');
                        el.removeAttribute('contenteditable');
                    });
                    
                    Array.from(bodyClone.childNodes).forEach(node => {
                         if (!isInjection(node)) {
                             result += (node.nodeType === 3 ? node.nodeValue : node.outerHTML) || "";
                         }
                    });

                    window.parent.postMessage({
                        type: 'HTML_UPDATE',
                        html: result 
                    }, '*');
                };

                // Add hover effects to everything reasonable
                document.body.addEventListener('mouseover', (e) => {
                    if (e.target !== document.body && !e.target.classList.contains('hover-target')) {
                        // e.target.classList.add('hover-target');
                    }
                });
                
                // Helper to find a "movable" block (divs, imgs, etc)
                const getMovable = (target) => {
                    if(!target || target === document.body) return null;
                    // Move up until we find a block level element or the body
                    const style = window.getComputedStyle(target);
                    if (style.display === 'block' || style.display === 'flex' || target.tagName === 'IMG') return target;
                    return getMovable(target.parentElement);
                }

                // Drag Logic
                let draggedEl = null;
                let startX = 0, startY = 0;
                let initialTransform = {x: 0, y: 0};
                let hasMoved = false;

                const getTranslate = (el) => {
                    const style = window.getComputedStyle(el);
                    const matrix = new WebKitCSSMatrix(style.transform);
                    return {x: matrix.m41, y: matrix.m42};
                }

                document.addEventListener('mousedown', (e) => {
                    if (e.target.isContentEditable) return; // Don't drag if editing text
                    
                    const target = getMovable(e.target);
                    if (!target) return;

                    draggedEl = target;
                    startX = e.clientX;
                    startY = e.clientY;
                    initialTransform = getTranslate(draggedEl);
                    hasMoved = false;
                    
                    // Don't add class yet, wait for move
                    e.preventDefault(); 
                });

                document.addEventListener('mousemove', (e) => {
                    if (!draggedEl) return;
                    e.preventDefault();
                    
                    const dx = e.clientX - startX;
                    const dy = e.clientY - startY;
                    
                    if (Math.abs(dx) > 2 || Math.abs(dy) > 2) {
                         hasMoved = true;
                         draggedEl.classList.add('is-dragging');
                    }

                    if (!hasMoved) return;
                    
                    // Apply translate
                    draggedEl.style.transform = \`translate3d(\${initialTransform.x + dx}px, \${initialTransform.y + dy}px, 0)\`;
                });

                document.addEventListener('mouseup', () => {
                    if (draggedEl) {
                        draggedEl.classList.remove('is-dragging');
                        draggedEl = null; 
                        if (hasMoved) {
                            postUpdate(); // Only save if actually moved
                        }
                    }
                });

                // Text Edit Logic
                document.addEventListener('dblclick', (e) => {
                    const target = e.target;
                    // Relaxed check: Allow text editing on anything that isn't the root containers
                    // and has some text content.
                    if (target !== document.body && target !== document.documentElement) {
                        e.stopPropagation(); // Only edit the specific clicked element
                        
                        target.setAttribute('contenteditable', 'true');
                        target.focus();
                        
                        // Select all text
                        // Use try-catch as execCommand can be flaky in some contexts
                        try {
                            document.execCommand('selectAll', false, null);
                        } catch(err) {}
                        
                        // Prevent drag while editing
                        const stopProp = (k) => k.stopPropagation();
                        target.addEventListener('keydown', stopProp);
                        target.addEventListener('mousedown', stopProp); // Stop drag start
                        
                        // Save on blur
                        target.addEventListener('blur', () => {
                            target.removeAttribute('contenteditable');
                            target.removeEventListener('keydown', stopProp);
                            target.removeEventListener('mousedown', stopProp);
                            postUpdate();
                        }, {once: true});
                    }
                });
            });
        </script>
    `;

    // Replace absolute file paths with valid Vite src paths and prepend libraries
    const fixedPathHtml = html.replace(/file:\/\/\/.*\/runs\/dna_gene_editing\/generated_images\//g, '/src/routes/ai-video-studio/runs/dna_gene_editing/generated_images/');

    return libs + fixedPathHtml;
};

function AIVideoStudio() {
    const [frames, setFrames] = useState<Frame[]>(initialFramesData);
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [currentFrameIndex, setCurrentFrameIndex] = useState(0);
    const audioRef = useRef<HTMLAudioElement>(null);
    const [duration, setDuration] = useState(0);


    // Sync current frame based on time
    useEffect(() => {
        const index = frames.findIndex(f => currentTime >= f.inTime && currentTime < f.exitTime);
        if (index !== -1 && index !== currentFrameIndex) {
            setCurrentFrameIndex(index);
        }
    }, [currentTime, frames, currentFrameIndex]);

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

    // Handle updates from Iframe
    useEffect(() => {
        const handleMessage = (e: MessageEvent) => {
            if (e.data.type === 'HTML_UPDATE') {
                const cleanHtml = e.data.html;

                // Update state
                setFrames(prev => {
                    const newFrames = [...prev];
                    const frame = newFrames[currentFrameIndex];
                    if (frame) {
                        newFrames[currentFrameIndex] = {
                            ...frame,
                            html: cleanHtml
                        };
                    }
                    return newFrames;
                });
            }
        };

        window.addEventListener('message', handleMessage);
        return () => window.removeEventListener('message', handleMessage);
    }, [currentFrameIndex]); // Re-bind when index changes to catch correct frame update context if needed? 
    // Actually currentFrameIndex is needed in the setFrames callback, but setState(prev => ...) is better.
    // However, we need to know WHICH frame to update. 'currentFrameIndex' is a dependency.


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

    const [scale, setScale] = useState(1);
    const containerRef = useRef<HTMLDivElement>(null);

    // Calculate scale to fit 1920x1080 into container
    useEffect(() => {
        const updateScale = () => {
            if (containerRef.current) {
                const { clientWidth, clientHeight } = containerRef.current;
                const targetRatio = 1920 / 1080;
                const containerRatio = clientWidth / clientHeight;

                let newScale;
                if (containerRatio > targetRatio) {
                    // Container is wider than target; constrain by height
                    newScale = clientHeight / 1080;
                } else {
                    // Container is taller than target; constrain by width
                    newScale = clientWidth / 1920;
                }
                // Add a small buffer to ensure no scrollbars/clipping
                setScale(newScale * 0.95);
            }
        };

        // Initial calc
        updateScale();

        // Observer
        const observer = new ResizeObserver(updateScale);
        if (containerRef.current) {
            observer.observe(containerRef.current);
        }

        return () => observer.disconnect();
    }, []);

    const handleSeek = (value: number[]) => {
        const newTime = value[0];
        if (newTime !== undefined && audioRef.current) {
            audioRef.current.currentTime = newTime;
            setCurrentTime(newTime);
        }
    };

    // Current HTML to render (processed)
    const currentHtml = useMemo(() => {
        const frame = frames[currentFrameIndex];
        return frame ? fixHtmlContent(frame.html) : '';
    }, [frames, currentFrameIndex]);

    return (
        <LayoutContainer>
            <div className="flex flex-col h-[calc(100vh-theme(spacing.20))] gap-4 p-4">

                {/* Top Bar: Controls */}
                <div className="flex items-center justify-between bg-card p-4 rounded-lg border shadow-sm">
                    <div className="flex items-center gap-4">
                        <Button variant="outline" size="icon" onClick={() => {
                            if (audioRef.current) {
                                audioRef.current.currentTime = 0;
                                setCurrentTime(0);
                            }
                        }}>
                            <RotateCcw className="h-4 w-4" />
                        </Button>
                        <Button onClick={handlePlayPause}>
                            {isPlaying ? <Pause className="h-4 w-4 mr-2" /> : <Play className="h-4 w-4 mr-2" />}
                            {isPlaying ? "Pause" : "Play"}
                        </Button>
                        <span className="font-mono text-sm">
                            {currentTime.toFixed(2)}s / {duration.toFixed(2)}s
                        </span>
                    </div>
                    <div className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                        AI Video Studio
                    </div>
                    <div className="w-[100px]"></div> {/* Spacer for alignment */}
                </div>

                {/* Main Content: Preview Only */}
                <div className="flex-1 flex gap-4 min-h-0 overflow-hidden justify-center items-center bg-gray-900 rounded-lg relative" ref={containerRef}>

                    {/* Scaled Preview Area */}
                    <div
                        style={{
                            width: '1920px',
                            height: '1080px',
                            transform: `scale(${scale})`,
                            transformOrigin: 'center center',
                            position: 'absolute'
                        }}
                        className="bg-black shadow-2xl"
                    >
                        <iframe
                            srcDoc={currentHtml}
                            className="w-full h-full border-0"
                            title="Preview"
                            sandbox="allow-scripts" // Allow scripts for GSAP animations
                        />

                        <div className="absolute top-2 left-2 bg-black/50 text-white px-4 py-2 text-xl rounded pointer-events-none z-50">
                            Frame {currentFrameIndex + 1}
                        </div>
                    </div>

                </div>

                {/* Bottom: Timeline */}
                <div className="h-32 bg-card border rounded-lg p-4 flex flex-col justify-center gap-4 shadow-sm relative overflow-hidden">
                    {/* Timeline Visualization */}
                    <div className="flex w-full h-12 bg-muted rounded overflow-hidden relative cursor-pointer"
                        onClick={(e) => {
                            const rect = e.currentTarget.getBoundingClientRect();
                            const x = e.clientX - rect.left;
                            const width = rect.width;
                            const newTime = (x / width) * duration;
                            if (audioRef.current) {
                                audioRef.current.currentTime = newTime;
                                setCurrentTime(newTime);
                            }
                        }}>
                        {frames.map((frame, idx) => {
                            const widthPercent = ((frame.exitTime - frame.inTime) / duration) * 100;
                            const isActive = idx === currentFrameIndex;
                            return (
                                <div key={frame.id} style={{ width: `${widthPercent}%` }}
                                    className={`h-full border-r border-white/20 text-[10px] p-1 truncate transition-colors
                                        ${isActive ? 'bg-blue-500 text-white' : 'bg-slate-200 text-slate-600 hover:bg-slate-300'}
                                     `}
                                    title={`Short ${idx + 1}: ${frame.inTime}s - ${frame.exitTime}s`}>
                                    <span className="font-bold">#{idx + 1}</span>
                                </div>
                            )
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
                        className="w-full"
                    />
                </div>

                <audio
                    ref={audioRef}
                    src={narrationUrl}
                    onTimeUpdate={handleTimeUpdate}
                    onLoadedMetadata={handleLoadedMetadata}
                    onEnded={() => setIsPlaying(false)}
                />
            </div>
        </LayoutContainer>
    );
}
