import React, { useState } from 'react';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { MyButton } from '@/components/design-system/button';
import { BookOpen, Gamepad2, Code, Split, PlayCircle } from 'lucide-react';
import { useContentStore } from '../-stores/chapter-sidebar-store';
import { toast } from 'sonner';

interface SplitScreenData {
    splitScreen: boolean;
    splitType: 'JUPYTER' | 'SCRATCH' | 'CODE';
    videoSlideId: string;
    originalVideoData: {
        id?: string;
        url?: string;
        title?: string;
        description?: string;
        source_type?: string;
        video_length_in_millis?: number;
        published_url?: string;
        published_video_length_in_millis?: number;
        questions?: unknown[];
    };
    [key: string]: unknown; // Allow additional properties
}

interface SplitScreenOption {
    icon: React.ReactNode;
    text: string;
    type: 'JUPYTER' | 'SCRATCH' | 'CODE';
    description: string;
    color: string;
}

interface VideoSplitScreenAddDialogProps {
    videoSlideId: string;
    isEditable: boolean;
}

export const VideoSplitScreenAddDialog: React.FC<VideoSplitScreenAddDialogProps> = ({
    videoSlideId,
    isEditable,
}) => {
    const { setActiveItem, getSlideById } = useContentStore();
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isCreating, setIsCreating] = useState(false);

    const splitScreenOptions: SplitScreenOption[] = [
        {
            icon: <BookOpen className="size-6 text-violet-600" />,
            text: 'Jupyter Notebook',
            type: 'JUPYTER',
            description: 'Interactive coding notebooks with video',
            color: 'bg-violet-100 border-violet-200',
        },
        {
            icon: <Gamepad2 className="size-6 text-orange-600" />,
            text: 'Scratch Project',
            type: 'SCRATCH',
            description: 'Visual programming blocks with video',
            color: 'bg-orange-100 border-orange-200',
        },
        {
            icon: <Code className="size-6 text-green-600" />,
            text: 'Code Editor',
            type: 'CODE',
            description: 'Interactive code environment with video',
            color: 'bg-green-100 border-green-200',
        },
    ];

    const handleAddSplitScreen = (type: 'JUPYTER' | 'SCRATCH' | 'CODE') => {
        try {
            setIsCreating(true);

            // Get the current video slide
            const currentSlide = getSlideById(videoSlideId);
            if (!currentSlide || currentSlide.source_type !== 'VIDEO') {
                toast.error('Video slide not found');
                return;
            }

            // Create split-screen data structure with complete video slide data
            let data: SplitScreenData = {
                splitScreen: true,
                splitType: type,
                videoSlideId,
                originalVideoData: {
                    id: currentSlide.video_slide?.id,
                    url: currentSlide.video_slide?.url,
                    title: currentSlide.video_slide?.title,
                    description: currentSlide.video_slide?.description,
                    source_type: currentSlide.video_slide?.source_type,
                    video_length_in_millis: currentSlide.video_slide?.video_length_in_millis,
                    published_url: currentSlide.video_slide?.published_url,
                    published_video_length_in_millis:
                        currentSlide.video_slide?.published_video_length_in_millis,
                    questions: currentSlide.video_slide?.questions,
                },
            };

            switch (type) {
                case 'JUPYTER':
                    data = {
                        ...data,
                        projectName: '',
                        contentUrl: '',
                        contentBranch: 'main',
                        notebookLocation: 'root',
                        activeTab: 'settings',
                        editorType: 'jupyterEditor',
                        timestamp: Date.now(),
                    };
                    break;
                case 'SCRATCH':
                    data = {
                        ...data,
                        projectId: '',
                        projectName: '',
                        scratchUrl: '',
                        timestamp: Date.now(),
                    };
                    break;
                case 'CODE':
                    data = {
                        ...data,
                        language: 'javascript',
                        theme: 'dark',
                        code: '// Welcome to the split-screen code editor\nconsole.log("Hello, World!");',
                        readOnly: false,
                        showLineNumbers: true,
                        fontSize: 14,
                        editorType: 'codeEditor',
                        timestamp: Date.now(),
                    };
                    break;
            }

            // Keep as VIDEO type but add split screen data
            const updatedSlide = {
                ...currentSlide,
                source_type: 'VIDEO', // Keep as VIDEO type for backend compatibility
                splitScreenMode: true,
                splitScreenData: data,
                splitScreenType: `SPLIT_${type}`,
                isNewSplitScreen: true, // Flag to indicate this is a newly created split screen
                // Store original video data
                originalVideoSlide: currentSlide.video_slide,
                // Update video_slide to include embedded data
                video_slide: currentSlide.video_slide
                    ? {
                          ...currentSlide.video_slide,
                          embedded_type: type,
                          embedded_data: JSON.stringify(data),
                      }
                    : null,
            };

            // Update the active item locally
            setActiveItem(updatedSlide);

            toast.success(`Video converted to split-screen ${type.toLowerCase()} successfully!`);
            setIsDialogOpen(false);
        } catch (error) {
            console.error(`Error converting to split-screen ${type}:`, error);
            toast.error(`Failed to convert to split-screen ${type.toLowerCase()}`);
        } finally {
            setIsCreating(false);
        }
    };

    if (!isEditable) {
        return null;
    }

    return (
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
                <MyButton
                    buttonType="secondary"
                    scale="large"
                    className="mt-4 w-full"
                    disabled={isCreating}
                >
                    <Split className="mr-2 size-4" />
                    Convert to Split Screen
                </MyButton>
            </DialogTrigger>
            <DialogContent className="max-w-md">
                <div className="flex flex-col space-y-4">
                    {/* Header */}
                    <div className="text-center">
                        <div className="mx-auto mb-3 flex size-12 items-center justify-center rounded-full bg-blue-100">
                            <Split className="size-6 text-blue-600" />
                        </div>
                        <h2 className="text-lg font-semibold text-gray-900">
                            Convert to Split Screen
                        </h2>
                        <p className="mt-1 text-xs text-gray-600">
                            Add interactive environment with video
                        </p>
                    </div>

                    {/* Options */}
                    <div className="space-y-2">
                        {splitScreenOptions.map((option) => (
                            <button
                                key={option.type}
                                onClick={() => handleAddSplitScreen(option.type)}
                                disabled={isCreating}
                                className={`
                                    group w-full rounded-lg border-2 p-3 text-left transition-all duration-200
                                    ${option.color}
                                    hover:scale-[1.01] hover:shadow-sm disabled:cursor-not-allowed disabled:opacity-50
                                `}
                            >
                                <div className="flex items-center space-x-3">
                                    <div className="shrink-0">{option.icon}</div>
                                    <div className="min-w-0 flex-1">
                                        <h3 className="text-sm font-medium text-gray-900 group-hover:text-gray-700">
                                            {option.text}
                                        </h3>
                                        <p className="text-xs text-gray-600">
                                            {option.description}
                                        </p>
                                    </div>
                                    <div className="shrink-0">
                                        <PlayCircle className="size-4 text-gray-400 group-hover:text-gray-600" />
                                    </div>
                                </div>
                            </button>
                        ))}
                    </div>

                    {isCreating && (
                        <div className="flex items-center justify-center space-x-2 text-xs text-gray-600">
                            <div className="size-3 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
                            <span>Creating split screen slide...</span>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
};
