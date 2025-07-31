/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-warning-comments */
import React, { useState, useMemo } from 'react';
import { applyModifications, Modification } from '../lib/applyModifications';
import ThreeColumnLayout from '../layout/ThreeColumnLayout';
import CourseExplorer from '../course/CourseExplorer';
import DetailView from '../course/DetailView';
import ChatView from '../chat/ChatView';
import type { Subject, Module, Chapter, Slide } from '../course/courseData';
// Initial course data is empty; will be generated dynamically by AI or Todo actions
import { aiResponseMemory, type TodoTask } from '../../../services/aiResponseMemory';

interface SelectedItem {
    type: 'course' | 'subject' | 'module' | 'chapter' | 'slide';
    id: string;
    data: Subject | Module | Chapter | Slide;
}

// Helper: shape DetailView expects (non-course)
type DetailViewItem = {
    type: 'subject' | 'module' | 'chapter' | 'slide';
    id: string;
    data: Subject | Module | Chapter | Slide;
};

// Import message types from ChatView
import type { Message as ChatMessage } from '../chat/ChatView';

interface UploadedFile {
    id: string;
    name: string;
    type: 'pdf' | 'video' | 'image';
    size: number;
    url: string;
    file: File;
}

interface CodePrompt {
    code: string;
    language: string;
    canEdit: boolean;
    canRun: boolean;
    description: string;
}

interface StructuredPrompt {
    type: 'code' | 'text';
    content: string;
    codePrompt?: CodePrompt;
}

