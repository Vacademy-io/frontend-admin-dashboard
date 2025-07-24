/* eslint-disable @typescript-eslint/no-unused-vars */
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
            <div className="ai-course-builder-container flex size-full flex-col overflow-hidden">
                <div className="flex size-full items-stretch justify-center bg-gradient-to-br from-gray-50 to-gray-100">
                    <div className="mx-auto size-full max-w-6xl p-4">
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
        );
    }

    // Full three-column layout after chat has started
    return (
        <div className="ai-course-builder-container flex size-full flex-col overflow-hidden">
            <ThreeColumnLayout
                leftPane={
                    <CourseExplorer
                        data={courseData}
                        setData={setCourseData}
                        selectedItem={selectedItem}
                        onItemSelect={(item) => setSelectedItem(item)}
                    />
                }
                middlePane={<DetailView selectedItem={detailSelectedItem} />}
                rightPane={
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
                }
            />
        </div>
    );
};

export default CoursePage;
