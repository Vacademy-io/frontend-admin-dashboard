import { LayoutContainer } from '@/components/common/layout-container/layout-container';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { Helmet } from 'react-helmet';
import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { useSidebar } from '@/components/ui/sidebar';
import { MyButton } from '@/components/design-system/button';
import { BASE_URL } from '@/constants/urls';
import { getInstituteId } from '@/constants/helper';
import { CircularProgress, SortableSessionItem, SortableSlideItem, OutlineGeneratingLoader } from './components';
import { useCourseGeneration } from './hooks/useCourseGeneration';
import { useSlideHandlers } from './hooks/useSlideHandlers';
import { useSessionHandlers } from './hooks/useSessionHandlers';
import { useMetadataHandlers } from './hooks/useMetadataHandlers';
import { useContentGeneration } from './hooks/useContentGeneration';
import { getSessionsWithProgress } from './utils/sessionUtils';
import { generateSlideContent } from './utils/mockSlideContent';
import { extractSlideTitlesFromSlides } from '../../shared/utils/slides';
import { isYouTubeUrl, getYouTubeEmbedUrl } from '../../shared/utils/youtube';
import { SlideGeneration, SlideType, QuizQuestion, SessionProgress } from '../../shared/types';
import { DEFAULT_QUIZ_QUESTIONS, DEFAULT_SELECTED_ANSWERS, DEFAULT_SOLUTION_CODE } from '../../shared/constants';
import {
    RegenerateSlideDialog,
    RegenerateSessionDialog,
    AddSlideDialog,
    AddSessionDialog,
    GenerateCourseAssetsDialog,
    BackToLibraryDialog,
} from './dialogs/CourseGenerationDialogs';
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
    ChevronsUp,
    ChevronsDown,
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
    AlertTriangle,
    Tag,
    Upload,
    Sparkles,
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
    DialogFooter,
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

// YouTube and utility functions are now imported from shared/utils

export const Route = createFileRoute('/study-library/ai-copilot/course-outline/generating/')({
    component: RouteComponent,
});

// Types, interfaces, and constants are now imported from shared modules

// SortableSessionItem and SortableSlideItem are now imported from ./components

