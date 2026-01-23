import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import {
    ArrowLeft,
    Settings,
    Loader2,
    CheckCircle,
    FileText,
    Sparkles,
} from 'lucide-react';
import { MyButton } from '@/components/design-system/button';
import { ContentHierarchyPanel } from './ContentHierarchyPanel';
import { ContentEditorPanel } from './ContentEditorPanel';
import { MetadataDialog } from './MetadataDialog';
import { SlideGeneration, SessionProgress } from '../../../shared/types';

interface SplitViewLayoutProps {
    sessionsWithProgress: SessionProgress[];
    slides: SlideGeneration[];
    courseMetadata: any;
    isGeneratingContent: boolean;
    isContentGenerated: boolean;
    contentGenerationProgress: string;
    isCreatingCourse: boolean;
    isTeacher: boolean;
    onBack: () => void;
    onSlideContentChange: (slideId: string, content: string) => void;
    onSlideSave: (slideId: string) => void;
    onMetadataSave: (metadata: any) => void;
    onCreateCourse: (status: 'DRAFT' | 'ACTIVE') => void;
    onGenerateContent: () => void;
}

export const SplitViewLayout: React.FC<SplitViewLayoutProps> = ({
    sessionsWithProgress,
    slides,
    courseMetadata,
    isGeneratingContent,
    isContentGenerated,
    contentGenerationProgress,
    isCreatingCourse,
    isTeacher,
    onBack,
    onSlideContentChange,
    onSlideSave,
    onMetadataSave,
    onCreateCourse,
    onGenerateContent,
}) => {
    const [selectedSlideId, setSelectedSlideId] = useState<string | null>(null);
    const [expandedChapters, setExpandedChapters] = useState<Set<string>>(new Set());
    const [showMetadataDialog, setShowMetadataDialog] = useState(false);

    // Initialize with first chapter expanded and first slide selected
    useEffect(() => {
        if (sessionsWithProgress.length > 0) {
            const firstSession = sessionsWithProgress[0];
            if (firstSession) {
                setExpandedChapters(new Set([firstSession.sessionId]));
                
                const visibleSlides = firstSession.slides.filter(s => s.slideTitle !== '_placeholder_');
                if (visibleSlides.length > 0 && visibleSlides[0] && !selectedSlideId) {
                    setSelectedSlideId(visibleSlides[0].id);
                }
            }
        }
    }, [sessionsWithProgress.length]);

    // Auto-select newly completed slides during generation
    useEffect(() => {
        if (isGeneratingContent && slides.length > 0) {
            // Find the first slide that just completed
            const justCompleted = slides.find(s => 
                s.status === 'completed' && 
                s.slideTitle !== '_placeholder_'
            );
            if (justCompleted && !selectedSlideId) {
                setSelectedSlideId(justCompleted.id);
                // Expand the chapter containing this slide
                setExpandedChapters(prev => new Set([...prev, justCompleted.sessionId]));
            }
        }
    }, [slides, isGeneratingContent]);

    const selectedSlide = useMemo(() => {
        return slides.find(s => s.id === selectedSlideId) || null;
    }, [slides, selectedSlideId]);

    const handleChapterToggle = (chapterId: string) => {
        setExpandedChapters(prev => {
            const next = new Set(prev);
            if (next.has(chapterId)) {
                next.delete(chapterId);
            } else {
                next.add(chapterId);
            }
            return next;
        });
    };

    const handleSlideSelect = (slide: SlideGeneration) => {
        setSelectedSlideId(slide.id);
        // Expand the chapter if not already expanded
        if (!expandedChapters.has(slide.sessionId)) {
            setExpandedChapters(prev => new Set([...prev, slide.sessionId]));
        }
    };

    const totalSlides = slides.filter(s => s.slideTitle !== '_placeholder_').length;
    const completedSlides = slides.filter(s => s.status === 'completed' && s.slideTitle !== '_placeholder_').length;
    const progressPercent = totalSlides > 0 ? Math.round((completedSlides / totalSlides) * 100) : 0;

    return (
        <div className="min-h-screen bg-gradient-to-b from-indigo-50 via-white to-purple-50">
            <div className="mx-auto max-w-[1600px] px-4 py-4 sm:px-6 lg:px-8 h-screen flex flex-col">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className="flex-shrink-0 mb-4"
                >
                    <div className="flex items-center justify-between">
                        <button
                            onClick={onBack}
                            className="flex items-center gap-2 text-sm font-medium text-neutral-600 transition-colors hover:text-indigo-600"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            Back
                        </button>

                        <div className="flex items-center gap-3">
                            {/* Metadata Button */}
                            <MyButton
                                buttonType="secondary"
                                scale="small"
                                onClick={() => setShowMetadataDialog(true)}
                            >
                                <Settings className="h-4 w-4 mr-1" />
                                Course Details
                            </MyButton>

                            {/* Action Buttons */}
                            {isGeneratingContent ? (
                                <div className="flex items-center gap-3">
                                    <div className="flex items-center gap-2 text-sm text-indigo-600">
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                        <span>{progressPercent}% Complete</span>
                                    </div>
                                </div>
                            ) : isContentGenerated ? (
                                <>
                                    <MyButton
                                        buttonType="secondary"
                                        onClick={() => onCreateCourse('DRAFT')}
                                        disabled={isCreatingCourse}
                                    >
                                        {isCreatingCourse ? (
                                            <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                                        ) : (
                                            <FileText className="h-4 w-4 mr-1" />
                                        )}
                                        Save as Draft
                                    </MyButton>
                                    <MyButton
                                        buttonType="primary"
                                        onClick={() => onCreateCourse('ACTIVE')}
                                        disabled={isCreatingCourse}
                                    >
                                        <CheckCircle className="h-4 w-4 mr-1" />
                                        {isTeacher ? 'Submit for Approval' : 'Create Course'}
                                    </MyButton>
                                </>
                            ) : (
                                <MyButton
                                    buttonType="primary"
                                    onClick={onGenerateContent}
                                >
                                    <Sparkles className="h-4 w-4 mr-1" />
                                    Generate Page Content
                                </MyButton>
                            )}
                        </div>
                    </div>

                    {/* Progress Bar during generation */}
                    {isGeneratingContent && (
                        <div className="mt-3">
                            <div className="flex items-center justify-between text-xs text-neutral-600 mb-1">
                                <span>Generating content...</span>
                                <span>{completedSlides} of {totalSlides} pages</span>
                            </div>
                            <div className="h-2 bg-neutral-200 rounded-full overflow-hidden">
                                <motion.div
                                    className="h-full bg-indigo-500 rounded-full"
                                    initial={{ width: 0 }}
                                    animate={{ width: `${progressPercent}%` }}
                                    transition={{ duration: 0.3 }}
                                />
                            </div>
                        </div>
                    )}
                </motion.div>

                {/* Split View - Main Content */}
                <div className="flex-1 flex gap-4 min-h-0 overflow-hidden">
                    {/* Left Panel - Hierarchy */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay: 0.1 }}
                        className="w-80 flex-shrink-0 lg:w-96"
                    >
                        <ContentHierarchyPanel
                            sessionsWithProgress={sessionsWithProgress}
                            selectedSlideId={selectedSlideId}
                            expandedChapters={expandedChapters}
                            onChapterToggle={handleChapterToggle}
                            onSlideSelect={handleSlideSelect}
                        />
                    </motion.div>

                    {/* Right Panel - Content Editor */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay: 0.2 }}
                        className="flex-1 min-w-0"
                    >
                        <ContentEditorPanel
                            slide={selectedSlide}
                            onContentChange={onSlideContentChange}
                            onSave={onSlideSave}
                        />
                    </motion.div>
                </div>
            </div>

            {/* Metadata Dialog */}
            <MetadataDialog
                open={showMetadataDialog}
                onOpenChange={setShowMetadataDialog}
                metadata={courseMetadata}
                onSave={onMetadataSave}
            />
        </div>
    );
};
