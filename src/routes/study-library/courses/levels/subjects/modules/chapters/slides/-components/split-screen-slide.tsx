import React, { useState, useRef, useCallback } from 'react';
import { Card } from '@/components/ui/card';
import { JupyterNotebookSlide } from './jupyter-notebook-slide';
import { ScratchProjectSlide } from './scratch-project-slide';
import { CodeEditorSlide } from './code-editor-slide';
import VideoSlidePreview from './video-slide-preview';
import { Slide } from '../-hooks/use-slides';

import { AlertCircle, Split, GripVertical } from 'lucide-react';
import { ExitSplitScreenDialog } from './exit-split-screen-dialog';

interface NotebookData {
    contentUrl?: string;
    projectName?: string;
    contentBranch?: string;
    notebookLocation?: string;
    activeTab?: string;
    editorType?: string;
    timestamp?: number;
}

interface ScratchData {
    projectId?: string;
    projectName?: string;
    scratchUrl?: string;
    timestamp?: number;
}

interface CodeEditorData {
    language: 'python' | 'javascript';
    code: string;
    theme: 'light' | 'dark';
    viewMode: 'view' | 'edit';
    // Add support for both languages' data
    allLanguagesData?: {
        python: { code: string; lastEdited?: number };
        javascript: { code: string; lastEdited?: number };
    };
}

interface SplitScreenData {
    splitScreen: boolean;
    videoSlideId: string;
    originalVideoData?: {
        url?: string;
        title?: string;
        description?: string;
        source_type?: string;
    };
    // For Jupyter
    projectName?: string;
    contentUrl?: string;
    contentBranch?: string;
    notebookLocation?: string;
    activeTab?: string;
    editorType?: string;
    // For Scratch
    projectId?: string;
    scratchUrl?: string;
    // For Code
    language?: string;
    theme?: string;
    code?: string;
    readOnly?: boolean;
    showLineNumbers?: boolean;
    fontSize?: number;
    timestamp?: number;
    viewMode?: string;
    // Support for both languages' data in split screen
    allLanguagesData?: {
        python: { code: string; lastEdited?: number };
        javascript: { code: string; lastEdited?: number };
    };
    [key: string]: unknown;
}

interface SplitScreenSlideProps {
    splitScreenData: SplitScreenData;
    slideType: 'SPLIT_JUPYTER' | 'SPLIT_SCRATCH' | 'SPLIT_CODE';
    isEditable: boolean;
    onDataChange?: (newData: SplitScreenData) => void;
    currentSlideId?: string;
}

