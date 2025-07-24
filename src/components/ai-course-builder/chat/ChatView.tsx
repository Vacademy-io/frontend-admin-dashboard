/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import {
    Send,
    BookOpen,
    FileText,
    Video,
    PenTool,
    Lightbulb,
    Target,
    Zap,
    Bot,
    User as UserIcon,
    Copy,
    Check,
    RefreshCw,
    Upload,
    Code,
    Image as ImageIcon,
    FileUp,
    X,
    Plus,
    Play,
    Edit3,
    FolderOpen,
    MessageCircle,
    AlertTriangle,
    Globe,
    ChevronRight,
    Search,
} from 'lucide-react';
import './styles/ChatView.css';
import { useMemo } from 'react';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import TodoList from '../todo/TodoList';
// Gemini API integration temporarily disabled – using local mock responses instead
// import { sendChatMessage, sendChatMessageStreaming, type ChatApiRequest, type ChatApiResponse } from '@/services/aiCourseApi';
import type { Modification } from '../lib/applyModifications';
import { testApiEndpoint } from '@/services/apiDebugTest';
import type { TodoTask } from '@/services/aiResponseMemory';
import TodoProgress from './TodoProgress';

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

interface Task {
    id: string;
    heading: string;
    completed: boolean;
    path?: string;
}

export interface Message {
    id: string;
    type: 'user' | 'ai';
    content: string;
    timestamp: Date;
    status: 'sending' | 'sent' | 'error' | 'streaming';
    attachments?: UploadedFile[];
    structuredPrompt?: StructuredPrompt;
    showTodoList?: boolean; // flag to display Todo list
}

interface PromptTemplate {
    id: string;
    title: string;
    description: string;
    prompt: string;
    category: 'course' | 'module' | 'assessment' | 'content';
    icon: React.ReactNode;
}

const MODEL_OPTIONS = [
    'google/gemini-2.5-flash-preview-05-20',
    'google/gemini-2.5-pro',
    'deepseek/deepseek-r1-0528:free',
    'google/gemini-2.5-flash',
    'deepseek/deepseek-r1-0528-qwen3-8b:free',
];

const PROMPT_TEMPLATES: PromptTemplate[] = [
    {
        id: 'basic-course',
        title: 'Create Basic Course',
        description: 'Generate a complete course structure with modules and lessons',
        prompt: 'Create a comprehensive course about [TOPIC] for [BEGINNER/INTERMEDIATE/ADVANCED] level learners. Include:\n- Course overview and objectives\n- 4-6 modules with detailed descriptions\n- Learning outcomes for each module\n- Estimated duration\n- Prerequisites',
        category: 'course',
        icon: <BookOpen className="size-4" />,
    },
    {
        id: 'interactive-content',
        title: 'Interactive Content',
        description: 'Generate engaging interactive lessons and activities',
        prompt: 'Create interactive content for [TOPIC] that includes:\n- Hands-on exercises and practical examples\n- Code challenges or real-world scenarios\n- Interactive quizzes and assessments\n- Visual aids and diagrams\n- Progressive difficulty levels',
        category: 'content',
        icon: <Zap className="size-4" />,
    },
    {
        id: 'assessment-generator',
        title: 'Assessment Generator',
        description: 'Create comprehensive assessments and quizzes',
        prompt: 'Generate a comprehensive assessment for [TOPIC] including:\n- 10 multiple choice questions\n- 5 short answer questions\n- 2 practical exercises\n- Answer key with explanations\n- Difficulty progression from basic to advanced',
        category: 'assessment',
        icon: <PenTool className="size-4" />,
    },
    {
        id: 'video-script',
        title: 'Video Script',
        description: 'Generate engaging video lesson scripts',
        prompt: 'Create a detailed video script for [TOPIC] that includes:\n- Engaging hook and introduction\n- Clear learning objectives\n- Step-by-step explanations with examples\n- Visual cues and demonstrations\n- Summary and call-to-action\n- Estimated duration: [TIME]',
        category: 'content',
        icon: <Video className="size-4" />,
    },
];

const EXAMPLE_PROMPTS = [
    'Create a Python programming course for complete beginners with hands-on projects',
    'Generate an advanced React course focusing on performance optimization and best practices',
    'Design a cybersecurity fundamentals course with practical labs and real-world scenarios',
    'Create a data science course using Python, including machine learning basics',
    'Build a comprehensive web development course covering HTML, CSS, JavaScript, and modern frameworks',
    'Design a digital marketing course with SEO, social media, and analytics modules',
];

const CONTEXT_OPTIONS = [
    {
        id: 'files-folders',
        title: 'Files & Folders',
        icon: <FolderOpen className="size-4" />,
        description: 'Add files and folders from your project',
    },
    {
        id: 'docs',
        title: 'Docs',
        icon: <FileText className="size-4" />,
        description: 'Reference documentation and guides',
    },
    {
        id: 'past-chats',
        title: 'Past Chats',
        icon: <MessageCircle className="size-4" />,
        description: 'Reference previous conversations',
    },
    {
        id: 'linter-errors',
        title: 'Linter Errors',
        icon: <AlertTriangle className="size-4" />,
        description: 'Show linting issues and errors',
    },
    {
        id: 'web',
        title: 'Web',
        icon: <Globe className="size-4" />,
        description: 'Search and include web content',
    },
];