const CoursePage = () => {
    const [selectedItem, setSelectedItem] = useState<SelectedItem | null>(null);
    const [hasStartedChat, setHasStartedChat] = useState(false);
    const [isFullScreen, setIsFullScreen] = useState(false);

    // Handle fullscreen API
    const toggleFullscreen = React.useCallback(async () => {
        try {
            if (!document.fullscreenElement) {
                // Enter fullscreen
                await document.documentElement.requestFullscreen();
                setIsFullScreen(true);
            } else {
                // Exit fullscreen
                await document.exitFullscreen();
                setIsFullScreen(false);
            }
        } catch (error) {
            console.error('Error toggling fullscreen:', error);
            // Fallback to component-level fullscreen
            setIsFullScreen(!isFullScreen);
        }
    }, [isFullScreen]);

    // Listen for fullscreen changes and ESC key
    React.useEffect(() => {
        const handleFullscreenChange = () => {
            setIsFullScreen(!!document.fullscreenElement);
        };

        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape' && document.fullscreenElement) {
                toggleFullscreen();
            }
        };

        document.addEventListener('fullscreenchange', handleFullscreenChange);
        document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
        document.addEventListener('mozfullscreenchange', handleFullscreenChange);
        document.addEventListener('MSFullscreenChange', handleFullscreenChange);
        document.addEventListener('keydown', handleKeyDown);

        return () => {
            document.removeEventListener('fullscreenchange', handleFullscreenChange);
            document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
            document.removeEventListener('mozfullscreenchange', handleFullscreenChange);
            document.removeEventListener('MSFullscreenChange', handleFullscreenChange);
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [toggleFullscreen]);

    // For middle pane DetailView
    const detailSelectedItem: DetailViewItem | null = useMemo(() => {
        if (selectedItem && selectedItem.type !== 'course') {
            return selectedItem as DetailViewItem;
        }
        return null;
    }, [selectedItem]);

    // Central course data state
    const [courseData, setCourseData] = useState<Subject[]>([]);

    // Auto-complete todos when course data changes
    React.useEffect(() => {
        if (courseData.length > 0) {
            aiResponseMemory.autoCompleteTodos(courseData);
        }
    }, [courseData]);

    // Update selectedItem when courseData changes to keep it in sync
    React.useEffect(() => {
        if (selectedItem && courseData.length > 0) {
            // Find the updated item in the new course data
            const findUpdatedItem = (
                data: Subject[],
                targetId: string,
                targetType: string
            ): Subject | Module | Chapter | Slide | null => {
                for (const subject of data) {
                    if (targetType === 'subject' && subject.id === targetId) {
                        return subject;
                    }
                    for (const module of subject.modules) {
                        if (targetType === 'module' && module.id === targetId) {
                            return module;
                        }
                        for (const chapter of module.chapters) {
                            if (targetType === 'chapter' && chapter.id === targetId) {
                                return chapter;
                            }
                            for (const slide of chapter.slides) {
                                if (targetType === 'slide' && slide.id === targetId) {
                                    return slide;
                                }
                            }
                        }
                    }
                }
                return null;
            };

            const updatedData = findUpdatedItem(courseData, selectedItem.id, selectedItem.type);
            if (updatedData) {
                setSelectedItem({
                    ...selectedItem,
                    data: updatedData,
                });
                console.log('🔄 Updated selectedItem with new data:', {
                    type: selectedItem.type,
                    id: selectedItem.id,
                    hasVideoSlide:
                        selectedItem.type === 'slide'
                            ? !!(updatedData as Slide).video_slide
                            : false,
                });
            }
        }
    }, [courseData, selectedItem]);

    // Task list state (derived from AI todos/modifications)
    interface Task {
        id: string;
        heading: string;
        path?: string;
        completed: boolean;
    }
    const [tasks, setTasks] = useState<Task[]>([]);

    // Shared chat state between both ChatView instances
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    // Handler for when user sends first prompt
    const handleChatStart = () => {
        setHasStartedChat(true);
    };

    // Handler when ChatView returns structural modifications
    const handleModifications = (mods: Modification[]) => {
        setCourseData((prev) => applyModifications(prev, mods));

        // Mark tasks completed if their path matches any modification
        setTasks((prev) => {
            const existingPaths = new Set(prev.map((t) => t.path));
            const newTasks: Task[] = mods
                .filter((m) => m.node?.path && !existingPaths.has(m.node.path))
                .map((m) => ({
                    id: `${Date.now()}-${m.node.path}`,
                    heading: `${m.targetType}: ${m.node?.name ?? ''}`,
                    path: m.node.path,
                    completed: true, // because modification already applied
                }));

            return [
                ...prev.map((t) =>
                    mods.some((m) => m.node?.path === t.path) ? { ...t, completed: true } : t
                ),
                ...newTasks,
            ];
        });
    };

    const handleTodos = (todos: TodoTask[]) => {
        if (!Array.isArray(todos)) return;
        const mapped: Task[] = todos.map((t, idx) => ({
            id: `${Date.now()}-todo-${idx}`,
            heading: t.title,
            path: t.path,
            completed: false,
        }));
        setTasks((prev) => [...prev, ...mapped]);
    };

    // Handle todo task clicks
    const handleTaskClick = (task: TodoTask) => {
        console.log('Task clicked:', task);
        // TODO: Implement task-specific actions (e.g., focus on specific course section)
    };

    // Handle course generation automation
    const handleCourseGeneration = () => {
        console.log('Starting automated course generation...');
        // TODO: Implement automated course generation based on todos

        // For now, auto-complete todos based on current course data
        aiResponseMemory.autoCompleteTodos(courseData);
    };

    // Initial full-screen chat view
    if (!hasStartedChat) {
        return (
            <div
                className={`ai-course-builder-container ${isFullScreen ? 'fixed inset-0 z-[9999]' : 'absolute inset-0'} flex flex-col overflow-hidden bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50`}
            >
                {/* Fullscreen Toggle Button for initial view */}
                <button
                    onClick={toggleFullscreen}
                    className={`absolute right-4 top-4 z-[60] flex items-center gap-1 rounded-md px-3 py-1.5 text-xs font-medium shadow-lg backdrop-blur-sm transition-colors ${
                        isFullScreen
                            ? 'bg-red-500/90 text-white hover:bg-red-600'
                            : 'bg-white/90 text-slate-700 hover:bg-white'
                    }`}
                    title={isFullScreen ? 'Exit Fullscreen (ESC)' : 'Enter Fullscreen'}
                >
                    {isFullScreen ? (
                        <>
                            <svg
                                className="size-3"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M6 18L18 6M6 6l12 12"
                                />
                            </svg>
                            Exit
                        </>
                    ) : (
                        <>
                            <svg
                                className="size-3"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"
                                />
                            </svg>
                            Fullscreen
                        </>
                    )}
                </button>

                <div
                    className={`flex size-full items-center justify-center ${isFullScreen ? 'p-0' : 'p-2'}`}
                >
                    <div className={`w-full ${isFullScreen ? 'h-full max-w-none' : 'max-w-5xl'}`}>
                        <div
                            className={`${isFullScreen ? 'h-full rounded-none border-0 p-1' : 'rounded-xl border border-slate-200/60 p-3'} bg-white/80 shadow-lg backdrop-blur-sm`}
                        >
                            {!isFullScreen && (
                                <div className="initial-header mb-2 text-center">
                                    <h1 className="initial-title text-xl font-semibold text-slate-800">
                                        AI Course Builder
                                    </h1>
                                    <p className="initial-subtitle text-xs text-slate-600">
                                        Start building your course with AI assistance
                                    </p>
                                </div>
                            )}
                            <ChatView
                                onChatStart={handleChatStart}
                                isFullScreen={true}
                                messages={messages}
                                setMessages={setMessages}
                                isLoading={isLoading}
                                setIsLoading={setIsLoading}
                                onModifications={handleModifications}
                                onTodos={handleTodos}
                                tasks={tasks}
                                onTaskClick={handleTaskClick}
                                onCourseGeneration={handleCourseGeneration}
                            />
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Full three-column layout after chat has started
    return (
        <div
            className={`ai-course-builder-container ${isFullScreen ? 'fixed inset-0 z-[9999]' : 'absolute inset-0'} flex flex-col overflow-hidden bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50`}
        >
            {/* Compact Header - Hidden in fullscreen mode - Vertically Responsive */}
            {!isFullScreen && (
                <div className="header-responsive flex shrink-0 items-center justify-between border-b border-slate-200/60 bg-white/80 px-2 py-1 backdrop-blur-sm">
                    <div>
                        <h1 className="header-title text-base font-semibold text-slate-800">
                            AI Course Builder
                        </h1>
                        <p className="header-subtitle text-xs text-slate-600">Workspace View</p>
                    </div>
                    <button
                        onClick={toggleFullscreen}
                        className="flex items-center gap-1 rounded-md bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-200"
                        title="Enter Fullscreen"
                    >
                        <svg
                            className="size-3"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"
                            />
                        </svg>
                        Fullscreen
                    </button>
                </div>
            )}

            {/* Fullscreen Toggle Button - Shown in fullscreen mode */}
            {isFullScreen && (
                <button
                    onClick={toggleFullscreen}
                    className="absolute right-4 top-4 z-[60] flex items-center gap-1 rounded-md bg-red-500/90 px-3 py-1.5 text-xs font-medium text-white shadow-lg backdrop-blur-sm transition-colors hover:bg-red-600"
                    title="Exit Fullscreen (ESC)"
                >
                    <svg className="size-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M6 18L18 6M6 6l12 12"
                        />
                    </svg>
                    Exit
                </button>
            )}

            {/* Edge-to-Edge Main Content */}
            <div className="flex-1 overflow-hidden">
                <ThreeColumnLayout
                    isFullScreen={isFullScreen}
                    leftPane={
                        <div
                            className={`h-full ${!isFullScreen ? 'border-r border-slate-200/50 bg-white/40' : ''}`}
                        >
                            <CourseExplorer
                                data={courseData}
                                setData={setCourseData}
                                selectedItem={selectedItem}
                                onItemSelect={(item) => setSelectedItem(item)}
                                onModifications={handleModifications}
                            />
                        </div>
                    }
                    middlePane={
                        <div
                            className={`h-full ${!isFullScreen ? 'border-r border-slate-200/50 bg-white/40' : ''}`}
                        >
                            <DetailView
                                selectedItem={detailSelectedItem}
                                onModifications={handleModifications}
                            />
                        </div>
                    }
                    rightPane={
                        <div className={`h-full ${!isFullScreen ? 'bg-white/40' : ''}`}>
                            <ChatView
                                onChatStart={handleChatStart}
                                isFullScreen={false}
                                messages={messages}
                                setMessages={setMessages}
                                isLoading={isLoading}
                                setIsLoading={setIsLoading}
                                onModifications={handleModifications}
                                onTodos={handleTodos}
                                tasks={tasks}
                                onTaskClick={handleTaskClick}
                                onCourseGeneration={handleCourseGeneration}
                            />
                        </div>
                    }
                />
            </div>
        </div>
    );
};

export default CoursePage;
