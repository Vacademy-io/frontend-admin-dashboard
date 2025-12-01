export type SlideType =
    | 'objectives'
    | 'topic'
    | 'quiz'
    | 'homework'
    | 'solution'
    | 'doc'
    | 'pdf'
    | 'video'
    | 'image'
    | 'jupyter'
    | 'code-editor'
    | 'scratch'
    | 'video-jupyter'
    | 'video-code-editor'
    | 'video-scratch'
    | 'assignment';

export interface QuizQuestion {
    question: string;
    options: string[];
    correctAnswerIndex?: number;
    explanation?: string;
}

export interface SlideGeneration {
    id: string;
    sessionId: string;
    sessionTitle: string;
    slideTitle: string;
    slideType: SlideType;
    status: 'pending' | 'generating' | 'completed';
    progress: number;
    content?: string; // Generated content for the slide
    regenerationCount?: number; // Number of times this slide has been regenerated
    topicIndex?: number; // Index of the topic slide
    prompt?: string; // AI generation prompt for the slide (from API)
}

export interface SessionProgress {
    sessionId: string;
    sessionTitle: string;
    slides: SlideGeneration[];
    progress: number;
}

export interface CircularProgressProps {
    value: number;
    size?: number;
    strokeWidth?: number;
    className?: string;
}

export interface SortableSessionItemProps {
    session: SessionProgress;
    sessionIndex: number;
    onEdit: (sessionId: string, newTitle: string) => void;
    onDelete: (sessionId: string) => void;
    onRegenerate: (sessionId: string) => void;
    editingSessionId: string | null;
    editSessionTitle: string;
    onStartEdit: (sessionId: string, currentTitle: string) => void;
    onCancelEdit: () => void;
    onSaveEdit: (sessionId: string) => void;
    setEditSessionTitle: (title: string) => void;
    children: React.ReactNode;
}

export interface SortableSlideItemProps {
    slide: SlideGeneration;
    onEdit: (slideId: string, newTitle: string) => void;
    onDelete: (slideId: string) => void;
    getSlideIcon: (type: SlideType) => React.ReactNode;
    onRegenerate?: (slideId: string, section?: 'video' | 'code') => void;
    onContentEdit?: (slideId: string, newContent: string) => void;
}
