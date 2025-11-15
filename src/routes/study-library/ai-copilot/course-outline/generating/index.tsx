import { LayoutContainer } from '@/components/common/layout-container/layout-container';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { Helmet } from 'react-helmet';
import { useState, useEffect, useMemo, useRef } from 'react';
import { MyButton } from '@/components/design-system/button';
import {
    ArrowLeft,
    RefreshCw,
    Eye,
    Trash2,
    FileText,
    Video,
    Code,
    FileQuestion,
    ClipboardList,
    FileCode,
    CheckCircle,
    Loader2,
    ChevronDown,
    ChevronUp,
    Layers,
    File,
    Image as ImageIcon,
    Notebook,
    Terminal,
    Puzzle,
    GripVertical,
    Edit2,
    X,
    Play,
    Settings,
    Sun,
    Copy,
    Download,
    Pencil,
    Check,
    ChevronLeft,
    ChevronRight,
    Plus,
} from 'lucide-react';
import { motion } from 'framer-motion';
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from '@/components/ui/accordion';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { TipTapEditor } from '@/components/tiptap/TipTapEditor';
import Editor from '@monaco-editor/react';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { TagInput } from '@/components/ui/tag-input';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator,
    DropdownMenuCheckboxItem,
} from '@/components/ui/dropdown-menu';
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragEndEvent,
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    useSortable,
    verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

// Circular Progress Component
interface CircularProgressProps {
    value: number;
    size?: number;
    strokeWidth?: number;
    className?: string;
}

const CircularProgress = ({ value, size = 24, strokeWidth = 3, className = '' }: CircularProgressProps) => {
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const offset = circumference - (value / 100) * circumference;

    return (
        <div className={`relative inline-flex items-center justify-center ${className}`}>
            <svg width={size} height={size} className="transform -rotate-90">
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    stroke="currentColor"
                    strokeWidth={strokeWidth}
                    fill="none"
                    className="text-neutral-200"
                />
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    stroke="currentColor"
                    strokeWidth={strokeWidth}
                    fill="none"
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                    strokeLinecap="round"
                    className="text-indigo-600 transition-all duration-300"
                />
            </svg>
            {value < 100 && (
                <span className="absolute text-[10px] font-semibold text-indigo-600">
                    {Math.round(value)}%
                </span>
            )}
        </div>
    );
};

export const Route = createFileRoute('/study-library/ai-copilot/course-outline/generating/')({
    component: RouteComponent,
});

type SlideType =
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

interface QuizQuestion {
    question: string;
    options: string[];
    correctAnswerIndex?: number;
    explanation?: string;
}

const DEFAULT_QUIZ_QUESTIONS: QuizQuestion[] = [
    {
        question: 'What is the primary purpose of machine learning?',
        options: [
            'To create databases',
            'To enable computers to learn from data',
            'To design user interfaces',
            'To manage network security',
        ],
        correctAnswerIndex: 1,
    },
    {
        question: 'Which ensemble method combines multiple weak learners sequentially?',
        options: ['Bagging', 'Boosting', 'Stacking', 'Random Forest'],
        correctAnswerIndex: 1,
    },
    {
        question: 'What does PCA stand for in dimensionality reduction?',
        options: [
            'Principal Component Analysis',
            'Primary Correlation Assessment',
            'Progressive Component Algorithm',
            'Practical Classification Approach',
        ],
        correctAnswerIndex: 0,
    },
];

const DEFAULT_SELECTED_ANSWERS: Record<number, string> = DEFAULT_QUIZ_QUESTIONS.reduce(
    (acc, question, index) => {
        if (question.correctAnswerIndex !== undefined) {
            acc[index] = question.correctAnswerIndex.toString();
        }
        return acc;
    },
    {} as Record<number, string>
);

const DEFAULT_SOLUTION_CODE = `// Sample solution implementation
function solveHomeworkProblem(input) {
    // Replace this with the real solution logic
    const processed = input.map((value) => value * 2);
    return processed;
}

const sampleInput = [1, 2, 3, 4];
const output = solveHomeworkProblem(sampleInput);

console.log('Input:', sampleInput);
console.log('Output:', output);`;

interface SlideGeneration {
    id: string;
    sessionId: string;
    sessionTitle: string;
    slideTitle: string;
    slideType: SlideType;
    status: 'pending' | 'generating' | 'completed';
    progress: number;
    content?: string; // Generated content for the slide
}

interface SessionProgress {
    sessionId: string;
    sessionTitle: string;
    slides: SlideGeneration[];
    progress: number;
}

const extractTopicTitlesFromSlides = (slides: SlideGeneration[]): string[] => {
    return slides.reduce<string[]>((acc, slide) => {
        const isTopicSlide = slide.slideType === 'topic' || slide.slideTitle?.startsWith('Topic');
        if (!isTopicSlide) {
            return acc;
        }

        const match = slide.slideTitle?.match(/Topic \d+: (.+)/);
        const topicTitle = match?.[1]?.trim() ?? slide.slideTitle?.trim();
        if (topicTitle) {
            acc.push(topicTitle);
        }
        return acc;
    }, []);
};

// Sortable Session Item Component
interface SortableSessionItemProps {
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

const SortableSessionItem = ({
    session,
    sessionIndex,
    onEdit,
    onDelete,
    onRegenerate,
    editingSessionId,
    editSessionTitle,
    onStartEdit,
    onCancelEdit,
    onSaveEdit,
    setEditSessionTitle,
    children,
}: SortableSessionItemProps) => {
    const isEditing = editingSessionId === session.sessionId;
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: session.sessionId });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
    };

    const handleSaveEdit = () => {
        if (editSessionTitle.trim()) {
            onSaveEdit(session.sessionId);
        }
    };

    const completedCount = session.slides.filter((s) => s.status === 'completed').length;

    return (
        <div ref={setNodeRef} style={style}>
            <AccordionItem
                value={session.sessionId}
                className="border-b border-neutral-200 last:border-b-0"
            >
                <AccordionTrigger className="group py-4 text-left hover:no-underline [&>svg]:hidden">
                    <div className="flex items-center justify-between w-full pr-4">
                        <div className="flex items-center gap-2 flex-1">
                            <button
                                {...attributes}
                                {...listeners}
                                className="cursor-grab active:cursor-grabbing text-neutral-400 hover:text-neutral-600 opacity-0 group-hover:opacity-100 transition-opacity"
                                onClick={(e) => e.stopPropagation()}
                            >
                                <GripVertical className="h-4 w-4" />
                            </button>
                            {isEditing ? (
                                <Input
                                    value={editSessionTitle}
                                    onChange={(e) => setEditSessionTitle(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') handleSaveEdit();
                                        if (e.key === 'Escape') onCancelEdit();
                                    }}
                                    onClick={(e) => e.stopPropagation()}
                                    className="h-7 text-sm flex-1"
                                    autoFocus
                                />
                            ) : (
                                <h3 className="text-base font-semibold text-neutral-900">
                                    Session {sessionIndex + 1}: {session.sessionTitle}
                                </h3>
                            )}
                        </div>
                        <div className="flex items-center gap-4">
                            {!isEditing && (
                                <div className="flex items-center gap-1">
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onRegenerate(session.sessionId);
                                        }}
                                        className="rounded p-1 text-xs text-indigo-600 hover:bg-indigo-50 opacity-0 group-hover:opacity-100 transition-opacity"
                                        title="Regenerate"
                                    >
                                        <RefreshCw className="h-3.5 w-3.5" />
                                    </button>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onStartEdit(session.sessionId, session.sessionTitle);
                                        }}
                                        className="rounded p-1 text-xs text-indigo-600 hover:bg-indigo-50 opacity-0 group-hover:opacity-100 transition-opacity"
                                        title="Edit"
                                    >
                                        <Edit2 className="h-3.5 w-3.5" />
                                    </button>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onDelete(session.sessionId);
                                        }}
                                        className="rounded p-1 text-xs text-red-600 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-opacity"
                                        title="Delete"
                                    >
                                        <Trash2 className="h-3.5 w-3.5" />
                                    </button>
                                </div>
                            )}
                            {isEditing && (
                                <div className="flex items-center gap-1">
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleSaveEdit();
                                        }}
                                        className="rounded p-1 text-xs text-indigo-600 hover:bg-indigo-50"
                                        title="Save"
                                    >
                                        <CheckCircle className="h-3.5 w-3.5" />
                                    </button>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onCancelEdit();
                                        }}
                                        className="rounded p-1 text-xs text-neutral-600 hover:bg-neutral-100"
                                        title="Cancel"
                                    >
                                        <X className="h-3.5 w-3.5" />
                                    </button>
                                </div>
                            )}
                            <div className="text-xs text-neutral-500">
                                {completedCount}/{session.slides.length} slides
                            </div>
                            {session.progress < 100 && (
                                <CircularProgress value={session.progress} size={32} strokeWidth={3} />
                            )}
                            {session.progress === 100 && (
                                <CheckCircle className="h-6 w-6 text-green-600" />
                            )}
                        </div>
                    </div>
                </AccordionTrigger>
                {children}
            </AccordionItem>
        </div>
    );
};

// Sortable Slide Item Component
interface SortableSlideItemProps {
    slide: SlideGeneration;
    onEdit: (slideId: string, newTitle: string) => void;
    onDelete: (slideId: string) => void;
    getSlideIcon: (type: SlideType) => React.ReactNode;
    onRegenerate?: (slideId: string) => void;
    onView?: (slideId: string) => void;
}

