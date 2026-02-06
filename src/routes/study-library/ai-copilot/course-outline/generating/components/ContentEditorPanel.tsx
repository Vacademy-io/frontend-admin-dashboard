import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import {
    FileText,
    Video,
    Code,
    FileQuestion,
    Loader2,
    CheckCircle,
    Clock,
    Sparkles,
    Play,
    ChevronLeft,
    ChevronRight,
    Edit2,
    Save,
} from 'lucide-react';
import { SlideGeneration, SlideType, QuizQuestion } from '../../../shared/types';
import { YooptaEditorWrapperSafe as YooptaEditorWrapper } from '../../../shared/components';
import Editor from '@monaco-editor/react';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { MyButton } from '@/components/design-system/button';
import { isYouTubeUrl, getYouTubeEmbedUrl } from '../../../shared/utils/youtube';

interface ContentEditorPanelProps {
    slide: SlideGeneration | null;
    onContentChange: (slideId: string, content: string) => void;
    onSave: (slideId: string) => void;
}

const DEFAULT_QUIZ_QUESTIONS: QuizQuestion[] = [
    {
        question: 'What is the main concept covered in this section?',
        options: ['Option A', 'Option B', 'Option C', 'Option D'],
        correctAnswerIndex: 0,
        explanation: 'This is the explanation for the correct answer.',
    },
];

