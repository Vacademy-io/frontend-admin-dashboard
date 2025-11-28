import { LayoutContainer } from '@/components/common/layout-container/layout-container';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { Helmet } from 'react-helmet';
import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { useSidebar } from '@/components/ui/sidebar';
import { MyButton } from '@/components/design-system/button';
import { BASE_URL } from '@/constants/urls';
import { getInstituteId } from '@/constants/helper';
import { CircularProgress, SortableSessionItem } from './components';
import { useCourseGeneration } from './hooks/useCourseGeneration';
import { getSessionsWithProgress } from './utils/sessionUtils';
import { extractSlideTitlesFromSlides } from '../../shared/utils/slides';
import { isYouTubeUrl, getYouTubeEmbedUrl } from '../../shared/utils/youtube';
import { SlideGeneration, SlideType, QuizQuestion, SessionProgress } from '../../shared/types';
import { DEFAULT_QUIZ_QUESTIONS, DEFAULT_SELECTED_ANSWERS, DEFAULT_SOLUTION_CODE } from '../../shared/constants';
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

// SortableSessionItem is now imported from ./components

// Sortable Slide Item Component
interface SortableSlideItemProps {
    slide: SlideGeneration;
    onEdit: (slideId: string, newTitle: string) => void;
    onDelete: (slideId: string) => void;
    getSlideIcon: (type: SlideType) => React.ReactNode;
    onRegenerate?: (slideId: string, section?: 'video' | 'code') => void;
    onContentEdit?: (slideId: string, newContent: string) => void;
}