interface ChatViewProps {
    onChatStart?: () => void;
    isFullScreen?: boolean;
    messages?: Message[];
    setMessages?: React.Dispatch<React.SetStateAction<Message[]>>;
    isLoading?: boolean;
    setIsLoading?: React.Dispatch<React.SetStateAction<boolean>>;
    onModifications?: (mods: Modification[]) => void;
    onTodos?: (todos: TodoTask[]) => void;
    tasks?: Task[];

    // Todo progress integration
    onTaskClick?: (task: TodoTask) => void;
    onCourseGeneration?: () => void;
}

const ChatView: React.FC<ChatViewProps> = ({
    onChatStart,
    isFullScreen = false,
    messages: propMessages,
    setMessages: propSetMessages,
    isLoading: propIsLoading,
    setIsLoading: propSetIsLoading,
    onModifications,
    onTodos,
    tasks = [],
    onTaskClick,
    onCourseGeneration,
}) => {
    const [prompt, setPrompt] = useState('');
    // Use local state as fallback if props not provided (for backward compatibility)
    const [localMessages, setLocalMessages] = useState<Message[]>([]);
    const [localIsLoading, setLocalIsLoading] = useState(false);

    // Get current user data for avatar
    const { currentUser } = useCurrentUser();

    // Use props if provided, otherwise use local state
    const messages = propMessages ?? localMessages;
    const setMessages = propSetMessages ?? setLocalMessages;
    const isLoading = propIsLoading ?? localIsLoading;
    const setIsLoading = propSetIsLoading ?? setLocalIsLoading;
    const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
    const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
    const [editingContent, setEditingContent] = useState<string>('');
    const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);
    const [inputMode, setInputMode] = useState<'text' | 'upload' | 'code'>('text');
    const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
    const [codePrompt, setCodePrompt] = useState<CodePrompt>({
        code: '',
        language: 'javascript',
        canEdit: true,
        canRun: false,
        description: '',
    });
    const [selectedModel, setSelectedModel] = useState('google/gemini-2.5-pro');
    const [showModelDropdown, setShowModelDropdown] = useState(false);
    const modelDropdownRef = useRef<HTMLDivElement>(null);
    const [showCodeDialog, setShowCodeDialog] = useState(false);

    const [showContextDialog, setShowContextDialog] = useState(false);
    const [contextSearchQuery, setContextSearchQuery] = useState('');
    const [selectedContextOptions, setSelectedContextOptions] = useState<string[]>([]);
    const [showScrollIndicator, setShowScrollIndicator] = useState(false);

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const chatMessagesRef = useRef<HTMLDivElement>(null);

    // Check if user is at bottom of chat
    const isAtBottom = useCallback(() => {
        if (!chatMessagesRef.current) return true;

        const element = chatMessagesRef.current;
        const threshold = 100; // 100px threshold
        const distanceFromBottom = element.scrollHeight - element.scrollTop - element.clientHeight;

        return distanceFromBottom <= threshold;
    }, []);

    // Only scroll to bottom if user is already at bottom
    const scrollToBottomIfAtBottom = useCallback(() => {
        if (isAtBottom()) {
            setTimeout(() => {
                if (messagesEndRef.current) {
                    messagesEndRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' });
                }
            }, 50);
        }
    }, [isAtBottom]);

    // Always scroll to bottom (for new messages)
    const forceScrollToBottom = useCallback(() => {
        setTimeout(() => {
            if (messagesEndRef.current) {
                messagesEndRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' });
            }
        }, 50);
    }, []);

    // Reset textarea height to initial state
    const resetTextareaHeight = () => {
        if (textareaRef.current) {
            textareaRef.current.style.setProperty('height', 'auto', 'important');
            const computedStyle = window.getComputedStyle(textareaRef.current);
            const minHeight = parseInt(computedStyle.minHeight) || 60;
            textareaRef.current.style.setProperty('height', `${minHeight}px`, 'important');
            textareaRef.current.style.setProperty('overflow-y', 'hidden', 'important');
        }
    };

    const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const textarea = e.target;
        setPrompt(textarea.value);

        // Auto-resize textarea dynamically as user types
        textarea.style.setProperty('height', 'auto', 'important');
        const scrollHeight = textarea.scrollHeight;

        // Get CSS values for min and max height
        const computedStyle = window.getComputedStyle(textarea);
        const minHeight = parseInt(computedStyle.minHeight) || 60;
        const maxHeight = parseInt(computedStyle.maxHeight) || 300;

        // Set the height based on content, respecting min and max
        const newHeight = Math.min(Math.max(scrollHeight, minHeight), maxHeight);
        textarea.style.setProperty('height', `${newHeight}px`, 'important');

        // If we're at max height, enable scrolling
        if (newHeight >= maxHeight) {
            textarea.style.setProperty('overflow-y', 'auto', 'important');
        } else {
            textarea.style.setProperty('overflow-y', 'hidden', 'important');
        }
    };

    // Track scroll position to show/hide scroll indicator
    useEffect(() => {
        const handleScroll = () => {
            const hasStreamingMessage = messages.some((msg) => msg.status === 'streaming');
            setShowScrollIndicator(hasStreamingMessage && !isAtBottom());
        };

        const element = chatMessagesRef.current;
        if (!element) {
            return; // no element yet – nothing to clean up
        }

        element.addEventListener('scroll', handleScroll);
        // Check initially
        handleScroll();

        return () => element.removeEventListener('scroll', handleScroll);
    }, [messages, isAtBottom]);

    // Smart scroll: only scroll if user is at bottom, force scroll for new messages
    useEffect(() => {
        const lastMessage = messages[messages.length - 1];

        if (lastMessage?.type === 'user') {
            // Always scroll for new user messages
            forceScrollToBottom();
        } else if (lastMessage?.status === 'streaming') {
            // Fallback: if user is at bottom during streaming, keep pinned.
            scrollToBottomIfAtBottom();
        } else {
            // For completed AI messages, always scroll
            forceScrollToBottom();
        }
    }, [messages, scrollToBottomIfAtBottom, forceScrollToBottom]);

    // Set initial textarea height on mount
    useEffect(() => {
        resetTextareaHeight();

        // Make test function available in console for debugging (only once)
        if (typeof window !== 'undefined' && !(window as any).testApiCall) {
            (window as any).testApiCall = testApiEndpoint;
            console.log('🔧 Debug tool: Run "window.testApiCall()" in console to test API');
        }
    }, []);

    // Click outside handler for model dropdown
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                modelDropdownRef.current &&
                !modelDropdownRef.current.contains(event.target as Node)
            ) {
                setShowModelDropdown(false);
            }
        };

        if (!showModelDropdown) {
            return; // dropdown closed – no listener needed
        }

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [showModelDropdown]);

    useEffect(() => {
        // Reset textarea height when prompt is cleared
        if (!prompt && textareaRef.current) {
            const isMobile = window.innerWidth <= 768;
            const minHeight = isMobile ? 36 : 40;
            textareaRef.current.style.height = `${minHeight}px`;
        }
    }, [prompt]);

    const handleSendMessage = async () => {
        if ((!prompt.trim() && uploadedFiles.length === 0 && inputMode === 'text') || isLoading) {
            return;
        }

        // If we're editing an existing message, send through edit handler
        if (editingMessageId) {
            handleEditSend();
            return;
        }

        const userMessage: Message = {
            id: Date.now().toString(),
            type: 'user',
            content:
                prompt ||
                (uploadedFiles.length > 0
                    ? `Uploaded ${uploadedFiles.length} file(s)`
                    : 'Code prompt'),
            timestamp: new Date(),
            status: 'sent',
            attachments: uploadedFiles.length > 0 ? [...uploadedFiles] : undefined,
            structuredPrompt:
                inputMode === 'code' ? { type: 'code', content: prompt, codePrompt } : undefined,
        };

        setMessages((prev) => {
            const newMessages = [...prev, userMessage];
            // Trigger chat start callback if this is the first message
            if (newMessages.length === 1 && onChatStart) {
                setTimeout(onChatStart, 100); // Small delay to ensure state update
            }
            return newMessages;
        });
        setPrompt('');
        setUploadedFiles([]);
        setCodePrompt({
            code: '',
            language: 'javascript',
            canEdit: true,
            canRun: false,
            description: '',
        });
        setInputMode('text');
        resetTextareaHeight();
        setIsLoading(true);

        // Gemini API integration removed – simulate AI response locally
        setTimeout(() => {
            const resp = generateMockResponse(
                userMessage.content,
                userMessage.attachments,
                userMessage.structuredPrompt
            );
            const aiMessage: Message = {
                id: (Date.now() + 1).toString(),
                type: 'ai',
                content: resp.text,
                showTodoList: resp.showTodoList,
                timestamp: new Date(),
                status: 'sent',
            };
            setMessages((prev) => [...prev, aiMessage]);
            // Attempt to parse structured payload (modifications/todos)
            tryProcessStructuredPayload(resp.text);
            setIsLoading(false);
        }, 2000);
    };

    const startEditingMessage = (msg: Message) => {
        setEditingMessageId(msg.id);
        setEditingContent(msg.content);
    };

    const cancelEdit = () => {
        setEditingMessageId(null);
        setEditingContent('');
    };

    const handleEditSend = () => {
        if (!editingMessageId) return;
        const originalMsgIndex = messages.findIndex((m) => m.id === editingMessageId);
        if (originalMsgIndex === -1) return;

        // update message content
        const updatedMessages = [...messages];
        const originalMsg = updatedMessages[originalMsgIndex]!; // non-null after bounds check
        updatedMessages[originalMsgIndex] = {
            ...originalMsg,
            content: editingContent,
        } as Message;

        // remove any AI responses after this message
        const msgsAfter = updatedMessages.slice(originalMsgIndex + 1);
        const firstAiIdx = msgsAfter.findIndex((m) => m.type === 'ai');
        if (firstAiIdx !== -1) {
            updatedMessages.splice(originalMsgIndex + 1);
        }

        setMessages(updatedMessages);
        setEditingMessageId(null);
        setEditingContent('');

        // trigger new AI response
        setIsLoading(true);
        setTimeout(() => {
            const aiMsg: Message = {
                id: Date.now().toString(),
                type: 'ai',
                content: generateMockResponse(editingContent).text,
                timestamp: new Date(),
                status: 'sent',
            };
            setMessages((prev) => [...prev, aiMsg]);
            tryProcessStructuredPayload(aiMsg.content);
            setIsLoading(false);
        }, 1500);
    };

    interface MockResp {
        text: string;
        showTodoList?: boolean;
    }

    const generateMockResponse = (
        userPrompt: string,
        attachments?: UploadedFile[],
        structuredPrompt?: StructuredPrompt
    ): MockResp => {
        // If prompt references python beginner course, trigger todo flow
        const lower = userPrompt.toLowerCase();
        if (lower.includes('python') && lower.includes('course')) {
            return {
                text: `Here is your Python course overview!\n\nI've also prepared a task list to start generating slide content.`,
                showTodoList: true,
            };
        }

        let text = `🎯 **Course Generation Plan**\n\nBased on your request: "${userPrompt}"\n\n`;

        if (attachments && attachments.length > 0) {
            text += `📎 **Uploaded Files Analysis**\n`;
            attachments.forEach((file) => {
                text += `- ${file.name} (${file.type.toUpperCase()}) - ${Math.round(file.size / 1024)}KB\n`;
            });
            text += `\nI'll incorporate these files into the course content.\n\n`;
        }

        if (structuredPrompt?.codePrompt) {
            text += `💻 **Code Integration**\n`;
            text += `- Language: ${structuredPrompt.codePrompt.language}\n`;
            text += `- Interactive: ${structuredPrompt.codePrompt.canEdit ? 'Yes' : 'No'}\n`;
            text += `- Executable: ${structuredPrompt.codePrompt.canRun ? 'Yes' : 'No'}\n`;
            text += `- Description: ${structuredPrompt.codePrompt.description}\n\n`;
        }

        text += `I'll create a comprehensive course structure with the following components:

📚 **Course Overview**
- Target audience analysis
- Learning objectives and outcomes
- Prerequisites and requirements
- Estimated completion time

🏗️ **Module Structure**
- Module 1: Introduction and Fundamentals
- Module 2: Core Concepts and Theory
- Module 3: Practical Applications
- Module 4: Advanced Topics
- Module 5: Projects and Assessment

📋 **Content Types**
- Video lessons with interactive elements
- Hands-on exercises and coding challenges
- Downloadable resources and cheat sheets
- Quizzes and knowledge checks
- Final capstone project

⚡ **Next Steps**
I can now generate specific content for any module or create detailed assessments. What would you like me to focus on first?`;
        return { text };
    };

    // Helper: parse JSON (modifications/todos) from AI content
    const tryProcessStructuredPayload = (payload: string) => {
        try {
            // Find first '{' and last '}' to extract JSON
            const start = payload.indexOf('{');
            const end = payload.lastIndexOf('}');
            if (start === -1 || end === -1) return;
            const jsonStr = payload.slice(start, end + 1);
            const data = JSON.parse(jsonStr);
            if (data?.modifications && Array.isArray(data.modifications) && onModifications) {
                onModifications(data.modifications as any);
            }
            if (data?.todos && Array.isArray(data.todos) && onTodos) {
                onTodos(data.todos);
            }
        } catch (err) {
            // silent – invalid JSON
        }
    };

    const handleTemplateSelect = (template: PromptTemplate) => {
        setSelectedTemplate(template.id);
        setPrompt(template.prompt);
        textareaRef.current?.focus();
        // Resize textarea safely after value update
        setTimeout(() => {
            const el = textareaRef.current;
            if (!el) return;
            el.style.setProperty('height', 'auto', 'important');
            const scrollHeight = el.scrollHeight;
            const style = window.getComputedStyle(el);
            const minH = parseInt(style.minHeight) || 60;
            const maxH = parseInt(style.maxHeight) || 300;
            const newH = Math.min(Math.max(scrollHeight, minH), maxH);
            el.style.setProperty('height', `${newH}px`, 'important');
            el.style.setProperty('overflow-y', newH >= maxH ? 'auto' : 'hidden', 'important');
        }, 0);
    };

    const handleExampleSelect = (example: string) => {
        setPrompt(example);
        textareaRef.current?.focus();
        setTimeout(() => {
            const el = textareaRef.current;
            if (!el) return;
            el.style.setProperty('height', 'auto', 'important');
            const scrollHeight = el.scrollHeight;
            const style = window.getComputedStyle(el);
            const minH = parseInt(style.minHeight) || 60;
            const maxH = parseInt(style.maxHeight) || 300;
            const newH = Math.min(Math.max(scrollHeight, minH), maxH);
            el.style.setProperty('height', `${newH}px`, 'important');
            el.style.setProperty('overflow-y', newH >= maxH ? 'auto' : 'hidden', 'important');
        }, 0);
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    const copyToClipboard = (msgId: string, text: string) => {
        navigator.clipboard.writeText(text);
        setCopiedMessageId(msgId);
        setTimeout(() => setCopiedMessageId(null), 1000);
    };

    const regenerateResponse = async (aiMessageId: string) => {
        if (isLoading) return;
        const aiIndex = messages.findIndex((m) => m.id === aiMessageId);
        if (aiIndex === -1) return;

        // Find the last user message before this AI message
        let userMsg: Message | null = null;
        for (let i = aiIndex - 1; i >= 0; i--) {
            const potential = messages[i];
            if (potential && potential.type === 'user') {
                userMsg = potential;
                break;
            }
        }

        if (!userMsg) return;

        // Remove the AI message and generate a new one
        const newMessages = messages.slice(0, aiIndex);
        setMessages(newMessages);
        setIsLoading(true);

        // Regenerate using local mock response
        setTimeout(() => {
            const resp = generateMockResponse(
                userMsg!.content,
                userMsg!.attachments,
                userMsg!.structuredPrompt
            );
            const newAiMsg: Message = {
                id: Date.now().toString(),
                type: 'ai',
                content: resp.text,
                showTodoList: resp.showTodoList,
                timestamp: new Date(),
                status: 'sent',
            };
            setMessages((prev) => [...prev, newAiMsg]);
            tryProcessStructuredPayload(resp.text);
            setIsLoading(false);
        }, 1500);
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        files.forEach((file) => {
            const fileType = file.type.startsWith('image/')
                ? 'image'
                : file.type === 'application/pdf'
                  ? 'pdf'
                  : file.type.startsWith('video/')
                    ? 'video'
                    : null;

            if (fileType) {
                const newFile: UploadedFile = {
                    id: Date.now().toString() + Math.random(),
                    name: file.name,
                    type: fileType,
                    size: file.size,
                    url: URL.createObjectURL(file),
                    file,
                };
                setUploadedFiles((prev) => [...prev, newFile]);
            }
        });
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const removeFile = (fileId: string) => {
        setUploadedFiles((prev) => {
            const file = prev.find((f) => f.id === fileId);
            if (file) {
                URL.revokeObjectURL(file.url);
            }
            return prev.filter((f) => f.id !== fileId);
        });
    };

    const handleCodeSubmit = () => {
        setInputMode('code');
        setShowCodeDialog(false);
        if (codePrompt.code || codePrompt.description) {
            setPrompt(codePrompt.description || 'Code snippet included');
        }
    };

    const getFileIcon = (type: string) => {
        switch (type) {
            case 'pdf':
                return <FileText className="size-4" />;
            case 'video':
                return <Video className="size-4" />;
            case 'image':
                return <ImageIcon className="size-4" />;
            default:
                return <FileUp className="size-4" />;
        }
    };

    const handleContextOptionSelect = (optionId: string) => {
        setSelectedContextOptions((prev) =>
            prev.includes(optionId) ? prev.filter((id) => id !== optionId) : [...prev, optionId]
        );
    };

    const handleContextSubmit = () => {
        // For now, just close the dialog - functionality can be added later
        setShowContextDialog(false);
        setContextSearchQuery('');
        setSelectedContextOptions([]);
    };

    const handleContextDialogOpen = (open: boolean) => {
        setShowContextDialog(open);
        if (open) {
            // Reset dialog state when opening
            setContextSearchQuery('');
            setSelectedContextOptions([]);
        }
    };

    const filteredContextOptions = CONTEXT_OPTIONS.filter(
        (option) =>
            option.title.toLowerCase().includes(contextSearchQuery.toLowerCase()) ||
            option.description.toLowerCase().includes(contextSearchQuery.toLowerCase())
    );

    const userMessagesCount = useMemo(
        () => messages.filter((m) => m.type === 'user').length,
        [messages]
    );
    const showWelcome = userMessagesCount === 0;

    return (
        <div
            className={`ai-chat-container ${isFullScreen ? 'fullscreen-chat' : ''}`}
            style={isFullScreen ? { height: '100%', display: 'flex', flexDirection: 'column' } : {}}
        >
            {/* Quick Start templates removed for full-width chat area */}

            {/* Todo Progress List */}
            <TodoProgress
                onTaskClick={onTaskClick}
                onStartAutomation={onCourseGeneration}
                isAutomationRunning={isLoading}
            />

            {/* Chat Messages */}
            <div
                className="chat-messages flex-1 overflow-y-auto"
                ref={chatMessagesRef}
                style={{ position: 'relative' }}
            >
                {/* Welcome Overlay - Only render when showing welcome */}
                {showWelcome && (
                    <div className="welcome-overlay">
                        <h2 className="welcome-title">
                            Welcome to <span className="text-primary">AI-Course Creation</span>
                        </h2>
                        <p className="welcome-text">
                            Try one of the prompts below, or start typing your own.
                        </p>
                        <div className="welcome-prompts">
                            {EXAMPLE_PROMPTS.slice(0, 6).map((example, idx) => (
                                <button
                                    type="button"
                                    key={idx}
                                    className="welcome-prompt"
                                    onClick={() => handleExampleSelect(example)}
                                >
                                    {example}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {messages.map((message, index) => (
                    <div key={message.id} className={`message ${message.type}`}>
                        <div className="message-avatar">
                            {message.type === 'ai' ? (
                                <Bot className="size-5" />
                            ) : (
                                <>
                                    {currentUser?.avatarUrl && (
                                        <img
                                            src={currentUser.avatarUrl}
                                            alt={currentUser.name || 'User'}
                                            onError={(e) => {
                                                // Hide image and show fallback icon
                                                const img = e.currentTarget;
                                                const fallbackIcon =
                                                    img.parentElement?.querySelector(
                                                        '.fallback-icon'
                                                    );
                                                img.style.display = 'none';
                                                if (fallbackIcon) {
                                                    (fallbackIcon as HTMLElement).style.display =
                                                        'block';
                                                }
                                            }}
                                        />
                                    )}
                                    <UserIcon
                                        className={`fallback-icon size-5 ${currentUser?.avatarUrl ? 'hidden' : ''}`}
                                    />
                                </>
                            )}
                        </div>
                        <div className="message-content">
                            {editingMessageId === message.id ? (
                                <div className="space-y-1">
                                    <Textarea
                                        value={editingContent}
                                        onChange={(e) => setEditingContent(e.target.value)}
                                        rows={1}
                                        className="edit-textarea"
                                    />
                                    <div className="flex justify-end gap-2">
                                        <Button size="sm" variant="outline" onClick={cancelEdit}>
                                            Cancel
                                        </Button>
                                        <Button
                                            size="sm"
                                            disabled={
                                                editingContent.trim() === message.content.trim()
                                            }
                                            onClick={handleEditSend}
                                        >
                                            Send
                                        </Button>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    <div className="message-header">
                                        <span className="message-sender">
                                            {message.type === 'ai' ? 'AI Assistant' : 'You'}
                                        </span>
                                        <span className="message-time">
                                            {message.timestamp.toLocaleTimeString([], {
                                                hour: '2-digit',
                                                minute: '2-digit',
                                            })}
                                        </span>
                                    </div>
                                    <div className="message-text">
                                        {message.showTodoList ? (
                                            <TodoList />
                                        ) : (
                                            (() => {
                                                let displayText = message.content;
                                                if (message.type === 'ai') {
                                                    displayText = displayText
                                                        .replace(/```json[\s\S]*?```/gi, '')
                                                        .trim();
                                                }
                                                return (
                                                    <pre className="message-pre">{displayText}</pre>
                                                );
                                            })()
                                        )}

                                        {/* File Attachments */}
                                        {message.attachments && message.attachments.length > 0 && (
                                            <div className="message-attachments">
                                                {message.attachments.map((file) => (
                                                    <div key={file.id} className="attachment-item">
                                                        {getFileIcon(file.type)}
                                                        <span className="attachment-name">
                                                            {file.name}
                                                        </span>
                                                        <span className="attachment-size">
                                                            ({Math.round(file.size / 1024)}KB)
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>
                                        )}

                                        {/* Structured Code Prompt */}
                                        {message.structuredPrompt?.codePrompt && (
                                            <div className="code-prompt-display">
                                                <div className="code-prompt-header">
                                                    <Code className="size-4" />
                                                    <span>
                                                        Code Snippet -{' '}
                                                        {
                                                            message.structuredPrompt.codePrompt
                                                                .language
                                                        }
                                                    </span>
                                                    <div className="code-settings">
                                                        {message.structuredPrompt.codePrompt
                                                            .canEdit && (
                                                            <Edit3 className="size-3" />
                                                        )}
                                                        {message.structuredPrompt.codePrompt
                                                            .canRun && <Play className="size-3" />}
                                                    </div>
                                                </div>
                                                {message.structuredPrompt.codePrompt
                                                    .description && (
                                                    <div className="code-description">
                                                        {
                                                            message.structuredPrompt.codePrompt
                                                                .description
                                                        }
                                                    </div>
                                                )}
                                                <pre className="code-content">
                                                    {message.structuredPrompt.codePrompt.code}
                                                </pre>
                                            </div>
                                        )}

                                        {/* Streaming indicator for AI messages */}
                                        {message.type === 'ai' &&
                                            message.status === 'streaming' && (
                                                <div className="streaming-indicator">
                                                    <div className="streaming-cursor">|</div>
                                                    <span className="streaming-text">
                                                        AI is generating...
                                                    </span>
                                                </div>
                                            )}
                                    </div>
                                    {/* AI actions handled below to avoid duplication */}
                                    {message.type === 'user' && editingMessageId !== message.id && (
                                        <div className="message-actions">
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                onClick={() => startEditingMessage(message)}
                                            >
                                                <Edit3 className="size-3" />
                                            </Button>
                                            <div className="tooltip">
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    onClick={() =>
                                                        copyToClipboard(message.id, message.content)
                                                    }
                                                >
                                                    {copiedMessageId === message.id ? (
                                                        <Check className="size-3" />
                                                    ) : (
                                                        <Copy className="size-3" />
                                                    )}
                                                </Button>
                                                <span className="tooltip-text">Copy message</span>
                                            </div>
                                        </div>
                                    )}

                                    {message.type === 'ai' && (
                                        <div className="message-actions">
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                onClick={() => regenerateResponse(message.id)}
                                            >
                                                <RefreshCw className="size-3" />
                                            </Button>
                                            <div className="tooltip">
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    onClick={() =>
                                                        copyToClipboard(message.id, message.content)
                                                    }
                                                >
                                                    {copiedMessageId === message.id ? (
                                                        <Check className="size-3" />
                                                    ) : (
                                                        <Copy className="size-3" />
                                                    )}
                                                </Button>
                                                <span className="tooltip-text">Copy message</span>
                                            </div>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    </div>
                ))}

                {isLoading && (
                    <div className="message ai">
                        <div className="message-avatar">
                            <Bot className="size-5" />
                        </div>
                        <div className="message-content">
                            <div className="typing-indicator">
                                <span></span>
                                <span></span>
                                <span></span>
                            </div>
                        </div>
                    </div>
                )}

                <div ref={messagesEndRef} />

                {/* Removed scroll indicator */}
            </div>

            {/* Input Area */}
            <div className="chat-input-area">
                {/* Upload Files Display */}
                {uploadedFiles.length > 0 && (
                    <div className="uploaded-files-preview">
                        <h4>Uploaded Files:</h4>
                        <div className="files-list">
                            {uploadedFiles.map((file) => (
                                <div key={file.id} className="file-preview">
                                    {getFileIcon(file.type)}
                                    <span className="file-name">{file.name}</span>
                                    <span className="file-size">
                                        ({Math.round(file.size / 1024)}KB)
                                    </span>
                                    <Button
                                        size="sm"
                                        variant="ghost"
                                        onClick={() => removeFile(file.id)}
                                        className="remove-file"
                                    >
                                        <X className="size-3" />
                                    </Button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Code Mode Display */}
                {inputMode === 'code' && (codePrompt.code || codePrompt.description) && (
                    <div className="code-preview">
                        <div className="code-preview-header">
                            <Code className="size-4" />
                            <span>Code Snippet Ready</span>
                            <Button size="sm" variant="ghost" onClick={() => setInputMode('text')}>
                                <X className="size-3" />
                            </Button>
                        </div>
                        <div className="code-preview-settings">Language: {codePrompt.language}</div>
                    </div>
                )}

                {/* Input Mode Selector */}
                <div className="input-mode-selector">
                    <Button
                        size="sm"
                        variant={inputMode === 'text' ? 'default' : 'ghost'}
                        onClick={() => setInputMode('text')}
                    >
                        <FileText className="size-4" />
                        Text
                    </Button>

                    <Button size="sm" variant="ghost" onClick={() => fileInputRef.current?.click()}>
                        <Upload className="size-4" />
                        Upload
                    </Button>

                    <Dialog open={showCodeDialog} onOpenChange={setShowCodeDialog}>
                        <DialogTrigger asChild>
                            <Button size="sm" variant={inputMode === 'code' ? 'default' : 'ghost'}>
                                <Code className="size-4" />
                                Code
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                            <DialogHeader>
                                <DialogTitle>Add Code Snippet</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4">
                                <div>
                                    <Label htmlFor="language">Programming Language</Label>
                                    <Select
                                        value={codePrompt.language}
                                        onValueChange={(value) =>
                                            setCodePrompt((prev) => ({ ...prev, language: value }))
                                        }
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="javascript">JavaScript</SelectItem>
                                            <SelectItem value="python">Python</SelectItem>
                                            <SelectItem value="java">Java</SelectItem>
                                            <SelectItem value="cpp">C++</SelectItem>
                                            <SelectItem value="html">HTML</SelectItem>
                                            <SelectItem value="css">CSS</SelectItem>
                                            <SelectItem value="sql">SQL</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div>
                                    <Label htmlFor="code">Code</Label>
                                    <Textarea
                                        id="code"
                                        placeholder="Enter your code here..."
                                        value={codePrompt.code}
                                        onChange={(e) =>
                                            setCodePrompt((prev) => ({
                                                ...prev,
                                                code: e.target.value,
                                            }))
                                        }
                                        rows={10}
                                        className="font-mono"
                                    />
                                </div>
                                <div className="flex justify-end gap-2">
                                    <Button
                                        variant="outline"
                                        onClick={() => setShowCodeDialog(false)}
                                    >
                                        Cancel
                                    </Button>
                                    <Button onClick={handleCodeSubmit}>Add Code</Button>
                                </div>
                            </div>
                        </DialogContent>
                    </Dialog>

                    <Dialog open={showContextDialog} onOpenChange={handleContextDialogOpen}>
                        <DialogTrigger asChild>
                            <Button size="sm" variant="ghost">
                                <Plus className="size-4" />
                                Add Context
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-md">
                            <DialogHeader>
                                <DialogTitle>Add Context</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4">
                                {/* Search Input */}
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-gray-400" />
                                    <Input
                                        placeholder="Add files, folders, docs..."
                                        value={contextSearchQuery}
                                        onChange={(e) => setContextSearchQuery(e.target.value)}
                                        className="pl-10"
                                    />
                                </div>

                                {/* Context Options */}
                                <div className="max-h-96 overflow-y-auto">
                                    {filteredContextOptions.map((option) => (
                                        <div
                                            key={option.id}
                                            className={`flex cursor-pointer items-center justify-between rounded-lg border p-3 transition-colors hover:bg-gray-50 ${
                                                selectedContextOptions.includes(option.id)
                                                    ? 'border-blue-500 bg-blue-50'
                                                    : 'border-gray-200'
                                            }`}
                                            onClick={() => handleContextOptionSelect(option.id)}
                                        >
                                            <div className="flex items-center space-x-3">
                                                <div className="rounded-md bg-gray-100 p-2">
                                                    {option.icon}
                                                </div>
                                                <div>
                                                    <div className="text-sm font-medium">
                                                        {option.title}
                                                    </div>
                                                    <div className="text-xs text-gray-500">
                                                        {option.description}
                                                    </div>
                                                </div>
                                            </div>
                                            <ChevronRight className="size-4 text-gray-400" />
                                        </div>
                                    ))}
                                </div>

                                {/* Selected Context Display */}
                                {selectedContextOptions.length > 0 && (
                                    <div className="border-t pt-4">
                                        <div className="mb-2 text-sm font-medium">
                                            Selected Context:
                                        </div>
                                        <div className="flex flex-wrap gap-2">
                                            {selectedContextOptions.map((optionId) => {
                                                const option = CONTEXT_OPTIONS.find(
                                                    (opt) => opt.id === optionId
                                                );
                                                return option ? (
                                                    <div
                                                        key={optionId}
                                                        className="flex items-center space-x-1 rounded-md bg-blue-100 px-2 py-1 text-xs text-blue-800"
                                                    >
                                                        {option.icon}
                                                        <span>{option.title}</span>
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleContextOptionSelect(optionId);
                                                            }}
                                                            className="ml-1 hover:text-blue-600"
                                                        >
                                                            <X className="size-3" />
                                                        </button>
                                                    </div>
                                                ) : null;
                                            })}
                                        </div>
                                    </div>
                                )}

                                <div className="flex justify-end gap-2">
                                    <Button
                                        variant="outline"
                                        onClick={() => setShowContextDialog(false)}
                                    >
                                        Cancel
                                    </Button>
                                    <Button onClick={handleContextSubmit}>Add Context</Button>
                                </div>
                            </div>
                        </DialogContent>
                    </Dialog>
                </div>

                <div className="input-container">
                    <div className="textarea-container">
                        <Textarea
                            ref={textareaRef}
                            value={prompt}
                            onChange={handleTextareaChange}
                            onKeyDown={handleKeyPress}
                            placeholder={
                                inputMode === 'code'
                                    ? 'How should this code be used in your course?'
                                    : uploadedFiles.length > 0
                                      ? 'How should these files be used?'
                                      : 'What course would you like to create?'
                            }
                            className="chat-textarea"
                        />
                        {/* Model Selector */}
                        <div className="model-selector-container" ref={modelDropdownRef}>
                            <button
                                onClick={() => setShowModelDropdown(!showModelDropdown)}
                                className="model-selector-button"
                                type="button"
                            >
                                <Bot className="size-3" />
                                <span>Models</span>
                            </button>

                            {showModelDropdown && (
                                <div className="model-dropdown">
                                    {MODEL_OPTIONS.map((model) => (
                                        <button
                                            key={model}
                                            onClick={() => {
                                                setSelectedModel(model);
                                                setShowModelDropdown(false);
                                            }}
                                            className={`model-option ${selectedModel === model ? 'selected' : ''}`}
                                        >
                                            {model}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        <Button
                            onClick={handleSendMessage}
                            disabled={
                                (!prompt.trim() &&
                                    uploadedFiles.length === 0 &&
                                    inputMode === 'text') ||
                                isLoading
                            }
                            className="send-button-inside"
                            size="sm"
                        >
                            <Send className="size-4" />
                        </Button>
                    </div>
                </div>

                <div className="input-footer">
                    <div className="input-tips">
                        <Target className="size-4" />
                        <span>
                            {inputMode === 'code'
                                ? 'Code snippets help create interactive programming lessons'
                                : uploadedFiles.length > 0
                                  ? 'Files will be analyzed and integrated into your course'
                                  : 'Be specific about your target audience, topic, and desired learning outcomes'}
                        </span>
                    </div>
                    <div className="character-count">{prompt.length}/2000</div>
                </div>

                {/* Hidden File Input */}
                <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept=".pdf,.mp4,.mov,.avi,.jpg,.jpeg,.png,.gif"
                    onChange={handleFileUpload}
                    style={{ display: 'none' }}
                />
            </div>
        </div>
    );
};

export default ChatView;