const SortableSlideItem = ({ slide, onEdit, onDelete, getSlideIcon, onRegenerate, onView }: SortableSlideItemProps) => {
    const [isEditing, setIsEditing] = useState(false);
    const [editValue, setEditValue] = useState(slide.slideTitle);

    useEffect(() => {
        setEditValue(slide.slideTitle);
    }, [slide.slideTitle]);

    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: slide.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
    };

    const handleSaveEdit = () => {
        if (editValue.trim()) {
            onEdit(slide.id, editValue.trim());
            setIsEditing(false);
        }
    };

    const handleCancelEdit = () => {
        setEditValue(slide.slideTitle);
        setIsEditing(false);
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            className="group flex items-center gap-2 rounded-md border border-transparent bg-white p-2 hover:border-neutral-200 hover:bg-neutral-50"
        >
            <button
                {...attributes}
                {...listeners}
                className="cursor-grab active:cursor-grabbing text-neutral-400 hover:text-neutral-600 opacity-0 group-hover:opacity-100 transition-opacity"
            >
                <GripVertical className="h-4 w-4" />
            </button>

            <div className="flex items-center gap-2 flex-1">
                {getSlideIcon(slide.slideType)}
                {isEditing ? (
                    <Input
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') handleSaveEdit();
                            if (e.key === 'Escape') handleCancelEdit();
                        }}
                        className="h-7 text-sm flex-1"
                        autoFocus
                    />
                ) : (
                    <span className="text-sm text-neutral-700 flex-1">{slide.slideTitle}</span>
                )}
            </div>

            <div className="flex items-center gap-3">
                {/* Edit and Delete buttons */}
                {isEditing ? (
                    <>
                        <button
                            onClick={handleSaveEdit}
                            className="rounded p-1 text-xs text-indigo-600 hover:bg-indigo-50"
                            title="Save"
                        >
                            <CheckCircle className="h-3.5 w-3.5" />
                        </button>
                        <button
                            onClick={handleCancelEdit}
                            className="rounded p-1 text-xs text-neutral-600 hover:bg-neutral-100"
                            title="Cancel"
                        >
                            <X className="h-3.5 w-3.5" />
                        </button>
                    </>
                ) : (
                    <>
                        {slide.status === 'completed' && onRegenerate && onView && (
                            <div className="flex items-center gap-1">
                                <button
                                    onClick={() => onRegenerate(slide.id)}
                                    className="rounded p-1 text-xs text-indigo-600 hover:bg-indigo-50 opacity-0 group-hover:opacity-100 transition-opacity"
                                    title="Regenerate"
                                >
                                    <RefreshCw className="h-3.5 w-3.5" />
                                </button>
                                <button
                                    onClick={() => onView(slide.id)}
                                    className="rounded p-1 text-xs text-indigo-600 hover:bg-indigo-50 opacity-0 group-hover:opacity-100 transition-opacity"
                                    title="View"
                                >
                                    <Eye className="h-3.5 w-3.5" />
                                </button>
                            </div>
                        )}
                        <button
                            onClick={() => setIsEditing(true)}
                            className="rounded p-1 text-xs text-indigo-600 hover:bg-indigo-50 opacity-0 group-hover:opacity-100 transition-opacity"
                            title="Edit"
                        >
                            <Edit2 className="h-3.5 w-3.5" />
                        </button>
                        <button
                            onClick={() => onDelete(slide.id)}
                            className="rounded p-1 text-xs text-red-600 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-opacity"
                            title="Delete"
                        >
                            <Trash2 className="h-3.5 w-3.5" />
                        </button>
                    </>
                )}

                {/* Slide Progress - at extreme right */}
                {slide.status === 'generating' && slide.progress < 100 && (
                    <CircularProgress value={slide.progress} size={24} strokeWidth={2.5} />
                )}

                {slide.status === 'completed' && (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                )}

                {slide.status === 'pending' && (
                    <div className="flex items-center gap-2 text-xs text-neutral-400">
                        <Loader2 className="h-4 w-4 animate-spin" />
                    </div>
                )}
            </div>
        </div>
    );
};