function RouteComponent() {
    const navigate = useNavigate();
    const { setOpen } = useSidebar();
    const [slides, setSlides] = useState<SlideGeneration[]>([]);
    
    // Collapse sidebar on mount
    useEffect(() => {
        setOpen(false);
    }, [setOpen]);
    const [isGenerating, setIsGenerating] = useState(true);
    const [generationProgress, setGenerationProgress] = useState<string>('Initializing...');
    const [courseMetadata, setCourseMetadata] = useState<any>(null);
    const [estimatedTimeRemaining, setEstimatedTimeRemaining] = useState<number>(30); // Default 30 seconds
    const [expandedSessions, setExpandedSessions] = useState<Set<string>>(new Set());
    const [viewingSlide, setViewingSlide] = useState<SlideGeneration | null>(null);
    const [documentContent, setDocumentContent] = useState<string>('');
    const [codeContent, setCodeContent] = useState<string>('');
    const [homeworkQuestion, setHomeworkQuestion] = useState<string>('');
    const [homeworkAnswer, setHomeworkAnswer] = useState<string>('');
    const [homeworkAnswerType, setHomeworkAnswerType] = useState<'text' | 'code'>('text');
    const [regenerateSlideDialogOpen, setRegenerateSlideDialogOpen] = useState(false);
    const [regeneratingSlideId, setRegeneratingSlideId] = useState<string | null>(null);
    const [regeneratingSection, setRegeneratingSection] = useState<'video' | 'code' | undefined>(undefined);
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
    const [addSessionName, setAddSessionName] = useState('');
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
    const [generateCourseAssetsDialogOpen, setGenerateCourseAssetsDialogOpen] = useState(false);
    const [backToLibraryDialogOpen, setBackToLibraryDialogOpen] = useState(false);
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
    const [outlineTodos, setOutlineTodos] = useState<any[]>([]); // Store todos from outline generation
    const [isGeneratingContent, setIsGeneratingContent] = useState(false);
    const [isContentGenerated, setIsContentGenerated] = useState(false);
    const [contentGenerationProgress, setContentGenerationProgress] = useState<string>('');
    const [abortController, setAbortController] = useState<AbortController | null>(null);

    // Drag and drop sensors
    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor)
    );

    // getSessionProgress and getSessionsWithProgress are now imported from ./utils/sessionUtils


    // Memoize sessions with progress - ensure it's always an array
    const sessionsWithProgress = useMemo(() => {
        try {
            return getSessionsWithProgress(slides);
        } catch (error) {
            console.error('Error getting sessions with progress:', error);
            return [];
        }
    }, [slides]);

    // Custom hooks for handlers
    const slideHandlers = useSlideHandlers(slides, setSlides);
    const sessionHandlers = useSessionHandlers(slides, setSlides, sessionsWithProgress);
    const metadataHandlers = useMetadataHandlers(courseMetadata, setCourseMetadata);
    const contentGenerationHandlers = useContentGeneration(
        outlineTodos,
        slides,
        setSlides,
        setIsGeneratingContent,
        setIsContentGenerated,
        setContentGenerationProgress,
        setAbortController
    );

    // Destructure handlers for easier access
    const { handleSlideEdit, handleSlideContentEdit, handleDelete } = slideHandlers;
    const {
        editingSessionId,
        editSessionTitle,
        setEditSessionTitle,
        handleSessionDragEnd,
        handleSessionEdit,
        handleSessionDelete,
        handleStartEdit,
        handleCancelEdit,
        handleSaveEdit,
        handleSlideDragEnd,
    } = sessionHandlers;
    const {
        editingMetadataField,
        metadataEditValues,
        setMetadataEditValues,
        mediaEditMode,
        setMediaEditMode,
        handleEditMetadataField,
        handleCancelMetadataEdit,
        handleSaveMetadataEdit,
    } = metadataHandlers;
    const { handleConfirmGenerateCourseAssets } = contentGenerationHandlers;

    // Keep all sessions always expanded - only run once when slides are first loaded
    useEffect(() => {
        if (slides.length > 0 && !isGenerating) {
            const allSessionIds = new Set(slides.map((slide) => slide.sessionId));
            setExpandedSessions((prev) => {
                // Only update if the set actually changed
                const prevArray = Array.from(prev).sort();
                const newArray = Array.from(allSessionIds).sort();
                if (prevArray.length !== newArray.length ||
                    prevArray.some((id, idx) => id !== newArray[idx])) {
                    return allSessionIds;
                }
                return prev; // Return previous value to prevent re-render
            });
        }
    }, [slides.length, isGenerating]); // Only depend on length and generating status

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


    // Check if all sessions are 100% completed
    const allSessionsCompleted = useMemo(() => {
        if (sessionsWithProgress.length === 0) return false;
        return sessionsWithProgress.every((session) => session.progress === 100);
    }, [sessionsWithProgress]);

    // Check if all sessions are expanded
    const isAllExpanded = useMemo(() => {
        if (sessionsWithProgress.length === 0) return false;
        return sessionsWithProgress.every((session) => expandedSessions.has(session.sessionId));
    }, [sessionsWithProgress, expandedSessions]);

    // Toggle all sessions expand/collapse
    const handleToggleAllSessions = () => {
        if (isAllExpanded) {
            // Collapse all
            setExpandedSessions(new Set());
        } else {
            // Expand all
            const allSessionIds = new Set(sessionsWithProgress.map((s) => s.sessionId));
            setExpandedSessions(allSessionIds);
        }
    };

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

        // Assignment
        if (hasHomework) {
            slides.push({
                id: `${sessionId}-homework`,
                sessionId,
                sessionTitle,
                slideTitle: 'Assignment',
                slideType: 'homework',
                status: 'pending',
                progress: 0,
            });
        }

        // Assignment solution
        if (hasHomework) {
            slides.push({
                id: `${sessionId}-solution`,
                sessionId,
                sessionTitle,
                slideTitle: 'Assignment Solution',
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
        const generateCourseOutline = async () => {
            try {
                // Get courseConfig from sessionStorage
                const courseConfigStr = sessionStorage.getItem('courseConfig');
                if (!courseConfigStr) {
                    alert('Course configuration not found. Please start over.');
                    navigate({ to: '/study-library/ai-copilot' });
                    return;
                }
                
                const courseConfig = JSON.parse(courseConfigStr);
                // Clear from sessionStorage after reading
                sessionStorage.removeItem('courseConfig');

                const instituteId = getInstituteId();
                if (!instituteId) {
                    alert('Institute ID not found. Please login again.');
                    return;
                }

                setGenerationProgress('Building prompt from configuration...');

                // Debug: Log courseConfig structure
                console.log('Course Config:', courseConfig);
                console.log('Course Depth Options:', courseConfig.courseDepthOptions);
                console.log('Course Depth:', courseConfig.courseDepth);

                // Build user prompt from courseConfig - simple comma-separated format
                let userPrompt = courseConfig.courseGoal || '';
                
                // Build array of additional requirements to append
                const requirements: string[] = [];

                // Add learning outcome if provided
                if (courseConfig.learningOutcome) {
                    requirements.push(courseConfig.learningOutcome);
                }

                // Add learner profile info
                if (courseConfig.learnerProfile?.ageRange) {
                    requirements.push(`target age range ${courseConfig.learnerProfile.ageRange}`);
                }
                if (courseConfig.learnerProfile?.skillLevel) {
                    requirements.push(`skill level ${courseConfig.learnerProfile.skillLevel}`);
                }

                // Add course depth options (check both courseDepthOptions and courseDepth for compatibility)
                const depthOptions = courseConfig.courseDepthOptions || courseConfig.courseDepth || {};
                
                if (depthOptions.includeDiagrams) {
                    requirements.push('include diagrams');
                }
                if (depthOptions.includeCodeSnippets) {
                    requirements.push('include code snippets');
                    if (depthOptions.programmingLanguage) {
                        requirements.push(`programming language ${depthOptions.programmingLanguage}`);
                    }
                }
                if (depthOptions.includePracticeProblems) {
                    requirements.push('include practice problems');
                }
                if (depthOptions.includeYouTubeVideo) {
                    requirements.push('include videos');
                }
                if (depthOptions.includeAIGeneratedVideo) {
                    requirements.push('include AI generated videos');
                }

                // Add duration and format info
                if (courseConfig.durationFormatStructure?.includeQuizzes) {
                    requirements.push('include assessment');
                }
                if (courseConfig.durationFormatStructure?.includeHomework) {
                    requirements.push('include homework');
                }
                if (courseConfig.durationFormatStructure?.includeSolutions) {
                    requirements.push('include solutions');
                }

                // Append all requirements as comma-separated list
                if (requirements.length > 0) {
                    userPrompt += ', ' + requirements.join(', ');
                }

                // Debug: Log final user prompt
                console.log('Final user_prompt:', userPrompt);

                // Build API payload
                const numChapters = courseConfig.durationFormatStructure?.numberOfSessions;
                const topicsPerSession = courseConfig.durationFormatStructure?.topicsPerSession;
                // Calculate total slides: slides per chapter * number of chapters
                const totalSlides = numChapters && topicsPerSession 
                    ? parseInt(numChapters) * parseInt(topicsPerSession)
                    : null;
                
                // Calculate estimated time: number of chapters * number of slides * 10 seconds
                const estimatedSeconds = numChapters && topicsPerSession
                    ? parseInt(numChapters) * parseInt(topicsPerSession) * 10
                    : 30;
                // Set estimated time before starting generation
                if (estimatedSeconds > 0) {
                    setEstimatedTimeRemaining(estimatedSeconds);
                }
                
                const payload: any = {
                    user_prompt: userPrompt,
                    course_tree: null,
                    course_depth: 3, // Course -> Chapter -> Slide (as per user's requirement: sessions = chapters, topics = slides)
                    generation_options: {
                        generate_images: true,
                        image_style: 'professional',
                    },
                };

                if (numChapters) {
                    payload.generation_options.num_chapters = parseInt(numChapters);
                }
                if (totalSlides) {
                    payload.generation_options.num_slides = totalSlides;
                }

                console.log('=== API Request ===');
                console.log('URL:', '${BASE_URL}/ai-service/course/ai/v1/generate?institute_id=${instituteId}');
                console.log('Payload:', JSON.stringify(payload, null, 2));
                
                setGenerationProgress('Connecting to AI service...');

                // Make SSE API call
                const apiUrl = `${BASE_URL}/ai-service/course/ai/v1/generate?institute_id=${instituteId}`;
                const response = await fetch(apiUrl, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(payload),
                });

                console.log('Response Status:', response.status, response.statusText);

                if (!response.ok) {
                    const errorText = await response.text();
                    console.error('=== API Error ===');
                    console.error('Status:', response.status);
                    console.error('Status Text:', response.statusText);
                    console.error('Error Body:', errorText);
                    throw new Error(`HTTP ${response.status}: ${response.statusText}. ${errorText}`);
                }

                const reader = response.body?.getReader();
                const decoder = new TextDecoder();

                if (!reader) {
                    throw new Error('No response body');
                }

                setGenerationProgress('Generating course outline...');

                // Read SSE stream
                let buffer = '';
                while (true) {
                    const { done, value } = await reader.read();
                    if (done) break;

                    const chunk = decoder.decode(value);
                    buffer += chunk;
                    const lines = buffer.split('\n');
                    
                    // Keep the last incomplete line in the buffer
                    buffer = lines.pop() || '';

                    for (const line of lines) {
                        if (line.startsWith('data: ')) {
                            const data = line.slice(6);

                            // Check if it's a progress message
                            if (data.startsWith('[Generating...]')) {
                                const progressMsg = data.replace('[Generating...]', '').trim();
                                setGenerationProgress(progressMsg);
                            }
                            // Check if it's the final JSON
                            else if (data.startsWith('{')) {
                                try {
                                    const jsonData = JSON.parse(data);
                                    console.log('=== API Response Received ===');
                                    console.log('Full Response:', jsonData);
                                    console.log('Course Metadata:', jsonData.courseMetadata);
                                    console.log('Tree:', jsonData.tree);
                                    
                                    // Validate response structure
                                    if (!jsonData.tree || !Array.isArray(jsonData.tree)) {
                                        console.error('Invalid API response structure:', jsonData);
                                        throw new Error('Invalid response structure: missing or invalid tree');
                                    }
                                    
                                    // Store course metadata (with fallback for missing fields)
                                    const metadata = {
                                        ...jsonData.courseMetadata,
                                        // Fallback for mediaImageUrl if not provided by API
                                        mediaImageUrl: jsonData.courseMetadata?.mediaImageUrl || 
                                                      jsonData.courseMetadata?.bannerImageUrl || 
                                                      jsonData.courseMetadata?.previewImageUrl
                                    };
                                    setCourseMetadata(metadata);
                                    console.log('Course Metadata Set:', metadata);

                                    // Store todos for later use in content generation
                                    if (jsonData.todos && Array.isArray(jsonData.todos)) {
                                        setOutlineTodos(jsonData.todos);
                                        console.log('Stored todos for content generation:', jsonData.todos.length);
                                    }

                                    // Transform API response to slides format
                                    const generatedSlides = transformApiResponseToSlides(jsonData, courseConfig);
                                    console.log('Generated Slides Count:', generatedSlides.length);
                                    
                                    if (generatedSlides.length === 0) {
                                        console.warn('No slides generated from API response');
                                    }
                                    
                                    setSlides(generatedSlides);

                                    // Pre-expand all sessions
                                    const allSessionIds = new Set(generatedSlides.map((slide: SlideGeneration) => slide.sessionId));
                                    setExpandedSessions(allSessionIds);

                                    // Stop countdown and hide loader immediately when data arrives
                                    setIsGenerating(false);
                                    setEstimatedTimeRemaining(0);
                                    setGenerationProgress('Complete!');
                                } catch (e) {
                                    console.error('=== Error Processing Response ===');
                                    console.error('Error:', e);
                                    console.error('Raw data:', data);
                                    setIsGenerating(false);
                                    alert(`Failed to process course data: ${e instanceof Error ? e.message : `Unknown error`}`);
                                }
                            }
                        }
                    }
                }
            } catch (error) {
                console.error('=== Error Generating Course Outline ===');
                console.error('Error:', error);
                if (error instanceof Error) {
                    console.error('Error Message:', error.message);
                    console.error('Error Stack:', error.stack);
                }
                setSlides([]);
                setIsGenerating(false);
                alert(`Failed to generate course outline: ${error instanceof Error ? error.message : `Unknown error`}. Check console for details.`);
            }
        };

        generateCourseOutline();
    }, []); // Empty dependency array ensures this only runs once on mount

    // Transform API response to slides format using tree for hierarchy and todos for content
    const transformApiResponseToSlides = (apiResponse: any, courseConfig: any): SlideGeneration[] => {
        const slides: SlideGeneration[] = [];
        const tree = apiResponse.tree;
        const todos = apiResponse.todos;
        
        if (!tree || tree.length === 0) {
            console.warn('No tree found in API response');
            return slides;
        }

        if (!todos || todos.length === 0) {
            console.warn('No todos found in API response');
            return slides;
        }

        console.log('Processing tree and todos');
        console.log('Tree:', tree);
        console.log('Todos:', todos);

        const courseNode = tree[0]; // Root course node
        const courseDepth = apiResponse.courseMetadata?.course_depth || 3;
        
        console.log('Course depth:', courseDepth);

        // Extract chapters based on depth
        let chapters: any[] = [];
        
        if (courseDepth === 5) {
            // Course → Subject → Module → Chapter → Slide
            const subjects = courseNode.children || [];
            subjects.forEach((subject: any) => {
                const modules = subject.children || [];
                modules.forEach((module: any) => {
                    const moduleChapters = module.children || [];
                    chapters.push(...moduleChapters);
                });
            });
        } else if (courseDepth === 4) {
            // Course → Module → Chapter → Slide
            const modules = courseNode.children || [];
            modules.forEach((module: any) => {
                const moduleChapters = module.children || [];
                chapters.push(...moduleChapters);
            });
        } else {
            // Course → Chapter → Slide (depth 3 or less)
            chapters = courseNode.children || [];
        }

        console.log('Extracted chapters:', chapters);

        // Group todos by chapter_name for mapping
        const todosByChapter = new Map<string, any[]>();
        todos.forEach((todo: any) => {
            const chapterName = todo.chapter_name || 'Uncategorized';
            if (!todosByChapter.has(chapterName)) {
                todosByChapter.set(chapterName, []);
            }
            todosByChapter.get(chapterName)!.push(todo);
        });

        console.log('Todos grouped by chapter:', Array.from(todosByChapter.entries()));

        // Create slides from chapters and their todos
        chapters.forEach((chapter: any, chapterIndex: number) => {
            const sessionId = `session-${chapterIndex + 1}`;
            const sessionTitle = chapter.title;
            
            // Get todos for this chapter
            const chapterTodos = todosByChapter.get(sessionTitle) || [];
            
            // Sort todos by order
            chapterTodos.sort((a, b) => (a.order || 0) - (b.order || 0));

            console.log(`Chapter "${sessionTitle}" has ${chapterTodos.length} todos`);

            // Create slides from todos
            chapterTodos.forEach((todo: any, todoIndex: number) => {
                // Map todo type to slide type
                let slideType: SlideType = 'doc';
                if (todo.type === 'DOCUMENT') {
                    slideType = 'doc';
                } else if (todo.type === 'VIDEO') {
                    slideType = 'video';
                } else if (todo.type === 'QUIZ' || todo.type === 'ASSESSMENT') {
                    slideType = 'quiz';
                }

                slides.push({
                    id: `${sessionId}-slide-${todoIndex + 1}`,
                    sessionId,
                    sessionTitle,
                    slideTitle: todo.title || todo.name,
                    slideType,
                    status: 'completed',
                    progress: 100,
                    content: todo.prompt || `<h2>${todo.title || todo.name}</h2><p>No prompt available</p>`, // Show the prompt in content
                    topicIndex: todoIndex,
                    prompt: todo.prompt || `Content for ${todo.title || todo.name}`, // Keep prompt in prompt field too
                });
            });
        });

        console.log('Generated slides:', slides.length);
        return slides;
    };

    // Helper function to check if a document slide has an image
    const documentHasImage = (content?: string): boolean => {
        if (!content) return false;
        // Check for img tags or mermaid diagrams (which are converted to images)
        return content.includes('<img') ||
               content.includes('mermaid.ink') ||
               content.includes('graph') ||
               content.includes('flowchart') ||
               content.includes('sequenceDiagram') ||
               content.includes('classDiagram');
    };

    const handleRegenerate = (slideId: string, section?: 'video' | 'code') => {
        const slide = slides.find((s) => s.id === slideId);
        if (!slide) return;

        // Store which section is being regenerated
        setRegeneratingSection(section);

        // Check if this is a document with image or video type
        // Proceed directly to regenerate dialog - no limitations on generating page
        setRegeneratingSlideId(slideId);
        setRegenerateSlideDialogOpen(true);
    };

    const handleConfirmRegenerateSlide = () => {
        if (!regenerateSlidePrompt.trim() || !regeneratingSlideId) {
            return;
        }
        setRegenerateSlideDialogOpen(false);

        // Update slide to generating status and increment regeneration count
        setSlides((prev) =>
            prev.map((slide) => {
                if (slide.id === regeneratingSlideId) {
                    const currentCount = slide.regenerationCount || 0;
                    return {
                        ...slide,
                        status: 'generating',
                        progress: 0,
                        regenerationCount: currentCount + 1
                    };
                }
                return slide;
            })
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

        // Extract slide titles from slides (slides with type 'topic' or titles starting with 'Topic')
        const slideTitles = extractSlideTitlesFromSlides(session.slides);

        // Pre-fill prompt with a default based on chapter data
        const defaultPrompt = `Regenerate the chapter "${session.sessionTitle}"${slideTitles.length > 0 ? ` with the following slides: ${slideTitles.join(", ")}.` : `.`}`;
        setRegenerateSessionPrompt(defaultPrompt);

        // Default chapter length (we don't have duration info in SessionProgress)
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

        // Pre-fill slides from session slides
        setRegenerateSessionTopics(slideTitles);

        // Pre-fill number of slides
        setRegenerateSessionNumberOfTopics(slideTitles.length.toString());

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
            slideTitle: 'New Page',
            slideType: selectedAddSlideType,
            status: 'generating',
            progress: 0,
        };

        setSlides((prev) => {
            // Remove placeholder slides from this session when adding a real slide
            const withoutPlaceholders = prev.filter(
                s => !(s.sessionId === addingSlideToSessionId && s.slideTitle === '_placeholder_')
            );
            return [...withoutPlaceholders, newSlide];
        });

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
        setAddSessionName('');
        setAddSessionDialogOpen(true);
    };

    const handleConfirmAddSession = () => {
        if (!addSessionName.trim()) {
            return;
        }
        setAddSessionDialogOpen(false);

        // Create new chapter with the provided name
        const newSessionId = `session-${Date.now()}`;
        const newSessionTitle = addSessionName.trim();

        // Create a placeholder slide so the chapter appears in the list
        // This slide acts as a marker for the session
        const placeholderSlide: SlideGeneration = {
            id: `${newSessionId}-placeholder-${Date.now()}`,
            sessionId: newSessionId,
            sessionTitle: newSessionTitle,
            slideTitle: '_placeholder_',
            slideType: 'doc',
            status: 'completed',
            progress: 100,
            content: '',
            prompt: '',
        };

        // Add the placeholder slide
        setSlides((prev) => [...prev, placeholderSlide]);
        
        // Reset the form
        setAddSessionName('');
        
        // Expand the new session so user can add pages
        setExpandedSessions(prev => new Set([...prev, newSessionId]));
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
        setBackToLibraryDialogOpen(true);
    };

    const handleDiscardCourse = () => {
        setBackToLibraryDialogOpen(false);
        navigate({ to: '/study-library/ai-copilot' });
    };

    const handleSaveToDrafts = () => {
        // Save current course data to drafts
        const courseData = {
            sessions: sessionsWithProgress,
            slides: slides,
            timestamp: new Date().toISOString()
        };
        // Get existing drafts or initialize empty array
        const existingDrafts = JSON.parse(localStorage.getItem('courseDrafts') || '[]');
        existingDrafts.push(courseData);
        localStorage.setItem('courseDrafts', JSON.stringify(existingDrafts));
        setBackToLibraryDialogOpen(false);
        navigate({ to: '/study-library/ai-copilot/course-outline' });
    };

    // Countdown timer for estimated time
    useEffect(() => {
        if (!isGenerating || slides.length > 0 || estimatedTimeRemaining <= 0) {
            return;
        }

        const timer = setInterval(() => {
            setEstimatedTimeRemaining((prev) => Math.max(0, prev - 1));
        }, 1000);

        return () => clearInterval(timer);
    }, [isGenerating, slides.length, estimatedTimeRemaining]);

    // Loading state - show AI generating loader
    if (isGenerating && slides.length === 0) {
        return (
            <LayoutContainer>
                <Helmet>
                    <title>Generating Course Outline...</title>
                </Helmet>
                <OutlineGeneratingLoader estimatedTimeRemaining={estimatedTimeRemaining} />
            </LayoutContainer>
        );
    }

    return (
        <LayoutContainer>
            <Helmet>
                <title>Review Course Outline</title>
                <meta name="description" content="Review and refine your AI-generated course outline." />
            </Helmet>
            <div className="min-h-screen bg-gradient-to-b from-indigo-50 via-white to-purple-50">
                <div className="mx-auto max-w-[1600px] px-4 py-6 sm:px-6 lg:px-8">
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
                                Back to Create Course
                            </button>

                            {/* Action Buttons - Top Right */}
                            <div className="flex items-center gap-3">
                                <MyButton
                                    buttonType="primary"
                                    onClick={() => {
                                        setGenerateCourseAssetsDialogOpen(true);
                                    }}
                                    disabled={!allSessionsCompleted || isGeneratingContent}
                                >
                                    {isGeneratingContent ? (
                                        <>
                                            <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                                            Generating...
                                        </>
                                    ) : isContentGenerated ? (
                                        <>
                                            <CheckCircle className="h-4 w-4 mr-1" />
                                            Create Course
                                        </>
                                    ) : (
                                        <>
                                            <Sparkles className="h-4 w-4 mr-1" />
                                            Generate Page Content
                                        </>
                                    )}
                                </MyButton>
                            </div>
                        </div>

                        <div>
                            <h1 className="mb-2 text-3xl font-semibold text-neutral-900">
                                Step 1: Review Your Course Outline
                            </h1>
                            <p className="text-base text-gray-600">
                                Review the course outline, topics, and objectives generated for your course. Once everything looks right, click Generate to begin creating your course materials.
                            </p>
                        </div>
                    </motion.div>

                    {/* Two Column Layout - Sessions List & Metadata */}
                    <div className="grid gap-6 lg:grid-cols-[1fr_400px]">
                        {/* Left Column - Sessions List */}
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.5, delay: 0.1 }}
                            className="rounded-xl bg-white p-6 shadow-md"
                        >
                            <div className="mb-4 flex items-center justify-between">
                                <h2 className="flex items-center gap-2 text-2xl font-semibold text-neutral-900">
                                    <Layers className="h-6 w-6 text-indigo-600" />
                                    Course Outline
                                </h2>
                                <div className="flex gap-2">
                                    <MyButton
                                        buttonType="secondary"
                                        scale="small"
                                        onClick={handleToggleAllSessions}
                                    >
                                        {isAllExpanded ? (
                                            <>
                                                <ChevronsUp className="h-3 w-3" />
                                                Collapse All
                                            </>
                                        ) : (
                                            <>
                                                <ChevronsDown className="h-3 w-3" />
                                                Expand All
                                            </>
                                        )}
                                    </MyButton>
                                </div>
                            </div>

                            <DndContext
                                sensors={sensors}
                                collisionDetection={closestCenter}
                                onDragEnd={handleSessionDragEnd}
                            >
                                <SortableContext
                                    items={Array.isArray(sessionsWithProgress) && sessionsWithProgress.length > 0 ? sessionsWithProgress.map((s) => s.sessionId) : []}
                                    strategy={verticalListSortingStrategy}
                                >
                                    {!Array.isArray(sessionsWithProgress) || sessionsWithProgress.length === 0 ? (
                                        <div className="text-center py-8 text-neutral-500">
                                            <span>No sessions available. Please try refreshing the page.</span>
                                        </div>
                                    ) : (
                                        <Accordion
                                            type="multiple"
                                            value={Array.from(expandedSessions)}
                                            onValueChange={(value) => setExpandedSessions(new Set(value))}
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
                                                                    items={session.slides.filter(s => s.slideTitle !== '_placeholder_').map((s) => s.id)}
                                                                    strategy={verticalListSortingStrategy}
                                                                >
                                                                    <div className="space-y-2">
                                                                        {session.slides
                                                                            .filter(slide => slide.slideTitle !== '_placeholder_')
                                                                            .map((slide) => (
                                                                                <SortableSlideItem
                                                                                    key={slide.id}
                                                                                    slide={slide}
                                                                                    onEdit={handleSlideEdit}
                                                                                    onDelete={handleDelete}
                                                                                    getSlideIcon={getSlideIcon}
                                                                                    onRegenerate={handleRegenerate}
                                                                                    onContentEdit={handleSlideContentEdit}
                                                                                />
                                                                            ))}
                                                                        {/* Add Page Button */}
                                                                        <button 
                                                                            className="flex w-full items-center justify-center gap-2 rounded-md border-2 border-dashed border-neutral-300 bg-neutral-50 px-4 py-3 text-sm font-medium text-neutral-600 transition-colors hover:border-indigo-400 hover:bg-indigo-50"
                                                                            onClick={() => {
                                                                                setAddingSlideToSessionId(session.sessionId);
                                                                                setAddSlideDialogOpen(true);
                                                                            }}
                                                                        >
                                                                            <Plus className="h-4 w-4" />
                                                                            Add Page
                                                                        </button>
                                                                    </div>
                                                                </SortableContext>
                                                            </DndContext>
                                                        </div>
                                                    </AccordionContent>
                                                </SortableSessionItem>
                                            ))}
                                        </Accordion>
                                    )}
                                </SortableContext>
                            </DndContext>

                            {/* Add Chapter Button */}
                            <button
                                onClick={handleAddSession}
                                className="mt-4 flex w-full items-center justify-center gap-2 rounded-md border-2 border-dashed border-neutral-300 bg-neutral-50 px-4 py-3 text-sm font-medium text-neutral-600 transition-colors hover:border-indigo-400 hover:bg-indigo-50"
                            >
                                <Plus className="h-4 w-4" />
                                Add Chapter
                            </button>
                        </motion.div>

                        {/* Right Column - Course Metadata */}
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.5, delay: 0.2 }}
                            className="space-y-4"
                        >
                            {/* Course Name - only show after API response */}
                            {courseMetadata?.course_name && (
                                <div className="rounded-xl bg-white p-4 shadow-md">
                                    <div className="mb-3 flex items-center justify-between">
                                        <label className="text-base font-bold text-neutral-900">Course name</label>
                                        <div className="flex gap-2">
                                            {editingMetadataField !== 'course_name' && (
                                                <button
                                                    onClick={() => handleEditMetadataField('course_name', courseMetadata.course_name)}
                                                    className="rounded p-1 text-xs text-indigo-600 hover:bg-indigo-50"
                                                    title="Edit"
                                                >
                                                    <Pencil className="h-3 w-3" />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                    {editingMetadataField === 'course_name' ? (
                                        <div className="space-y-2">
                                            <Input
                                                value={metadataEditValues.course_name || ''}
                                                onChange={(e) => setMetadataEditValues({ course_name: e.target.value })}
                                                className="text-sm"
                                            />
                                            <div className="flex gap-2">
                                                <MyButton
                                                    buttonType="primary"
                                                    scale="small"
                                                    onClick={() => handleSaveMetadataEdit('course_name')}
                                                >
                                                    Save
                                                </MyButton>
                                                <MyButton
                                                    buttonType="secondary"
                                                    scale="small"
                                                    onClick={handleCancelMetadataEdit}
                                                >
                                                    Cancel
                                                </MyButton>
                                            </div>
                                        </div>
                                    ) : (
                                        <p className="text-sm text-neutral-900">
                                            {courseMetadata.course_name}
                                        </p>
                                    )}
                                </div>
                            )}

                            {/* Description - only show after API response */}
                            {courseMetadata?.about_the_course_html && (
                                <div className="rounded-xl bg-white p-4 shadow-md">
                                    <div className="mb-3 flex items-center justify-between">
                                        <label className="text-base font-bold text-neutral-900">Description</label>
                                        <div className="flex gap-2">
                                            {editingMetadataField !== 'description' && (
                                                <button
                                                    onClick={() => {
                                                        // Extract first paragraph or 2-3 sentences from about_the_course_html
                                                        const tempDiv = document.createElement('div');
                                                        tempDiv.innerHTML = courseMetadata.about_the_course_html;
                                                        const textContent = tempDiv.textContent || tempDiv.innerText || '';
                                                        const sentences = textContent.match(/[^.!?]+[.!?]+/g) || [];
                                                        const shortDescription = sentences.slice(0, 3).join(' ');
                                                        handleEditMetadataField('description', courseMetadata.description || shortDescription);
                                                    }}
                                                    className="rounded p-1 text-xs text-indigo-600 hover:bg-indigo-50"
                                                    title="Edit"
                                                >
                                                    <Pencil className="h-3 w-3" />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                    {editingMetadataField === 'description' ? (
                                        <div className="space-y-2">
                                            <Textarea
                                                value={metadataEditValues.description || ''}
                                                onChange={(e) => setMetadataEditValues({ description: e.target.value })}
                                                className="min-h-[80px] text-sm"
                                            />
                                            <div className="flex gap-2">
                                                <MyButton
                                                    buttonType="primary"
                                                    scale="small"
                                                    onClick={() => handleSaveMetadataEdit('description')}
                                                >
                                                    Save
                                                </MyButton>
                                                <MyButton
                                                    buttonType="secondary"
                                                    scale="small"
                                                    onClick={handleCancelMetadataEdit}
                                                >
                                                    Cancel
                                                </MyButton>
                                            </div>
                                        </div>
                                    ) : (
                                        <p className="text-sm text-neutral-700">
                                            {(() => {
                                                // If description exists, use it
                                                if (courseMetadata.description) {
                                                    return courseMetadata.description;
                                                }
                                                // Otherwise extract first paragraph or 2-3 sentences from about_the_course_html
                                                const tempDiv = document.createElement('div');
                                                tempDiv.innerHTML = courseMetadata.about_the_course_html;
                                                const textContent = tempDiv.textContent || tempDiv.innerText || '';
                                                const sentences = textContent.match(/[^.!?]+[.!?]+/g) || [];
                                                return sentences.slice(0, 3).join(' ');
                                            })()}
                                        </p>
                                    )}
                                </div>
                            )}

                            {/* Level */}
                            {courseMetadata && (
                                <div className="rounded-xl bg-white p-4 shadow-md">
                                    <div className="mb-3 flex items-center justify-between">
                                        <label className="text-base font-bold text-neutral-900">Level</label>
                                    </div>
                                    <Select
                                        value={courseMetadata.level || 'Beginner'}
                                        onValueChange={(value) => {
                                            setCourseMetadata((prev: any) => ({ ...prev, level: value }));
                                        }}
                                    >
                                        <SelectTrigger className="w-full text-sm">
                                            <SelectValue placeholder="Select level" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Beginner">Beginner</SelectItem>
                                            <SelectItem value="Basic">Basic</SelectItem>
                                            <SelectItem value="Intermediate">Intermediate</SelectItem>
                                            <SelectItem value="Advanced">Advanced</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            )}

                            {/* Course Tags */}
                            {courseMetadata?.tags && courseMetadata.tags.length > 0 && (
                                <div className="rounded-xl bg-white p-4 shadow-md">
                                    <div className="mb-3 flex items-center justify-between">
                                        <label className="text-base font-bold text-neutral-900">Course tags</label>
                                        <div className="flex gap-2">
                                            {editingMetadataField !== 'tags' && (
                                                <button
                                                    onClick={() => handleEditMetadataField('tags', courseMetadata.tags.join(', '))}
                                                    className="rounded p-1 text-xs text-indigo-600 hover:bg-indigo-50"
                                                    title="Edit"
                                                >
                                                    <Pencil className="h-3 w-3" />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                    {editingMetadataField === 'tags' ? (
                                        <div className="space-y-2">
                                            <Textarea
                                                value={metadataEditValues.tags || ''}
                                                onChange={(e) => setMetadataEditValues({ tags: e.target.value })}
                                                placeholder="Enter tags separated by commas"
                                                className="min-h-[60px] text-sm"
                                            />
                                            <div className="flex gap-2">
                                                <MyButton
                                                    buttonType="primary"
                                                    scale="small"
                                                    onClick={() => {
                                                        const tags = metadataEditValues.tags.split(',').map((t: string) => t.trim()).filter((t: string) => t);
                                                        setCourseMetadata((prev: any) => ({ ...prev, tags }));
                                                        handleSaveMetadataEdit('tags');
                                                    }}
                                                >
                                                    Save
                                                </MyButton>
                                                <MyButton
                                                    buttonType="secondary"
                                                    scale="small"
                                                    onClick={handleCancelMetadataEdit}
                                                >
                                                    Cancel
                                                </MyButton>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="flex flex-wrap gap-2">
                                            {courseMetadata.tags.map((tag: string, index: number) => (
                                                <span
                                                    key={index}
                                                    className="inline-flex items-center gap-1 rounded-full bg-indigo-50 px-2 py-1 text-xs font-medium text-indigo-700"
                                                >
                                                    <Tag className="h-3 w-3" />
                                                    {tag}
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Course Preview Image */}
                            <div className="rounded-xl bg-white p-4 shadow-md">
                                <div className="mb-3 flex items-center justify-between">
                                    <div>
                                        <label className="text-base font-bold text-neutral-900">
                                            Course preview image
                                        </label>
                                        <p className="mt-1 text-xs text-neutral-500">
                                            Thumbnail shown on course cards
                                        </p>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    {courseMetadata?.previewImageUrl ? (
                                        <div className="relative">
                                            <div className="w-full aspect-[16/9] rounded-lg overflow-hidden">
                                                <img
                                                    src={courseMetadata.previewImageUrl}
                                                    alt="Course preview"
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>
                                            <button
                                                onClick={() => {
                                                    setCourseMetadata((prev: any) => ({ ...prev, previewImageUrl: null }));
                                                }}
                                                className="absolute right-2 top-2 rounded-full bg-red-500 p-1 text-white hover:bg-red-600"
                                                title="Remove image"
                                            >
                                                <X className="h-3 w-3" />
                                            </button>
                                            <div className="mt-2">
                                                <label className="flex cursor-pointer items-center gap-1.5 rounded-md border border-neutral-300 bg-white px-3 py-1.5 text-xs font-medium text-neutral-700 transition-colors hover:bg-neutral-50">
                                                    <Upload className="h-3 w-3" />
                                                    <input
                                                        type="file"
                                                        accept="image/*"
                                                        className="hidden"
                                                        onChange={(e) => {
                                                            const file = e.target.files?.[0];
                                                            if (file) {
                                                                const url = URL.createObjectURL(file);
                                                                setCourseMetadata((prev: any) => ({ ...prev, previewImageUrl: url }));
                                                            }
                                                        }}
                                                    />
                                                    Upload
                                                </label>
                                            </div>
                                        </div>
                                    ) : (
                                        <label className="flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-neutral-300 bg-neutral-50 p-4 transition-colors hover:border-indigo-400 hover:bg-indigo-50">
                                            <input
                                                type="file"
                                                accept="image/*"
                                                className="hidden"
                                                onChange={(e) => {
                                                    const file = e.target.files?.[0];
                                                    if (file) {
                                                        const url = URL.createObjectURL(file);
                                                        setCourseMetadata((prev: any) => ({ ...prev, previewImageUrl: url }));
                                                    }
                                                }}
                                            />
                                            <ImageIcon className="mb-2 h-8 w-8 text-neutral-400" />
                                            <span className="text-sm font-medium text-neutral-600">
                                                Click to upload preview image
                                            </span>
                                            <span className="mt-1 text-xs text-neutral-500">
                                                Thumbnail for course card
                                            </span>
                                        </label>
                                    )}
                                </div>
                            </div>

                            {/* Course Banner Image */}
                            <div className="rounded-xl bg-white p-4 shadow-md">
                                <div className="mb-3 flex items-center justify-between">
                                    <div>
                                        <label className="text-base font-bold text-neutral-900">
                                            Course banner image
                                        </label>
                                        <p className="mt-1 text-xs text-neutral-500">
                                            Wide header image on course detail page
                                        </p>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    {courseMetadata?.bannerImageUrl ? (
                                        <div className="relative">
                                            <div className="w-full aspect-[16/9] rounded-lg overflow-hidden">
                                                <img
                                                    src={courseMetadata.bannerImageUrl}
                                                    alt="Course banner"
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>
                                            <button
                                                onClick={() => {
                                                    setCourseMetadata((prev: any) => ({ ...prev, bannerImageUrl: null }));
                                                }}
                                                className="absolute right-2 top-2 rounded-full bg-red-500 p-1 text-white hover:bg-red-600"
                                                title="Remove image"
                                            >
                                                <X className="h-3 w-3" />
                                            </button>
                                            <div className="mt-2">
                                                <label className="flex cursor-pointer items-center gap-1.5 rounded-md border border-neutral-300 bg-white px-3 py-1.5 text-xs font-medium text-neutral-700 transition-colors hover:bg-neutral-50">
                                                    <Upload className="h-3 w-3" />
                                                    <input
                                                        type="file"
                                                        accept="image/*"
                                                        className="hidden"
                                                        onChange={(e) => {
                                                            const file = e.target.files?.[0];
                                                            if (file) {
                                                                const url = URL.createObjectURL(file);
                                                                setCourseMetadata((prev: any) => ({ ...prev, bannerImageUrl: url }));
                                                            }
                                                        }}
                                                    />
                                                    Upload
                                                </label>
                                            </div>
                                        </div>
                                    ) : (
                                        <label className="flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-neutral-300 bg-neutral-50 p-4 transition-colors hover:border-indigo-400 hover:bg-indigo-50">
                                            <input
                                                type="file"
                                                accept="image/*"
                                                className="hidden"
                                                onChange={(e) => {
                                                    const file = e.target.files?.[0];
                                                    if (file) {
                                                        const url = URL.createObjectURL(file);
                                                        setCourseMetadata((prev: any) => ({ ...prev, bannerImageUrl: url }));
                                                    }
                                                }}
                                            />
                                            <ImageIcon className="mb-2 h-8 w-8 text-neutral-400" />
                                            <span className="text-sm font-medium text-neutral-600">
                                                Click to upload banner image
                                            </span>
                                            <span className="mt-1 text-xs text-neutral-500">
                                                Wide header for course detail page
                                            </span>
                                        </label>
                                    )}
                                </div>
                            </div>

                            {/* Course Media */}
                            <div className="rounded-xl bg-white p-4 shadow-md">
                                <div className="mb-3 flex items-center justify-between">
                                    <div>
                                        <label className="text-base font-bold text-neutral-900">Course Media</label>
                                        <p className="mt-1 text-xs text-neutral-500">
                                            Featured image or video for course page
                                            {!courseMetadata?.courseMedia && (courseMetadata?.mediaImageUrl || courseMetadata?.bannerImageUrl || courseMetadata?.previewImageUrl) && ' - Using fallback image'}
                                        </p>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    {(courseMetadata?.courseMedia || courseMetadata?.mediaImageUrl || courseMetadata?.bannerImageUrl || courseMetadata?.previewImageUrl) ? (
                                        <div className="relative">
                                            {courseMetadata?.courseMedia && courseMetadata.courseMediaType === 'youtube' ? (
                                                <div className="w-full aspect-[16/9] rounded-lg overflow-hidden">
                                                    <iframe
                                                        src={courseMetadata.courseMedia}
                                                        className="w-full h-full rounded-lg"
                                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                                        allowFullScreen
                                                    />
                                                </div>
                                            ) : courseMetadata?.courseMedia && courseMetadata.courseMediaType === 'video' ? (
                                                <div className="w-full aspect-[16/9] rounded-lg overflow-hidden">
                                                    <video
                                                        src={courseMetadata.courseMedia}
                                                        className="w-full h-full object-cover"
                                                        controls
                                                    />
                                                </div>
                                            ) : (
                                                <div className="w-full aspect-[16/9] rounded-lg overflow-hidden">
                                                    <img
                                                        src={courseMetadata?.courseMedia || courseMetadata?.mediaImageUrl || courseMetadata?.bannerImageUrl || courseMetadata?.previewImageUrl}
                                                        alt="Course media"
                                                        className="w-full h-full object-cover"
                                                    />
                                                </div>
                                            )}
                                            <button
                                                onClick={() =>
                                                    setCourseMetadata((prev: any) => ({
                                                        ...prev,
                                                        courseMedia: undefined,
                                                        courseMediaType: undefined,
                                                    }))
                                                }
                                                className="absolute right-2 top-2 rounded-full bg-red-500 p-1 text-white hover:bg-red-600"
                                                title="Remove media"
                                            >
                                                <X className="h-3 w-3" />
                                            </button>
                                            <div className="mt-2 flex gap-2">
                                                <label className="flex cursor-pointer items-center gap-1.5 rounded-md border border-neutral-300 bg-white px-3 py-1.5 text-xs font-medium text-neutral-700 transition-colors hover:bg-neutral-50">
                                                    <Upload className="h-3 w-3" />
                                                    <input
                                                        type="file"
                                                        accept="image/*,video/*"
                                                        className="hidden"
                                                        onChange={(e) => {
                                                            const file = e.target.files?.[0];
                                                            if (file) {
                                                                const url = URL.createObjectURL(file);
                                                                const type = file.type.startsWith('video/') ? 'video' : 'image';
                                                                setCourseMetadata((prev: any) => ({
                                                                    ...prev,
                                                                    courseMedia: url,
                                                                    courseMediaType: type,
                                                                }));
                                                            }
                                                        }}
                                                    />
                                                    Upload
                                                </label>
                                                <button
                                                    onClick={() => setMediaEditMode('youtube')}
                                                    className="flex items-center gap-1.5 rounded-md border border-neutral-300 bg-white px-3 py-1.5 text-xs font-medium text-neutral-700 transition-colors hover:bg-neutral-50"
                                                >
                                                    <Video className="h-3 w-3" />
                                                    YouTube Link
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="space-y-2">
                                            {mediaEditMode === 'youtube' ? (
                                                <div className="space-y-2">
                                                    <Input
                                                        placeholder="Paste YouTube URL here"
                                                        className="text-sm"
                                                        onKeyDown={(e) => {
                                                            if (e.key === 'Enter') {
                                                                const url = (e.target as HTMLInputElement).value;
                                                                if (isYouTubeUrl(url)) {
                                                                    const embedUrl = getYouTubeEmbedUrl(url);
                                                                    if (embedUrl) {
                                                                        setCourseMetadata((prev: any) => ({
                                                                            ...prev,
                                                                            courseMedia: embedUrl,
                                                                            courseMediaType: 'youtube',
                                                                        }));
                                                                        setMediaEditMode(null);
                                                                    }
                                                                }
                                                            }
                                                        }}
                                                        autoFocus
                                                    />
                                                    <div className="flex gap-2">
                                                        <MyButton
                                                            buttonType="primary"
                                                            scale="small"
                                                            onClick={(e) => {
                                                                const input = (e.target as HTMLElement).closest('div')?.querySelector('input') as HTMLInputElement;
                                                                if (input) {
                                                                    const url = input.value;
                                                                    if (isYouTubeUrl(url)) {
                                                                        const embedUrl = getYouTubeEmbedUrl(url);
                                                                        if (embedUrl) {
                                                                            setCourseMetadata((prev: any) => ({
                                                                                ...prev,
                                                                                courseMedia: embedUrl,
                                                                                courseMediaType: 'youtube',
                                                                            }));
                                                                            setMediaEditMode(null);
                                                                        }
                                                                    }
                                                                }
                                                            }}
                                                        >
                                                            Save
                                                        </MyButton>
                                                        <MyButton
                                                            buttonType="secondary"
                                                            scale="small"
                                                            onClick={() => setMediaEditMode(null)}
                                                        >
                                                            Cancel
                                                        </MyButton>
                                                    </div>
                                                </div>
                                            ) : (
                                                <>
                                                    <label className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg border border-neutral-300 bg-white px-4 py-2 text-sm font-medium text-neutral-700 transition-colors hover:bg-neutral-50">
                                                        <input
                                                            type="file"
                                                            accept="image/*,video/*"
                                                            className="hidden"
                                                            onChange={(e) => {
                                                                const file = e.target.files?.[0];
                                                                if (file) {
                                                                    const url = URL.createObjectURL(file);
                                                                    const type = file.type.startsWith('video/') ? 'video' : 'image';
                                                                    setCourseMetadata((prev: any) => ({
                                                                        ...prev,
                                                                        courseMedia: url,
                                                                        courseMediaType: type,
                                                                    }));
                                                                }
                                                            }}
                                                        />
                                                        <ImageIcon className="h-4 w-4" />
                                                        Upload Image or Video
                                                    </label>
                                                    <button
                                                        onClick={() => setMediaEditMode('youtube')}
                                                        className="flex w-full items-center justify-center gap-2 rounded-lg border border-neutral-300 bg-white px-4 py-2 text-sm font-medium text-neutral-700 transition-colors hover:bg-neutral-50"
                                                    >
                                                        <Video className="h-4 w-4" />
                                                        Add YouTube Link
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* What learners will gain Section */}
                            {courseMetadata?.why_learn_html && (
                                <div className="rounded-xl bg-white p-4 shadow-md">
                                    <div className="mb-3 flex items-center justify-between">
                                        <label className="text-base font-bold text-neutral-900">What learners will gain</label>
                                        <div className="flex gap-2">
                                            {editingMetadataField !== 'why_learn_html' && (
                                                <button
                                                    onClick={() => handleEditMetadataField('why_learn_html', courseMetadata.why_learn_html)}
                                                    className="rounded p-1 text-xs text-indigo-600 hover:bg-indigo-50"
                                                    title="Edit"
                                                >
                                                    <Pencil className="h-3 w-3" />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                    {editingMetadataField === 'why_learn_html' ? (
                                        <div className="space-y-2">
                                            <Textarea
                                                value={metadataEditValues.why_learn_html || ''}
                                                onChange={(e) => setMetadataEditValues({ why_learn_html: e.target.value })}
                                                className="min-h-[80px] text-sm"
                                            />
                                            <div className="flex gap-2">
                                                <MyButton
                                                    buttonType="primary"
                                                    scale="small"
                                                    onClick={() => handleSaveMetadataEdit('why_learn_html')}
                                                >
                                                    Save
                                                </MyButton>
                                                <MyButton
                                                    buttonType="secondary"
                                                    scale="small"
                                                    onClick={handleCancelMetadataEdit}
                                                >
                                                    Cancel
                                                </MyButton>
                                            </div>
                                        </div>
                                    ) : (
                                        <div 
                                            className="text-sm text-neutral-700 prose prose-sm max-w-none"
                                            dangerouslySetInnerHTML={{ __html: courseMetadata.why_learn_html }}
                                        />
                                    )}
                                </div>
                            )}

                            {/* Who Should Join Section */}
                            {courseMetadata?.who_should_learn_html && (
                                <div className="rounded-xl bg-white p-4 shadow-md">
                                    <div className="mb-3 flex items-center justify-between">
                                        <label className="text-base font-bold text-neutral-900">Who Should Join</label>
                                        <div className="flex gap-2">
                                            {editingMetadataField !== 'who_should_learn_html' && (
                                                <button
                                                    onClick={() => handleEditMetadataField('who_should_learn_html', courseMetadata.who_should_learn_html)}
                                                    className="rounded p-1 text-xs text-indigo-600 hover:bg-indigo-50"
                                                    title="Edit"
                                                >
                                                    <Pencil className="h-3 w-3" />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                    {editingMetadataField === 'who_should_learn_html' ? (
                                        <div className="space-y-2">
                                            <Textarea
                                                value={metadataEditValues.who_should_learn_html || ''}
                                                onChange={(e) => setMetadataEditValues({ who_should_learn_html: e.target.value })}
                                                className="min-h-[80px] text-sm"
                                            />
                                            <div className="flex gap-2">
                                                <MyButton
                                                    buttonType="primary"
                                                    scale="small"
                                                    onClick={() => handleSaveMetadataEdit('who_should_learn_html')}
                                                >
                                                    Save
                                                </MyButton>
                                                <MyButton
                                                    buttonType="secondary"
                                                    scale="small"
                                                    onClick={handleCancelMetadataEdit}
                                                >
                                                    Cancel
                                                </MyButton>
                                            </div>
                                        </div>
                                    ) : (
                                        <div 
                                            className="text-sm text-neutral-700 prose prose-sm max-w-none"
                                            dangerouslySetInnerHTML={{ __html: courseMetadata.who_should_learn_html }}
                                        />
                                    )}
                                </div>
                            )}

                            {/* About the Course Section */}
                            {courseMetadata?.about_the_course_html && (
                                <div className="rounded-xl bg-white p-4 shadow-md">
                                    <div className="mb-3 flex items-center justify-between">
                                        <label className="text-base font-bold text-neutral-900">About the Course</label>
                                        <div className="flex gap-2">
                                            {editingMetadataField !== 'about_the_course_html' && (
                                                <button
                                                    onClick={() => handleEditMetadataField('about_the_course_html', courseMetadata.about_the_course_html)}
                                                    className="rounded p-1 text-xs text-indigo-600 hover:bg-indigo-50"
                                                    title="Edit"
                                                >
                                                    <Pencil className="h-3 w-3" />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                    {editingMetadataField === 'about_the_course_html' ? (
                                        <div className="space-y-2">
                                            <Textarea
                                                value={metadataEditValues.about_the_course_html || ''}
                                                onChange={(e) => setMetadataEditValues({ about_the_course_html: e.target.value })}
                                                className="min-h-[80px] text-sm"
                                            />
                                            <div className="flex gap-2">
                                                <MyButton
                                                    buttonType="primary"
                                                    scale="small"
                                                    onClick={() => handleSaveMetadataEdit('about_the_course_html')}
                                                >
                                                    Save
                                                </MyButton>
                                                <MyButton
                                                    buttonType="secondary"
                                                    scale="small"
                                                    onClick={handleCancelMetadataEdit}
                                                >
                                                    Cancel
                                                </MyButton>
                                            </div>
                                        </div>
                                    ) : (
                                        <div 
                                            className="text-sm text-neutral-700 prose prose-sm max-w-none"
                                            dangerouslySetInnerHTML={{ 
                                                __html: courseMetadata.about_the_course_html
                                            }}
                                        />
                                    )}
                                </div>
                            )}
                        </motion.div>
                    </div>

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
                                                    placeholder="Enter assignment question..."
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

                    {/* Dialogs */}
                    <RegenerateSlideDialog
                        open={regenerateSlideDialogOpen}
                        onOpenChange={(open) => {
                        setRegenerateSlideDialogOpen(open);
                        if (!open) {
                            setRegenerateSlidePrompt('');
                            setRegeneratingSlideId(null);
                            setRegeneratingSection(undefined);
                        }
                        }}
                        prompt={regenerateSlidePrompt}
                        onPromptChange={setRegenerateSlidePrompt}
                        onConfirm={handleConfirmRegenerateSlide}
                        promptRef={regenerateSlidePromptTextareaRef}
                    />

                    <RegenerateSessionDialog
                        open={regenerateSessionDialogOpen}
                        onOpenChange={(open) => {
                        setRegenerateSessionDialogOpen(open);
                        if (!open) {
                            setRegeneratingSessionId(null);
                        } else if (regeneratingSessionId) {
                            const session = sessionsWithProgress.find((s) => s.sessionId === regeneratingSessionId);
                            if (session) {
                                const slideTitles = extractSlideTitlesFromSlides(session.slides);
                                const defaultPrompt = `Regenerate the chapter "${session.sessionTitle}"${slideTitles.length > 0 ? ` with the following slides: ${slideTitles.join(", ")}.` : `.`}`;
                                setRegenerateSessionPrompt(defaultPrompt);
                                setRegenerateSessionTopics(slideTitles);
                                setRegenerateSessionNumberOfTopics(slideTitles.length.toString());
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
                        }}
                        sessionId={regeneratingSessionId}
                        sessions={sessionsWithProgress}
                        prompt={regenerateSessionPrompt}
                        onPromptChange={setRegenerateSessionPrompt}
                        sessionLength={regenerateSessionLength}
                        onSessionLengthChange={handleRegenerateSessionLengthChange}
                        customSessionLength={regenerateCustomSessionLength}
                        onCustomSessionLengthChange={setRegenerateCustomSessionLength}
                        includeDiagrams={regenerateIncludeDiagrams}
                        onIncludeDiagramsChange={setRegenerateIncludeDiagrams}
                        includeCodeSnippets={regenerateIncludeCodeSnippets}
                        onIncludeCodeSnippetsChange={setRegenerateIncludeCodeSnippets}
                        includePracticeProblems={regenerateIncludePracticeProblems}
                        onIncludePracticeProblemsChange={setRegenerateIncludePracticeProblems}
                        includeQuizzes={regenerateIncludeQuizzes}
                        onIncludeQuizzesChange={setRegenerateIncludeQuizzes}
                        includeHomework={regenerateIncludeHomework}
                        onIncludeHomeworkChange={setRegenerateIncludeHomework}
                        includeSolutions={regenerateIncludeSolutions}
                        onIncludeSolutionsChange={setRegenerateIncludeSolutions}
                        numberOfTopics={regenerateSessionNumberOfTopics}
                        onNumberOfTopicsChange={setRegenerateSessionNumberOfTopics}
                        topics={regenerateSessionTopics}
                        onTopicsChange={setRegenerateSessionTopics}
                        onConfirm={handleConfirmRegenerateSession}
                        promptRef={regenerateSessionPromptTextareaRef}
                    />

                    <AddSlideDialog
                        open={addSlideDialogOpen}
                        onOpenChange={(open) => {
                        setAddSlideDialogOpen(open);
                        if (!open) {
                            setAddSlidePrompt('');
                            setAddingSlideToSessionId(null);
                            setSelectedAddSlideType(null);
                        }
                        }}
                        selectedType={selectedAddSlideType}
                        onSelectType={handleSelectAddSlideType}
                        prompt={addSlidePrompt}
                        onPromptChange={setAddSlidePrompt}
                        onConfirm={handleConfirmAddSlide}
                        onBack={() => {
                                                setSelectedAddSlideType(null);
                                                setAddSlidePrompt('');
                                            }}
                        promptRef={addSlidePromptTextareaRef}
                    />

                    <AddSessionDialog
                        open={addSessionDialogOpen}
                        onOpenChange={(open) => {
                        setAddSessionDialogOpen(open);
                        if (!open) {
                            setAddSessionName('');
                            }
                        }}
                        sessionName={addSessionName}
                        onSessionNameChange={setAddSessionName}
                        onConfirm={handleConfirmAddSession}
                    />

                    <GenerateCourseAssetsDialog
                        open={generateCourseAssetsDialogOpen}
                        onOpenChange={setGenerateCourseAssetsDialogOpen}
                        onConfirm={handleConfirmGenerateCourseAssets}
                    />

                    <BackToLibraryDialog
                        open={backToLibraryDialogOpen}
                        onOpenChange={setBackToLibraryDialogOpen}
                        onDiscard={handleDiscardCourse}
                        onSaveToDrafts={handleSaveToDrafts}
                    />
                </div>
            </div>
        </LayoutContainer>
    )
}