export const SplitScreenSlide: React.FC<SplitScreenSlideProps> = ({
    splitScreenData,
    slideType,
    isEditable,
    onDataChange,
    currentSlideId,
}) => {
    const [leftWidth, setLeftWidth] = useState(50); // Percentage for left panel
    const [isResizing, setIsResizing] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    const handleMouseDown = useCallback((e: React.MouseEvent) => {
        e.preventDefault();
        setIsResizing(true);
    }, []);

    const handleMouseMove = useCallback(
        (e: MouseEvent) => {
            if (!isResizing || !containerRef.current) return;

            const container = containerRef.current;
            const containerRect = container.getBoundingClientRect();
            const containerWidth = containerRect.width;
            const mouseX = e.clientX - containerRect.left;

            // Calculate percentage, with min/max constraints (20% to 80%)
            const percentage = Math.max(20, Math.min(80, (mouseX / containerWidth) * 100));
            setLeftWidth(percentage);
        },
        [isResizing]
    );

    const handleMouseUp = useCallback(() => {
        setIsResizing(false);
    }, []);

    // Add event listeners for mouse move and up
    React.useEffect(() => {
        if (isResizing) {
            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseup', handleMouseUp);
            document.body.style.cursor = 'col-resize';
            document.body.style.userSelect = 'none';
        }

        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
            document.body.style.cursor = '';
            document.body.style.userSelect = '';
        };
    }, [isResizing, handleMouseMove, handleMouseUp]);
    // Create a mock video slide from the stored original video data
    const videoSlide: Slide | undefined = splitScreenData.originalVideoData
        ? {
              id: splitScreenData.videoSlideId,
              source_id: splitScreenData.videoSlideId,
              title: splitScreenData.originalVideoData.title || 'Video',
              description: splitScreenData.originalVideoData.description || '',
              source_type: 'VIDEO',
              status: 'DRAFT',
              slide_order: 0,
              image_file_id: '',
              video_slide: {
                  id: crypto.randomUUID(),
                  title: splitScreenData.originalVideoData.title || 'Video',
                  description: splitScreenData.originalVideoData.description || '',
                  url: splitScreenData.originalVideoData.url || '',
                  published_url: splitScreenData.originalVideoData.url || '',
                  video_length_in_millis: 0,
                  published_video_length_in_millis: 0,
                  source_type: splitScreenData.originalVideoData.source_type || 'VIDEO',
                  questions: [],
              },
              document_slide: null,
              question_slide: null,
              assignment_slide: null,
              is_loaded: true,
              new_slide: false,
          }
        : undefined;

    const handleJupyterDataChange = (newData: NotebookData) => {
        if (onDataChange) {
            onDataChange({
                ...splitScreenData,
                ...newData,
            });
        }
    };

    const handleScratchDataChange = (newData: ScratchData) => {
        if (onDataChange) {
            onDataChange({
                ...splitScreenData,
                ...newData,
            });
        }
    };

    const handleCodeDataChange = (newData: CodeEditorData) => {
        if (onDataChange) {
            onDataChange({
                ...splitScreenData,
                ...newData,
            });
        }
    };

    const renderInteractiveContent = () => {
        switch (slideType) {
            case 'SPLIT_JUPYTER':
                return (
                    <JupyterNotebookSlide
                        notebookData={splitScreenData}
                        isEditable={isEditable}
                        onDataChange={handleJupyterDataChange}
                    />
                );
            case 'SPLIT_SCRATCH':
                return (
                    <ScratchProjectSlide
                        scratchData={splitScreenData}
                        isEditable={isEditable}
                        onDataChange={handleScratchDataChange}
                    />
                );
            case 'SPLIT_CODE':
                return (
                    <CodeEditorSlide
                        key={`split-code-editor-${currentSlideId || 'default'}`}
                        codeData={{
                            language:
                                (splitScreenData.language as 'python' | 'javascript') || 'python',
                            code: splitScreenData.code || '',
                            theme: (splitScreenData.theme as 'light' | 'dark') || 'light',
                            viewMode: (splitScreenData.viewMode as 'view' | 'edit') || 'edit',
                            allLanguagesData: splitScreenData.allLanguagesData,
                        }}
                        isEditable={isEditable}
                        onDataChange={handleCodeDataChange}
                    />
                );
            default:
                return (
                    <div className="flex h-full items-center justify-center">
                        <div className="text-center">
                            <AlertCircle className="mx-auto mb-2 size-8 text-red-500" />
                            <p className="text-red-600">Unknown split screen type</p>
                        </div>
                    </div>
                );
        }
    };

    if (!videoSlide) {
        return (
            <div className="flex h-full items-center justify-center p-6">
                <Card className="w-full max-w-md text-center">
                    <div className="p-6">
                        <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-red-100">
                            <AlertCircle className="size-8 text-red-600" />
                        </div>
                        <h3 className="mb-2 text-lg font-semibold">Video Not Found</h3>
                        <p className="text-gray-600">
                            The video slide for this split screen could not be found. Please check
                            if the video slide still exists.
                        </p>
                        <p className="mt-2 text-sm text-gray-500">
                            Video ID: {splitScreenData.videoSlideId}
                        </p>
                    </div>
                </Card>
            </div>
        );
    }

    return (
        <div className="flex h-full flex-col">
            {/* Header */}
            <div className="flex items-center justify-between border-b bg-gray-50 p-2">
                <div className="flex items-center gap-3">
                    <div className="flex size-8 items-center justify-center rounded-lg bg-blue-100">
                        <Split className="size-4 text-blue-600" />
                    </div>
                    <div>
                        <h3 className="font-semibold">Split Screen Mode</h3>
                    </div>
                </div>
                <div className="flex items-center space-x-2">
                    {isEditable && currentSlideId && (
                        <ExitSplitScreenDialog
                            splitScreenData={splitScreenData}
                            currentSlideId={currentSlideId}
                            isEditable={isEditable}
                        />
                    )}
                </div>
            </div>

            {/* Split Screen Content */}
            <div className="flex flex-1 overflow-hidden" ref={containerRef}>
                {/* Left Panel - Interactive Content */}
                <div className="flex flex-col" style={{ width: `${leftWidth}%` }}>
                    <div className="flex-1 overflow-hidden">{renderInteractiveContent()}</div>
                </div>

                {/* Resizable Divider */}
                <div
                    className={`
                        flex w-1 cursor-col-resize items-center justify-center bg-gray-200 transition-colors hover:bg-gray-300
                        ${isResizing ? 'bg-blue-400' : ''}
                    `}
                    onMouseDown={handleMouseDown}
                >
                    <GripVertical className="size-4 text-gray-400" />
                </div>

                {/* Right Panel - Video */}
                <div className="flex flex-col" style={{ width: `${100 - leftWidth}%` }}>
                    <div className="border-b bg-gray-50 p-2">
                        <h4 className="font-medium text-gray-700">
                            {videoSlide.title || 'Untitled Video'}
                        </h4>
                    </div>
                    <div className="flex-1 overflow-hidden p-4">
                        <VideoSlidePreview activeItem={videoSlide} />
                    </div>
                </div>
            </div>
        </div>
    );
};