function RouteComponent() {
    const navigate = useNavigate();
    const [slides, setSlides] = useState<SlideGeneration[]>([]);
    const [isGenerating, setIsGenerating] = useState(true);
    const [expandedSessions, setExpandedSessions] = useState<Set<string>>(new Set());
    const [editingSessionId, setEditingSessionId] = useState<string | null>(null);
    const [editSessionTitle, setEditSessionTitle] = useState<string>('');
    const [viewingSlide, setViewingSlide] = useState<SlideGeneration | null>(null);
    const [documentContent, setDocumentContent] = useState<string>('');
    const [codeContent, setCodeContent] = useState<string>('');
    const [homeworkQuestion, setHomeworkQuestion] = useState<string>('');
    const [homeworkAnswer, setHomeworkAnswer] = useState<string>('');
    const [homeworkAnswerType, setHomeworkAnswerType] = useState<'text' | 'code'>('text');
    const [regenerateSlideDialogOpen, setRegenerateSlideDialogOpen] = useState(false);
    const [regeneratingSlideId, setRegeneratingSlideId] = useState<string | null>(null);
    const [regenerateSlidePrompt, setRegenerateSlidePrompt] = useState('');
    const regenerateSlidePromptTextareaRef = useRef<HTMLTextAreaElement>(null);
    const [regenerateSessionDialogOpen, setRegenerateSessionDialogOpen] = useState(false);
    const [regeneratingSessionId, setRegeneratingSessionId] = useState<string | null>(null);
    const [regenerateSessionPrompt, setRegenerateSessionPrompt] = useState('');
    const regenerateSessionPromptTextareaRef = useRef<HTMLTextAreaElement>(null);
    const [addSlideDialogOpen, setAddSlideDialogOpen] = useState(false);
    const [addingSlideToSessionId, setAddingSlideToSessionId] = useState<string | null>(null);
    const [addSlidePrompt, setAddSlidePrompt] = useState('');
    const [selectedAddSlideType, setSelectedAddSlideType] = useState<SlideType | null>(null);
    const addSlidePromptTextareaRef = useRef<HTMLTextAreaElement>(null);
    const [addSessionDialogOpen, setAddSessionDialogOpen] = useState(false);
    const [addSessionPrompt, setAddSessionPrompt] = useState('');
    const addSessionPromptTextareaRef = useRef<HTMLTextAreaElement>(null);
    const [addSessionLength, setAddSessionLength] = useState<string>('60');
    const [addCustomSessionLength, setAddCustomSessionLength] = useState<string>('');
    const [addIncludeDiagrams, setAddIncludeDiagrams] = useState(false);
    const [addIncludeCodeSnippets, setAddIncludeCodeSnippets] = useState(false);
    const [addIncludePracticeProblems, setAddIncludePracticeProblems] = useState(false);
    const [addIncludeQuizzes, setAddIncludeQuizzes] = useState(false);
    const [addIncludeHomework, setAddIncludeHomework] = useState(false);
    const [addIncludeSolutions, setAddIncludeSolutions] = useState(false);
    const [addSessionTopics, setAddSessionTopics] = useState<string[]>([]);
    const [addSessionNumberOfTopics, setAddSessionNumberOfTopics] = useState<string>('');
    const [regenerateSessionLength, setRegenerateSessionLength] = useState<string>('60');
    const [regenerateCustomSessionLength, setRegenerateCustomSessionLength] = useState<string>('');
    const [regenerateIncludeDiagrams, setRegenerateIncludeDiagrams] = useState(false);
    const [regenerateIncludeCodeSnippets, setRegenerateIncludeCodeSnippets] = useState(false);
    const [regenerateIncludePracticeProblems, setRegenerateIncludePracticeProblems] = useState(false);
    const [regenerateIncludeQuizzes, setRegenerateIncludeQuizzes] = useState(false);
    const [regenerateIncludeHomework, setRegenerateIncludeHomework] = useState(false);
    const [regenerateIncludeSolutions, setRegenerateIncludeSolutions] = useState(false);
    const [regenerateSessionTopics, setRegenerateSessionTopics] = useState<string[]>([]);
    const [regenerateSessionNumberOfTopics, setRegenerateSessionNumberOfTopics] = useState<string>('');
    const [codeEditorWidth, setCodeEditorWidth] = useState(50); // Percentage width for code editor
    const [isResizing, setIsResizing] = useState(false);
    const resizeContainerRef = useRef<HTMLDivElement>(null);
    const [isEditMode, setIsEditMode] = useState(true); // View/Edit mode toggle
    const [isDarkTheme, setIsDarkTheme] = useState(false); // Theme toggle
    const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>(DEFAULT_QUIZ_QUESTIONS);
    const [currentQuizQuestionIndex, setCurrentQuizQuestionIndex] = useState(0);
    const [selectedQuizAnswers, setSelectedQuizAnswers] = useState<Record<number, string>>(() => ({
        ...DEFAULT_SELECTED_ANSWERS,
    }));
    const currentQuizQuestion = quizQuestions[currentQuizQuestionIndex];

    // Drag and drop sensors
    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor)
    );

    // Calculate session progress
    const getSessionProgress = (sessionSlides: SlideGeneration[]): number => {
        if (sessionSlides.length === 0) return 0;
        const completedCount = sessionSlides.filter((s) => s.status === 'completed').length;
        const generatingSlide = sessionSlides.find((s) => s.status === 'generating');
        let totalProgress = completedCount * 100;
        if (generatingSlide) {
            totalProgress += generatingSlide.progress;
        }
        return Math.round(totalProgress / sessionSlides.length);
    };

    // Group slides by session
    const getSessionsWithProgress = (): SessionProgress[] => {
        const sessionMap = new Map<string, SlideGeneration[]>();
        slides.forEach((slide) => {
            if (!sessionMap.has(slide.sessionId)) {
                sessionMap.set(slide.sessionId, []);
            }
            sessionMap.get(slide.sessionId)!.push(slide);
        });

        return Array.from(sessionMap.entries()).map(([sessionId, sessionSlides]) => ({
            sessionId,
            sessionTitle: sessionSlides[0]?.sessionTitle || 'Unknown Session',
            slides: sessionSlides,
            progress: getSessionProgress(sessionSlides),
        }));
    };


    // Memoize sessions with progress
    const sessionsWithProgress = useMemo(() => getSessionsWithProgress(), [slides]);

    // Keep all sessions always expanded
    useEffect(() => {
        if (slides.length > 0) {
            setExpandedSessions(new Set(sessionsWithProgress.map((s) => s.sessionId)));
        }
    }, [slides.length, sessionsWithProgress]);

    // Set cursor to end of textarea when regenerate slide dialog opens
    useEffect(() => {
        if (regenerateSlideDialogOpen && regenerateSlidePromptTextareaRef.current) {
            const textarea = regenerateSlidePromptTextareaRef.current;
            setTimeout(() => {
                textarea.focus();
                const length = textarea.value.length;
                textarea.setSelectionRange(length, length);
            }, 0);
        }
    }, [regenerateSlideDialogOpen]);

    // Set cursor to end of textarea when regenerate session dialog opens
    useEffect(() => {
        if (regenerateSessionDialogOpen && regenerateSessionPromptTextareaRef.current) {
            const textarea = regenerateSessionPromptTextareaRef.current;
            setTimeout(() => {
                textarea.focus();
                const length = textarea.value.length;
                textarea.setSelectionRange(length, length);
            }, 0);
        }
    }, [regenerateSessionDialogOpen]);

    // Set cursor to end of textarea when add slide dialog opens
    useEffect(() => {
        if (addSlideDialogOpen && addSlidePromptTextareaRef.current) {
            const textarea = addSlidePromptTextareaRef.current;
            setTimeout(() => {
                textarea.focus();
                const length = textarea.value.length;
                textarea.setSelectionRange(length, length);
            }, 0);
        }
    }, [addSlideDialogOpen]);

    // Set cursor to end of textarea when add session dialog opens
    useEffect(() => {
        if (addSessionDialogOpen && addSessionPromptTextareaRef.current) {
            const textarea = addSessionPromptTextareaRef.current;
            setTimeout(() => {
                textarea.focus();
                const length = textarea.value.length;
                textarea.setSelectionRange(length, length);
            }, 0);
        }
    }, [addSessionDialogOpen]);

    // Check if all sessions are 100% completed
    const allSessionsCompleted = useMemo(() => {
        if (sessionsWithProgress.length === 0) return false;
        return sessionsWithProgress.every((session) => session.progress === 100);
    }, [sessionsWithProgress]);

    // Handle session drag end
    const handleSessionDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        if (!over || active.id === over.id) return;

        const oldIndex = sessionsWithProgress.findIndex((s) => s.sessionId === active.id);
        const newIndex = sessionsWithProgress.findIndex((s) => s.sessionId === over.id);

        if (oldIndex !== -1 && newIndex !== -1) {
            const reorderedSessions = arrayMove(sessionsWithProgress, oldIndex, newIndex);
            // Update slides order based on new session order
            const reorderedSlides: SlideGeneration[] = [];
            reorderedSessions.forEach((session) => {
                reorderedSlides.push(...session.slides);
            });
            setSlides(reorderedSlides);
        }
    };

    // Handle session edit
    const handleSessionEdit = (sessionId: string, newTitle: string) => {
        setSlides((prev) =>
            prev.map((slide) =>
                slide.sessionId === sessionId ? { ...slide, sessionTitle: newTitle } : slide
            )
        );
        setEditingSessionId(null);
        setEditSessionTitle('');
    };

    // Handle session delete
    const handleSessionDelete = (sessionId: string) => {
        setSlides((prev) => prev.filter((slide) => slide.sessionId !== sessionId));
    };

    // Start editing session
    const handleStartEdit = (sessionId: string, currentTitle: string) => {
        setEditingSessionId(sessionId);
        setEditSessionTitle(currentTitle);
    };

    // Cancel editing session
    const handleCancelEdit = () => {
        setEditingSessionId(null);
        setEditSessionTitle('');
    };

    // Save edited session
    const handleSaveEdit = (sessionId: string) => {
        if (editSessionTitle.trim()) {
            handleSessionEdit(sessionId, editSessionTitle.trim());
        }
    };

    // Helper function to generate slides from session data
    const generateSlidesFromSession = (
        sessionId: string,
        sessionTitle: string,
        learningObjectives: string[],
        topics: Array<{ title: string; duration: string }>,
        hasQuiz: boolean,
        hasHomework: boolean
    ): SlideGeneration[] => {
        const slides: SlideGeneration[] = [];

        // Learning Objectives
        if (learningObjectives.length > 0) {
            slides.push({
                id: `${sessionId}-objectives`,
                sessionId,
                sessionTitle,
                slideTitle: 'Learning objective',
                slideType: 'objectives',
                status: 'pending',
                progress: 0,
            });
        }

        // Topics
        topics.forEach((topic, index) => {
            slides.push({
                id: `${sessionId}-topic-${index}`,
                sessionId,
                sessionTitle,
                slideTitle: `Topic ${index + 1}: ${topic.title}`,
                slideType: 'topic',
                status: 'pending',
                progress: 0,
            });
        });

        // Quiz
        if (hasQuiz) {
            slides.push({
                id: `${sessionId}-quiz`,
                sessionId,
                sessionTitle,
                slideTitle: 'Wrap-Up Quiz',
                slideType: 'quiz',
                status: 'pending',
                progress: 0,
            });
        }

        // Homework
        if (hasHomework) {
            slides.push({
                id: `${sessionId}-homework`,
                sessionId,
                sessionTitle,
                slideTitle: 'Homework',
                slideType: 'homework',
                status: 'pending',
                progress: 0,
            });
        }

        // Solution
        if (hasHomework) {
            slides.push({
                id: `${sessionId}-solution`,
                sessionId,
                sessionTitle,
                slideTitle: 'Solution',
                slideType: 'solution',
                content: DEFAULT_SOLUTION_CODE,
                status: 'pending',
                progress: 0,
            });
        }

        return slides;
    };

    // Initialize slides from course outline (in real app, this would come from route params or state)
    useEffect(() => {
        // Generate all slides from all 8 sessions
        const allSlides: SlideGeneration[] = [];

        // Session 1: Advanced Supervised Learning
        allSlides.push(
            ...generateSlidesFromSession(
                '1',
                'Advanced Supervised Learning',
                ['Understand optimization techniques and hyperparameter tuning'],
                [
                    { title: 'Advanced Regression Techniques', duration: '10 min' },
                    { title: 'Gradient Boosting & XGBoost', duration: '12 min' },
                    { title: 'Model Evaluation Metrics', duration: '8 min' },
                ],
                true,
                true
            )
        );

        // Session 2: Ensemble Methods
        allSlides.push(
            ...generateSlidesFromSession(
                '2',
                'Ensemble Methods',
                ['Learn stacking, bagging, and boosting strategies'],
                [
                    { title: 'Random Forests Deep Dive', duration: '10 min' },
                    { title: 'Bagging vs. Boosting in Practice', duration: '12 min' },
                    { title: 'Hyperparameter Grid Search Hands-On', duration: '10 min' },
                ],
                true,
                true
            )
        );

        // Session 3: Unsupervised Learning & Clustering
        allSlides.push(
            ...generateSlidesFromSession(
                '3',
                'Unsupervised Learning & Clustering',
                ['Apply K-Means, Hierarchical, and DBSCAN clustering'],
                [
                    { title: 'Dimensionality Reduction (PCA)', duration: '15 min' },
                    { title: 'Cluster Evaluation Metrics', duration: '10 min' },
                    { title: 'Advanced Clustering Techniques', duration: '12 min' },
                ],
                true,
                true
            )
        );

        // Session 4: Neural Networks & Deep Learning
        allSlides.push(
            ...generateSlidesFromSession(
                '4',
                'Neural Networks & Deep Learning',
                ['Build and train dense neural networks'],
                [
                    { title: 'Backpropagation & Gradient Descent', duration: '15 min' },
                    { title: 'Using TensorFlow & PyTorch', duration: '18 min' },
                    { title: 'Regularization Techniques', duration: '12 min' },
                ],
                true,
                true
            )
        );

        // Session 5: CNNs and Computer Vision
        allSlides.push(
            ...generateSlidesFromSession(
                '5',
                'CNNs and Computer Vision',
                ['Understand convolutional layer architectures'],
                [
                    { title: 'Convolutional Layers', duration: '15 min' },
                    { title: 'Transfer Learning with Pre-trained Models', duration: '20 min' },
                    { title: 'Image Classification Project', duration: '25 min' },
                ],
                true,
                true
            )
        );

        // Session 6: NLP with Transformers
        allSlides.push(
            ...generateSlidesFromSession(
                '6',
                'NLP with Transformers',
                ['Master word embeddings and attention mechanisms'],
                [
                    { title: 'Word Embeddings & Attention', duration: '18 min' },
                    { title: 'Fine-tuning BERT', duration: '20 min' },
                    { title: 'Sentiment Analysis Case Study', duration: '22 min' },
                ],
                true,
                true
            )
        );

        // Session 7: Model Deployment
        allSlides.push(
            ...generateSlidesFromSession(
                '7',
                'Model Deployment',
                ['Export and optimize models for production'],
                [
                    { title: 'Exporting Models', duration: '12 min' },
                    { title: 'Using Flask/FastAPI', duration: '18 min' },
                    { title: 'Deploying to AWS / GCP', duration: '25 min' },
                ],
                true,
                true
            )
        );

        // Session 8: Capstone Project
        allSlides.push(
            ...generateSlidesFromSession(
                '8',
                'Capstone Project',
                ['Combine all learned skills to build an end-to-end ML project'],
                [
                    { title: 'Problem Statement & Dataset', duration: '20 min' },
                    { title: 'Model Development & Training', duration: '30 min' },
                    { title: 'Evaluation & Submission', duration: '15 min' },
                ],
                false,
                true
            )
        );

        setSlides(allSlides);

        // Start generation after slides are set
        let currentIndex = 0;
        const generateNextSlide = () => {
            if (currentIndex >= allSlides.length) {
                setIsGenerating(false);
                return;
            }

            // Update current slide to generating
            setSlides((prev) =>
                prev.map((slide, idx) =>
                    idx === currentIndex ? { ...slide, status: 'generating', progress: 0 } : slide
                )
            );

            // Simulate progress for current slide
            let progress = 0;
            const progressInterval = setInterval(() => {
                progress += Math.random() * 15;
                if (progress >= 100) {
                    progress = 100;
                    clearInterval(progressInterval);

                    // Mark as completed
                    setSlides((prev) =>
                        prev.map((slide, idx) =>
                            idx === currentIndex ? { ...slide, status: 'completed', progress: 100 } : slide
                        )
                    );

                    // Move to next slide
                    currentIndex++;
                    setTimeout(generateNextSlide, 500);
                } else {
                    setSlides((prev) =>
                        prev.map((slide, idx) =>
                            idx === currentIndex ? { ...slide, progress: Math.round(progress) } : slide
                        )
                    );
                }
            }, 200);
        };

        generateNextSlide();
    }, []);

    const handleRegenerate = (slideId: string) => {
        setRegeneratingSlideId(slideId);
        setRegenerateSlideDialogOpen(true);
    };

    const handleConfirmRegenerateSlide = () => {
        if (!regenerateSlidePrompt.trim() || !regeneratingSlideId) {
            return;
        }
        setRegenerateSlideDialogOpen(false);

        // Update slide to generating status
        setSlides((prev) =>
            prev.map((slide) =>
                slide.id === regeneratingSlideId ? { ...slide, status: 'generating', progress: 0 } : slide
            )
        );

        // TODO: Call API to regenerate slide based on the prompt
        // For now, simulate regeneration
        let progress = 0;
        const progressInterval = setInterval(() => {
            progress += Math.random() * 20;
            if (progress >= 100) {
                progress = 100;
                clearInterval(progressInterval);
                setSlides((prev) =>
                    prev.map((slide) =>
                        slide.id === regeneratingSlideId ? { ...slide, status: 'completed', progress: 100 } : slide
                    )
                );
                setRegenerateSlidePrompt('');
                setRegeneratingSlideId(null);
            } else {
                setSlides((prev) =>
                    prev.map((slide) =>
                        slide.id === regeneratingSlideId ? { ...slide, progress: Math.round(progress) } : slide
                    )
                );
            }
        }, 150);
    };

    const handleRegenerateSession = (sessionId: string) => {
        const session = sessionsWithProgress.find((s) => s.sessionId === sessionId);
        if (!session) return;

        setRegeneratingSessionId(sessionId);

        // Extract topics from slides (slides with type 'topic' or titles starting with "Topic")
        const topics = extractTopicTitlesFromSlides(session.slides);

        // Pre-fill prompt with a default based on session data
        const defaultPrompt = `Regenerate the session "${session.sessionTitle}"${topics.length > 0 ? ` with the following topics: ${topics.join(', ')}.` : '.'}`;
        setRegenerateSessionPrompt(defaultPrompt);

        // Default session length (we don't have duration info in SessionProgress)
        setRegenerateSessionLength('60');
        setRegenerateCustomSessionLength('');

        // Pre-fill session components based on slide types
        const hasQuiz = session.slides.some(s => s.slideType === 'quiz');
        const hasHomework = session.slides.some(s => s.slideType === 'homework');
        const hasSolution = session.slides.some(s => s.slideType === 'solution');

        // Check for code-related slides
        const hasCodeSlides = session.slides.some(s =>
            s.slideType === 'code-editor' ||
            s.slideType === 'video-code-editor' ||
            s.slideType === 'jupyter' ||
            s.slideType === 'video-jupyter'
        );

        setRegenerateIncludeDiagrams(false); // Not directly detectable from slides
        setRegenerateIncludeCodeSnippets(hasCodeSlides);
        setRegenerateIncludePracticeProblems(false); // Not directly detectable
        setRegenerateIncludeQuizzes(hasQuiz);
        setRegenerateIncludeHomework(hasHomework);
        setRegenerateIncludeSolutions(hasSolution || hasHomework);

        // Pre-fill topics from session slides
        setRegenerateSessionTopics(topics);

        // Pre-fill number of topics
        setRegenerateSessionNumberOfTopics(topics.length.toString());

        setRegenerateSessionDialogOpen(true);
    };

    const handleConfirmRegenerateSession = () => {
        if (!regenerateSessionPrompt.trim() || !regeneratingSessionId) {
            return;
        }
        setRegenerateSessionDialogOpen(false);

        // Update all slides in the session to generating status
        setSlides((prev) =>
            prev.map((slide) =>
                slide.sessionId === regeneratingSessionId
                    ? { ...slide, status: 'generating', progress: 0 }
                    : slide
            )
        );

        // TODO: Call API to regenerate session based on the prompt
        // For now, simulate regeneration
        const sessionSlides = slides.filter((s) => s.sessionId === regeneratingSessionId);
        let completedCount = 0;
        const totalSlides = sessionSlides.length;

        const progressInterval = setInterval(() => {
            completedCount += Math.random() * 2;
            if (completedCount >= totalSlides) {
                completedCount = totalSlides;
                clearInterval(progressInterval);
                setSlides((prev) =>
                    prev.map((slide) =>
                        slide.sessionId === regeneratingSessionId
                            ? { ...slide, status: 'completed', progress: 100 }
                            : slide
                    )
                );
                setRegenerateSessionPrompt('');
                setRegeneratingSessionId(null);
                setRegenerateSessionTopics([]);
                setRegenerateSessionNumberOfTopics('');
            } else {
                const progress = Math.round((completedCount / totalSlides) * 100);
                setSlides((prev) =>
                    prev.map((slide) => {
                        if (slide.sessionId === regeneratingSessionId) {
                            if (completedCount >= prev.filter((s) => s.sessionId === regeneratingSessionId).indexOf(slide) + 1) {
                                return { ...slide, status: 'completed', progress: 100 };
                            } else {
                                return { ...slide, status: 'generating', progress };
                            }
                        }
                        return slide;
                    })
                );
            }
        }, 200);
    };

    const handleRegenerateSessionLengthChange = (value: string) => {
        setRegenerateSessionLength(value);
        if (value !== 'custom') {
            setRegenerateCustomSessionLength('');
        }
    };

    const handleAddSlide = (sessionId: string) => {
        setAddingSlideToSessionId(sessionId);
        setSelectedAddSlideType(null);
        setAddSlidePrompt('');
        setAddSlideDialogOpen(true);
    };

    const handleSelectAddSlideType = (slideType: SlideType) => {
        setSelectedAddSlideType(slideType);
        // Set cursor to end of textarea when slide type is selected
        setTimeout(() => {
            if (addSlidePromptTextareaRef.current) {
                addSlidePromptTextareaRef.current.focus();
                const length = addSlidePromptTextareaRef.current.value.length;
                addSlidePromptTextareaRef.current.setSelectionRange(length, length);
            }
        }, 0);
    };

    const handleConfirmAddSlide = () => {
        if (!addSlidePrompt.trim() || !addingSlideToSessionId || !selectedAddSlideType) {
            return;
        }
        setAddSlideDialogOpen(false);

        const session = sessionsWithProgress.find((s) => s.sessionId === addingSlideToSessionId);
        if (!session) return;

        // Create new slide
        const newSlideId = `slide-${Date.now()}`;
        const newSlide: SlideGeneration = {
            id: newSlideId,
            sessionId: addingSlideToSessionId,
            sessionTitle: session.sessionTitle,
            slideTitle: 'New Slide',
            slideType: selectedAddSlideType,
            status: 'generating',
            progress: 0,
        };

        setSlides((prev) => [...prev, newSlide]);

        // TODO: Call API to generate slide based on the prompt
        // For now, simulate generation
        let progress = 0;
        const progressInterval = setInterval(() => {
            progress += Math.random() * 20;
            if (progress >= 100) {
                progress = 100;
                clearInterval(progressInterval);
                setSlides((prev) =>
                    prev.map((slide) =>
                        slide.id === newSlideId ? { ...slide, status: 'completed', progress: 100 } : slide
                    )
                );
                setAddSlidePrompt('');
                setAddingSlideToSessionId(null);
                setSelectedAddSlideType(null);
            } else {
                setSlides((prev) =>
                    prev.map((slide) =>
                        slide.id === newSlideId ? { ...slide, progress: Math.round(progress) } : slide
                    )
                );
            }
        }, 150);
    };

    const handleAddSession = () => {
        // Reset form fields
        setAddSessionPrompt('');
        setAddSessionLength('60');
        setAddCustomSessionLength('');
        setAddIncludeDiagrams(false);
        setAddIncludeCodeSnippets(false);
        setAddIncludePracticeProblems(false);
        setAddIncludeQuizzes(false);
        setAddIncludeHomework(false);
        setAddIncludeSolutions(false);
        setAddSessionTopics([]);
        setAddSessionNumberOfTopics('');
        setAddSessionDialogOpen(true);
    };

    const handleAddSessionLengthChange = (value: string) => {
        setAddSessionLength(value);
        if (value !== 'custom') {
            setAddCustomSessionLength('');
        }
    };

    const handleConfirmAddSession = () => {
        if (!addSessionPrompt.trim()) {
            return;
        }
        setAddSessionDialogOpen(false);

        // Create new session
        const newSessionId = `session-${Date.now()}`;
        const newSessionTitle = 'New Session';

        // Create initial slides for the new session
        const newSlides: SlideGeneration[] = [
            {
                id: `${newSessionId}-objectives`,
                sessionId: newSessionId,
                sessionTitle: newSessionTitle,
                slideTitle: 'Learning Objectives',
                slideType: 'objectives',
                status: 'generating',
                progress: 0,
            },
        ];

        setSlides((prev) => [...prev, ...newSlides]);

        // TODO: Call API to generate session based on the prompt
        // For now, simulate generation
        let progress = 0;
        const progressInterval = setInterval(() => {
            progress += Math.random() * 15;
            if (progress >= 100) {
                progress = 100;
                clearInterval(progressInterval);
                setSlides((prev) =>
                    prev.map((slide) =>
                        slide.sessionId === newSessionId
                            ? { ...slide, status: 'completed', progress: 100 }
                            : slide
                    )
                );
                setAddSessionPrompt('');
                setAddSessionTopics([]);
            } else {
                setSlides((prev) =>
                    prev.map((slide) =>
                        slide.sessionId === newSessionId
                            ? { ...slide, progress: Math.round(progress) }
                            : slide
                    )
                );
            }
        }, 200);
    };

    const handleView = (slideId: string) => {
        const slide = slides.find((s) => s.id === slideId);
        if (slide) {
            setViewingSlide(slide);
            // Initialize content based on slide type
            // Use stored content if available, otherwise use default/sample content
            if (slide.slideType === 'objectives' || slide.slideType === 'doc') {
                // For learning objectives, use stored content or show sample generated content
                if (slide.content) {
                    setDocumentContent(slide.content);
                } else {
                    // Sample generated content - in real app, this would come from AI generation
                    setDocumentContent(`<h2>Learning Objectives</h2>
<ul>
<li>Understand the key concepts and principles covered in this session</li>
<li>Apply the learned techniques to solve practical problems</li>
<li>Demonstrate proficiency in the core topics discussed</li>
</ul>
<p>These objectives are designed to guide your learning journey and help you achieve mastery of the subject matter.</p>`);
                }
            } else if (slide.slideType === 'topic' || slide.slideType === 'video-code-editor' || slide.slideType === 'video-jupyter' || slide.slideType === 'video-scratch') {
                setCodeContent(slide.content || '// Your code here\nconsole.log("Hello, World!");');
            } else if (
                slide.slideType === 'code-editor' ||
                slide.slideType === 'jupyter' ||
                slide.slideType === 'scratch' ||
                slide.slideType === 'solution'
            ) {
                if (slide.slideType === 'solution') {
                    setCodeContent(slide.content || DEFAULT_SOLUTION_CODE);
                } else {
                    setCodeContent(slide.content || '// Your code here\nconsole.log("Hello, World!");');
                }
            } else if (slide.slideType === 'homework' || slide.slideType === 'assignment') {
                setHomeworkQuestion('What is the main concept covered in this session?');
                setHomeworkAnswer(slide.content || '');
                setHomeworkAnswerType('text');
            } else if (slide.slideType === 'quiz') {
                if (slide.content) {
                    try {
                        const parsed = JSON.parse(slide.content);
                        if (Array.isArray(parsed.questions)) {
                            setQuizQuestions(parsed.questions);
                            setSelectedQuizAnswers(
                                parsed.answers && Object.keys(parsed.answers).length > 0
                                    ? parsed.answers
                                    : { ...DEFAULT_SELECTED_ANSWERS }
                            );
                        } else if (Array.isArray(parsed)) {
                            setQuizQuestions(parsed);
                            setSelectedQuizAnswers({ ...DEFAULT_SELECTED_ANSWERS });
                        } else {
                            setQuizQuestions(DEFAULT_QUIZ_QUESTIONS);
                            setSelectedQuizAnswers(DEFAULT_SELECTED_ANSWERS);
                        }
                    } catch (error) {
                        console.error('Failed to parse quiz content:', error);
                        setQuizQuestions(DEFAULT_QUIZ_QUESTIONS);
                        setSelectedQuizAnswers({ ...DEFAULT_SELECTED_ANSWERS });
                    }
                } else {
                    setQuizQuestions(DEFAULT_QUIZ_QUESTIONS);
                    setSelectedQuizAnswers({ ...DEFAULT_SELECTED_ANSWERS });
                }
                setCurrentQuizQuestionIndex(0);
            }
        }
    };

    const handleDelete = (slideId: string) => {
        setSlides((prev) => prev.filter((slide) => slide.id !== slideId));
    };

    const handleSaveSlideContent = () => {
        if (!viewingSlide) return;

        // Save content based on slide type
        setSlides((prev) =>
            prev.map((slide) => {
                if (slide.id === viewingSlide.id) {
                    let contentToSave = '';
                    if (slide.slideType === 'objectives' || slide.slideType === 'doc') {
                        contentToSave = documentContent;
                    } else if (slide.slideType === 'topic' || slide.slideType === 'video-code-editor' || slide.slideType === 'video-jupyter' || slide.slideType === 'video-scratch') {
                        contentToSave = codeContent;
                    } else if (
                        slide.slideType === 'code-editor' ||
                        slide.slideType === 'jupyter' ||
                        slide.slideType === 'scratch' ||
                        slide.slideType === 'solution'
                    ) {
                        contentToSave = codeContent;
                    } else if (slide.slideType === 'homework' || slide.slideType === 'assignment') {
                        contentToSave = homeworkAnswer;
                    } else if (slide.slideType === 'quiz') {
                        contentToSave = JSON.stringify({
                            questions: quizQuestions,
                            answers: selectedQuizAnswers,
                        });
                    }
                    return { ...slide, content: contentToSave };
                }
                return slide;
            })
        );
        // TODO: Call API to save the content
    };

    const handleQuizAnswerChange = (value: string) => {
        setSelectedQuizAnswers((prev) => ({
            ...prev,
            [currentQuizQuestionIndex]: value,
        }));
    };

    const handleQuizNavigation = (direction: 'prev' | 'next') => {
        if (direction === 'prev' && currentQuizQuestionIndex > 0) {
            setCurrentQuizQuestionIndex((prev) => prev - 1);
        } else if (direction === 'next' && currentQuizQuestionIndex < quizQuestions.length - 1) {
            setCurrentQuizQuestionIndex((prev) => prev + 1);
        }
    };

    // Handle resize start
    const handleResizeStart = (e: React.MouseEvent) => {
        e.preventDefault();
        setIsResizing(true);
    };

    // Handle resize move
    useEffect(() => {
        const handleResizeMove = (e: MouseEvent) => {
            if (!isResizing || !resizeContainerRef.current) return;

            const container = resizeContainerRef.current;
            const containerRect = container.getBoundingClientRect();
            const newWidth = ((e.clientX - containerRect.left) / containerRect.width) * 100;

            // Constrain between 20% and 80%
            const constrainedWidth = Math.max(20, Math.min(80, newWidth));
            setCodeEditorWidth(constrainedWidth);
        };

        const handleResizeEnd = () => {
            setIsResizing(false);
        };

        if (isResizing) {
            document.addEventListener('mousemove', handleResizeMove);
            document.addEventListener('mouseup', handleResizeEnd);
            document.body.style.cursor = 'col-resize';
            document.body.style.userSelect = 'none';
        }

        return () => {
            document.removeEventListener('mousemove', handleResizeMove);
            document.removeEventListener('mouseup', handleResizeEnd);
            document.body.style.cursor = '';
            document.body.style.userSelect = '';
        };
    }, [isResizing]);

    // Handle Run button click
    const handleRunCode = () => {
        // TODO: Implement code execution
        console.log('Running code:', codeContent);
    };

    // Handle Copy Code
    const handleCopyCode = async () => {
        try {
            await navigator.clipboard.writeText(codeContent);
            // TODO: Show toast notification
            console.log('Code copied to clipboard');
        } catch (err) {
            console.error('Failed to copy code:', err);
        }
    };

    // Handle Download Code
    const handleDownloadCode = () => {
        const blob = new Blob([codeContent], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'code.js';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    // Handle slide edit
    const handleSlideEdit = (slideId: string, newTitle: string) => {
        setSlides((prev) =>
            prev.map((slide) => (slide.id === slideId ? { ...slide, slideTitle: newTitle } : slide))
        );
    };

    // Handle slide drag end within a session
    const handleSlideDragEnd = (event: DragEndEvent, sessionId: string) => {
        const { active, over } = event;
        if (!over || active.id === over.id) return;

        const sessionSlides = slides.filter((s) => s.sessionId === sessionId);
        const oldIndex = sessionSlides.findIndex((s) => s.id === active.id);
        const newIndex = sessionSlides.findIndex((s) => s.id === over.id);

        if (oldIndex !== -1 && newIndex !== -1) {
            const reorderedSlides = arrayMove(sessionSlides, oldIndex, newIndex);
            // Update slides with new order
            const otherSlides = slides.filter((s) => s.sessionId !== sessionId);
            setSlides([...otherSlides, ...reorderedSlides]);
        }
    };

    const getSlideIcon = (type: SlideType) => {
        switch (type) {
            case 'objectives':
                return <FileText className="h-4 w-4 text-blue-600" />;
            case 'topic':
                return (
                    <div className="flex items-center gap-1">
                        <Video className="h-4 w-4 text-red-600" />
                        <Code className="h-4 w-4 text-green-600" />
                    </div>
                );
            case 'quiz':
                return <FileQuestion className="h-4 w-4 text-purple-600" />;
            case 'homework':
            case 'assignment':
                return <ClipboardList className="h-4 w-4 text-orange-600" />;
            case 'solution':
                return <FileCode className="h-4 w-4 text-indigo-600" />;
            case 'doc':
                return <FileText className="h-4 w-4 text-blue-600" />;
            case 'pdf':
                return <File className="h-4 w-4 text-red-600" />;
            case 'video':
                return <Video className="h-4 w-4 text-red-600" />;
            case 'jupyter':
                return <Notebook className="h-4 w-4 text-orange-600" />;
            case 'code-editor':
                return <Code className="h-4 w-4 text-green-600" />;
            case 'scratch':
                return <Puzzle className="h-4 w-4 text-purple-600" />;
            case 'video-jupyter':
                return (
                    <div className="flex items-center gap-1">
                        <Video className="h-4 w-4 text-red-600" />
                        <Notebook className="h-4 w-4 text-orange-600" />
                    </div>
                );
            case 'video-code-editor':
                return (
                    <div className="flex items-center gap-1">
                        <Video className="h-4 w-4 text-red-600" />
                        <Code className="h-4 w-4 text-green-600" />
                    </div>
                );
            case 'video-scratch':
                return (
                    <div className="flex items-center gap-1">
                        <Video className="h-4 w-4 text-red-600" />
                        <Puzzle className="h-4 w-4 text-purple-600" />
                    </div>
                );
            default:
                return null;
        }
    };

    const handleBack = () => {
        navigate({ to: '/study-library/ai-copilot/course-outline' });
    };

    return (
        <LayoutContainer public={true}>
            <Helmet>
                <title>Generating Course Content</title>
                <meta name="description" content="AI is generating your course content." />
            </Helmet>

            <div className="min-h-screen bg-gradient-to-b from-indigo-50 via-white to-purple-50">
                <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
                    {/* Header */}
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="mb-6"
                    >
                        <div className="mb-4 flex items-center justify-between">
                            <button
                                onClick={handleBack}
                                className="flex items-center gap-2 text-sm font-medium text-neutral-600 transition-colors hover:text-indigo-600"
                            >
                                <ArrowLeft className="h-4 w-4" />
                                Back to Course Outline
                            </button>

                            {/* Action Buttons - Top Right */}
                            <div className="flex items-center gap-3">
                                <MyButton
                                    buttonType="primary"
                                    onClick={() => {
                                        // TODO: Confirm and finish course creation
                                        console.log('Confirm and finish');
                                    }}
                                    disabled={!allSessionsCompleted}
                                >
                                    Confirm and Finish
                                </MyButton>
                            </div>
                        </div>

                        <div>
                            <h1 className="mb-2 text-3xl font-semibold text-neutral-900">
                                Step 2: Building Your Course Content
                            </h1>
                            <p className="text-base text-gray-600">
                                Sit back while AI brings your outline to life, crafting lessons, slides, and media assets. When it's ready, confirm to complete your course creation.
                            </p>
                        </div>
                    </motion.div>

                    {/* Sessions List */}
                    <div className="rounded-xl bg-white p-6 shadow-md">
                        <DndContext
                            sensors={sensors}
                            collisionDetection={closestCenter}
                            onDragEnd={handleSessionDragEnd}
                        >
                            <SortableContext
                                items={sessionsWithProgress.map((s) => s.sessionId)}
                                strategy={verticalListSortingStrategy}
                            >
                                <Accordion
                                    type="multiple"
                                    value={Array.from(expandedSessions)}
                                    className="w-full"
                                >
                                    {sessionsWithProgress.map((session, sessionIndex) => (
                                        <SortableSessionItem
                                            key={session.sessionId}
                                            session={session}
                                            sessionIndex={sessionIndex}
                                            onEdit={handleSessionEdit}
                                            onDelete={handleSessionDelete}
                                            onRegenerate={handleRegenerateSession}
                                            editingSessionId={editingSessionId}
                                            editSessionTitle={editSessionTitle}
                                            onStartEdit={handleStartEdit}
                                            onCancelEdit={handleCancelEdit}
                                            onSaveEdit={handleSaveEdit}
                                            setEditSessionTitle={setEditSessionTitle}
                                        >
                                            <AccordionContent className="pb-4 pt-0">
                                                <div className="ml-11">
                                                    <DndContext
                                                        sensors={sensors}
                                                        collisionDetection={closestCenter}
                                                        onDragEnd={(event) => handleSlideDragEnd(event, session.sessionId)}
                                                    >
                                                        <SortableContext
                                                            items={session.slides.map((s) => s.id)}
                                                            strategy={verticalListSortingStrategy}
                                                        >
                                                            <div className="space-y-2">
                                                                {session.slides.map((slide) => (
                                                                    <SortableSlideItem
                                                                        key={slide.id}
                                                                        slide={slide}
                                                                        onEdit={handleSlideEdit}
                                                                        onDelete={handleDelete}
                                                                        getSlideIcon={getSlideIcon}
                                                                        onRegenerate={handleRegenerate}
                                                                        onView={handleView}
                                                                    />
                                                                ))}
                                                            </div>
                                                        </SortableContext>
                                                    </DndContext>
                                                    <div className="mt-3">
                                                        <MyButton
                                                            buttonType="secondary"
                                                            onClick={() => handleAddSlide(session.sessionId)}
                                                            className="text-xs"
                                                        >
                                                            <Plus className="h-3.5 w-3.5 mr-1" />
                                                            Add Slide
                                                        </MyButton>
                                                    </div>
                                                </div>
                                            </AccordionContent>
                                        </SortableSessionItem>
                                    ))}
                                </Accordion>
                            </SortableContext>
                        </DndContext>
                        <div className="mt-4">
                            <MyButton
                                buttonType="secondary"
                                onClick={handleAddSession}
                                className="w-full"
                            >
                                <Plus className="h-4 w-4 mr-1" />
                                Add Session
                            </MyButton>
                        </div>
                    </div>

                    {/* Completion Message */}
                    {!isGenerating && allSessionsCompleted && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="mt-8 rounded-xl bg-gradient-to-r from-green-50 to-emerald-50 p-6 text-center shadow-md"
                        >
                            <CheckCircle className="mx-auto mb-3 h-12 w-12 text-green-600" />
                            <h3 className="mb-2 text-xl font-semibold text-neutral-900">Course Generation Complete!</h3>
                            <p className="mb-4 text-neutral-600">
                                All slides have been generated successfully. You can now preview or send for approval.
                            </p>
                        </motion.div>
                    )}

                    {/* View Slide Dialog */}
                    <Dialog
                        open={viewingSlide !== null}
                        onOpenChange={(open) => {
                            if (!open) {
                                setViewingSlide(null);
                                setQuizQuestions(DEFAULT_QUIZ_QUESTIONS);
                                setSelectedQuizAnswers({ ...DEFAULT_SELECTED_ANSWERS });
                                setCurrentQuizQuestionIndex(0);
                            }
                        }}
                    >
                        <DialogContent className="w-[80vw] max-w-[80vw] max-h-[90vh] flex flex-col p-0">
                            {viewingSlide && (
                                <>
                                    <DialogHeader className="px-6 pt-6 pb-4 flex-shrink-0 border-b">
                                        <DialogTitle>{viewingSlide.slideTitle}</DialogTitle>
                                    </DialogHeader>

                                    <div className="flex-1 overflow-y-auto px-6 py-4 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                                        {/* Document Slide */}
                                        {(viewingSlide.slideType === 'objectives' || viewingSlide.slideType === 'doc') && (
                                            <div>
                                                <TipTapEditor
                                                    value={documentContent}
                                                    onChange={setDocumentContent}
                                                    placeholder="Enter document content..."
                                                    minHeight={500}
                                                />
                                            </div>
                                        )}

                                    {/* Video + Code Slide */}
                                    {(viewingSlide.slideType === 'topic' ||
                                        viewingSlide.slideType === 'video-code-editor' ||
                                        viewingSlide.slideType === 'video-jupyter' ||
                                        viewingSlide.slideType === 'video-scratch') && (
                                        <div
                                            ref={resizeContainerRef}
                                            className="flex gap-0 h-[600px] relative"
                                        >
                                            {/* Code Editor Section */}
                                            <div
                                                className="border rounded-l-lg overflow-hidden flex-shrink-0 flex flex-col"
                                                style={{ width: `${codeEditorWidth}%` }}
                                            >
                                                {/* Code Editor Header */}
                                                <div className="bg-white px-4 py-3 border-b flex items-center justify-between gap-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="flex items-center gap-2 text-sm font-semibold text-neutral-900">
                                                            <Code className="h-4 w-4" />
                                                            <span>Code Editor</span>
                                                        </div>
                                                        <span
                                                            className={`rounded-full px-3 py-1 text-xs font-semibold ${
                                                                isEditMode
                                                                    ? 'bg-emerald-100 text-emerald-700'
                                                                    : 'bg-neutral-200 text-neutral-600'
                                                            }`}
                                                        >
                                                            {isEditMode ? 'Edit Mode' : 'View Mode'}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <button
                                                            onClick={handleRunCode}
                                                            className="flex items-center gap-2 px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded text-sm font-medium transition-colors"
                                                        >
                                                            <Play className="h-4 w-4" />
                                                            Run
                                                        </button>
                                                        <DropdownMenu>
                                                            <DropdownMenuTrigger asChild>
                                                                <button className="flex items-center gap-2 px-3 py-1.5 bg-white hover:bg-neutral-50 border border-neutral-300 rounded text-sm font-medium transition-colors">
                                                                    <Settings className="h-4 w-4" />
                                                                    Settings
                                                                    <ChevronDown className="h-3 w-3" />
                                                                </button>
                                                            </DropdownMenuTrigger>
                                                            <DropdownMenuContent className="w-56 bg-white" align="end">
                                                                {/* View/Edit Mode */}
                                                                <DropdownMenuCheckboxItem
                                                                    checked={isEditMode}
                                                                    onCheckedChange={(checked) => setIsEditMode(!!checked)}
                                                                    className="flex items-center justify-between"
                                                                >
                                                                    <div className="flex items-center gap-2">
                                                                        <Eye className="h-4 w-4" />
                                                                        <span>View/Edit Mode</span>
                                                                    </div>
                                                                    {isEditMode && (
                                                                        <div className="flex items-center gap-1">
                                                                            <div className="flex h-5 w-9 items-center rounded-full bg-emerald-500 px-1">
                                                                                <div className="h-3.5 w-3.5 rounded-full bg-white shadow-sm" />
                                                                            </div>
                                                                            <Pencil className="h-3 w-3 text-neutral-600" />
                                                                        </div>
                                                                    )}
                                                                </DropdownMenuCheckboxItem>

                                                                <DropdownMenuSeparator />

                                                                {/* Switch Theme */}
                                                                <DropdownMenuItem
                                                                    onClick={() => setIsDarkTheme((prev) => !prev)}
                                                                    className="flex items-center gap-2"
                                                                >
                                                                    <Sun className="h-4 w-4" />
                                                                    <span>{isDarkTheme ? 'Switch to Light Theme' : 'Switch to Dark Theme'}</span>
                                                                </DropdownMenuItem>

                                                                <DropdownMenuSeparator />

                                                                {/* Copy Code */}
                                                                <DropdownMenuItem
                                                                    onClick={handleCopyCode}
                                                                    className="flex items-center gap-2"
                                                                >
                                                                    <Copy className="h-4 w-4" />
                                                                    <span>Copy Code</span>
                                                                </DropdownMenuItem>

                                                                {/* Download Code */}
                                                                <DropdownMenuItem
                                                                    onClick={handleDownloadCode}
                                                                    className="flex items-center gap-2"
                                                                >
                                                                    <Download className="h-4 w-4" />
                                                                    <span>Download Code</span>
                                                                </DropdownMenuItem>
                                                            </DropdownMenuContent>
                                                        </DropdownMenu>
                                                    </div>
                                                </div>
                                                <Editor
                                                    height="calc(100% - 60px)"
                                                    language="javascript"
                                                    value={codeContent}
                                                    onChange={(value) => setCodeContent(value || '')}
                                                    theme={isDarkTheme ? 'vs-dark' : 'light'}
                                                    options={{
                                                        minimap: { enabled: false },
                                                        fontSize: 14,
                                                        lineNumbers: 'on',
                                                        scrollBeyondLastLine: false,
                                                        automaticLayout: true,
                                                        readOnly: !isEditMode,
                                                    }}
                                                />
                                            </div>

                                            {/* Resize Divider */}
                                            <div
                                                className="w-1 bg-neutral-300 hover:bg-indigo-500 cursor-col-resize flex-shrink-0 transition-colors relative group"
                                                onMouseDown={handleResizeStart}
                                                style={{ cursor: isResizing ? 'col-resize' : 'col-resize' }}
                                            >
                                                <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-8 flex items-center justify-center">
                                                    <div className="w-1 h-12 bg-neutral-400 group-hover:bg-indigo-500 rounded-full transition-colors" />
                                                </div>
                                            </div>

                                            {/* Video Section */}
                                            <div
                                                className="border rounded-r-lg overflow-hidden bg-black flex-shrink-0 flex items-center justify-center"
                                                style={{ width: `${100 - codeEditorWidth}%` }}
                                            >
                                                <div className="w-full h-full flex items-center justify-center bg-black">
                                                    <div className="text-white text-center px-6">
                                                        <Video className="h-16 w-16 mx-auto mb-2 opacity-50" />
                                                        <p className="text-sm opacity-75">Video Player</p>
                                                        <p className="text-xs mt-2 opacity-50">Video will be displayed here</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Quiz Slide */}
                                    {viewingSlide.slideType === 'quiz' && (
                                        <div className="space-y-6">
                                            <div className="flex items-start justify-between gap-4">
                                                <div className="flex-1">
                                                    <Label className="text-base font-semibold">Question:</Label>
                                                    <p className="mt-2 text-neutral-700">
                                                        {currentQuizQuestion?.question ?? 'No question available'}
                                                    </p>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <button
                                                        onClick={() => handleQuizNavigation('prev')}
                                                        disabled={currentQuizQuestionIndex === 0}
                                                        className="flex h-9 w-9 items-center justify-center rounded-full border border-neutral-300 bg-white text-neutral-600 transition-colors hover:border-emerald-400 hover:text-emerald-600 disabled:cursor-not-allowed disabled:opacity-40"
                                                        aria-label="Previous question"
                                                    >
                                                        <ChevronLeft className="h-4 w-4" />
                                                    </button>
                                                    <span className="text-sm font-medium text-neutral-600">
                                                        {currentQuizQuestionIndex + 1}/{quizQuestions.length}
                                                    </span>
                                                    <button
                                                        onClick={() => handleQuizNavigation('next')}
                                                        disabled={
                                                            quizQuestions.length === 0 ||
                                                            currentQuizQuestionIndex === quizQuestions.length - 1
                                                        }
                                                        className="flex h-9 w-9 items-center justify-center rounded-full border border-neutral-300 bg-white text-neutral-600 transition-colors hover:border-emerald-400 hover:text-emerald-600 disabled:cursor-not-allowed disabled:opacity-40"
                                                        aria-label="Next question"
                                                    >
                                                        <ChevronRight className="h-4 w-4" />
                                                    </button>
                                                </div>
                                            </div>

                                            {quizQuestions.length > 0 && currentQuizQuestion ? (
                                                <RadioGroup
                                                    value={selectedQuizAnswers[currentQuizQuestionIndex] ?? ''}
                                                    onValueChange={handleQuizAnswerChange}
                                                    className="space-y-3"
                                                >
                                                    {currentQuizQuestion.options.map((option, optionIndex) => {
                                                        const value = optionIndex.toString();
                                                        const selected = selectedQuizAnswers[currentQuizQuestionIndex] === value;
                                                        const isCorrect =
                                                            currentQuizQuestion.correctAnswerIndex?.toString() === value;
                                                        const highlightClass = selected
                                                            ? isCorrect
                                                                ? 'border-emerald-300 bg-emerald-50'
                                                                : 'border-indigo-300 bg-indigo-50'
                                                            : 'border-neutral-200 hover:border-emerald-200 hover:bg-emerald-50/40';

                                                        return (
                                                            <div
                                                                key={value}
                                                                className={`flex items-center space-x-2 rounded-lg border p-3 transition-colors ${highlightClass}`}
                                                            >
                                                                <RadioGroupItem
                                                                    value={value}
                                                                    id={`quiz-${currentQuizQuestionIndex}-${optionIndex}`}
                                                                />
                                                                <Label
                                                                    htmlFor={`quiz-${currentQuizQuestionIndex}-${optionIndex}`}
                                                                    className="flex-1 cursor-pointer"
                                                                >
                                                                    {option}
                                                                </Label>
                                                                {selected && isCorrect && <CheckCircle className="h-5 w-5 text-emerald-500" />}
                                                            </div>
                                                        );
                                                    })}
                                                </RadioGroup>
                                            ) : (
                                                <p className="text-sm text-neutral-500">No questions available for this quiz yet.</p>
                                            )}
                                        </div>
                                    )}

                                    {/* Homework/Assignment Slide */}
                                    {(viewingSlide.slideType === 'homework' || viewingSlide.slideType === 'assignment') && (
                                        <div className="space-y-4">
                                            <div>
                                                <Label className="text-base font-semibold">Question:</Label>
                                                <Textarea
                                                    value={homeworkQuestion}
                                                    onChange={(e) => setHomeworkQuestion(e.target.value)}
                                                    placeholder="Enter homework question..."
                                                    className="mt-2 min-h-[100px]"
                                                />
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-4 mb-2">
                                                    <Label className="text-base font-semibold">Answer:</Label>
                                                    <div className="flex gap-2">
                                                        <button
                                                            onClick={() => setHomeworkAnswerType('text')}
                                                            className={`px-3 py-1 text-sm rounded ${
                                                                homeworkAnswerType === 'text'
                                                                    ? 'bg-indigo-600 text-white'
                                                                    : 'bg-neutral-100 text-neutral-700'
                                                            }`}
                                                        >
                                                            Text
                                                        </button>
                                                        <button
                                                            onClick={() => setHomeworkAnswerType('code')}
                                                            className={`px-3 py-1 text-sm rounded ${
                                                                homeworkAnswerType === 'code'
                                                                    ? 'bg-indigo-600 text-white'
                                                                    : 'bg-neutral-100 text-neutral-700'
                                                            }`}
                                                        >
                                                            Code Editor
                                                        </button>
                                                    </div>
                                                </div>
                                                {homeworkAnswerType === 'text' ? (
                                                    <TipTapEditor
                                                        value={homeworkAnswer}
                                                        onChange={setHomeworkAnswer}
                                                        placeholder="Enter your answer..."
                                                        minHeight={300}
                                                    />
                                                ) : (
                                                    <div className="border rounded-lg overflow-hidden">
                                                        <Editor
                                                            height="300px"
                                                            language="javascript"
                                                            value={homeworkAnswer}
                                                            onChange={(value) => setHomeworkAnswer(value || '')}
                                                            theme="light"
                                                            options={{
                                                                minimap: { enabled: false },
                                                                fontSize: 14,
                                                                lineNumbers: 'on',
                                                                scrollBeyondLastLine: false,
                                                                automaticLayout: true,
                                                            }}
                                                        />
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    {/* Code Editor Slide */}
                                    {(viewingSlide.slideType === 'code-editor' ||
                                        viewingSlide.slideType === 'jupyter' ||
                                        viewingSlide.slideType === 'scratch' ||
                                        viewingSlide.slideType === 'solution') && (
                                        <div className="border rounded-lg overflow-hidden">
                                            <div className="bg-neutral-100 px-4 py-2 border-b">
                                                <span className="text-sm font-medium">
                                                    {viewingSlide.slideType === 'solution' ? 'Solution Code' : 'Code Editor'}
                                                </span>
                                            </div>
                                            <Editor
                                                height="500px"
                                                language="javascript"
                                                value={codeContent}
                                                onChange={(value) => setCodeContent(value || '')}
                                                theme="light"
                                                options={{
                                                    minimap: { enabled: false },
                                                    fontSize: 14,
                                                    lineNumbers: 'on',
                                                    scrollBeyondLastLine: false,
                                                    automaticLayout: true,
                                                }}
                                            />
                                        </div>
                                    )}
                                    </div>

                                    {/* Fixed Footer */}
                                    <div className="px-6 py-4 flex-shrink-0 border-t flex justify-end">
                                        <MyButton
                                            buttonType="primary"
                                            onClick={() => {
                                                handleSaveSlideContent();
                                                setViewingSlide(null);
                                            }}
                                        >
                                            Save
                                        </MyButton>
                                    </div>
                                </>
                            )}
                        </DialogContent>
                    </Dialog>

                    {/* Regenerate Slide Dialog */}
                    <Dialog open={regenerateSlideDialogOpen} onOpenChange={(open) => {
                        setRegenerateSlideDialogOpen(open);
                        if (!open) {
                            setRegenerateSlidePrompt('');
                            setRegeneratingSlideId(null);
                        }
                    }}>
                        <DialogContent className="w-[80vw] max-w-[80vw] max-h-[90vh] flex flex-col p-0">
                            <DialogHeader className="px-6 pt-6 pb-4 flex-shrink-0 border-b">
                                <DialogTitle>Regenerate Slide</DialogTitle>
                            </DialogHeader>
                            <div className="flex-1 overflow-y-auto px-6 py-4 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                                <Textarea
                                    ref={regenerateSlidePromptTextareaRef}
                                    value={regenerateSlidePrompt}
                                    onChange={(e) => setRegenerateSlidePrompt(e.target.value)}
                                    placeholder="Enter a prompt describing how you want this slide to be regenerated..."
                                    className="min-h-[150px] text-sm"
                                />
                            </div>
                            <div className="px-6 py-4 flex-shrink-0 border-t flex justify-end">
                                <MyButton
                                    buttonType="primary"
                                    onClick={handleConfirmRegenerateSlide}
                                    disabled={!regenerateSlidePrompt.trim()}
                                >
                                    Regenerate
                                </MyButton>
                            </div>
                        </DialogContent>
                    </Dialog>

                    {/* Regenerate Session Dialog */}
                    <Dialog open={regenerateSessionDialogOpen} onOpenChange={(open) => {
                        setRegenerateSessionDialogOpen(open);
                        if (!open) {
                            // Reset form when closing
                            setRegeneratingSessionId(null);
                        } else if (regeneratingSessionId) {
                            // Re-pre-fill when reopening with the same session
                            const session = sessionsWithProgress.find((s) => s.sessionId === regeneratingSessionId);
                            if (session) {
                                const topics = extractTopicTitlesFromSlides(session.slides);
                                const defaultPrompt = `Regenerate the session "${session.sessionTitle}"${topics.length > 0 ? ` with the following topics: ${topics.join(', ')}.` : '.'}`;
                                setRegenerateSessionPrompt(defaultPrompt);
                                setRegenerateSessionTopics(topics);
                                setRegenerateSessionNumberOfTopics(topics.length.toString());
                                const hasQuiz = session.slides.some(s => s.slideType === 'quiz');
                                const hasHomework = session.slides.some(s => s.slideType === 'homework');
                                const hasSolution = session.slides.some(s => s.slideType === 'solution');
                                const hasCodeSlides = session.slides.some(s =>
                                    s.slideType === 'code-editor' ||
                                    s.slideType === 'video-code-editor' ||
                                    s.slideType === 'jupyter' ||
                                    s.slideType === 'video-jupyter'
                                );
                                setRegenerateIncludeCodeSnippets(hasCodeSlides);
                                setRegenerateIncludeQuizzes(hasQuiz);
                                setRegenerateIncludeHomework(hasHomework);
                                setRegenerateIncludeSolutions(hasSolution || hasHomework);
                            }
                        }
                    }}>
                        <DialogContent className="w-[80vw] max-w-[80vw] max-h-[90vh] flex flex-col p-0">
                            <DialogHeader className="px-6 pt-6 pb-4 flex-shrink-0 border-b">
                                <DialogTitle>
                                    Regenerate Session{' '}
                                    {regeneratingSessionId &&
                                        sessionsWithProgress.find((s) => s.sessionId === regeneratingSessionId) &&
                                        `: ${sessionsWithProgress.find((s) => s.sessionId === regeneratingSessionId)?.sessionTitle}`}
                                </DialogTitle>
                            </DialogHeader>
                            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                                <div>
                                    <Label className="mb-2 block">Prompt</Label>
                                    <Textarea
                                        ref={regenerateSessionPromptTextareaRef}
                                        value={regenerateSessionPrompt}
                                        onChange={(e) => setRegenerateSessionPrompt(e.target.value)}
                                        placeholder="Enter a prompt describing how you want this session to be regenerated..."
                                        className="min-h-[150px] text-sm"
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="regenerateSessionLength" className="mb-2 block">
                                        Session Length
                                    </Label>
                                    <div className="space-y-2">
                                        <Select value={regenerateSessionLength} onValueChange={handleRegenerateSessionLengthChange}>
                                            <SelectTrigger id="regenerateSessionLength" className="w-full">
                                                <SelectValue placeholder="Select session length" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="45">45 minutes</SelectItem>
                                                <SelectItem value="60">60 minutes</SelectItem>
                                                <SelectItem value="90">90 minutes</SelectItem>
                                                <SelectItem value="custom">Custom</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        {regenerateSessionLength === 'custom' && (
                                            <Input
                                                type="number"
                                                min="1"
                                                value={regenerateCustomSessionLength}
                                                onChange={(e) => setRegenerateCustomSessionLength(e.target.value)}
                                                placeholder="Enter custom length in minutes"
                                                className="w-full"
                                            />
                                        )}
                                    </div>
                                </div>

                                <div>
                                    <Label className="mb-2 block">Session Components</Label>
                                    <div className="grid grid-cols-3 gap-4">
                                        <div className="flex items-center space-x-2">
                                            <Checkbox
                                                id="regenerateIncludeDiagrams"
                                                checked={regenerateIncludeDiagrams}
                                                onCheckedChange={(checked) => setRegenerateIncludeDiagrams(checked === true)}
                                            />
                                            <Label htmlFor="regenerateIncludeDiagrams" className="cursor-pointer">
                                                Include diagrams
                                            </Label>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <Checkbox
                                                id="regenerateIncludeCodeSnippets"
                                                checked={regenerateIncludeCodeSnippets}
                                                onCheckedChange={(checked) => setRegenerateIncludeCodeSnippets(checked === true)}
                                            />
                                            <Label htmlFor="regenerateIncludeCodeSnippets" className="cursor-pointer">
                                                Include code snippets
                                            </Label>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <Checkbox
                                                id="regenerateIncludePracticeProblems"
                                                checked={regenerateIncludePracticeProblems}
                                                onCheckedChange={(checked) => setRegenerateIncludePracticeProblems(checked === true)}
                                            />
                                            <Label htmlFor="regenerateIncludePracticeProblems" className="cursor-pointer">
                                                Include practice problems
                                            </Label>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <Checkbox
                                                id="regenerateIncludeQuizzes"
                                                checked={regenerateIncludeQuizzes}
                                                onCheckedChange={(checked) => setRegenerateIncludeQuizzes(checked === true)}
                                            />
                                            <Label htmlFor="regenerateIncludeQuizzes" className="cursor-pointer">
                                                Include quizzes
                                            </Label>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <Checkbox
                                                id="regenerateIncludeHomework"
                                                checked={regenerateIncludeHomework}
                                                onCheckedChange={(checked) => setRegenerateIncludeHomework(checked === true)}
                                            />
                                            <Label htmlFor="regenerateIncludeHomework" className="cursor-pointer">
                                                Include homework
                                            </Label>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <Checkbox
                                                id="regenerateIncludeSolutions"
                                                checked={regenerateIncludeSolutions}
                                                onCheckedChange={(checked) => setRegenerateIncludeSolutions(checked === true)}
                                            />
                                            <Label htmlFor="regenerateIncludeSolutions" className="cursor-pointer">
                                                Include solutions
                                            </Label>
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <Label htmlFor="regenerateSessionNumberOfTopics" className="mb-2 block">
                                        Number of Topics
                                    </Label>
                                    <Input
                                        id="regenerateSessionNumberOfTopics"
                                        type="number"
                                        min="1"
                                        value={regenerateSessionNumberOfTopics}
                                        onChange={(e) => setRegenerateSessionNumberOfTopics(e.target.value)}
                                        placeholder="e.g., 3, 4, 5, etc."
                                        className="w-full"
                                    />
                                </div>

                                <div>
                                    <Label className="mb-2 block">Topics in Session (Optional)</Label>
                                    <TagInput
                                        tags={regenerateSessionTopics}
                                        onChange={setRegenerateSessionTopics}
                                        placeholder="Enter a topic and press Enter"
                                    />
                                </div>
                            </div>
                            <div className="px-6 py-4 flex-shrink-0 border-t flex justify-end">
                                <MyButton
                                    buttonType="primary"
                                    onClick={handleConfirmRegenerateSession}
                                    disabled={!regenerateSessionPrompt.trim()}
                                >
                                    Regenerate
                                </MyButton>
                            </div>
                        </DialogContent>
                    </Dialog>

                    {/* Add Slide Dialog */}
                    <Dialog open={addSlideDialogOpen} onOpenChange={(open) => {
                        setAddSlideDialogOpen(open);
                        if (!open) {
                            setAddSlidePrompt('');
                            setAddingSlideToSessionId(null);
                            setSelectedAddSlideType(null);
                        }
                    }}>
                        <DialogContent className="w-[80vw] max-w-[80vw] max-h-[90vh] flex flex-col p-0">
                            <DialogHeader className="px-6 pt-6 pb-4 flex-shrink-0 border-b">
                                <DialogTitle>
                                    {selectedAddSlideType ? 'AI Generation Prompt' : 'Select Slide Type'}
                                </DialogTitle>
                                {!selectedAddSlideType && (
                                    <DialogDescription>
                                        Choose the type of slide you want to add to this session.
                                    </DialogDescription>
                                )}
                            </DialogHeader>
                            {!selectedAddSlideType ? (
                                <div className="flex-1 overflow-y-auto px-6 py-4 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                                    <div className="grid grid-cols-3 gap-3">
                                        <button
                                            onClick={() => handleSelectAddSlideType('doc')}
                                            className="flex flex-col items-center gap-2 rounded-lg border border-neutral-200 bg-white p-4 transition-colors hover:border-indigo-400 hover:bg-indigo-50"
                                        >
                                            <FileText className="h-6 w-6 text-blue-600" />
                                            <span className="text-sm font-medium">Document</span>
                                        </button>
                                        <button
                                            onClick={() => handleSelectAddSlideType('pdf')}
                                            className="flex flex-col items-center gap-2 rounded-lg border border-neutral-200 bg-white p-4 transition-colors hover:border-indigo-400 hover:bg-indigo-50"
                                        >
                                            <File className="h-6 w-6 text-red-600" />
                                            <span className="text-sm font-medium">PDF</span>
                                        </button>
                                        <button
                                            onClick={() => handleSelectAddSlideType('video')}
                                            className="flex flex-col items-center gap-2 rounded-lg border border-neutral-200 bg-white p-4 transition-colors hover:border-indigo-400 hover:bg-indigo-50"
                                        >
                                            <Video className="h-6 w-6 text-red-600" />
                                            <span className="text-sm font-medium">Video</span>
                                        </button>
                                        <button
                                            onClick={() => handleSelectAddSlideType('image')}
                                            className="flex flex-col items-center gap-2 rounded-lg border border-neutral-200 bg-white p-4 transition-colors hover:border-indigo-400 hover:bg-indigo-50"
                                        >
                                            <ImageIcon className="h-6 w-6 text-blue-600" />
                                            <span className="text-sm font-medium">Image</span>
                                        </button>
                                        <button
                                            onClick={() => handleSelectAddSlideType('jupyter')}
                                            className="flex flex-col items-center gap-2 rounded-lg border border-neutral-200 bg-white p-4 transition-colors hover:border-indigo-400 hover:bg-indigo-50"
                                        >
                                            <Notebook className="h-6 w-6 text-orange-600" />
                                            <span className="text-sm font-medium">Jupyter</span>
                                        </button>
                                        <button
                                            onClick={() => handleSelectAddSlideType('code-editor')}
                                            className="flex flex-col items-center gap-2 rounded-lg border border-neutral-200 bg-white p-4 transition-colors hover:border-indigo-400 hover:bg-indigo-50"
                                        >
                                            <Code className="h-6 w-6 text-green-600" />
                                            <span className="text-sm font-medium">Code Editor</span>
                                        </button>
                                        <button
                                            onClick={() => handleSelectAddSlideType('scratch')}
                                            className="flex flex-col items-center gap-2 rounded-lg border border-neutral-200 bg-white p-4 transition-colors hover:border-indigo-400 hover:bg-indigo-50"
                                        >
                                            <Puzzle className="h-6 w-6 text-purple-600" />
                                            <span className="text-sm font-medium">Scratch</span>
                                        </button>
                                        <button
                                            onClick={() => handleSelectAddSlideType('video-jupyter')}
                                            className="flex flex-col items-center gap-2 rounded-lg border border-neutral-200 bg-white p-4 transition-colors hover:border-indigo-400 hover:bg-indigo-50"
                                        >
                                            <div className="flex items-center gap-1">
                                                <Video className="h-6 w-6 text-red-600" />
                                                <Notebook className="h-6 w-6 text-orange-600" />
                                            </div>
                                            <span className="text-sm font-medium">Video + Jupyter</span>
                                        </button>
                                        <button
                                            onClick={() => handleSelectAddSlideType('video-code-editor')}
                                            className="flex flex-col items-center gap-2 rounded-lg border border-neutral-200 bg-white p-4 transition-colors hover:border-indigo-400 hover:bg-indigo-50"
                                        >
                                            <div className="flex items-center gap-1">
                                                <Video className="h-6 w-6 text-red-600" />
                                                <Code className="h-6 w-6 text-green-600" />
                                            </div>
                                            <span className="text-sm font-medium">Video + Code</span>
                                        </button>
                                        <button
                                            onClick={() => handleSelectAddSlideType('video-scratch')}
                                            className="flex flex-col items-center gap-2 rounded-lg border border-neutral-200 bg-white p-4 transition-colors hover:border-indigo-400 hover:bg-indigo-50"
                                        >
                                            <div className="flex items-center gap-1">
                                                <Video className="h-6 w-6 text-red-600" />
                                                <Puzzle className="h-6 w-6 text-purple-600" />
                                            </div>
                                            <span className="text-sm font-medium">Video + Scratch</span>
                                        </button>
                                        <button
                                            onClick={() => handleSelectAddSlideType('quiz')}
                                            className="flex flex-col items-center gap-2 rounded-lg border border-neutral-200 bg-white p-4 transition-colors hover:border-indigo-400 hover:bg-indigo-50"
                                        >
                                            <FileQuestion className="h-6 w-6 text-purple-600" />
                                            <span className="text-sm font-medium">Quiz</span>
                                        </button>
                                        <button
                                            onClick={() => handleSelectAddSlideType('assignment')}
                                            className="flex flex-col items-center gap-2 rounded-lg border border-neutral-200 bg-white p-4 transition-colors hover:border-indigo-400 hover:bg-indigo-50"
                                        >
                                            <ClipboardList className="h-6 w-6 text-orange-600" />
                                            <span className="text-sm font-medium">Assignment</span>
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    <div className="flex-1 overflow-y-auto px-6 py-4 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                                        <Textarea
                                            ref={addSlidePromptTextareaRef}
                                            value={addSlidePrompt}
                                            onChange={(e) => setAddSlidePrompt(e.target.value)}
                                            placeholder="Enter a prompt describing the slide you want to create..."
                                            className="min-h-[150px] text-sm"
                                        />
                                    </div>
                                    <div className="px-6 py-4 flex-shrink-0 border-t flex justify-end gap-2">
                                        <MyButton
                                            buttonType="secondary"
                                            onClick={() => {
                                                setSelectedAddSlideType(null);
                                                setAddSlidePrompt('');
                                            }}
                                        >
                                            Back
                                        </MyButton>
                                        <MyButton
                                            buttonType="primary"
                                            onClick={handleConfirmAddSlide}
                                            disabled={!addSlidePrompt.trim()}
                                        >
                                            Create Slide
                                        </MyButton>
                                    </div>
                                </>
                            )}
                        </DialogContent>
                    </Dialog>

                    {/* Add Session Dialog */}
                    <Dialog open={addSessionDialogOpen} onOpenChange={(open) => {
                        setAddSessionDialogOpen(open);
                        if (!open) {
                            setAddSessionPrompt('');
                            setAddSessionNumberOfTopics('');
                        }
                    }}>
                        <DialogContent className="w-[80vw] max-w-[80vw] max-h-[90vh] flex flex-col p-0">
                            <DialogHeader className="px-6 pt-6 pb-4 flex-shrink-0 border-b">
                                <DialogTitle>Add Session</DialogTitle>
                            </DialogHeader>
                            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                                <div>
                                    <Label className="mb-2 block">Prompt</Label>
                                    <Textarea
                                        ref={addSessionPromptTextareaRef}
                                        value={addSessionPrompt}
                                        onChange={(e) => setAddSessionPrompt(e.target.value)}
                                        placeholder="Enter a prompt describing the session you want to create..."
                                        className="min-h-[150px] text-sm"
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="addSessionLength" className="mb-2 block">
                                        Session Length
                                    </Label>
                                    <div className="space-y-2">
                                        <Select value={addSessionLength} onValueChange={handleAddSessionLengthChange}>
                                            <SelectTrigger id="addSessionLength" className="w-full">
                                                <SelectValue placeholder="Select session length" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="45">45 minutes</SelectItem>
                                                <SelectItem value="60">60 minutes</SelectItem>
                                                <SelectItem value="90">90 minutes</SelectItem>
                                                <SelectItem value="custom">Custom</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        {addSessionLength === 'custom' && (
                                            <Input
                                                type="number"
                                                min="1"
                                                value={addCustomSessionLength}
                                                onChange={(e) => setAddCustomSessionLength(e.target.value)}
                                                placeholder="Enter custom length in minutes"
                                                className="w-full"
                                            />
                                        )}
                                    </div>
                                </div>

                                <div>
                                    <Label className="mb-2 block">Session Components</Label>
                                    <div className="grid grid-cols-3 gap-4">
                                        <div className="flex items-center space-x-2">
                                            <Checkbox
                                                id="addIncludeDiagrams"
                                                checked={addIncludeDiagrams}
                                                onCheckedChange={(checked) => setAddIncludeDiagrams(checked === true)}
                                            />
                                            <Label htmlFor="addIncludeDiagrams" className="cursor-pointer">
                                                Include diagrams
                                            </Label>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <Checkbox
                                                id="addIncludeCodeSnippets"
                                                checked={addIncludeCodeSnippets}
                                                onCheckedChange={(checked) => setAddIncludeCodeSnippets(checked === true)}
                                            />
                                            <Label htmlFor="addIncludeCodeSnippets" className="cursor-pointer">
                                                Include code snippets
                                            </Label>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <Checkbox
                                                id="addIncludePracticeProblems"
                                                checked={addIncludePracticeProblems}
                                                onCheckedChange={(checked) => setAddIncludePracticeProblems(checked === true)}
                                            />
                                            <Label htmlFor="addIncludePracticeProblems" className="cursor-pointer">
                                                Include practice problems
                                            </Label>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <Checkbox
                                                id="addIncludeQuizzes"
                                                checked={addIncludeQuizzes}
                                                onCheckedChange={(checked) => setAddIncludeQuizzes(checked === true)}
                                            />
                                            <Label htmlFor="addIncludeQuizzes" className="cursor-pointer">
                                                Include quizzes
                                            </Label>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <Checkbox
                                                id="addIncludeHomework"
                                                checked={addIncludeHomework}
                                                onCheckedChange={(checked) => setAddIncludeHomework(checked === true)}
                                            />
                                            <Label htmlFor="addIncludeHomework" className="cursor-pointer">
                                                Include homework
                                            </Label>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <Checkbox
                                                id="addIncludeSolutions"
                                                checked={addIncludeSolutions}
                                                onCheckedChange={(checked) => setAddIncludeSolutions(checked === true)}
                                            />
                                            <Label htmlFor="addIncludeSolutions" className="cursor-pointer">
                                                Include solutions
                                            </Label>
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <Label htmlFor="addSessionNumberOfTopics" className="mb-2 block">
                                        Number of Topics
                                    </Label>
                                    <Input
                                        id="addSessionNumberOfTopics"
                                        type="number"
                                        min="1"
                                        value={addSessionNumberOfTopics}
                                        onChange={(e) => setAddSessionNumberOfTopics(e.target.value)}
                                        placeholder="e.g., 3, 4, 5, etc."
                                        className="w-full"
                                    />
                                </div>

                                <div>
                                    <Label className="mb-2 block">Topics in Session (Optional)</Label>
                                    <TagInput
                                        tags={addSessionTopics}
                                        onChange={setAddSessionTopics}
                                        placeholder="Enter a topic and press Enter"
                                    />
                                </div>
                            </div>
                            <div className="px-6 py-4 flex-shrink-0 border-t flex justify-end">
                                <MyButton
                                    buttonType="primary"
                                    onClick={handleConfirmAddSession}
                                    disabled={!addSessionPrompt.trim()}
                                >
                                    Create Session
                                </MyButton>
                            </div>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>
        </LayoutContainer>
    );
}