const SortableSlideItem = React.memo(({ slide, onEdit, onDelete, getSlideIcon, onRegenerate, onContentEdit }: SortableSlideItemProps) => {
    // All hooks must be called before any conditional returns
    const [isEditing, setIsEditing] = useState(false);
    const [editValue, setEditValue] = useState(slide?.slideTitle || '');
    const [videoScriptContent, setVideoScriptContent] = useState('');
    const [codeContent, setCodeContent] = useState('');
    const [mermaidContent, setMermaidContent] = useState('');
    const [documentContent, setDocumentContent] = useState('');
    const [editedSections, setEditedSections] = useState<Array<{ type: 'text' | 'video-script' | 'code' | 'mermaid'; content: string; label: string }>>([]);
    const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([]);
    const questionRefs = useRef<(HTMLDivElement | null)[]>([]);

    // Parse content to extract video scripts, code snippets, and mermaid diagrams
    const parseContent = useCallback((content: string) => {
        const sections: Array<{ type: 'text' | 'video-script' | 'code' | 'mermaid'; content: string; label: string; originalMatch?: string }> = [];

        if (!content) return sections;

        // Create a temporary DOM element to parse HTML
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = content;

        // Extract text content and check for code/pre blocks
        const textContent = tempDiv.textContent || tempDiv.innerText || '';
        const lowerText = textContent.toLowerCase();

        // Check if content contains video script keywords
        const hasVideoScript = lowerText.includes('video script') || lowerText.includes('video narration');

        // Look for code blocks in HTML (pre > code or just pre)
        const codeBlocks = tempDiv.querySelectorAll('pre code, pre');
        const mermaidBlocks: Array<{ element: Element; content: string }> = [];
        const regularCodeBlocks: Array<{ element: Element; content: string }> = [];

        codeBlocks.forEach((block) => {
            const codeText = block.textContent || '';
            const parentText = block.parentElement?.textContent || '';

            // Check if it's a mermaid diagram
            if (codeText.includes('graph') || codeText.includes('flowchart') ||
                codeText.includes('sequenceDiagram') || codeText.includes('classDiagram') ||
                parentText.toLowerCase().includes('mermaid')) {
                mermaidBlocks.push({ element: block, content: codeText.trim() });
            } else if (codeText.trim()) {
                regularCodeBlocks.push({ element: block, content: codeText.trim() });
            }
        });

        // If we have code blocks, split content around them
        if (mermaidBlocks.length > 0 || regularCodeBlocks.length > 0) {
            const allBlocks = [
                ...mermaidBlocks.map(b => ({ ...b, type: 'mermaid' as const })),
                ...regularCodeBlocks.map(b => ({ ...b, type: 'code' as const }))
            ];

            // Sort by position in DOM
            allBlocks.sort((a, b) => {
                const posA = Array.from(tempDiv.querySelectorAll('*')).indexOf(a.element as Element);
                const posB = Array.from(tempDiv.querySelectorAll('*')).indexOf(b.element as Element);
                return posA - posB;
            });

            let processedHTML = content;
            let offset = 0;

            for (const block of allBlocks) {
                const blockHTML = block.element.outerHTML;
                const blockIndex = processedHTML.indexOf(blockHTML, offset);

                if (blockIndex !== -1) {
                    // Add text before this block
                    const textBefore = processedHTML.substring(offset, blockIndex).trim();
                    if (textBefore) {
                        const textBeforeLower = textBefore.toLowerCase();
                        if (hasVideoScript && (textBeforeLower.includes('video script') || textBeforeLower.includes('video narration'))) {
                            sections.push({
                                type: 'video-script',
                                content: textBefore,
                                label: 'Video Script',
                                originalMatch: textBefore
                            });
                        } else {
                            sections.push({
                                type: 'text',
                                content: textBefore,
                                label: 'Content',
                                originalMatch: textBefore
                            });
                        }
                    }

                    // Add the code/mermaid block
                    sections.push({
                        type: block.type as 'mermaid' | 'code',
                        content: block.content,
                        label: block.type === 'mermaid' ? 'Mermaid Diagram Code' : 'Code Snippet',
                        originalMatch: blockHTML
                    });

                    offset = blockIndex + blockHTML.length;
                }
            }

            // Add remaining content
            if (offset < processedHTML.length) {
                const remaining = processedHTML.substring(offset).trim();
                if (remaining) {
                    const remainingLower = remaining.toLowerCase();
                    if (hasVideoScript && (remainingLower.includes('video script') || remainingLower.includes('video narration'))) {
                        sections.push({
                            type: 'video-script',
                            content: remaining,
                            label: 'Video Script',
                            originalMatch: remaining
                        });
                    } else {
                        sections.push({
                            type: 'text',
                            content: remaining,
                            label: 'Content',
                            originalMatch: remaining
                        });
                    }
                }
            }
        } else {
            // No code blocks found, treat entire content as text or video script
            if (hasVideoScript) {
                sections.push({
                    type: 'video-script',
                    content,
                    label: 'Video Script',
                    originalMatch: content
                });
            } else {
                sections.push({
                    type: 'text',
                    content,
                    label: 'Content',
                    originalMatch: content
                });
            }
        }

        return sections;
    }, []);

    useEffect(() => {
        if (!slide) return;

        setEditValue(slide.slideTitle || '');

        // Initialize content based on slide type
        if (slide.content) {
            if (slide.slideType === 'video') {
                // Video pages - content IS the video script (NO content section)
                // Remove any "Content" labels, sections, or headings that might be in the stored content
                // ALL content is video script - never show "Content" section
                let videoScript = slide.content || '';
                // Remove any "Content" labels, sections, or headings from the HTML
                videoScript = videoScript.replace(/<[^>]*>Content[^<]*<\/[^>]*>/gi, '');
                videoScript = videoScript.replace(/Content[:\s]*/gi, '');
                videoScript = videoScript.replace(/<div[^>]*class[^>]*content[^>]*>[\s\S]*?<\/div>/gi, '');
                videoScript = videoScript.replace(/<section[^>]*class[^>]*content[^>]*>[\s\S]*?<\/section>/gi, '');
                videoScript = videoScript.replace(/<h[1-6][^>]*>Content[^<]*<\/h[1-6]>/gi, '');
                // Remove any labels like "Content:" or "Content Section" that might appear
                videoScript = videoScript.replace(/<p[^>]*>Content[:\s]*<\/p>/gi, '');
                videoScript = videoScript.replace(/<strong[^>]*>Content[:\s]*<\/strong>/gi, '');
                setVideoScriptContent(videoScript.trim());
            } else if (slide.slideType === 'image') {
                // Image - extract mermaid code
                const tempDiv = document.createElement('div');
                tempDiv.innerHTML = slide.content;
                const codeElement = tempDiv.querySelector('pre code, pre');
                setMermaidContent(codeElement?.textContent || slide.content);
            } else if (slide.slideType === 'code-editor' || slide.slideType === 'jupyter' || slide.slideType === 'scratch') {
                // Code only - use prompt if available, otherwise fall back to content
                setCodeContent(slide.prompt || slide.content);
            } else if (slide.slideType === 'video-code-editor' || slide.slideType === 'video-jupyter' || slide.slideType === 'video-scratch') {
                // Video + Code - use prompt for code if available
                if (slide.prompt) {
                    setCodeContent(slide.prompt);
                    setVideoScriptContent(slide.content || '');
                } else {
                    // Fallback: extract from content
                    const content = slide.content || '';
                    const tempDiv = document.createElement('div');
                    tempDiv.innerHTML = content;
                    const codeBlocks = tempDiv.querySelectorAll('pre code, pre');

                    if (codeBlocks.length > 0) {
                        // Extract code from all code blocks
                        let allCode = '';
                        codeBlocks.forEach((block, idx) => {
                            const codeText = block.textContent || '';
                            if (idx > 0) allCode += '\n\n';
                            allCode += codeText.trim();
                        });
                        setCodeContent(allCode.trim());

                        // Remove ALL code blocks from content to get pure video script
                        let videoScript = content;
                        codeBlocks.forEach((block) => {
                            const blockHTML = block.outerHTML;
                            videoScript = videoScript.replace(blockHTML, '');
                        });

                        // Remove any "Content" labels, sections, or headings from the HTML
                        videoScript = videoScript.replace(/<[^>]*>Content[^<]*<\/[^>]*>/gi, '');
                        videoScript = videoScript.replace(/Content[:\s]*/gi, '');
                        videoScript = videoScript.replace(/<div[^>]*class[^>]*content[^>]*>[\s\S]*?<\/div>/gi, '');
                        videoScript = videoScript.replace(/<section[^>]*class[^>]*content[^>]*>[\s\S]*?<\/section>/gi, '');
                        videoScript = videoScript.replace(/<h[1-6][^>]*>Content[^<]*<\/h[1-6]>/gi, '');
                        videoScript = videoScript.replace(/<p[^>]*>Content[:\s]*<\/p>/gi, '');
                        videoScript = videoScript.replace(/<strong[^>]*>Content[:\s]*<\/strong>/gi, '');

                        videoScript = videoScript.trim();
                        setVideoScriptContent(videoScript || '');
                    } else {
                        // No code block found, treat entire content as video script
                        let videoScript = content;
                        videoScript = videoScript.replace(/<[^>]*>Content[^<]*<\/[^>]*>/gi, '');
                        videoScript = videoScript.replace(/Content[:\s]*/gi, '');
                        videoScript = videoScript.replace(/<div[^>]*class[^>]*content[^>]*>[\s\S]*?<\/div>/gi, '');
                        videoScript = videoScript.replace(/<section[^>]*class[^>]*content[^>]*>[\s\S]*?<\/section>/gi, '');
                        videoScript = videoScript.replace(/<h[1-6][^>]*>Content[^<]*<\/h[1-6]>/gi, '');
                        videoScript = videoScript.replace(/<p[^>]*>Content[:\s]*<\/p>/gi, '');
                        videoScript = videoScript.replace(/<strong[^>]*>Content[:\s]*<\/strong>/gi, '');
                        setVideoScriptContent(videoScript.trim());
                        setCodeContent('');
                    }
                }
            } else if (slide.slideType === 'topic') {
                // Topic slides - check if they have code blocks
                // If topic has code blocks AND text content, treat it like video-code-editor (only Video Script + Code, NO Content section)
                // ALL non-code content is treated as video script for video+code editor topics
                const content = slide.content || '';
                const tempDiv = document.createElement('div');
                tempDiv.innerHTML = content;
                const codeBlocks = tempDiv.querySelectorAll('pre code, pre');

                // Check if there's substantial text content (not just code)
                let textWithoutCode = content;
                codeBlocks.forEach((block) => {
                    const blockHTML = block.outerHTML;
                    textWithoutCode = textWithoutCode.replace(blockHTML, '');
                });
                const textOnly = textWithoutCode.replace(/<[^>]*>/g, '').trim();
                const hasTextContent = textOnly.length > 50; // At least 50 characters of text

                // If topic has code blocks AND text content, treat it like video-code-editor
                if (codeBlocks.length > 0 && hasTextContent) {
                    // Separate mermaid diagrams from regular code
                    // Mermaid diagrams should stay in video script (learning document)
                    // Regular code goes to code editor
                    const mermaidBlocks: Array<{ element: Element; html: string }> = [];
                    const regularCodeBlocks: Array<{ element: Element; html: string }> = [];

                    codeBlocks.forEach((block) => {
                        const codeText = block.textContent || '';
                        const parentText = block.parentElement?.textContent || '';
                        const blockHTML = block.outerHTML;
                        const isMermaid = codeText.includes('graph') ||
                                        codeText.includes('flowchart') ||
                                        codeText.includes('sequenceDiagram') ||
                                        codeText.includes('classDiagram') ||
                                        parentText.toLowerCase().includes('mermaid') ||
                                        block.parentElement?.querySelector('code[class*="mermaid"]');

                        if (isMermaid) {
                            mermaidBlocks.push({ element: block, html: blockHTML });
                        } else {
                            regularCodeBlocks.push({ element: block, html: blockHTML });
                        }
                    });

                    // Extract regular code (non-mermaid) to code editor
                    let allCode = '';
                    regularCodeBlocks.forEach((block, idx) => {
                        const codeText = block.element.textContent || '';
                        if (idx > 0) allCode += '\n\n';
                        allCode += codeText.trim();
                    });
                    setCodeContent(allCode.trim());

                    // Remove only regular code blocks from content, keep mermaid in video script
                    // Mermaid diagrams should appear in the learning document (video script section)
                    let videoScript = content;
                    regularCodeBlocks.forEach((block) => {
                        videoScript = videoScript.replace(block.html, '');
                    });

                    // Remove any "Content" labels, sections, or headings from the HTML
                    videoScript = videoScript.replace(/<[^>]*>Content[^<]*<\/[^>]*>/gi, '');
                    videoScript = videoScript.replace(/Content[:\s]*/gi, '');
                    videoScript = videoScript.replace(/<div[^>]*class[^>]*content[^>]*>[\s\S]*?<\/div>/gi, '');
                    videoScript = videoScript.replace(/<section[^>]*class[^>]*content[^>]*>[\s\S]*?<\/section>/gi, '');
                    videoScript = videoScript.replace(/<h[1-6][^>]*>Content[^<]*<\/h[1-6]>/gi, '');
                    videoScript = videoScript.replace(/<p[^>]*>Content[:\s]*<\/p>/gi, '');
                    videoScript = videoScript.replace(/<strong[^>]*>Content[:\s]*<\/strong>/gi, '');
                    setVideoScriptContent(videoScript.trim());
                    // Clear editedSections since we're using videoScriptContent and codeContent
                    setEditedSections([]);
                } else {
                    // Topic without code blocks or without substantial text - parse all sections normally
                    const sections = parseContent(slide.content);
                    setEditedSections(sections);
                }
            } else if (slide.slideType === 'doc' || slide.slideType === 'objectives') {
                // Document - parse all sections
                const sections = parseContent(slide.content);
                setEditedSections(sections);
            }
        }
    }, [slide.slideTitle, slide.content, slide.slideType, parseContent]);

    // Initialize quiz questions from slide content - must be called unconditionally
    useEffect(() => {
        if (slide.slideType === 'quiz' && slide.content) {
            try {
                // Try to parse as JSON first (old format)
                const quizData = JSON.parse(slide.content);
                if (quizData && quizData.questions && Array.isArray(quizData.questions)) {
                    // Ensure each question has a correctAnswerIndex (default to 0 if missing or invalid)
                    const normalizedQuestions = quizData.questions.map((q: QuizQuestion) => {
                        const options = q.options || [];
                        let correctIndex = 0;

                        // Convert to number if it's a string
                        if (q.correctAnswerIndex !== undefined && q.correctAnswerIndex !== null) {
                            const numIndex = typeof q.correctAnswerIndex === 'string'
                                ? parseInt(q.correctAnswerIndex, 10)
                                : q.correctAnswerIndex;

                            // Ensure it's a valid number and within bounds
                            if (typeof numIndex === 'number' && !isNaN(numIndex) && numIndex >= 0 && numIndex < options.length) {
                                correctIndex = numIndex;
                            }
                        }

                        return {
                            question: q.question || '',
                            options: options,
                            correctAnswerIndex: Number(correctIndex)
                        };
                    });
                    setQuizQuestions(normalizedQuestions);
                } else {
                    setQuizQuestions([]);
                }
            } catch (e) {
                // If not JSON, try to parse as HTML (new document format)
                if (slide.content && slide.content.includes('<h3>') && slide.content.includes('Question')) {
                    const tempDiv = document.createElement('div');
                    tempDiv.innerHTML = slide.content;
                    const questionHeaders = tempDiv.querySelectorAll('h3');

                    if (questionHeaders.length > 0) {
                        const questions: QuizQuestion[] = [];
                        questionHeaders.forEach((header) => {
                            const questionText = header.nextElementSibling?.textContent?.trim() || '';
                            const listElement = header.nextElementSibling?.nextElementSibling;

                            if (listElement && listElement.tagName === 'OL') {
                                const options: string[] = [];
                                let correctIndex = 0;

                                // Extract options from the list
                                listElement.querySelectorAll('li').forEach((li) => {
                                    const text = li.textContent?.trim() || '';
                                    if (text) {
                                        options.push(text);
                                    }
                                });

                                // Find the correct answer below the list
                                let nextElement = listElement.nextElementSibling;
                                while (nextElement) {
                                    const text = nextElement.textContent || '';
                                    if (text.includes('Correct Answer:') || text.includes('Correct Answer')) {
                                        // Extract the correct answer text
                                        const correctAnswerMatch = text.match(/Correct Answer:\s*(.+)/i);
                                        if (correctAnswerMatch?.[1]) {
                                            const correctAnswerText = correctAnswerMatch[1].trim();
                                            // Find which option matches the correct answer
                                            const foundIndex = options.findIndex(opt => opt.trim() === correctAnswerText);
                                            if (foundIndex !== -1) {
                                                correctIndex = foundIndex;
                                            }
                                        }
                                        break;
                                    }
                                    nextElement = nextElement.nextElementSibling;
                                }

                                if (questionText && options.length > 0) {
                                    questions.push({
                                        question: questionText,
                                        options: options,
                                        correctAnswerIndex: correctIndex
                                    });
                                }
                            }
                        });
                        setQuizQuestions(questions);
                    } else {
                        setQuizQuestions([]);
                    }
                } else {
                    setQuizQuestions([]);
                }
            }
        } else if (slide.slideType !== 'quiz') {
            // Clear quiz questions if not a quiz slide
            setQuizQuestions([]);
        }
    }, [slide.content, slide.id, slide.slideType]);

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

    // Auto-save content changes
    const handleContentChange = useCallback((newContent: string) => {
        if (onContentEdit) {
            onContentEdit(slide.id, newContent);
        }
    }, [onContentEdit, slide.id]);

    // Handle video script change
    const handleVideoScriptChange = useCallback((html: string) => {
        setVideoScriptContent(html);
        if (slide.slideType === 'video') {
            // For video pages, the content IS the video script (NO content section)
            // Ensure no "Content" labels are added - ALL content is video script
            let cleanHtml = html;
            // Remove any "Content" labels, sections, or headings from the HTML
            cleanHtml = cleanHtml.replace(/<[^>]*>Content[^<]*<\/[^>]*>/gi, '');
            cleanHtml = cleanHtml.replace(/Content[:\s]*/gi, '');
            cleanHtml = cleanHtml.replace(/<div[^>]*class[^>]*content[^>]*>[\s\S]*?<\/div>/gi, '');
            cleanHtml = cleanHtml.replace(/<section[^>]*class[^>]*content[^>]*>[\s\S]*?<\/section>/gi, '');
            cleanHtml = cleanHtml.replace(/<h[1-6][^>]*>Content[^<]*<\/h[1-6]>/gi, '');
            handleContentChange(cleanHtml.trim());
        } else if (slide.slideType === 'video-code-editor' || slide.slideType === 'video-jupyter' || slide.slideType === 'video-scratch' || slide.slideType === 'topic') {
            // Combine video script and code (NO content section - just video script + code)
            // Ensure no "Content" labels are in the video script - ALL non-code content is video script
            // This applies to video-code-editor types AND topic slides with video script + code
            let cleanHtml = html;
            // Remove any "Content" labels, sections, or headings from the HTML
            cleanHtml = cleanHtml.replace(/<[^>]*>Content[^<]*<\/[^>]*>/gi, '');
            cleanHtml = cleanHtml.replace(/Content[:\s]*/gi, '');
            cleanHtml = cleanHtml.replace(/<div[^>]*class[^>]*content[^>]*>[\s\S]*?<\/div>/gi, '');
            cleanHtml = cleanHtml.replace(/<section[^>]*class[^>]*content[^>]*>[\s\S]*?<\/section>/gi, '');
            cleanHtml = cleanHtml.replace(/<h[1-6][^>]*>Content[^<]*<\/h[1-6]>/gi, '');
            const combined = codeContent ? `${cleanHtml.trim()}\n\n<pre><code>${codeContent}</code></pre>` : cleanHtml.trim();
            handleContentChange(combined);
        }
    }, [codeContent, slide.slideType, handleContentChange]);

    // Handle code change
    const handleCodeChange = useCallback((value: string | undefined) => {
        const code = value || '';
        setCodeContent(code);
        if (slide.slideType === 'code-editor' || slide.slideType === 'jupyter' || slide.slideType === 'scratch') {
            handleContentChange(code);
        } else if (slide.slideType === 'video-code-editor' || slide.slideType === 'video-jupyter' || slide.slideType === 'video-scratch' || slide.slideType === 'topic') {
            // Combine video script and code (NO content section - just video script + code)
            // Ensure video script doesn't have "Content" labels
            // This applies to video-code-editor types AND topic slides with video script + code
            let cleanVideoScript = videoScriptContent || '';
            cleanVideoScript = cleanVideoScript.replace(/<[^>]*>Content[^<]*<\/[^>]*>/gi, '');
            cleanVideoScript = cleanVideoScript.replace(/Content[:\s]*/gi, '');
            cleanVideoScript = cleanVideoScript.replace(/<div[^>]*class[^>]*content[^>]*>[\s\S]*?<\/div>/gi, '');
            cleanVideoScript = cleanVideoScript.replace(/<section[^>]*class[^>]*content[^>]*>[\s\S]*?<\/section>/gi, '');
            cleanVideoScript = cleanVideoScript.replace(/<h[1-6][^>]*>Content[^<]*<\/h[1-6]>/gi, '');
            const combined = cleanVideoScript ? `${cleanVideoScript.trim()}\n\n<pre><code>${code}</code></pre>` : `<pre><code>${code}</code></pre>`;
            handleContentChange(combined);
        }
    }, [videoScriptContent, slide.slideType, handleContentChange]);

    // Handle mermaid change
    const handleMermaidChange = useCallback((value: string | undefined) => {
        const mermaid = value || '';
        setMermaidContent(mermaid);
        if (slide.slideType === 'image') {
            handleContentChange(`<pre><code>${mermaid}</code></pre>`);
        }
    }, [slide.slideType, handleContentChange]);

    // Handle document section change
    const handleDocumentSectionChange = useCallback((sectionIndex: number, newContent: string) => {
        const updated = [...editedSections];
        const section = updated[sectionIndex];
        if (section) {
            updated[sectionIndex] = {
                type: section.type,
                content: newContent,
                label: section.label
            };
        }
        setEditedSections(updated);

        // Reconstruct full content
        const originalSections = parseContent(slide.content || '');
        let newFullContent = slide.content || '';
        const originalSection = originalSections[sectionIndex];

        if (originalSection?.originalMatch) {
            if (originalSection.type === 'mermaid' || originalSection.type === 'code') {
                const tempDiv = document.createElement('div');
                tempDiv.innerHTML = originalSection.originalMatch;
                const codeElement = tempDiv.querySelector('code, pre');
                if (codeElement) {
                    codeElement.textContent = newContent;
                    newFullContent = newFullContent.replace(originalSection.originalMatch, tempDiv.innerHTML);
                } else {
                    newFullContent = newFullContent.replace(
                        originalSection.originalMatch,
                        `<pre><code>${newContent}</code></pre>`
                    );
                }
            } else {
                newFullContent = newFullContent.replace(originalSection.originalMatch, newContent);
            }
        }

        handleContentChange(newFullContent);
    }, [editedSections, slide.content, handleContentChange]);

    // Convert quiz questions to HTML format for document editing
    const convertQuizToHTML = useCallback((questions: QuizQuestion[]): string => {
        if (questions.length === 0) {
            return '<p>No questions available.</p>';
        }

        let html = '';
        questions.forEach((q, index) => {
            html += `<h3>Question ${index + 1}</h3>`;
            html += `<p>${q.question || ``}</p>`;
            html += '<ol>';
            (q.options || []).forEach((option) => {
                html += `<li>${option || ``}</li>`;
            });
            html += '</ol>';
            // Show correct answer below the options
            const correctAnswerIndex = q.correctAnswerIndex ?? 0;
            const correctAnswer = (q.options || [])[correctAnswerIndex] || '';
            if (correctAnswer) {
                html += `<p><strong style="color: #10b981;">Correct Answer: ${correctAnswer}</strong></p>`;
            }
            if (index < questions.length - 1) {
                html += '<hr style="margin: 20px 0;" />';
            }
        });
        return html;
    }, []);

    // Parse HTML back to quiz questions format
    const parseHTMLToQuiz = useCallback((html: string): QuizQuestion[] => {
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = html;

        const questions: QuizQuestion[] = [];
        const questionHeaders = tempDiv.querySelectorAll('h3');

        questionHeaders.forEach((header) => {
            const questionText = header.nextElementSibling?.textContent?.trim() || '';
            const listElement = header.nextElementSibling?.nextElementSibling;

            if (listElement && listElement.tagName === 'OL') {
                const options: string[] = [];
                let correctIndex = 0;

                // Extract options from the list
                listElement.querySelectorAll('li').forEach((li) => {
                    const text = li.textContent?.trim() || '';
                    if (text) {
                        options.push(text);
                    }
                });

                // Find the correct answer below the list
                let nextElement = listElement.nextElementSibling;
                while (nextElement) {
                    const text = nextElement.textContent || '';
                    if (text.includes('Correct Answer:') || text.includes('Correct Answer')) {
                        // Extract the correct answer text
                        const correctAnswerMatch = text.match(/Correct Answer:\s*(.+)/i);
                        if (correctAnswerMatch?.[1]) {
                            const correctAnswerText = correctAnswerMatch[1].trim();
                            // Find which option matches the correct answer
                            const foundIndex = options.findIndex(opt => opt.trim() === correctAnswerText);
                            if (foundIndex !== -1) {
                                correctIndex = foundIndex;
                            }
                        }
                        break;
                    }
                    nextElement = nextElement.nextElementSibling;
                }

                if (questionText && options.length > 0) {
                    questions.push({
                        question: questionText,
                        options: options,
                        correctAnswerIndex: correctIndex
                    });
                }
            }
        });

        return questions;
    }, []);

    // Get current HTML content from quiz questions - always called
    const quizHTML = useMemo(() => {
        if (slide.slideType === 'quiz') {
            // If we have quiz questions, convert them to HTML
            if (quizQuestions.length > 0) {
                return convertQuizToHTML(quizQuestions);
            }
            // If no quiz questions but slide has HTML content, use that directly
            if (slide.content && slide.content.includes('<h3>') && slide.content.includes('Question')) {
                return slide.content;
            }
            // Otherwise return empty
            return '<p>No questions available.</p>';
        }
        return '';
    }, [quizQuestions, slide.slideType, slide.content, convertQuizToHTML]);

    // Handle quiz content change - always called
    const handleQuizContentChange = useCallback((html: string) => {
        if (slide.slideType === 'quiz') {
            const parsedQuestions = parseHTMLToQuiz(html);
            if (parsedQuestions.length > 0) {
                setQuizQuestions(parsedQuestions);
                // Save to slide content
                const quizData = { questions: parsedQuestions };
                handleContentChange(JSON.stringify(quizData, null, 2));
            } else {
                // If parsing fails, still save the HTML as content
                handleContentChange(html);
            }
        }
    }, [slide.slideType, parseHTMLToQuiz, handleContentChange]);

    // Render content based on slide type - everything editable by default
    const renderContent = useMemo(() => {
        // Only render if slide is completed and has content - never regenerate
        if (slide.status !== 'completed' || !slide.content) return null;

        try {
            // Video pages - content is the video script
            if (slide.slideType === 'video') {
                return (
                    <div className="mt-3 ml-8 bg-neutral-50 rounded-md border border-neutral-200 p-4">
                        <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2">
                                <Video className="h-4 w-4 text-red-600" />
                                <Label className="text-sm font-semibold text-neutral-900">Video Script</Label>
                            </div>
                            {onRegenerate && (
                                <button
                                    onClick={() => onRegenerate(slide.id)}
                                    className="flex items-center gap-1.5 rounded px-2 py-1 text-xs font-medium text-indigo-600 hover:bg-indigo-50 transition-colors"
                                    title="Regenerate Video Script"
                                >
                                    <RefreshCw className="h-3.5 w-3.5" />
                                    Regenerate
                                </button>
                            )}
                        </div>
                        <TipTapEditor
                            value={videoScriptContent || slide.content}
                            onChange={handleVideoScriptChange}
                            className="min-h-[300px]"
                        />
                    </div>
                );
            }

            // Image page - show mermaid diagram code editor
            if (slide.slideType === 'image') {
                return (
                    <div className="mt-3 ml-8 bg-neutral-50 rounded-md border border-neutral-200 p-4">
                        <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2">
                                <Layers className="h-4 w-4 text-purple-600" />
                                <Label className="text-sm font-semibold text-neutral-900">Mermaid Diagram Code</Label>
                            </div>
                            {onRegenerate && (
                                <button
                                    onClick={() => onRegenerate(slide.id)}
                                    className="flex items-center gap-1.5 rounded px-2 py-1 text-xs font-medium text-indigo-600 hover:bg-indigo-50 transition-colors"
                                    title="Regenerate Diagram"
                                >
                                    <RefreshCw className="h-3.5 w-3.5" />
                                    Regenerate
                                </button>
                            )}
                        </div>
                        <Editor
                            height="400px"
                            defaultLanguage="mermaid"
                            value={mermaidContent}
                            onChange={handleMermaidChange}
                            theme="vs-dark"
                            options={{
                                minimap: { enabled: false },
                                fontSize: 12,
                                wordWrap: 'on',
                            }}
                        />
                    </div>
                );
            }

            // Code only pages - show code editor
            if (slide.slideType === 'code-editor' || slide.slideType === 'jupyter' || slide.slideType === 'scratch' || slide.slideType === 'solution') {
                return (
                    <div className="mt-3 ml-8 bg-neutral-50 rounded-md border border-neutral-200 p-4">
                        <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2">
                                <Code className="h-4 w-4 text-green-600" />
                                <Label className="text-sm font-semibold text-neutral-900">Code Snippet</Label>
                            </div>
                            {onRegenerate && (
                                <button
                                    onClick={() => onRegenerate(slide.id)}
                                    className="flex items-center gap-1.5 rounded px-2 py-1 text-xs font-medium text-indigo-600 hover:bg-indigo-50 transition-colors"
                                    title="Regenerate Code"
                                >
                                    <RefreshCw className="h-3.5 w-3.5" />
                                    Regenerate
                                </button>
                            )}
                        </div>
                        <Editor
                            height="400px"
                            defaultLanguage="python"
                            value={codeContent}
                            onChange={handleCodeChange}
                            theme="vs-dark"
                            options={{
                                minimap: { enabled: false },
                                fontSize: 12,
                                wordWrap: 'on',
                            }}
                        />
                    </div>
                );
            }

            // Video + Code pages - show both video script and code, clearly labeled
            if (slide.slideType === 'video-code-editor' || slide.slideType === 'video-jupyter' || slide.slideType === 'video-scratch') {
                return (
                    <div className="mt-3 ml-8 space-y-4">
                        <div className="bg-neutral-50 rounded-md border border-neutral-200 p-4">
                            <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-2">
                                    <Video className="h-4 w-4 text-red-600" />
                                    <Label className="text-sm font-semibold text-neutral-900">Video Script</Label>
                                </div>
                                {onRegenerate && (
                                    <button
                                        onClick={() => onRegenerate(slide.id)}
                                        className="flex items-center gap-1.5 rounded px-2 py-1 text-xs font-medium text-indigo-600 hover:bg-indigo-50 transition-colors"
                                        title="Regenerate Video Script"
                                    >
                                        <RefreshCw className="h-3.5 w-3.5" />
                                        Regenerate
                                    </button>
                                )}
                            </div>
                            <TipTapEditor
                                value={videoScriptContent || ''}
                                onChange={handleVideoScriptChange}
                                className="min-h-[300px]"
                            />
                        </div>
                        <div className="bg-neutral-50 rounded-md border border-neutral-200 p-4">
                            <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-2">
                                    <Code className="h-4 w-4 text-green-600" />
                                    <Label className="text-sm font-semibold text-neutral-900">Code Snippet</Label>
                                </div>
                                {onRegenerate && (
                                    <button
                                        onClick={() => onRegenerate(slide.id)}
                                        className="flex items-center gap-1.5 rounded px-2 py-1 text-xs font-medium text-indigo-600 hover:bg-indigo-50 transition-colors"
                                        title="Regenerate Code"
                                    >
                                        <RefreshCw className="h-3.5 w-3.5" />
                                        Regenerate
                                    </button>
                                )}
                            </div>
                            <Editor
                                height="400px"
                                defaultLanguage="python"
                                value={codeContent || ''}
                                onChange={handleCodeChange}
                                theme="vs-dark"
                                options={{
                                    minimap: { enabled: false },
                                    fontSize: 12,
                                    wordWrap: 'on',
                                }}
                            />
                        </div>
                    </div>
                );
            }

            // Topic pages - if they have code blocks and text content, show only Video Script and Code (NO Content section)
            if (slide.slideType === 'topic') {
                // Check if topic has code blocks and text content
                const tempDiv = document.createElement('div');
                tempDiv.innerHTML = slide.content || '';
                const codeBlocks = tempDiv.querySelectorAll('pre code, pre');

                // Check if there's substantial text content (not just code)
                let textWithoutCode = slide.content || '';
                codeBlocks.forEach((block) => {
                    const blockHTML = block.outerHTML;
                    textWithoutCode = textWithoutCode.replace(blockHTML, '');
                });
                const textOnly = textWithoutCode.replace(/<[^>]*>/g, '').trim();
                const hasTextContent = textOnly.length > 50; // At least 50 characters of text

                // If topic has code blocks AND text content, render like video-code-editor (NO Content section)
                // Use videoScriptContent and codeContent if available (from initialization), otherwise check content
                if (codeBlocks.length > 0 && hasTextContent && (videoScriptContent || codeContent || slide.content)) {
                    // Check if there's regular code to show in code editor
                    // Mermaid diagrams are already kept in videoScriptContent, so codeContent only has regular code
                    const hasRegularCode = codeContent && codeContent.trim().length > 0;

                    return (
                        <div className="mt-3 ml-8 space-y-4">
                            <div className="bg-neutral-50 rounded-md border border-neutral-200 p-4">
                                <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center gap-2">
                                        <Video className="h-4 w-4 text-red-600" />
                                        <Label className="text-sm font-semibold text-neutral-900">Video Script</Label>
                                    </div>
                                    {onRegenerate && (
                                        <button
                                            onClick={() => onRegenerate(slide.id, 'video')}
                                            className="flex items-center gap-1.5 rounded px-2 py-1 text-xs font-medium text-indigo-600 hover:bg-indigo-50 transition-colors"
                                            title="Regenerate Video Script"
                                        >
                                            <RefreshCw className="h-3.5 w-3.5" />
                                            Regenerate
                                        </button>
                                    )}
                                </div>
                                <TipTapEditor
                                    value={videoScriptContent || ''}
                                    onChange={handleVideoScriptChange}
                                    className="min-h-[300px]"
                                />
                            </div>
                            {hasRegularCode && (
                                <div className="bg-neutral-50 rounded-md border border-neutral-200 p-4">
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="flex items-center gap-2">
                                            <Code className="h-4 w-4 text-green-600" />
                                            <Label className="text-sm font-semibold text-neutral-900">Code Snippet</Label>
                                        </div>
                                        {onRegenerate && (
                                            <button
                                                onClick={() => onRegenerate(slide.id, 'code')}
                                                className="flex items-center gap-1.5 rounded px-2 py-1 text-xs font-medium text-indigo-600 hover:bg-indigo-50 transition-colors"
                                                title="Regenerate Code"
                                            >
                                                <RefreshCw className="h-3.5 w-3.5" />
                                                Regenerate
                                            </button>
                                        )}
                                    </div>
                                    <Editor
                                        height="400px"
                                        defaultLanguage="python"
                                        value={codeContent || ''}
                                        onChange={handleCodeChange}
                                        theme="vs-dark"
                                        options={{
                                            minimap: { enabled: false },
                                            fontSize: 12,
                                            wordWrap: 'on',
                                        }}
                                    />
                                </div>
                            )}
                        </div>
                    );
                } else {
                    // Topic without video script + code - parse and show all sections editable
                    const sections = editedSections.length > 0 ? editedSections : parseContent(slide.content);

                    return (
                        <div className="mt-3 ml-8 space-y-4">
                            {sections.map((section, idx) => (
                                <div key={idx} className="bg-neutral-50 rounded-md border border-neutral-200 p-4">
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="flex items-center gap-2">
                                            {section.type === 'video-script' && <Video className='h-4 w-4 text-red-600' />}
                                            {section.type === 'code' && <Code className='h-4 w-4 text-green-600' />}
                                            {section.type === 'mermaid' && <Layers className='h-4 w-4 text-purple-600' />}
                                            {section.type === 'text' && <FileText className='h-4 w-4 text-blue-600' />}
                                            <Label className="text-sm font-semibold text-neutral-900">{section.label}</Label>
                                        </div>
                                        {onRegenerate && (
                                            <button
                                                onClick={() => onRegenerate(slide.id)}
                                                className="flex items-center gap-1.5 rounded px-2 py-1 text-xs font-medium text-indigo-600 hover:bg-indigo-50 transition-colors"
                                                title={`Regenerate ${section.label}`}
                                            >
                                                <RefreshCw className="h-3.5 w-3.5" />
                                                Regenerate
                                            </button>
                                        )}
                                    </div>

                                    {section.type === 'text' || section.type === 'video-script' ? (
                                        <TipTapEditor
                                            value={section.content}
                                            onChange={(html) => handleDocumentSectionChange(idx, html)}
                                            className="min-h-[300px]"
                                        />
                                    ) : section.type === 'mermaid' ? (
                                        <Editor
                                            height="400px"
                                            defaultLanguage="mermaid"
                                            value={section.content}
                                            onChange={(value) => handleDocumentSectionChange(idx, value || '')}
                                            theme="vs-dark"
                                            options={{
                                                minimap: { enabled: false },
                                                fontSize: 12,
                                                wordWrap: 'on',
                                            }}
                                        />
                                    ) : (
                                        <Editor
                                            height="400px"
                                            defaultLanguage="python"
                                            value={section.content}
                                            onChange={(value) => handleDocumentSectionChange(idx, value || '')}
                                            theme="vs-dark"
                                            options={{
                                                minimap: { enabled: false },
                                                fontSize: 12,
                                                wordWrap: 'on',
                                            }}
                                        />
                                    )}
                                </div>
                            ))}
                        </div>
                    );
                }
            }

            // Document pages (doc, objectives) - parse and show all sections editable
            if (slide.slideType === 'objectives' || slide.slideType === 'doc') {
                const sections = editedSections.length > 0 ? editedSections : parseContent(slide.content);

                return (
                    <div className="mt-3 ml-8 space-y-4">
                        {sections.map((section, idx) => (
                            <div key={idx} className="bg-neutral-50 rounded-md border border-neutral-200 p-4">
                                <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center gap-2">
                                        {section.type === 'video-script' && <Video className='h-4 w-4 text-red-600' />}
                                        {section.type === 'code' && <Code className='h-4 w-4 text-green-600' />}
                                        {section.type === 'mermaid' && <Layers className='h-4 w-4 text-purple-600' />}
                                        {section.type === 'text' && <FileText className='h-4 w-4 text-blue-600' />}
                                        <Label className="text-sm font-semibold text-neutral-900">{section.label}</Label>
                                    </div>
                                    {onRegenerate && (
                                        <button
                                            onClick={() => onRegenerate(slide.id)}
                                            className="flex items-center gap-1.5 rounded px-2 py-1 text-xs font-medium text-indigo-600 hover:bg-indigo-50 transition-colors"
                                            title={`Regenerate ${section.label}`}
                                        >
                                            <RefreshCw className="h-3.5 w-3.5" />
                                            Regenerate
                                        </button>
                                    )}
                                </div>

                                {section.type === 'text' || section.type === 'video-script' ? (
                                    <TipTapEditor
                                        value={section.content}
                                        onChange={(html) => handleDocumentSectionChange(idx, html)}
                                        className="min-h-[300px]"
                                    />
                                ) : section.type === 'mermaid' ? (
                                    <Editor
                                        height="400px"
                                        defaultLanguage="mermaid"
                                        value={section.content}
                                        onChange={(value) => handleDocumentSectionChange(idx, value || '')}
                                        theme="vs-dark"
                                        options={{
                                            minimap: { enabled: false },
                                            fontSize: 12,
                                            wordWrap: 'on',
                                        }}
                                    />
                                ) : (
                                    <Editor
                                        height="400px"
                                        defaultLanguage="python"
                                        value={section.content}
                                        onChange={(value) => handleDocumentSectionChange(idx, value || '')}
                                        theme="vs-dark"
                                        options={{
                                            minimap: { enabled: false },
                                            fontSize: 12,
                                            wordWrap: 'on',
                                        }}
                                    />
                                )}
                            </div>
                        ))}
                    </div>
                );
            }

            // Quiz - editable document format with correct answers shown
            if (slide.slideType === 'quiz') {
                return (
                    <div className="mt-3 ml-8 bg-neutral-50 rounded-md border border-neutral-200 p-4">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2">
                                <FileQuestion className="h-4 w-4 text-purple-600" />
                                <Label className="text-sm font-semibold text-neutral-900">Quiz Content</Label>
                            </div>
                            {onRegenerate && (
                                <button
                                    onClick={() => onRegenerate(slide.id)}
                                    className="flex items-center gap-1.5 rounded px-2 py-1 text-xs font-medium text-indigo-600 hover:bg-indigo-50 transition-colors"
                                    title="Regenerate Quiz"
                                >
                                    <RefreshCw className="h-3.5 w-3.5" />
                                    Regenerate
                                </button>
                            )}
                        </div>
                        <div className="bg-white rounded-lg border border-neutral-200 p-4">
                            <TipTapEditor
                                value={quizHTML}
                                onChange={handleQuizContentChange}
                                className="min-h-[400px]"
                            />
                            <p className="text-xs text-neutral-500 mt-2">
                                <strong>Note:</strong> Format questions as "Question 1", "Question 2", etc. with ordered lists for options. Write the correct answer below the options list as "Correct Answer: [option text]".
                            </p>
                        </div>
                    </div>
                );
            }

            // Assignment/Homework - editable text
            if (slide.slideType === 'homework' || slide.slideType === 'assignment') {
                return (
                    <div className="mt-3 ml-8 bg-neutral-50 rounded-md border border-neutral-200 p-4">
                        <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2">
                                <ClipboardList className="h-4 w-4 text-orange-600" />
                                <Label className="text-sm font-semibold text-neutral-900">Assignment</Label>
                            </div>
                            {onRegenerate && (
                                <button
                                    onClick={() => onRegenerate(slide.id)}
                                    className="flex items-center gap-1.5 rounded px-2 py-1 text-xs font-medium text-indigo-600 hover:bg-indigo-50 transition-colors"
                                    title="Regenerate Assignment"
                                >
                                    <RefreshCw className="h-3.5 w-3.5" />
                                    Regenerate
                                </button>
                            )}
                        </div>
                        <TipTapEditor
                            value={slide.content}
                            onChange={handleContentChange}
                            className="min-h-[300px]"
                        />
                    </div>
                );
            }
        } catch (e) {
            return null;
        }
        return null;
    }, [slide.status, slide.content, slide.slideType, videoScriptContent, codeContent, mermaidContent, editedSections, handleVideoScriptChange, handleCodeChange, handleMermaidChange, handleDocumentSectionChange, handleContentChange, onRegenerate]);

    return (
        <div className="mb-2">
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
            {/* Content sections removed - only showing slide title as requested */}
        </div>
    );
}, (prevProps, nextProps) => {
    // Custom comparison function to prevent unnecessary re-renders
    // Return true if props are equal (skip re-render), false if they differ (re-render)
    return (
        prevProps.slide.id === nextProps.slide.id &&
        prevProps.slide.status === nextProps.slide.status &&
        prevProps.slide.content === nextProps.slide.content &&
        prevProps.slide.slideTitle === nextProps.slide.slideTitle &&
        prevProps.slide.progress === nextProps.slide.progress &&
        prevProps.slide.slideType === nextProps.slide.slideType
    );
});

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
    
    // Metadata editing states
    const [editingMetadataField, setEditingMetadataField] = useState<string | null>(null);
    const [metadataEditValues, setMetadataEditValues] = useState<Record<string, any>>({});
    const [mediaEditMode, setMediaEditMode] = useState<'upload' | 'youtube' | null>(null);

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

    // Metadata editing handlers
    const handleEditMetadataField = (field: string, currentValue: any) => {
        setEditingMetadataField(field);
        setMetadataEditValues({ [field]: currentValue });
    };

    const handleCancelMetadataEdit = () => {
        setEditingMetadataField(null);
        setMetadataEditValues({});
    };

    const handleSaveMetadataEdit = (field: string) => {
        if (courseMetadata) {
            const updatedMetadata = {
                ...courseMetadata,
                [field]: metadataEditValues[field],
            };
            setCourseMetadata(updatedMetadata);
        }
        setEditingMetadataField(null);
        setMetadataEditValues({});
    };

    // Handle session drag end
    const handleSessionDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        if (!over || active.id === over.id) return;

        const oldIndex = sessionsWithProgress.findIndex((s) => s.sessionId === active.id);
        const newIndex = sessionsWithProgress.findIndex((s) => s.sessionId === over.id);

        if (oldIndex !== -1 && newIndex !== -1) {
            const reorderedSessions = arrayMove(sessionsWithProgress, oldIndex, newIndex);
            // Update slides order based on new session order - preserve all slide properties
            const reorderedSlides: SlideGeneration[] = [];
            reorderedSessions.forEach((session) => {
                // Preserve all properties of slides when reordering
                reorderedSlides.push(...session.slides.map(slide => ({ ...slide })));
            });
            setSlides(reorderedSlides);
        }
    };

    // Handle session edit - preserve all slide properties including status and content
    const handleSessionEdit = (sessionId: string, newTitle: string) => {
        setSlides((prev) =>
            prev.map((slide) =>
                slide.sessionId === sessionId
                    ? { ...slide, sessionTitle: newTitle } // Only update title, preserve status and content
                    : slide
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

    // Function to generate content for a slide based on session and slide info
    const generateSlideContent = (
        sessionId: string,
        sessionTitle: string,
        slideTitle: string,
        slideType: SlideType,
        topicIndex?: number
    ): string => {
        // Content mapping based on the provided Python course data
        const contentMap: Record<string, Record<string, string>> = {
            '1': {
                // Session 1: Introduction to Python
                'Learning objective': `<h2>Learning Objectives</h2>
<p>By the end of this session, students will:</p>
<ul>
<li>Understand what Python is and its key features.</li>
<li>Set up Python on their computer.</li>
<li>Write their first Python program.</li>
</ul>

<h3>Python Usage Diagram:</h3>
<pre><code class="language-mermaid">
graph TD
    A[Python] --> B[Web Development]
    A --> C[Data Science]
    A --> D[Automation]
    A --> E[AI & Machine Learning]
    A --> F[Game Development]
    B --> B1[Django, Flask]
    C --> C1[Pandas, NumPy]
    D --> D1[Scripting]
    E --> E1[TensorFlow, PyTorch]
</code></pre>

<p><em>Image source: https://www.98thpercentile.com/blog/what-is-python-used-for/</em></p>`,
                'Topic 1: What is Python?': `<h2>What is Python?</h2>
<p>Python is a high-level, interpreted programming language known for its simplicity and readability. It was created by Guido van Rossum and first released in 1991.</p>

<h3>Key Features:</h3>
<ul>
<li><strong>Simplicity:</strong> Python's syntax is clean and easy to read, making it perfect for beginners.</li>
<li><strong>Versatility:</strong> Python can be used for web development, data science, automation, artificial intelligence, and more.</li>
<li><strong>Open-source:</strong> Python is free to use and has a large community of developers contributing to its growth.</li>
</ul>

<h3>Your First Python Program</h3>
<p>Let's see Python in action with a simple example:</p>

<pre><code class="language-python">
# This is a comment in Python
print("Hello, Python!")
print("Python is simple and powerful!")
</code></pre>

<p>This simple program demonstrates Python's clean syntax. Just two lines of code to display messages!</p>

<h3>Video Script:</h3>
<p>Welcome to Python! Python is a powerful, beginner-friendly programming language created in 1991. It's known for its simple syntax - no complex symbols needed. Python is versatile, used in web development, data science, AI, and more. It's also open-source and free. Let's see it in action with a simple 'Hello, Python!' program. Notice how clean and readable the code is - that's Python's strength!</p>`,
                'Topic 2: Setting Up Python': `<h2>Setting Up Python</h2>
<p>To start programming in Python, you need to install it on your computer and set up a development environment.</p>

<h3>Step 1: Downloading Python</h3>
<ol>
<li>Visit the official Python website: <strong>www.python.org</strong></li>
<li>Download the latest version for your operating system (Windows, macOS, or Linux)</li>
<li>Run the installer and make sure to check "Add Python to PATH"</li>
</ol>

<h3>Step 2: Installing an IDE</h3>
<p>An IDE (Integrated Development Environment) makes coding easier. Popular options include:</p>
<ul>
<li><strong>Thonny:</strong> Perfect for beginners, simple and easy to use</li>
<li><strong>VS Code:</strong> A powerful editor with many extensions</li>
<li><strong>PyCharm:</strong> A full-featured IDE for professional development</li>
</ul>

<h3>Step 3: Testing Installation</h3>
<p>Create a file called <code>hello.py</code> and write:</p>

<pre><code class="language-python">
print("Hello, World!")
</code></pre>

<p>Run it in your IDE or from the command line. If you see "Hello, World!" printed, Python is installed correctly!</p>

<h3>Video Script:</h3>
<p>Welcome to Python setup! We'll install Python and set up your development environment. Navigate to python.org, download the installer, and run it. Remember to check 'Add Python to PATH'. Install Thonny as it's beginner-friendly. You can also use VS Code if you prefer. Create a simple 'Hello, World!' program and run it to verify everything works. You're now ready to start coding in Python!</p>`,
                'Topic 3: Writing Your First Program': `<h2>Writing Your First Program</h2>
<p>Now that Python is installed, let's write your first program!</p>

<h3>Python Syntax Overview</h3>
<p>Python uses simple, readable syntax. Here are some basics:</p>
<ul>
<li>No semicolons needed at the end of lines</li>
<li>Indentation is used to define code blocks</li>
<li>Comments start with <code>#</code></li>
</ul>

<h3>Hands-On: Display "Hello, [your name]!"</h3>
<p>Let's create a program that greets you by name:</p>

<pre><code class="language-python">
# Get the user's name
name = input("Enter your name: ")

# Display a greeting
print(f"Hello, ${"{ name }"}!")
</code></pre>

<p>When you run this program:</p>
<ol>
<li>It will ask you to enter your name</li>
<li>You type your name and press Enter</li>
<li>It will display "Hello, [your name]!"</li>
</ol>

<h3>Video Script:</h3>
<p>Let's write your first Python program together! Python is simple - no semicolons, use indentation for blocks, comments with #. We'll use input() to get the user's name and print() to display a greeting. Save the file, run it, and see your personalized greeting!</p>`,
                'Wrap-Up Quiz': `<h2>Topic 1: What is Python?</h2>

<h3>Question 1</h3>
<p>Python is known for being:</p>
<ol>
<li>Complicated and hard to learn</li>
<li>A low-level programming language</li>
<li>Simple, versatile, and open-source</li>
<li>Only used for web development</li>
</ol>
<p><strong style="color: #10b981;">Correct Answer: Simple, versatile, and open-source</strong></p>

<h3>Question 2</h3>
<p>Which of the following is NOT a key feature of Python?</p>
<ol>
<li>Readability</li>
<li>Open-source</li>
<li>Requires compilation before running</li>
<li>Versatile for various applications</li>
</ol>
<p><strong style="color: #10b981;">Correct Answer: Requires compilation before running</strong></p>

<h3>Question 3</h3>
<p>Python is commonly used for:</p>
<ol>
<li>Data science</li>
<li>Web development</li>
<li>Automation</li>
<li>All of the above</li>
</ol>
<p><strong style="color: #10b981;">Correct Answer: All of the above</strong></p>

<hr style="margin: 20px 0;" />

<h2>Topic 2: Setting Up Python</h2>

<h3>Question 4</h3>
<p>Which website is the official source for downloading Python?</p>
<ol>
<li>www.python.com</li>
<li>www.python.org</li>
<li>www.downloadpython.net</li>
<li>www.programminglanguages.com</li>
</ol>
<p><strong style="color: #10b981;">Correct Answer: www.python.org</strong></p>

<h3>Question 5</h3>
<p>What is an IDE?</p>
<ol>
<li>Internet Development Environment</li>
<li>Integrated Development Environment</li>
<li>Internal Debugging Engine</li>
<li>Interactive Data Editor</li>
</ol>
<p><strong style="color: #10b981;">Correct Answer: Integrated Development Environment</strong></p>

<h3>Question 6</h3>
<p>Which of the following is an IDE for Python?</p>
<ol>
<li>Thonny</li>
<li>MS Word</li>
<li>Google Chrome</li>
<li>VLC Player</li>
</ol>
<p><strong style="color: #10b981;">Correct Answer: Thonny</strong></p>

<h3>Question 7</h3>
<p>What will happen when you run a program that prints "Hello, World!" in Python?</p>
<ol>
<li>It will display Hello, World!</li>
<li>It will give an error</li>
<li>Nothing will happen</li>
<li>It will shut down the computer</li>
</ol>
<p><strong style="color: #10b981;">Correct Answer: It will display Hello, World!</strong></p>

<hr style="margin: 20px 0;" />

<h2>Topic 3: Writing Your First Program</h2>

<h3>Question 8</h3>
<p>What is the correct way to display a message in Python?</p>
<ol>
<li>Using an echo command</li>
<li>Using a print command</li>
<li>Using a display command</li>
<li>Using a log command</li>
</ol>
<p><strong style="color: #10b981;">Correct Answer: Using a print command</strong></p>

<h3>Question 9</h3>
<p>In Python, strings must be enclosed in:</p>
<ol>
<li>Slash symbols</li>
<li>Angle brackets</li>
<li>Quotation marks</li>
<li>Exclamation marks</li>
</ol>
<p><strong style="color: #10b981;">Correct Answer: Quotation marks</strong></p>

<h3>Question 10</h3>
<p>If a program prints "Hello, Alex!" what will be the output?</p>
<ol>
<li>Hello, [your name]!</li>
<li>Hello, Alex!</li>
<li>An error message</li>
<li>Nothing</li>
</ol>
<p><strong style="color: #10b981;">Correct Answer: Hello, Alex!</strong></p>`,
                'Assignment': 'Write a Python program that prints a short introduction about yourself.',
                'Assignment Solution': `# Solution: Introduction Program

# Get user information
name = input("Enter your name: ")
age = input("Enter your age: ")
hobby = input("Enter your hobby: ")

# Print introduction
print(f"Hello! My name is ${"{ name }"}.")
print(f"I am ${"{ age }"} years old.")
print(f"My hobby is ${"{ hobby }"}.")
print("Nice to meet you!")`
            },
            '2': {
                // Session 2: Variables and Data Types in Python
                'Learning objective': `<h2>Learning Objectives</h2>
<p>By the end of this session, students will:</p>
<ul>
<li>Understand what variables are and how to create them.</li>
<li>Identify different data types in Python (e.g., integers, strings, floats).</li>
<li>Practice basic variable operations.</li>
</ul>`,
                'Topic 1: Variables in Python': `<h2>Variables in Python</h2>
<p>Variables are containers that store data values. They allow us to save information and use it later in our programs.</p>

<h3>What are Variables?</h3>
<p>A variable is a name that refers to a value stored in memory. Think of it like a labeled box where you can store something.</p>

<h3>Why Do We Use Variables?</h3>
<ul>
<li>To store data that we want to use multiple times</li>
<li>To make our code more readable and organized</li>
<li>To perform calculations and operations</li>
</ul>

<h3>Naming Conventions and Rules:</h3>
<ul>
<li>Variable names can contain letters, numbers, and underscores</li>
<li>They must start with a letter or underscore (not a number)</li>
<li>They are case-sensitive (age and Age are different)</li>
<li>Cannot use Python keywords (if, for, class, etc.)</li>
<li>Use descriptive names (e.g., <code>student_name</code> instead of <code>sn</code>)</li>
</ul>

<h3>Examples:</h3>
<pre><code class="language-python">
# Valid variable names
name = "Alice"
age = 25
my_variable = 100
_student = "John"

# Invalid variable names
# 2variable = 10  # Cannot start with a number
# my-variable = 10  # Cannot use hyphens
# class = "Python"  # Cannot use reserved keywords
</code></pre>

<h3>Video Script:</h3>
<p>Variables are the building blocks of programming. Let's learn how to use them! Variables store data. Think of them as labeled boxes in memory. Learn the rules for naming variables - letters, numbers, underscores, but start with a letter. See valid and invalid variable names in action. Variables help us store and reuse data in our programs.</p>`,
                'Topic 2: Data Types': `<h2>Data Types in Python</h2>
<p>Python has several built-in data types. Each type represents a different kind of data.</p>

<h3>Basic Data Types:</h3>

<h4>1. Integers (int)</h4>
<p>Whole numbers without decimals:</p>
<pre><code class="language-python">
age = 25
count = 100
temperature = -10
\`\`\`

<h4>2. Floats (float)</h4>
<p>Numbers with decimal points:</p>
<pre><code class="language-python">
price = 19.99
pi = 3.14
height = 5.8
\`\`\`

<h4>3. Strings (str)</h4>
<p>Text enclosed in quotes:</p>
<pre><code class="language-python">
name = "Alice"
message = 'Hello, World!'
greeting = """Multi-line
string"""
\`\`\`

<h4>4. Booleans (bool)</h4>
<p>True or False values:</p>
<pre><code class="language-python">
is_student = True
is_active = False
\`\`\`

<h3>Type Checking:</h3>
<p>Use the <code>type()</code> function to check the data type:</p>
<pre><code class="language-python">
print(type(25))        # <class 'int'>
print(type(3.14))      # <class 'float'>
print(type("Hello"))   # <class "str">
print(type(True))      # <class 'bool'>
\`\`\`

<h3>Data Types Diagram:</h3>
<pre><code class="language-mermaid">
graph TD
    A[Python Data Types] --> B[Numeric]
    A --> C[Text]
    A --> D[Boolean]
    B --> B1[Integer: 25]
    B --> B2[Float: 3.14]
    C --> C1[String: "Hello"]
    D --> D1[True/False]
\`\`\`

<p><em>Image source: https://data-flair.training/blogs/python-variables-and-data-types/</em></p>

<h3>Video Script:</h3>
<p>Python has different data types for different kinds of information. Whole numbers are integers - examples and when to use them. Decimal numbers are floats - precision and calculations. Text data are strings - single, double, and triple quotes. True/False values are booleans for conditions. Using type() to identify data types. Create variables of each type and check their types.</p>`,
                'Topic 3: Hands-On Practice': `<h2>Hands-On Practice</h2>
<p>Let's practice working with variables and data types!</p>

<h3>Exercise 1: Declaring Variables</h3>
<p>Create variables of different data types:</p>
<pre><code class="language-python">
# Integer
age = 20

# Float
height = 5.9

# String
name = "John"

# Boolean
is_student = True

# Display all variables
print(f"Name: ${"{ name }"}")
print(f"Age: ${"{ age }"}")
print(f"Height: ${"{ height }"} feet")
print(f"Is Student: ${"{ is_student }"}")
\`\`\`

<h3>Exercise 2: Calculate Sum of Two Numbers</h3>
<p>Write a Python script to calculate the sum of two numbers:</p>
<pre><code class="language-python">
# Get two numbers from user
num1 = float(input("Enter first number: "))
num2 = float(input("Enter second number: "))

# Calculate sum
sum_result = num1 + num2

# Display result
print(f"The sum of ${"{ num1 }"} and ${"{ num2 }"} is ${"{ sum_result }"}")
\`\`\`

<h3>Video Script:</h3>
<p>Time to practice what we've learned! Create variables of different types and display them. Build a program that adds two numbers together. Recap variables and data types, answer questions.</p>`,
                'Wrap-Up Quiz': JSON.stringify({
                    questions: [
                        {
                            question: 'What is a variable in Python?',
                            options: [
                                'A fixed value that cannot be changed',
                                'A name that stores a value in memory',
                                'A built-in function',
                                'A type of Python error'
                            ],
                            correctAnswerIndex: 1
                        },
                        {
                            question: 'Why do we use variables in programming?',
                            options: [
                                'To store and manipulate data',
                                'To make programs harder to read',
                                'To delete files automatically',
                                'To slow down execution'
                            ],
                            correctAnswerIndex: 0
                        },
                        {
                            question: 'Which of the following is a valid variable name in Python?',
                            options: ['2variable', 'my-variable', 'my_variable', 'class'],
                            correctAnswerIndex: 2
                        },
                        {
                            question: 'What will happen if you use a reserved keyword (e.g., "if" or "class") as a variable name?',
                            options: [
                                'The program will run normally',
                                'The program will display an error',
                                'The variable will store the keyword function',
                                'Python will rename the variable automatically'
                            ],
                            correctAnswerIndex: 1
                        },
                        {
                            question: 'Which of the following is NOT a basic data type in Python?',
                            options: ['Integer', 'Float', 'String', 'Character'],
                            correctAnswerIndex: 3
                        },
                        {
                            question: 'What is the correct data type for the value 3.14 in Python?',
                            options: ['Integer', 'Float', 'String', 'Boolean'],
                            correctAnswerIndex: 1
                        },
                        {
                            question: 'What will the following code return? type(True)',
                            options: ['int', 'str', 'bool', 'float'],
                            correctAnswerIndex: 2
                        },
                        {
                            question: 'Which of the following is an example of a string?',
                            options: ['42', '"Hello, World!"', '3.5', 'True'],
                            correctAnswerIndex: 1
                        },
                        {
                            question: 'If you store 10 in a variable named x and 5 in a variable named y, what will x + y return?',
                            options: ['105', '15', 'x + y', 'An error'],
                            correctAnswerIndex: 1
                        },
                        {
                            question: 'Which of the following is the correct way to declare a variable storing a person name?',
                            options: [
                                'name = John',
                                '"name" = "John"',
                                'name == "John"',
                                'name = "John"'
                            ],
                            correctAnswerIndex: 3
                        }
                    ]
                }),
                'Assignment': 'Write a Python program that accepts your name and age as inputs, and prints them in a complete sentence.',
                'Assignment Solution': `# Solution: Name and Age Program

# Get user's name and age
name = input("Enter your name: ")
age = input("Enter your age: ")

# Print in a complete sentence
print(f"My name is ${"{ name }"} and I am ${"{ age }"} years old.")`
            },
            '3': {
                // Session 3: Input and Output in Python
                'Learning objective': `<h2>Learning Objectives</h2>
<p>By the end of this session, students will:</p>
<ul>
<li>Understand how to accept user inputs using input().</li>
<li>Format and display output effectively using print().</li>
<li>Practice writing programs that interact with users.</li>
</ul>`,
                'Topic 1: Input in Python': `<h2>Input in Python</h2>
<p>The <code>input()</code> function allows your program to accept data from the user while it's running.</p>

<h3>How to Use input()</h3>
<p>The <code>input()</code> function displays a prompt and waits for the user to type something and press Enter.</p>

<pre><code class="language-python">
# Basic input
name = input("Enter your name: ")
print(f"Hello, ${"{ name }"}!")
</code></pre>

<h3>Important Notes:</h3>
<ul>
<li><code>input()</code> always returns a <strong>string</strong>, even if the user types a number</li>
<li>To use the input as a number, you need to convert it using <code>int()</code> or <code>float()</code></li>
</ul>

<h3>Example: Accepting a User's Name</h3>
<pre><code class="language-python">
# Get user's name
name = input("What is your name? ")

# Greet the user
print(f"Nice to meet you, ${"{ name }"}!")
</code></pre>

<h3>Video Script:</h3>
<p>Learn how to make your programs interactive with user input! How input() works and how to use it to get user data. Getting text input from users - names, messages, etc. Converting string input to numbers using int() and float(). Build a program that greets users by name.</p>`,
                'Topic 2: Output in Python': `<h2>Output in Python</h2>
<p>The <code>print()</code> function displays information to the user. You can format output in several ways.</p>

<h3>Basic print()</h3>
<pre><code class="language-python">
print("Hello, World!")
print(42)
print("Name:", "Alice")
</code></pre>

<h3>String Concatenation</h3>
<p>Combine strings using the <code>+</code> operator:</p>
<pre><code class="language-python">
name = "Alice"
age = 25
message = "My name is " + name + " and I am " + str(age) + " years old."
print(message)
</code></pre>

<h3>F-strings (Formatted String Literals)</h3>
<p>F-strings make formatting easier and more readable:</p>
<pre><code class="language-python">
name = "Alice"
age = 25
message = f"My name is {name} and I am {age} years old."
print(message)
</code></pre>

<h3>Example: Displaying User Information</h3>
<pre><code class="language-python">
# Get user information
name = input("Enter your name: ")
age = int(input("Enter your age: "))

# Display using f-string
print(f"Hello, ${"{ name }"}! You are ${"{ age }"} years old.")
</code></pre>

<h3>Input & Output Diagram:</h3>
<pre><code class="language-mermaid">
graph LR
    A[User] -->|Types input| B[input function]
    B -->|Returns string| C[Program]
    C -->|Processes data| D[print function]
    D -->|Displays output| A
</code></pre>

<p><em>Image source: https://www.computerbitsdaily.com/2022/10/python-programming-cards-photo-gallery.html</em></p>

<h3>Video Script:</h3>
<p>Learn different ways to display output in Python. Simple output with print() function. Combining strings with + operator. Modern way to format strings with f-strings - cleaner and easier. Build programs that format and display user information beautifully.</p>`,
                'Topic 3: Hands-On Practice': `<h2>Hands-On Practice</h2>
<p>Let's practice input and output with real examples!</p>

<h3>Exercise 1: Full Name Greeting</h3>
<p>Write a program that accepts first and last name, then displays a greeting:</p>
<pre><code class="language-python">
# Get first and last name
first_name = input("Enter your first name: ")
last_name = input("Enter your last name: ")

# Display greeting
print(f"Hello, ${"{ first_name }"} ${"{ last_name }"}!")
</code></pre>

<h3>Exercise 2: Calculator</h3>
<p>Write a program that accepts two numbers and displays their sum, difference, product, and quotient:</p>
<pre><code class="language-python">
# Get two numbers
num1 = float(input("Enter first number: "))
num2 = float(input("Enter second number: "))

# Calculate and display results
print(f"Sum: ${"{ num1 + num2 }"}")
print(f"Difference: ${"{ num1 - num2 }"}")
print(f"Product: ${"{ num1 * num2 }"}")
if num2 != 0:
    print(f"Quotient: ${"{ num1 / num2 }"}")
else:
    print("Cannot divide by zero!")
</code></pre>

<h3>Video Script:</h3>
<p>Practice time! Let's build interactive programs. Create a program that greets users by their full name. Build a simple calculator that performs multiple operations. Recap input() and print() concepts.</p>`,
                'Wrap-Up Quiz': JSON.stringify({
                    questions: [
                        {
                            question: 'What is the purpose of the input function in Python?',
                            options: [
                                'To display text on the screen',
                                'To accept user input from the keyboard',
                                'To perform mathematical calculations',
                                'To comment out code'
                            ],
                            correctAnswerIndex: 1
                        },
                        {
                            question: 'What data type does the input function return by default?',
                            options: ['Integer', 'Float', 'String', 'Boolean'],
                            correctAnswerIndex: 2
                        },
                        {
                            question: 'What will happen if you use input to take a number from the user but do not convert it to an integer or float?',
                            options: [
                                'The number will be stored as a string',
                                'The program will crash',
                                'Python will automatically convert it to a number',
                                'The input will be ignored'
                            ],
                            correctAnswerIndex: 0
                        },
                        {
                            question: 'How can you convert user input into an integer?',
                            options: [
                                'Using an integer conversion function',
                                'Using a string conversion function',
                                'Using a floating-point conversion function',
                                'Using a list conversion function'
                            ],
                            correctAnswerIndex: 0
                        },
                        {
                            question: 'What function is used to display output in Python?',
                            options: [
                                'Display function',
                                'Print function',
                                'Output function',
                                'Show function'
                            ],
                            correctAnswerIndex: 1
                        },
                        {
                            question: 'Which method is NOT commonly used to format output in Python?',
                            options: [
                                'String concatenation',
                                'F-strings',
                                'Formatting method',
                                'Combining function'
                            ],
                            correctAnswerIndex: 3
                        },
                        {
                            question: 'What happens when you use an f-string in Python?',
                            options: [
                                'It allows variables to be included directly in a string',
                                'It automatically capitalizes all text',
                                'It removes spaces from the string',
                                'It converts all numbers into text'
                            ],
                            correctAnswerIndex: 0
                        },
                        {
                            question: 'What is the main advantage of using f-strings over string concatenation?',
                            options: [
                                'They are more readable and efficient',
                                'They require fewer variables',
                                'They automatically correct errors',
                                'They convert numbers to strings automatically'
                            ],
                            correctAnswerIndex: 0
                        },
                        {
                            question: 'If a user inputs their first name as "John" and last name as "Doe", how would you correctly format the output as a greeting message?',
                            options: [
                                'By manually writing a greeting for each user',
                                'By combining the first and last name with a greeting in a structured sentence',
                                'By storing the name in a list',
                                'By displaying only the first name'
                            ],
                            correctAnswerIndex: 1
                        },
                        {
                            question: 'If you accept two numbers from a user and store them in separate variables, how would you correctly display their sum?',
                            options: [
                                'By directly adding the two variables',
                                'By converting them into integers before performing addition',
                                'By displaying them separately without adding',
                                'By storing the result in a list and printing it'
                            ],
                            correctAnswerIndex: 1
                        }
                    ]
                }),
                'Assignment': 'Write a program that asks the user for three favorite foods and prints them in a single sentence.',
                'Assignment Solution': `# Solution: Favorite Foods Program

# Get three favorite foods
food1 = input("Enter your first favorite food: ")
food2 = input("Enter your second favorite food: ")
food3 = input("Enter your third favorite food: ")

# Print in a single sentence
print(f"My three favorite foods are ${"{ food1 }"}, ${"{ food2 }"}, and ${"{ food3 }"}.")`
            },
            '4': {
                // Session 4: Control Flow in Python – if Statements
                'Learning objective': `<h2>Learning Objectives</h2>
<p>By the end of this session, students will:</p>
<ul>
<li>Understand the concept of control flow in programming.</li>
<li>Write conditional statements using if, elif, and else.</li>
<li>Practice basic decision-making in Python programs.</li>
</ul>`,
                'Topic 1: Introduction to Control Flow': `<h2>Introduction to Control Flow</h2>
<p>Control flow determines the order in which statements are executed in a program. It allows programs to make decisions and repeat actions.</p>

<h3>What is Control Flow?</h3>
<p>Control flow refers to the order in which program statements are executed. It includes:</p>
<ul>
<li><strong>Sequential:</strong> Statements execute one after another</li>
<li><strong>Conditional:</strong> Statements execute based on conditions (if/else)</li>
<li><strong>Iterative:</strong> Statements repeat (loops)</li>
</ul>

<h3>Real-Life Analogy</h3>
<p>Think of control flow like making decisions in daily life:</p>
<ul>
<li>"If it rains, use an umbrella" - conditional</li>
<li>"If it's cold, wear a jacket" - conditional</li>
<li>"Repeat brushing teeth until clean" - iterative</li>
</ul>

<h3>Why is Control Flow Important?</h3>
<p>Control flow allows programs to:</p>
<ul>
<li>Make decisions based on conditions</li>
<li>Repeat actions efficiently</li>
<li>Respond differently to different situations</li>
</ul>

<h3>Control Flow Diagram:</h3>
<pre><code class="language-mermaid">
graph TD
    A[Start] --> B{Condition}
    B -->|True| C[Execute Code Block]
    B -->|False| D[Skip or Execute Else]
    C --> E[Continue]
    D --> E
</code></pre>

<p><em>Image source: https://www.tutorialspoint.com/python/python_if_else.htm</em></p>

<h3>Video Script:</h3>
<p>Control flow helps programs make decisions! Understanding sequential, conditional, and iterative execution. See how control flow works in everyday decisions. How control flow makes programs intelligent and responsive. Control flow is essential for creating dynamic programs.</p>`,
                'Topic 2: Writing Conditional Statements': `<h2>Writing Conditional Statements</h2>
<p>Conditional statements allow your program to execute different code based on conditions.</p>

<h3>Syntax of if, elif, and else</h3>
<pre><code class="language-python">
# Simple if statement
if condition:
    # code to execute if condition is True
    pass

# if-else statement
if condition:
    # code if True
    pass
else:
    # code if False
    pass

# if-elif-else statement
if condition1:
    # code if condition1 is True
    pass
elif condition2:
    # code if condition2 is True
    pass
else:
    # code if all conditions are False
    pass
</code></pre>

<h3>Example 1: Checking if a Number is Positive, Negative, or Zero</h3>
<pre><code class="language-python">
number = float(input("Enter a number: "))

if number > 0:
    print("The number is positive.")
elif number < 0:
    print("The number is negative.")
else:
    print("The number is zero.")
</code></pre>

<h3>Example 2: Determining Voting Eligibility</h3>
<pre><code class="language-python">
age = int(input("Enter your age: "))

if age >= 18:
    print("You are eligible to vote!")
else:
    print(f"You need to wait ${"{ 18 - age }"} more years to vote.")
</code></pre>

<h3>Video Script:</h3>
<p>Learn to write conditional statements in Python. Basic conditional execution with if. Handling both True and False cases with if-else. Multiple conditions with elif in if-elif-else. See conditional statements in action.</p>`,
                'Topic 3: Hands-On Practice': `<h2>Hands-On Practice</h2>
<p>Let's practice writing conditional statements!</p>

<h3>Exercise 1: Even or Odd</h3>
<p>Write a program to check if a number is even or odd:</p>
<pre><code class="language-python">
number = int(input("Enter a number: "))

if number % 2 == 0:
    print(f"${"{ number }"} is even.")
else:
    print(f"${"{ number }"} is odd.")
</code></pre>

<h3>Exercise 2: Grade System</h3>
<p>Accept a user's score and display a grade based on ranges:</p>
<pre><code class="language-python">
score = float(input("Enter your score: "))

if score >= 90:
    grade = "A"
elif score >= 80:
    grade = "B"
elif score >= 70:
    grade = "C"
elif score >= 60:
    grade = "D"
else:
    grade = "F"

print(f"Your grade is ${"{ grade }"}")
</code></pre>

<h3>Challenge: Largest of Three Numbers</h3>
<pre><code class="language-python">
num1 = float(input("Enter first number: "))
num2 = float(input("Enter second number: "))
num3 = float(input("Enter third number: "))

if num1 >= num2 and num1 >= num3:
    largest = num1
elif num2 >= num1 and num2 >= num3:
    largest = num2
else:
    largest = num3

print(f"The largest number is ${"{ largest }"}")
</code></pre>

<h3>Video Script:</h3>
<p>Practice time with conditional statements! Check if a number is even or odd. Build a grading system using if-elif-else. Find the largest of three numbers.</p>`,
                'Wrap-Up Quiz': JSON.stringify({
                    questions: [
                        {
                            question: 'What does control flow refer to in programming?',
                            options: [
                                'The order in which statements are executed',
                                'The speed of the program',
                                'The number of variables in a program',
                                'The way functions are named'
                            ],
                            correctAnswerIndex: 0
                        },
                        {
                            question: 'Which of the following is an example of control flow in real life?',
                            options: [
                                'Watching TV',
                                'Deciding to wear a jacket if it is cold outside',
                                'Running without stopping',
                                'Counting objects'
                            ],
                            correctAnswerIndex: 1
                        },
                        {
                            question: 'Why is control flow important in programming?',
                            options: [
                                'It helps execute all code at the same time',
                                'It allows decisions and loops to control execution order',
                                'It prevents a program from running',
                                'It makes the code longer'
                            ],
                            correctAnswerIndex: 1
                        },
                        {
                            question: 'Which keyword is used for a simple decision-making statement in Python?',
                            options: ['for', 'if', 'loop', 'function'],
                            correctAnswerIndex: 1
                        },
                        {
                            question: 'What is the purpose of the elif statement in Python?',
                            options: [
                                'It starts a loop',
                                'It runs when the if condition is false but checks another condition',
                                'It stops the program',
                                'It prints text on the screen'
                            ],
                            correctAnswerIndex: 1
                        },
                        {
                            question: 'If a user enters their age, how can you check if they are eligible to vote?',
                            options: [
                                'By checking if the age is greater than or equal to the required voting age',
                                'By checking if the age is less than zero',
                                'By using a loop',
                                'By printing the age without checking'
                            ],
                            correctAnswerIndex: 0
                        },
                        {
                            question: 'What will happen if none of the if or elif conditions are met?',
                            options: [
                                'The program crashes',
                                'The else statement (if present) runs',
                                'The first condition is always executed',
                                'Python will display an error message'
                            ],
                            correctAnswerIndex: 1
                        },
                        {
                            question: 'How do you determine if a number is even or odd?',
                            options: [
                                'By checking if the number is divisible by 2',
                                'By checking if the number is greater than 10',
                                'By adding 1 to the number',
                                'By multiplying the number by 2'
                            ],
                            correctAnswerIndex: 0
                        },
                        {
                            question: 'When writing a grading system, what is the best way to check the grade based on score ranges?',
                            options: [
                                'Using multiple if statements without elif',
                                'Using if, elif, and else conditions to cover different score ranges',
                                'By printing all grades and letting the user choose',
                                'By checking only the highest grade and ignoring the rest'
                            ],
                            correctAnswerIndex: 1
                        },
                        {
                            question: 'What approach should you use to determine the largest of three numbers entered by a user?',
                            options: [
                                'Compare each number using if, elif, and else conditions',
                                'Multiply all numbers together',
                                'Convert numbers to strings and compare their length',
                                'Print all numbers and let the user decide'
                            ],
                            correctAnswerIndex: 0
                        }
                    ]
                }),
                'Assignment': `Write a Python program that asks the user for their age and suggests an activity based on the input (e.g., "You're a teenager, focus on your studies!").`,
                'Assignment Solution': `# Solution: Age-Based Activity Suggestion

age = int(input("Enter your age: "))

if age < 13:
    print("You're a child! Enjoy playing and learning new things!")
elif age < 20:
    print("You're a teenager, focus on your studies!")
elif age < 65:
    print("You're an adult! Work hard and pursue your goals!")
else:
    print("You're a senior! Enjoy your well-deserved rest and share your wisdom!")`
            },
            '5': {
                // Session 5: Loops in Python – for and while
                'Learning objective': `<h2>Learning Objectives</h2>
<p>By the end of this session, students will:</p>
<ul>
<li>Understand the purpose of loops in programming.</li>
<li>Learn how to use for and while loops in Python.</li>
<li>Practice writing programs that use loops for repetitive tasks.</li>
</ul>`,
                'Topic 1: Introduction to Loops': `<h2>Introduction to Loops</h2>
<p>Loops allow you to execute a block of code multiple times, making programs more efficient and powerful.</p>

<h3>What are Loops?</h3>
<p>Loops are programming constructs that repeat a block of code until a certain condition is met or for a specific number of times.</p>

<h3>Difference between for and while Loops</h3>
<ul>
<li><strong>for loop:</strong> Runs a fixed number of times (iterates over a sequence)</li>
<li><strong>while loop:</strong> Runs as long as a condition is true (indefinite iteration)</li>
</ul>

<h3>For Loop Syntax</h3>
<pre><code class="language-python">
# Iterate over a range
for i in range(1, 11):
    print(i)

# Iterate over a list
fruits = ["apple", "banana", "orange"]
for fruit in fruits:
    print(fruit)
\`\`\`

<h3>Example: Printing Numbers from 1 to 10</h3>
<pre><code class="language-python">
for number in range(1, 11):
    print(number)
\`\`\`

<h3>Example: Iterating Over a List</h3>
<pre><code class="language-python">
students = ["Alice", "Bob", "Charlie"]
for student in students:
    print(f"Hello, ${"{ student }"}!")
\`\`\`

<h3>For & While Loop Diagram:</h3>
<pre><code class="language-mermaid">
graph TD
    A[For Loop] --> B[Fixed iterations]
    C[While Loop] --> D[Condition-based]
    B --> E[range, list, etc.]
    D --> F[Continues while True]
\`\`\`

<p><em>Image source: https://www.geeksforgeeks.org/difference-between-for-loop-and-while-loop-in-programming/</em></p>

<h3>Video Script:</h3>
<p>Loops help us repeat actions efficiently! Understanding the purpose and power of loops. Key differences between for and while loops. How to write and use for loops with range() and lists. Print numbers, iterate over lists, practical examples. Try writing your own for loops!</p>`,
                'Topic 2: Using while Loops': `<h2>Using while Loops</h2>
<p>While loops repeat code as long as a condition remains true.</p>

<h3>While Loop Syntax</h3>
<pre><code class="language-python">
while condition:
    # code to execute
    pass
\`\`\`

<h3>Example: Printing Numbers Until a Condition is Met</h3>
<pre><code class="language-python">
count = 1
while count <= 10:
    print(count)
    count += 1  # Important: update the counter!
\`\`\`

<h3>Example: Using a Counter in a while Loop</h3>
<pre><code class="language-python">
counter = 0
while counter < 5:
    print(f"Count: ${"{ counter }"}")
    counter += 1
\`\`\`

<h3>Important: Avoiding Infinite Loops</h3>
<p>Always make sure the condition will eventually become False, or use <code>break</code> to exit:</p>
<pre><code class="language-python">
# Good: condition will become False
count = 0
while count < 10:
    print(count)
    count += 1

# Bad: infinite loop (don't do this!)
# while True:
#     print("This runs forever!")
\`\`\`

<h3>Video Script:</h3>
<p>While loops run until a condition is false. How to write a while loop. Using a counter to control loop execution. Important tips to prevent infinite loops. When to use while loops vs for loops.</p>`,
                'Wrap-Up Quiz': JSON.stringify({
                    questions: [
                        {
                            question: 'What is the purpose of loops in programming?',
                            options: [
                                'To execute a block of code multiple times',
                                'To store large amounts of data',
                                'To stop a program from running',
                                'To randomly choose a value'
                            ],
                            correctAnswerIndex: 0
                        },
                        {
                            question: 'Which of the following is an example of when you would use a loop?',
                            options: [
                                'Printing a single message on the screen',
                                'Checking if a number is positive or negative',
                                'Iterating through a list of student names to print each one',
                                'Writing a one-time calculation'
                            ],
                            correctAnswerIndex: 2
                        },
                        {
                            question: 'What is the key difference between a for loop and a while loop?',
                            options: [
                                'A for loop is used for indefinite looping, while a while loop is used for definite looping',
                                'A for loop runs a fixed number of times, while a while loop runs until a condition is false',
                                'A for loop is slower than a while loop',
                                'A while loop requires a list, whereas a for loop does not'
                            ],
                            correctAnswerIndex: 1
                        },
                        {
                            question: 'Which type of loop is best suited for iterating over a list of items?',
                            options: ['while loop', 'for loop', 'if-else statement', 'switch statement'],
                            correctAnswerIndex: 1
                        },
                        {
                            question: 'In a for loop, what determines the number of times the loop runs?',
                            options: [
                                'The condition inside an if statement',
                                'The number of items in the sequence or range',
                                'The number of times the user presses a key',
                                'The amount of memory available'
                            ],
                            correctAnswerIndex: 1
                        },
                        {
                            question: 'What is the main characteristic of a while loop?',
                            options: [
                                'It runs for a predetermined number of times',
                                'It repeats as long as a certain condition is true',
                                'It only runs once and then stops',
                                'It executes before checking any condition'
                            ],
                            correctAnswerIndex: 1
                        },
                        {
                            question: 'When should you use a while loop instead of a for loop?',
                            options: [
                                'When the number of iterations is unknown beforehand',
                                'When iterating through a list',
                                'When running a function',
                                'When defining a variable'
                            ],
                            correctAnswerIndex: 0
                        },
                        {
                            question: 'What happens if the condition in a while loop never becomes false?',
                            options: [
                                'The program stops immediately',
                                'The loop runs indefinitely (infinite loop)',
                                'An error message is displayed',
                                'The program skips the loop'
                            ],
                            correctAnswerIndex: 1
                        },
                        {
                            question: 'Which of the following is a common use case for a while loop?',
                            options: [
                                'Printing "Hello" once',
                                'Running a loop until the user enters a specific input',
                                'Changing the value of a variable once',
                                'Creating a fixed-length list'
                            ],
                            correctAnswerIndex: 1
                        },
                        {
                            question: 'How can you ensure that a while loop eventually stops running?',
                            options: [
                                'By increasing the loop counter inside the loop',
                                'By using a break statement randomly',
                                'By not using any conditions',
                                'By making the condition always true'
                            ],
                            correctAnswerIndex: 0
                        }
                    ]
                }),
                'Assignment': 'Write a Python program to display the sum of the first 20 natural numbers using a loop.',
                'Assignment Solution': `# Solution: Sum of First 20 Natural Numbers

# Using a for loop
total = 0
for i in range(1, 21):
    total += i

print(f"The sum of the first 20 natural numbers is ${"{ total }"}")

# Alternative using while loop
total = 0
count = 1
while count <= 20:
    total += count
    count += 1

print(f"The sum of the first 20 natural numbers is ${"{ total }"}")`
            },
            '6': {
                // Session 6: Functions in Python
                'Learning objective': `<h2>Learning Objectives</h2>
<p>By the end of this session, students will:</p>
<ul>
<li>Understand the purpose of functions in programming.</li>
<li>Learn how to define and call functions in Python.</li>
<li>Write reusable code using functions.</li>
</ul>`,
                'Topic 1: What Are Functions?': `<h2>What Are Functions?</h2>
<p>Functions are reusable blocks of code that perform a specific task. They help organize code and avoid repetition.</p>

<h3>Purpose of Functions</h3>
<ul>
<li>To avoid repeating code</li>
<li>To organize code into logical sections</li>
<li>To make programs easier to read and maintain</li>
<li>To allow code reuse</li>
</ul>

<h3>Built-in Python Functions</h3>
<p>Python comes with many built-in functions:</p>
<pre><code class="language-python">
print("Hello")        # Prints to console
len("Python")        # Returns length: 6
type(42)             # Returns data type
input("Enter: ")     # Gets user input
\`\`\`

<h3>Defining Your Own Functions</h3>
<p>Use the <code>def</code> keyword to define a function:</p>
<pre><code class="language-python">
def greet_user():
    print("Hello, user!")

# Call the function
greet_user()
\`\`\`

<h3>Functions with Arguments</h3>
<pre><code class="language-python">
def greet(name):
    print(f"Hello, ${"{ name }"}!")

greet("Alice")
greet("Bob")
\`\`\`

<h3>Functions with Return Values</h3>
<pre><code class="language-python">
def add_numbers(a, b):
    return a + b

result = add_numbers(5, 3)
print(result)  # Output: 8
\`\`\`

<h3>Function Explained Diagram:</h3>
<pre><code class="language-mermaid">
graph LR
    A[Function Definition] --> B[Function Name]
    A --> C[Parameters]
    A --> D[Function Body]
    D --> E[Return Value]
    F[Function Call] --> G[Execute Function]
    G --> E
\`\`\`

<p><em>Image source: https://medium.com/@eylemaytas1/exploring-functions-in-python-59a8bd537678</em></p>

<h3>Video Script:</h3>
<p>Functions help us write reusable, organized code! Understanding the purpose and benefits of functions. Examples of Python's built-in functions. How to create your own functions with def. Passing data to functions and getting results back. See functions in action with practical examples.</p>`,
                'Topic 2: Hands-On Practice': `<h2>Hands-On Practice</h2>
<p>Let's practice creating and using functions!</p>

<h3>Exercise 1: Calculate Square</h3>
<p>Create a function to calculate the square of a number:</p>
<pre><code class="language-python">
def square(number):
    return number * number

# Test the function
result = square(5)
print(f"Square of 5 is ${"{ result }"}")  # Output: Square of 5 is 25
\`\`\`

<h3>Exercise 2: User Information Function</h3>
<p>Define a function that takes a user's name and age, and returns a message:</p>
<pre><code class="language-python">
def user_info(name, age):
    return f"Hello! My name is {name} and I am {age} years old."

# Use the function
message = user_info("Alice", 25)
print(message)
\`\`\`

<h3>Challenge: Find Largest Number in a List</h3>
<pre><code class="language-python">
def find_largest(numbers):
    if not numbers:
        return None
    largest = numbers[0]
    for num in numbers:
        if num > largest:
            largest = num
    return largest

# Test the function
my_list = [3, 7, 2, 9, 1, 5]
result = find_largest(my_list)
print(f"The largest number is ${"{ result }"}")  # Output: The largest number is 9
\`\`\`

<h3>Video Script:</h3>
<p>Practice creating and using functions! Create a function to calculate squares. Build a function that formats user information. Write a function to find the largest number in a list. Recap function concepts and best practices.</p>`,
                'Wrap-Up Quiz': JSON.stringify({
                    questions: [
                        {
                            question: 'What is the purpose of functions in Python?',
                            options: [
                                'To store data',
                                'To repeat a block of code without rewriting it',
                                'To create loops',
                                'To stop program execution'
                            ],
                            correctAnswerIndex: 1
                        },
                        {
                            question: 'Which of the following is an example of a built-in function in Python?',
                            options: ['print()', 'myFunction()', 'define()', 'loop()'],
                            correctAnswerIndex: 0
                        },
                        {
                            question: 'What keyword is used to define a function in Python?',
                            options: ['function', 'define', 'def', 'create'],
                            correctAnswerIndex: 2
                        },
                        {
                            question: 'What does a function return if there is no explicit return statement?',
                            options: [
                                'The last value used in the function',
                                'The number 0',
                                'None',
                                'An empty string'
                            ],
                            correctAnswerIndex: 2
                        },
                        {
                            question: 'Why are arguments used in functions?',
                            options: [
                                'To repeat a function multiple times',
                                'To allow functions to accept input values for processing',
                                'To create variables inside the function',
                                'To stop a function from running'
                            ],
                            correctAnswerIndex: 1
                        },
                        {
                            question: 'If a function takes an argument, what does it mean?',
                            options: [
                                'The function can only run once',
                                'The function accepts input values when called',
                                'The function cannot return values',
                                'The function must always print something'
                            ],
                            correctAnswerIndex: 1
                        },
                        {
                            question: 'What is the purpose of the return statement in a function?',
                            options: [
                                'To display output on the screen',
                                'To return a value from the function back to where it was called',
                                'To stop the function from executing',
                                'To take input from the user'
                            ],
                            correctAnswerIndex: 1
                        },
                        {
                            question: 'What happens if you call a function without providing the required arguments?',
                            options: [
                                'The program runs normally',
                                'The function automatically assigns default values',
                                'Python raises an error',
                                'The function skips execution'
                            ],
                            correctAnswerIndex: 2
                        },
                        {
                            question: 'Which of the following is an example of a function that takes multiple arguments?',
                            options: [
                                'A function that only prints "Hello"',
                                'A function that adds two numbers and returns the sum',
                                'A function that runs a while loop',
                                'A function that only contains a return statement'
                            ],
                            correctAnswerIndex: 1
                        },
                        {
                            question: 'What is a common use case for functions in programming?',
                            options: [
                                'To break code into smaller, reusable pieces',
                                'To write the entire program in one block',
                                'To store large amounts of data',
                                'To make the code run slower'
                            ],
                            correctAnswerIndex: 0
                        }
                    ]
                }),
                'Assignment': 'Write a Python program with a function that calculates the factorial of a number. Bonus: Create a function that accepts a list of numbers and returns the average.',
                'Assignment Solution': `# Solution: Factorial and Average Functions

# Function to calculate factorial
def factorial(n):
    if n == 0 or n == 1:
        return 1
    result = 1
    for i in range(2, n + 1):
        result *= i
    return result

# Test factorial
num = 5
print(f"Factorial of ${"{ num }"} is ${"{ factorial(num) }"}")

# Bonus: Function to calculate average
def calculate_average(numbers):
    if not numbers:
        return 0
    total = sum(numbers)
    return total / len(numbers)

# Test average
my_numbers = [10, 20, 30, 40, 50]
avg = calculate_average(my_numbers)
print(f"Average of ${"{ my_numbers }"} is ${"{ avg }"}")`
            },
            '7': {
                // Session 7: Lists and Tuples in Python
                'Learning objective': `<h2>Learning Objectives</h2>
<p>By the end of this session, students will:</p>
<ul>
<li>Understand what lists and tuples are in Python.</li>
<li>Learn how to create, access, and modify lists and tuples.</li>
<li>Practice performing basic operations on lists and tuples.</li>
</ul>`,
                'Topic 1: Introduction to Lists': `<h2>Introduction to Lists</h2>
<p>Lists and tuples are collections that allow you to store multiple items in a single variable.</p>

<h3>What is a List?</h3>
<p>A list is an ordered, changeable (mutable) collection of items. Lists are created using square brackets <code>[]</code>.</p>

<h3>Creating and Accessing Lists</h3>
<pre><code class="language-python">
# Create a list
fruits = ["apple", "banana", "orange"]
numbers = [1, 2, 3, 4, 5]

# Access items by index (starts at 0)
print(fruits[0])    # Output: apple
print(fruits[1])    # Output: banana
print(fruits[-1])   # Output: orange (last item)
\`\`\`

<h3>Adding, Removing, and Updating Items</h3>
<pre><code class="language-python">
# Add item to end
fruits.append("grape")

# Remove item
fruits.remove("banana")

# Update item
fruits[0] = "mango"

# Insert at specific position
fruits.insert(1, "pear")
\`\`\`

<h3>Iterating Through a List</h3>
<pre><code class="language-python">
fruits = ["apple", "banana", "orange"]
for fruit in fruits:
    print(fruit)
\`\`\`

<h3>What are Tuples?</h3>
<p>Tuples are ordered, unchangeable (immutable) collections. They are created using parentheses <code>()</code>.</p>

<h3>Creating Tuples</h3>
<pre><code class="language-python">
# Create a tuple
days = ("Monday", "Tuesday", "Wednesday", "Thursday", "Friday")

# Access items (same as lists)
print(days[0])  # Output: Monday

# Cannot modify tuples
# days[0] = "Sunday"  # This would cause an error!
\`\`\`

<h3>List and Tuple Diagram:</h3>
<pre><code class="language-mermaid">
graph TD
    A[Collections] --> B[List]
    A --> C[Tuple]
    B --> B1[Mutable: Can Change]
    B --> B2[Square Brackets []]
    C --> C1[Immutable: Cannot Change]
    C --> C2[Parentheses ()]
\`\`\`

<p><em>Image source: https://www.instagram.com/allinpython/p/CltwgZpj5D4/</em></p>

<h3>Video Script:</h3>
<p>Lists and tuples help us store multiple items! Understanding lists - ordered, changeable collections. Creating, accessing, adding, removing items from lists. Using loops to go through list items. Understanding tuples - ordered, unchangeable collections. When to use lists vs tuples. Create lists and tuples, perform operations.</p>`,
                'Wrap-Up Quiz': JSON.stringify({
                    questions: [
                        {
                            question: 'What is a list in Python?',
                            options: [
                                'A function that repeats a task',
                                'A collection of ordered and changeable items',
                                'A data type used only for numbers',
                                'A loop that runs indefinitely'
                            ],
                            correctAnswerIndex: 1
                        },
                        {
                            question: 'How do you access the first item in a list?',
                            options: ['list[0]', 'list(1)', 'list.first()', 'list[-1]'],
                            correctAnswerIndex: 0
                        },
                        {
                            question: 'What method is used to add an item to the end of a list?',
                            options: ['insert()', 'remove()', 'append()', 'pop()'],
                            correctAnswerIndex: 2
                        },
                        {
                            question: 'Which method is used to remove an item from a list?',
                            options: ['delete()', 'pop()', 'discard()', 'push()'],
                            correctAnswerIndex: 1
                        },
                        {
                            question: 'What is the main difference between a list and a tuple in Python?',
                            options: [
                                'Lists are immutable, while tuples are mutable',
                                'Tuples are immutable, while lists are mutable',
                                'Tuples store only numbers, while lists store any data',
                                'Lists are faster than tuples'
                            ],
                            correctAnswerIndex: 1
                        },
                        {
                            question: 'What will my_list[-1] return?',
                            options: [
                                'The first item in the list',
                                'The last item in the list',
                                'The total number of items',
                                'An error'
                            ],
                            correctAnswerIndex: 1
                        },
                        {
                            question: 'Which of the following is a valid way to create a tuple?',
                            options: [
                                'my_tuple = {1, 2, 3}',
                                'my_tuple = [1, 2, 3]',
                                'my_tuple = (1, 2, 3)',
                                'my_tuple = tuple[1, 2, 3]'
                            ],
                            correctAnswerIndex: 2
                        },
                        {
                            question: 'What happens if you try to modify a tuple?',
                            options: [
                                'It updates normally',
                                'It deletes the existing value',
                                'It raises an error',
                                'It converts into a list'
                            ],
                            correctAnswerIndex: 2
                        },
                        {
                            question: 'Which method is used to loop through a list in Python?',
                            options: ['while', 'for', 'loop()', 'iterate()'],
                            correctAnswerIndex: 1
                        },
                        {
                            question: 'Which of the following is an example of an immutable data type?',
                            options: ['List', 'Tuple', 'Dictionary', 'Set'],
                            correctAnswerIndex: 1
                        }
                    ]
                }),
                'Assignment': 'Write a Python program to create a list of five numbers and calculate their sum. Bonus: Create a tuple of five cities and display them in reverse order.',
                'Assignment Solution': `# Solution: List Sum and Tuple Cities

# Create a list of five numbers
numbers = [10, 20, 30, 40, 50]

# Calculate sum
total = sum(numbers)
print(f"Sum of ${"{ numbers }"} is ${"{ total }"}")

# Bonus: Create a tuple of cities
cities = ("New York", "London", "Tokyo", "Paris", "Sydney")

# Display in reverse order
print("Cities in reverse order:")
for city in reversed(cities):
    print(city)`
            },
            '8': {
                // Session 8: Dictionaries in Python
                'Learning objective': `<h2>Learning Objectives</h2>
<p>By the end of this session, students will:</p>
<ul>
<li>Understand what dictionaries are and their purpose.</li>
<li>Learn how to create and manipulate dictionaries in Python.</li>
<li>Practice accessing and updating data stored in dictionaries.</li>
</ul>`,
                'Topic 1: Introduction to Dictionaries': `<h2>Introduction to Dictionaries</h2>
<p>Dictionaries store data in key-value pairs, making it easy to organize and retrieve information.</p>

<h3>What is a Dictionary?</h3>
<p>A dictionary is a collection of key-value pairs. Each key is unique and maps to a value. Dictionaries are created using curly braces <code>{}</code>.</p>

<h3>Creating and Accessing Dictionaries</h3>
<pre><code class="language-python">
# Create a dictionary
student = {
    "name": "John",
    "age": 20,
    "grade": "A"
}

# Access values by key
print(student["name"])   # Output: John
print(student.get("age"))  # Output: 20
\`\`\`

<h3>Adding, Updating, and Deleting Key-Value Pairs</h3>
<pre><code class="language-python">
# Add new key-value pair
student["city"] = "New York"

# Update existing value
student["age"] = 21

# Delete key-value pair
del student["grade"]
\`\`\`

<h3>Dictionary Methods</h3>
<pre><code class="language-python">
# Get all keys
keys = student.keys()

# Get all values
values = student.values()

# Get all items (key-value pairs)
items = student.items()
\`\`\`

<h3>Iterating Through a Dictionary</h3>
<pre><code class="language-python">
for key in student:
    print(f"${"{ key }"}: ${"{ student[key] }"}")

# Or using items()
for key, value in student.items():
    print(f"${"{ key }"}: ${"{ value }"}")
\`\`\`

<h3>Dictionary Example Diagram:</h3>
<pre><code class="language-mermaid">
graph LR
    A[Dictionary] --> B[Key-Value Pairs]
    B --> C["name: "John""]
    B --> D["age: 20"]
    B --> E["grade: "A""]
\`\`\`

<p><em>Image source: https://pynative.com/python-dictionaries/</em></p>

<h3>Video Script:</h3>
<p>Dictionaries organize data with key-value pairs! Understanding the key-value structure. How to create and access dictionary data. Adding, updating, and deleting key-value pairs. Using keys(), values(), items() and looping through dictionaries.</p>`,
                'Wrap-Up Quiz': JSON.stringify({
                    questions: [
                        {
                            question: 'What is a dictionary in Python?',
                            options: [
                                'A collection of unique values stored in a sequence',
                                'A collection of key-value pairs',
                                'A list of words and their meanings',
                                'A data type used only for numbers'
                            ],
                            correctAnswerIndex: 1
                        },
                        {
                            question: 'How do you define a dictionary in Python?',
                            options: [
                                'my_dict = [ "name": "Alice", "age": 25 ]',
                                'my_dict = { "name": "Alice", "age": 25 }',
                                'my_dict = ( "name": "Alice", "age": 25 )',
                                'my_dict = "name": "Alice", "age": 25'
                            ],
                            correctAnswerIndex: 1
                        },
                        {
                            question: 'How do you access the value of the key "age" in the dictionary student = {"name": "John", "age": 20}?',
                            options: [
                                'student["age"]',
                                'student.get("age")',
                                'Both a and b',
                                'student.age'
                            ],
                            correctAnswerIndex: 2
                        },
                        {
                            question: 'What will happen if you try to access a key that does not exist in a dictionary using dict[key]?',
                            options: [
                                'It returns None',
                                'It returns an empty string',
                                'It raises a KeyError',
                                'It automatically adds the key'
                            ],
                            correctAnswerIndex: 2
                        },
                        {
                            question: 'Which method is used to get a list of all keys in a dictionary?',
                            options: ['keys()', 'values()', 'items()', 'get_keys()'],
                            correctAnswerIndex: 0
                        },
                        {
                            question: 'How do you add a new key-value pair to an existing dictionary?',
                            options: [
                                'dict.append("key", "value")',
                                'dict["key"] = "value"',
                                'dict.add("key", "value")',
                                'dict.insert("key", "value")'
                            ],
                            correctAnswerIndex: 1
                        },
                        {
                            question: 'What does the values() method return?',
                            options: [
                                'A list of all dictionary keys',
                                'A list of all dictionary values',
                                'A list of key-value pairs',
                                'The total number of keys'
                            ],
                            correctAnswerIndex: 1
                        },
                        {
                            question: 'What happens when you use the items() method on a dictionary?',
                            options: [
                                'It returns a list of all values',
                                'It removes all items from the dictionary',
                                'It returns a list of key-value pairs as tuples',
                                'It returns the number of items in the dictionary'
                            ],
                            correctAnswerIndex: 2
                        },
                        {
                            question: 'What will del my_dict["age"] do in a dictionary?',
                            options: [
                                'Delete the "age" key and its value',
                                'Delete all keys and values',
                                'Return the "age" value and keep the key',
                                'Raise an error'
                            ],
                            correctAnswerIndex: 0
                        },
                        {
                            question: 'Which loop is commonly used to iterate through a dictionary?',
                            options: [
                                'for key in dict:',
                                'while dict:',
                                'for dict in key:',
                                'while key in dict:'
                            ],
                            correctAnswerIndex: 0
                        }
                    ]
                }),
                'Assignment': `Write a Python program to create a dictionary storing the names and marks of three students. Display each student's name and marks. Bonus: Write a program to count the occurrences of each word in a given sentence using a dictionary.`,
                'Assignment Solution': `# Solution: Student Marks Dictionary

# Create dictionary with student names and marks
students = {
    "Alice": 85,
    "Bob": 92,
    "Charlie": 78
}

# Display each student's name and marks
for name, marks in students.items():
    print(f"${"{ name }"}: ${"{ marks }"}")

# Bonus: Count word occurrences
sentence = "the cat sat on the mat"
words = sentence.split()
word_count = {}

for word in words:
    if word in word_count:
        word_count[word] += 1
    else:
        word_count[word] = 1

print("\\nWord occurrences:")
for word, count in word_count.items():
    print(f"${"{ word }"}: ${"{ count }"}")`
            }
        };

        // Try to find content for this specific slide
        const sessionContent = contentMap[sessionId];
        if (sessionContent) {
            // Try exact match first
            const exactMatch = sessionContent[slideTitle];
            if (exactMatch) {
                return exactMatch;
            }
            // Try matching by extracting topic title (e.g., "Topic 1: What is Python?" -> "Topic 1: What is Python?")
            // This handles cases where the title format might vary slightly
            for (const key in sessionContent) {
                if (key.toLowerCase().includes(slideTitle.toLowerCase()) || slideTitle.toLowerCase().includes(key.toLowerCase())) {
                    const matchedContent = sessionContent[key];
                    if (matchedContent !== undefined) {
                        return matchedContent;
                    }
                }
            }
        }

        // Default content based on slide type
        if (slideType === 'objectives') {
            return `<h2>Learning Objectives</h2><p>By the end of this session, students will achieve the learning goals outlined for ${sessionTitle}.</p>`;
        } else if (slideType === 'topic') {
            return `<h2>${slideTitle}</h2><p>This topic covers important concepts related to ${sessionTitle}.</p>`;
        } else if (slideType === 'quiz') {
            return JSON.stringify({ questions: DEFAULT_QUIZ_QUESTIONS });
        } else if (slideType === 'homework' || slideType === 'assignment') {
            return `Complete the assignment for ${sessionTitle}.`;
        } else if (slideType === 'solution') {
            return DEFAULT_SOLUTION_CODE;
        }

        return '';
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

                // Build user prompt from courseConfig
                let userPrompt = `${courseConfig.courseGoal}\n\n`;
                
                if (courseConfig.learningOutcome) {
                    userPrompt += `Learning Outcomes:\n${courseConfig.learningOutcome}\n\n`;
                }

                // Add learner profile info
                if (courseConfig.learnerProfile?.ageRange) {
                    userPrompt += `Target Age Range: ${courseConfig.learnerProfile.ageRange}\n`;
                }
                if (courseConfig.learnerProfile?.skillLevel) {
                    userPrompt += `Skill Level: ${courseConfig.learnerProfile.skillLevel}\n`;
                }

                // Add course depth options as key-value pairs
                userPrompt += `\nCourse Requirements:\n`;
                if (courseConfig.courseDepth?.includeDiagrams) {
                    userPrompt += `- Include Diagrams: Yes\n`;
                }
                if (courseConfig.courseDepth?.includeCodeSnippets) {
                    userPrompt += `- Include Code Snippets: Yes\n`;
                    if (courseConfig.courseDepth?.programmingLanguage) {
                        userPrompt += `- Programming Language: ${courseConfig.courseDepth.programmingLanguage}\n`;
                    }
                }
                if (courseConfig.courseDepth?.includePracticeProblems) {
                    userPrompt += `- Include Practice Problems: Yes\n`;
                }
                if (courseConfig.courseDepth?.includeYouTubeVideo) {
                    userPrompt += `- Include YouTube Videos: Yes\n`;
                }
                if (courseConfig.courseDepth?.includeAIGeneratedVideo) {
                    userPrompt += `- Include AI Generated Videos: Yes\n`;
                }

                // Add duration and format info
                if (courseConfig.durationFormatStructure?.includeQuizzes) {
                    userPrompt += `- Include Quizzes: Yes\n`;
                }
                if (courseConfig.durationFormatStructure?.includeHomework) {
                    userPrompt += `- Include Homework: Yes\n`;
                }
                if (courseConfig.durationFormatStructure?.includeSolutions) {
                    userPrompt += `- Include Solutions: Yes\n`;
                }

                // Build API payload
                const numChapters = courseConfig.durationFormatStructure?.numberOfSessions;
                const topicsPerSession = courseConfig.durationFormatStructure?.topicsPerSession;
                // Calculate total slides: slides per chapter * number of chapters
                const totalSlides = numChapters && topicsPerSession 
                    ? parseInt(numChapters) * parseInt(topicsPerSession)
                    : null;
                
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

                                    setIsGenerating(false);
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
                } else if (todo.type === 'QUIZ') {
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

    const handleDelete = (slideId: string) => {
        setSlides((prev) => {
            const updatedSlides = prev.filter((slide) => slide.id !== slideId);
            
            // Check if the deleted slide's session now only has a placeholder
            const deletedSlide = prev.find(s => s.id === slideId);
            if (deletedSlide) {
                const remainingSlidesInSession = updatedSlides.filter(s => s.sessionId === deletedSlide.sessionId);
                const onlyPlaceholder = remainingSlidesInSession.length === 1 && 
                                       remainingSlidesInSession[0]?.slideTitle === '_placeholder_';
                
                // If only placeholder remains, keep it so session stays visible
                // User can still add pages or delete the session
                if (onlyPlaceholder) {
                    return updatedSlides;
                }
            }
            
            return updatedSlides;
        });
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

    // Handle slide edit - preserve all slide properties including status and content
    const handleSlideEdit = (slideId: string, newTitle: string) => {
        setSlides((prev) =>
            prev.map((slide) =>
                slide.id === slideId
                    ? { ...slide, slideTitle: newTitle } // Only update title, preserve status and content
                    : slide
            )
        );
    };

    // Handle slide content edit
    const handleSlideContentEdit = (slideId: string, newContent: string) => {
        setSlides((prev) =>
            prev.map((slide) =>
                slide.id === slideId
                    ? { ...slide, content: newContent } // Update content, preserve other properties
                    : slide
            )
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
            // Update slides with new order - preserve all properties including status and content
            const otherSlides = slides.filter((s) => s.sessionId !== sessionId);
            setSlides([...otherSlides.map(s => ({ ...s })), ...reorderedSlides.map(s => ({ ...s }))]);
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

    const handleConfirmGenerateCourseAssets = () => {
        // Store all slides data for the viewer
        localStorage.setItem('generatedSlides', JSON.stringify(slides));
        setGenerateCourseAssetsDialogOpen(false);
        navigate({ to: '/study-library/ai-copilot/course-outline/generating/processing' });
    };

    // Loading state - show only loader on background
    if (isGenerating && slides.length === 0) {
        return (
            <LayoutContainer>
                <Helmet>
                    <title>Generating Course Outline...</title>
                </Helmet>
                <div className="min-h-screen bg-gradient-to-b from-indigo-50 via-white to-purple-50">
                    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
                        <div className="flex items-center justify-center gap-2 py-20">
                            <RefreshCw className="h-5 w-5 animate-spin text-indigo-600" />
                            <span className="text-sm font-medium text-indigo-600">
                                AI is generating your course outline...
                            </span>
                        </div>
                    </div>
                </div>
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
                                    disabled={!allSessionsCompleted}
                                >
                                    <Sparkles className="h-4 w-4 mr-1" />
                                    Generate Page Content
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

                    {/* Regenerate Page Dialog */}
                    <Dialog open={regenerateSlideDialogOpen} onOpenChange={(open) => {
                        setRegenerateSlideDialogOpen(open);
                        if (!open) {
                            setRegenerateSlidePrompt('');
                            setRegeneratingSlideId(null);
                            setRegeneratingSection(undefined);
                        }
                    }}>
                        <DialogContent className="w-[80vw] max-w-[80vw] max-h-[90vh] flex flex-col p-0">
                            <DialogHeader className="px-6 pt-6 pb-4 flex-shrink-0 border-b">
                                <DialogTitle>Regenerate Page</DialogTitle>
                            </DialogHeader>
                            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                                <div>
                                    <Textarea
                                        ref={regenerateSlidePromptTextareaRef}
                                        value={regenerateSlidePrompt}
                                        onChange={(e) => setRegenerateSlidePrompt(e.target.value)}
                                        placeholder="Enter a prompt describing how you want this page to be regenerated..."
                                        className="min-h-[150px] text-sm"
                                    />
                                </div>
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

                    {/* Regenerate Chapter Dialog */}
                    <Dialog open={regenerateSessionDialogOpen} onOpenChange={(open) => {
                        setRegenerateSessionDialogOpen(open);
                        if (!open) {
                            // Reset form when closing
                            setRegeneratingSessionId(null);
                        } else if (regeneratingSessionId) {
                            // Re-pre-fill when reopening with the same chapter
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
                    }}>
                        <DialogContent className="w-[80vw] max-w-[80vw] max-h-[90vh] flex flex-col p-0">
                            <DialogHeader className="px-6 pt-6 pb-4 flex-shrink-0 border-b">
                                <DialogTitle>
                                    Regenerate Chapter{' '}
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
                                        Chapter Length
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
                                                Include assignments
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
                                        Number of Slides
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
                                    <Label className="mb-2 block">Slides in Chapter (Optional)</Label>
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

                    {/* Add Page Dialog */}
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
                                    {selectedAddSlideType ? 'AI Generation Prompt' : 'Select Page Type'}
                                </DialogTitle>
                                {!selectedAddSlideType && (
                                    <DialogDescription>
                                        Choose the type of page you want to add to this session.
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
                                            placeholder="Enter a prompt describing the page you want to create..."
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
                                            Create Page
                                        </MyButton>
                                    </div>
                                </>
                            )}
                        </DialogContent>
                    </Dialog>

                    {/* Add Chapter Dialog */}
                    <Dialog open={addSessionDialogOpen} onOpenChange={(open) => {
                        setAddSessionDialogOpen(open);
                        if (!open) {
                            setAddSessionName('');
                        }
                    }}>
                        <DialogContent className="sm:max-w-[500px]">
                            <DialogHeader>
                                <DialogTitle>Add New Chapter</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4 py-4">
                                <div>
                                    <Label htmlFor="sessionName" className="mb-2 block">
                                        Chapter Name
                                    </Label>
                                    <Input
                                        id="sessionName"
                                        value={addSessionName}
                                        onChange={(e) => setAddSessionName(e.target.value)}
                                        placeholder="Enter chapter name"
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter' && addSessionName.trim()) {
                                                handleConfirmAddSession();
                                            }
                                        }}
                                        autoFocus
                                    />
                                </div>
                            </div>
                            <div className="flex justify-end gap-3">
                                <MyButton
                                    buttonType="secondary"
                                    onClick={() => setAddSessionDialogOpen(false)}
                                >
                                    Cancel
                                </MyButton>
                                <MyButton
                                    buttonType="primary"
                                    onClick={handleConfirmAddSession}
                                    disabled={!addSessionName.trim()}
                                >
                                    Add Chapter
                                </MyButton>
                            </div>
                        </DialogContent>
                    </Dialog>

                    {/* Generate Course Assets Confirmation Dialog */}
                    <Dialog
                        open={generateCourseAssetsDialogOpen}
                        onOpenChange={setGenerateCourseAssetsDialogOpen}
                    >
                        <DialogContent className="max-w-md">
                            <DialogHeader>
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
                                        <AlertTriangle className="h-5 w-5 text-amber-600" />
                                    </div>
                                    <DialogTitle className="text-xl">Final Confirmation</DialogTitle>
                                </div>
                                <DialogDescription className="pt-2">
                                    <div className="space-y-3 text-neutral-700">
                                        <p>
                                            Please review the text content for each page carefully before proceeding.
                                        </p>
                                        <p className="font-semibold text-neutral-900">
                                            Once you proceed, AI will start creating the actual course content and there is no coming back.
                                        </p>
                                    </div>
                                </DialogDescription>
                            </DialogHeader>
                            <div className="flex justify-end gap-3 mt-6">
                                <MyButton
                                    buttonType="secondary"
                                    onClick={() => setGenerateCourseAssetsDialogOpen(false)}
                                >
                                    Cancel
                                </MyButton>
                                <MyButton
                                    buttonType="primary"
                                    onClick={handleConfirmGenerateCourseAssets}
                                >
                                    Proceed
                                </MyButton>
                            </div>
                        </DialogContent>
                    </Dialog>

                    {/* Back to Library Confirmation Dialog */}
                    <Dialog
                        open={backToLibraryDialogOpen}
                        onOpenChange={setBackToLibraryDialogOpen}
                    >
                        <DialogContent className="max-w-md">
                            <DialogHeader>
                                <DialogTitle>Go Back to Course Library?</DialogTitle>
                                <DialogDescription className="text-neutral-600">
                                    Are you sure you want to go back to course library? You can either discard your current course or save it to drafts.
                                </DialogDescription>
                            </DialogHeader>
                            <div className="flex items-center justify-end gap-3 mt-6 pt-4 border-t border-neutral-200">
                                <MyButton
                                    buttonType="secondary"
                                    onClick={() => setBackToLibraryDialogOpen(false)}
                                    className="min-w-[100px]"
                                >
                                    Cancel
                                </MyButton>
                                <MyButton
                                    buttonType="secondary"
                                    onClick={handleDiscardCourse}
                                    className="min-w-[120px] border-red-300 text-red-600 hover:text-red-700 hover:bg-red-50 hover:border-red-400"
                                >
                                    Discard Course
                                </MyButton>
                                <MyButton
                                    buttonType="primary"
                                    onClick={handleSaveToDrafts}
                                    className="min-w-[130px]"
                                >
                                    Save to Drafts
                                </MyButton>
                            </div>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>
        </LayoutContainer>
    )
}