export const ContentEditorPanel: React.FC<ContentEditorPanelProps> = ({
    slide,
    onContentChange,
    onSave,
}) => {
    const [documentContent, setDocumentContent] = useState<string>('');
    const [codeContent, setCodeContent] = useState<string>('');
    const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>(DEFAULT_QUIZ_QUESTIONS);
    const [currentQuizIndex, setCurrentQuizIndex] = useState(0);
    const [selectedAnswers, setSelectedAnswers] = useState<Record<number, string>>({});
    const [isEditing, setIsEditing] = useState(false);

    // Initialize content when slide changes
    useEffect(() => {
        if (!slide) return;

        if (slide.slideType === 'doc' || slide.slideType === 'objectives' || slide.slideType === 'topic') {
            setDocumentContent(slide.content || '');
        } else if (
            slide.slideType === 'code-editor' ||
            slide.slideType === 'solution' ||
            slide.slideType === 'video-code' ||
            slide.slideType === 'ai-video-code'
        ) {
            setCodeContent(slide.content || '// Your code here\n');
        } else if (slide.slideType === 'quiz' || slide.slideType === 'assessment' || slide.slideType === 'ASSESSMENT') {
            if (slide.content) {
                try {
                    const parsed = JSON.parse(slide.content);
                    if (Array.isArray(parsed.questions)) {
                        setQuizQuestions(parsed.questions);
                        setSelectedAnswers(parsed.answers || {});
                    } else if (Array.isArray(parsed)) {
                        setQuizQuestions(parsed);
                        setSelectedAnswers({});
                    } else {
                        setQuizQuestions(DEFAULT_QUIZ_QUESTIONS);
                    }
                } catch {
                    setQuizQuestions(DEFAULT_QUIZ_QUESTIONS);
                }
            } else {
                setQuizQuestions(DEFAULT_QUIZ_QUESTIONS);
            }
            setCurrentQuizIndex(0);
        }
        setIsEditing(false);
    }, [slide?.id, slide?.content]);

    const handleSave = () => {
        if (!slide) return;

        let content = '';
        if (slide.slideType === 'doc' || slide.slideType === 'objectives' || slide.slideType === 'topic') {
            content = documentContent;
        } else if (
            slide.slideType === 'code-editor' ||
            slide.slideType === 'solution' ||
            slide.slideType === 'video-code' ||
            slide.slideType === 'ai-video-code'
        ) {
            content = codeContent;
        } else if (slide.slideType === 'quiz' || slide.slideType === 'assessment' || slide.slideType === 'ASSESSMENT') {
            content = JSON.stringify({ questions: quizQuestions, answers: selectedAnswers });
        }

        onContentChange(slide.id, content);
        onSave(slide.id);
        setIsEditing(false);
    };

    // Empty state - no slide selected
    if (!slide) {
        return (
            <div className="flex flex-col h-full bg-white rounded-xl shadow-md overflow-hidden">
                <div className="flex-1 flex items-center justify-center text-neutral-400">
                    <div className="text-center">
                        <FileText className="h-12 w-12 mx-auto mb-3 opacity-50" />
                        <p className="text-sm">Select a page from the left panel to view its content</p>
                    </div>
                </div>
            </div>
        );
    }

    // Pending state - show prompt
    if (slide.status === 'pending') {
        return (
            <div className="flex flex-col h-full bg-white rounded-xl shadow-md overflow-hidden">
                {/* Header */}
                <div className="flex-shrink-0 px-4 py-3 border-b border-neutral-200 bg-neutral-50">
                    <div className="flex items-center justify-between">
                        <h3 className="text-sm font-semibold text-neutral-900 truncate">{slide.slideTitle}</h3>
                        <span className="flex items-center gap-1 text-xs text-neutral-500">
                            <Clock className="h-3.5 w-3.5" />
                            Pending
                        </span>
                    </div>
                </div>

                {/* Prompt Display */}
                <div className="flex-1 flex items-center justify-center p-6">
                    <div className="max-w-md text-center">
                        <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center mx-auto mb-4">
                            <Sparkles className="h-6 w-6 text-amber-600" />
                        </div>
                        <h4 className="text-lg font-medium text-neutral-900 mb-2">AI Generation Prompt</h4>
                        <p className="text-sm text-neutral-600 bg-neutral-50 rounded-lg p-4 border border-neutral-200">
                            {slide.prompt || 'No prompt available for this slide.'}
                        </p>
                        <p className="text-xs text-neutral-400 mt-4">
                            Content will be generated when you click "Generate Page Content"
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    // Generating state
    if (slide.status === 'generating') {
        return (
            <div className="flex flex-col h-full bg-white rounded-xl shadow-md overflow-hidden">
                {/* Header */}
                <div className="flex-shrink-0 px-4 py-3 border-b border-neutral-200 bg-neutral-50">
                    <div className="flex items-center justify-between">
                        <h3 className="text-sm font-semibold text-neutral-900 truncate">{slide.slideTitle}</h3>
                        <span className="flex items-center gap-1 text-xs text-indigo-600">
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            Generating...
                        </span>
                    </div>
                </div>

                {/* Loading Animation */}
                <div className="flex-1 flex items-center justify-center p-6">
                    <div className="text-center">
                        <div className="w-16 h-16 rounded-full bg-indigo-100 flex items-center justify-center mx-auto mb-4 animate-pulse">
                            <Loader2 className="h-8 w-8 text-indigo-600 animate-spin" />
                        </div>
                        <h4 className="text-lg font-medium text-neutral-900 mb-2">Generating Content</h4>
                        <p className="text-sm text-neutral-500">
                            AI is creating content for this page...
                        </p>
                        {slide.prompt && (
                            <p className="text-xs text-neutral-400 mt-4 max-w-sm mx-auto">
                                Prompt: {slide.prompt.substring(0, 100)}...
                            </p>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    // Completed state - show editable content
    return (
        <div className="flex flex-col h-full bg-white rounded-xl shadow-md overflow-hidden">
            {/* Header */}
            <div className="flex-shrink-0 px-4 py-3 border-b border-neutral-200 bg-neutral-50">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 min-w-0">
                        <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                        <h3 className="text-sm font-semibold text-neutral-900 truncate">{slide.slideTitle}</h3>
                    </div>
                    <div className="flex items-center gap-2">
                        {isEditing ? (
                            <MyButton buttonType="primary" scale="small" onClick={handleSave}>
                                <Save className="h-3.5 w-3.5 mr-1" />
                                Save
                            </MyButton>
                        ) : (
                            <MyButton buttonType="secondary" scale="small" onClick={() => setIsEditing(true)}>
                                <Edit2 className="h-3.5 w-3.5 mr-1" />
                                Edit
                            </MyButton>
                        )}
                    </div>
                </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-hidden">
                {/* Document Content */}
                {(slide.slideType === 'doc' || slide.slideType === 'objectives' || slide.slideType === 'topic') && (
                    <div className="h-full overflow-y-auto">
                        {isEditing ? (
                            <div className="h-full">
                                <YooptaEditorWrapper
                                    value={documentContent}
                                    onChange={(content) => setDocumentContent(content)}
                                    className="h-full"
                                />
                            </div>
                        ) : (
                            <div
                                className="p-6 prose prose-sm max-w-none"
                                dangerouslySetInnerHTML={{ __html: documentContent || '<p>No content available</p>' }}
                            />
                        )}
                    </div>
                )}

                {/* Video Content */}
                {(slide.slideType === 'video' || slide.slideType === 'ai-video') && (
                    <div className="h-full flex items-center justify-center p-6 bg-neutral-900">
                        {slide.content && isYouTubeUrl(slide.content) ? (
                            <iframe
                                src={getYouTubeEmbedUrl(slide.content) || undefined}
                                className="w-full max-w-3xl aspect-video rounded-lg"
                                allowFullScreen
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            />
                        ) : slide.aiVideoData?.timelineUrl ? (
                            <div className="text-center text-white">
                                <Video className="h-12 w-12 mx-auto mb-4 opacity-50" />
                                <p className="text-sm">AI Content Generated</p>
                                <p className="text-xs text-neutral-400 mt-2">Video ID: {slide.aiVideoData.videoId}</p>
                            </div>
                        ) : (
                            <div className="text-center text-white">
                                <Video className="h-12 w-12 mx-auto mb-4 opacity-50" />
                                <p className="text-sm">Video content will appear here</p>
                            </div>
                        )}
                    </div>
                )}

                {/* Code Content */}
                {(slide.slideType === 'code-editor' ||
                    slide.slideType === 'solution' ||
                    slide.slideType === 'video-code' ||
                    slide.slideType === 'ai-video-code') && (
                    <div className="h-full">
                        <Editor
                            height="100%"
                            defaultLanguage="javascript"
                            value={codeContent}
                            onChange={(value) => setCodeContent(value || '')}
                            theme="vs-dark"
                            options={{
                                readOnly: !isEditing,
                                minimap: { enabled: false },
                                fontSize: 14,
                                lineNumbers: 'on',
                                scrollBeyondLastLine: false,
                                wordWrap: 'on',
                            }}
                        />
                    </div>
                )}

                {/* Quiz Content */}
                {(slide.slideType === 'quiz' || slide.slideType === 'assessment' || slide.slideType === 'ASSESSMENT') && (
                    <div className="h-full overflow-y-auto p-6">
                        {quizQuestions.length > 0 && quizQuestions[currentQuizIndex] && (
                            <div className="max-w-2xl mx-auto">
                                {/* Question Navigation */}
                                <div className="flex items-center justify-between mb-6">
                                    <span className="text-sm font-medium text-neutral-600">
                                        Question {currentQuizIndex + 1} of {quizQuestions.length}
                                    </span>
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => setCurrentQuizIndex(Math.max(0, currentQuizIndex - 1))}
                                            disabled={currentQuizIndex === 0}
                                            className="p-1 rounded hover:bg-neutral-100 disabled:opacity-50"
                                        >
                                            <ChevronLeft className="h-5 w-5" />
                                        </button>
                                        <button
                                            onClick={() => setCurrentQuizIndex(Math.min(quizQuestions.length - 1, currentQuizIndex + 1))}
                                            disabled={currentQuizIndex === quizQuestions.length - 1}
                                            className="p-1 rounded hover:bg-neutral-100 disabled:opacity-50"
                                        >
                                            <ChevronRight className="h-5 w-5" />
                                        </button>
                                    </div>
                                </div>

                                {/* Question */}
                                <div className="bg-neutral-50 rounded-lg p-6 mb-6">
                                    <h4 className="text-lg font-medium text-neutral-900 mb-4">
                                        {quizQuestions[currentQuizIndex]?.question}
                                    </h4>
                                    <RadioGroup
                                        value={selectedAnswers[currentQuizIndex] || ''}
                                        onValueChange={(value) =>
                                            setSelectedAnswers((prev) => ({ ...prev, [currentQuizIndex]: value }))
                                        }
                                        disabled={!isEditing}
                                    >
                                        <div className="space-y-3">
                                            {quizQuestions[currentQuizIndex]?.options?.map((option, optionIndex) => (
                                                <div key={optionIndex} className="flex items-center space-x-3">
                                                    <RadioGroupItem
                                                        value={optionIndex.toString()}
                                                        id={`option-${optionIndex}`}
                                                    />
                                                    <Label
                                                        htmlFor={`option-${optionIndex}`}
                                                        className="text-sm text-neutral-700 cursor-pointer"
                                                    >
                                                        {option}
                                                    </Label>
                                                </div>
                                            ))}
                                        </div>
                                    </RadioGroup>
                                </div>

                                {/* Explanation */}
                                {quizQuestions[currentQuizIndex]?.explanation && (
                                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                                        <p className="text-sm text-green-800">
                                            <span className="font-medium">Explanation: </span>
                                            {quizQuestions[currentQuizIndex]?.explanation}
                                        </p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )}

                {/* Homework/Assignment Content */}
                {(slide.slideType === 'homework' || slide.slideType === 'assignment') && (
                    <div className="h-full overflow-y-auto p-6">
                        <div className="max-w-2xl mx-auto">
                            <div className="bg-neutral-50 rounded-lg p-6">
                                <h4 className="text-lg font-medium text-neutral-900 mb-4">Assignment</h4>
                                <div
                                    className="prose prose-sm max-w-none"
                                    dangerouslySetInnerHTML={{ __html: slide.content || '<p>No assignment content</p>' }}
                                />
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
