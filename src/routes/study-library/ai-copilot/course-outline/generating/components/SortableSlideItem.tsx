import React, { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
    CheckCircle,
    Edit2,
    FileText,
    GripVertical,
    Trash2,
    X,
    Code,
    Video,
    Loader2,
    RefreshCw,
    Layers,
    FileQuestion,
    ClipboardList,
    ChevronDown,
    ChevronUp,
    Eye,
} from 'lucide-react';
import { Editor } from '@monaco-editor/react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { TipTapEditor } from '@/components/tiptap/TipTapEditor';
import { CircularProgress } from './CircularProgress';
import type { SlideGeneration, SlideType, QuizQuestion } from '../../../shared/types';

interface SortableSlideItemProps {
    slide: SlideGeneration;
    onEdit: (slideId: string, newTitle: string) => void;
    onDelete: (slideId: string) => void;
    getSlideIcon: (type: SlideType) => React.ReactNode;
    onRegenerate?: (slideId: string, section?: 'video' | 'code') => void;
    onContentEdit?: (slideId: string, newContent: string) => void;
}

export const SortableSlideItem = React.memo(({ slide, onEdit, onDelete, getSlideIcon, onRegenerate, onContentEdit }: SortableSlideItemProps) => {
    // All hooks must be called before any conditional returns
    const [isEditing, setIsEditing] = useState(false);
    const [isExpanded, setIsExpanded] = useState(false);
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
        if ((slide.slideType === 'quiz' || slide.slideType === 'assessment') && slide.content) {
            try {
                // Try to parse as JSON first
                const quizData = JSON.parse(slide.content);
                
                // Check if it's the new assessment format from API
                if (quizData && quizData.questions && Array.isArray(quizData.questions) && quizData.questions.length > 0) {
                    const firstQuestion = quizData.questions[0];
                    
                    // Check if it's the new assessment format (has question.content, options with preview_id)
                    if (firstQuestion.question && typeof firstQuestion.question === 'object' && firstQuestion.question.content) {
                        // New assessment format from API
                        const normalizedQuestions = quizData.questions.map((q: any) => {
                            const questionText = q.question?.content || '';
                            const options = (q.options || []).map((opt: any) => opt.content || '');
                            let correctIndex = 0;

                            // Find correct answer index from correct_options array
                            if (q.correct_options && q.correct_options.length > 0) {
                                const correctOptionId = q.correct_options[0];
                                const foundIndex = q.options?.findIndex((opt: any) => opt.preview_id === correctOptionId);
                                if (foundIndex !== -1) {
                                    correctIndex = foundIndex;
                                }
                            }

                            return {
                                question: questionText,
                                options: options,
                                correctAnswerIndex: correctIndex,
                                explanation: q.exp || ''
                            };
                        });
                        setQuizQuestions(normalizedQuestions);
                    } else if (firstQuestion.question && typeof firstQuestion.question === 'string') {
                        // Old quiz format
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
        } else if (slide.slideType !== 'quiz' && slide.slideType !== 'assessment') {
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
    }, [editedSections, slide.content, handleContentChange, parseContent]);

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
        if (slide.slideType === 'quiz' || slide.slideType === 'assessment') {
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
        if (slide.slideType === 'quiz' || slide.slideType === 'assessment') {
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
        // Only render content when expanded by user
        if (!isExpanded) return null;

        // Show loader if slide is generating
        if (slide.status === 'generating') {
            return (
                <div className="mt-3 ml-8 bg-neutral-50 rounded-md border border-neutral-200 p-4">
                    <div className="flex items-center justify-center gap-3 py-8">
                        <Loader2 className="h-5 w-5 animate-spin text-indigo-600" />
                        <span className="text-sm font-medium text-neutral-600">
                            Generating {slide.slideType === 'doc' ? 'document' : (slide.slideType === 'quiz' || slide.slideType === 'assessment') ? 'quiz' : slide.slideType === 'video' ? 'video' : 'content'}...
                        </span>
                    </div>
                </div>
            );
        }

        // Only render if slide is completed and has content
        if (slide.status !== 'completed' || !slide.content) {
            return (
                <div className="mt-3 ml-8 bg-neutral-50 rounded-md border border-neutral-200 p-4">
                    <div className="flex items-center justify-center gap-3 py-8">
                        <span className="text-sm text-neutral-500">No content available yet</span>
                    </div>
                </div>
            );
        }

        try {
            // Video pages - show video thumbnail with YouTube link (embedding is blocked)
            if (slide.slideType === 'video') {
                // Parse video content to extract video URL and script
                const parseVideoContent = (content: string): { videoUrl?: string; script?: string } => {
                    const tempDiv = document.createElement('div');
                    tempDiv.innerHTML = content || '';
                    
                    // Extract YouTube URL from content - try multiple patterns
                    let videoUrl: string | undefined;
                    
                    // Pattern 1: embed URL
                    const embedMatch = content.match(/youtube\.com\/embed\/([a-zA-Z0-9_-]+)/);
                    if (embedMatch) {
                        videoUrl = `https://www.youtube.com/embed/${embedMatch[1]}`;
                    }
                    
                    // Pattern 2: watch URL
                    if (!videoUrl) {
                        const watchMatch = content.match(/youtube\.com\/watch\?v=([a-zA-Z0-9_-]+)/);
                        if (watchMatch) {
                            videoUrl = `https://www.youtube.com/embed/${watchMatch[1]}`;
                        }
                    }
                    
                    // Pattern 3: short URL
                    if (!videoUrl) {
                        const shortMatch = content.match(/youtu\.be\/([a-zA-Z0-9_-]+)/);
                        if (shortMatch) {
                            videoUrl = `https://www.youtube.com/embed/${shortMatch[1]}`;
                        }
                    }
                    
                    // Pattern 4: any 11-character ID
                    if (!videoUrl) {
                        const idMatch = content.match(/([a-zA-Z0-9_-]{11})/);
                        if (idMatch && idMatch[1] && /[a-zA-Z]/.test(idMatch[1])) {
                            videoUrl = `https://www.youtube.com/embed/${idMatch[1]}`;
                        }
                    }
                    
                    // Extract script (remove code blocks if any)
                    const codeBlocks = tempDiv.querySelectorAll('pre code, pre');
                    codeBlocks.forEach(block => block.remove());
                    const script = tempDiv.innerHTML.trim();
                    
                    return { videoUrl, script: script || undefined };
                };

                const { videoUrl, script } = parseVideoContent(slide.content || '');
                const displayScript = script || videoScriptContent || slide.content || '';
                
                // Extract video ID from URL
                const getVideoIdFromUrl = (url: string | undefined) => {
                    if (!url) return null;
                    const embedMatch = url.match(/youtube\.com\/embed\/([a-zA-Z0-9_-]+)/);
                    if (embedMatch) return embedMatch[1];
                    const watchMatch = url.match(/youtube\.com\/watch\?v=([a-zA-Z0-9_-]+)/);
                    if (watchMatch) return watchMatch[1];
                    const shortMatch = url.match(/youtu\.be\/([a-zA-Z0-9_-]+)/);
                    if (shortMatch) return shortMatch[1];
                    const idMatch = url.match(/([a-zA-Z0-9_-]{11})/);
                    if (idMatch) return idMatch[1];
                    return null;
                };

                const videoId = videoUrl ? getVideoIdFromUrl(videoUrl) : null;
                const watchUrl = videoId ? `https://www.youtube.com/watch?v=${videoId}` : (videoUrl || '#');
                const thumbnailUrl = videoId ? `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg` : null;

                return (
                    <div className="mt-3 ml-8 bg-neutral-50 rounded-md border border-neutral-200 p-4">
                        <div className="space-y-4">
                            {/* YouTube Thumbnail with Play Button */}
                            {videoUrl && videoId ? (
                                <div className="relative w-full aspect-video rounded-lg overflow-hidden group bg-black">
                                    <img
                                        src={thumbnailUrl || `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`}
                                        alt="Video thumbnail"
                                        className="w-full h-full object-cover"
                                        onError={(e) => {
                                            const img = e.target as HTMLImageElement;
                                            if (img.src.includes('maxresdefault')) {
                                                img.src = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
                                            } else if (img.src.includes('hqdefault')) {
                                                img.src = 'https://via.placeholder.com/1280x720/1a1a1a/ffffff?text=YouTube+Video';
                                            }
                                        }}
                                    />
                                    {/* Play button overlay */}
                                    <a
                                        href={watchUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="absolute inset-0 flex items-center justify-center bg-black/40 group-hover:bg-black/60 transition-colors cursor-pointer"
                                    >
                                        <div className="bg-red-600 rounded-full p-4 group-hover:scale-110 transition-transform">
                                            <svg
                                                className="w-8 h-8 text-white fill-current"
                                                viewBox="0 0 24 24"
                                            >
                                                <path d="M8 5v14l11-7z" />
                                            </svg>
                                        </div>
                                    </a>
                                    {/* "Watch on YouTube" text */}
                                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                                        <a
                                            href={watchUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-white text-sm font-semibold hover:text-yellow-300 transition-colors flex items-center gap-2"
                                        >
                                            ▶ Watch on YouTube
                                        </a>
                                    </div>
                                </div>
                            ) : videoUrl ? (
                                <div className="aspect-video w-full rounded-lg bg-gradient-to-br from-red-600 to-red-800 flex items-center justify-center">
                                    <div className="text-center text-white p-8">
                                        <Video className="h-16 w-16 mx-auto mb-4" />
                                        <p className="text-lg font-semibold mb-4">YouTube Video Available</p>
                                        <a
                                            href={videoUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center gap-2 bg-white text-red-600 px-6 py-3 rounded-lg font-semibold hover:bg-red-50 transition-colors"
                                        >
                                            ▶ Watch on YouTube
                                        </a>
                                    </div>
                                </div>
                            ) : (
                                <div className="aspect-video w-full rounded-lg bg-black flex items-center justify-center">
                                    <div className="text-center text-white">
                                        <Video className="h-16 w-16 mx-auto mb-4 opacity-50" />
                                        <p className="text-lg">No Video URL Found</p>
                                        <p className="text-sm opacity-75">Please check the content for YouTube links</p>
                                    </div>
                                </div>
                            )}
                            
                            {/* Video Script */}
                            {displayScript && (
                                <div className="mt-4 p-4 bg-white rounded-lg">
                                    <div className="flex items-center justify-between mb-2">
                                        <h4 className="font-semibold">Video Script</h4>
                            {onRegenerate && (
                                <button
                                    onClick={() => onRegenerate(slide.id)}
                                                className="rounded p-1.5 text-xs text-indigo-600 hover:bg-indigo-50 transition-colors flex items-center gap-1"
                                    title="Regenerate Video Script"
                                >
                                    <RefreshCw className="h-3.5 w-3.5" />
                                    Regenerate
                                </button>
                            )}
                        </div>
                        <TipTapEditor
                                        value={displayScript}
                            onChange={handleVideoScriptChange}
                            className="min-h-[300px]"
                        />
                                </div>
                            )}
                        </div>
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
            if (slide.slideType === 'quiz' || slide.slideType === 'assessment') {
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
    }, [isExpanded, slide.status, slide.content, slide.slideType, videoScriptContent, codeContent, mermaidContent, editedSections, handleVideoScriptChange, handleCodeChange, handleMermaidChange, handleDocumentSectionChange, handleContentChange, onRegenerate, parseContent, quizHTML, handleQuizContentChange]);

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
                    {/* View Content Button - only show if slide has content */}
                    {!isEditing && slide.status === 'completed' && slide.content && (
                        <button
                            onClick={() => setIsExpanded(!isExpanded)}
                            className="flex items-center gap-1 rounded px-2 py-1 text-xs font-medium text-indigo-600 hover:bg-indigo-50 transition-colors"
                            title={isExpanded ? "Hide content" : "View content"}
                        >
                            <Eye className="h-3.5 w-3.5" />
                            {isExpanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                        </button>
                    )}

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
            
            {/* Content - only show when expanded */}
            {isExpanded && renderContent}
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
