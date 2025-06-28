import React, { useState } from 'react';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { MyButton } from '@/components/design-system/button';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, Video, AlertTriangle } from 'lucide-react';
import { useContentStore } from '../-stores/chapter-sidebar-store';
import { useSlides, VideoQuestion } from '../-hooks/use-slides';
import { Route } from '@/routes/study-library/courses/levels/subjects/modules/chapters/slides/index';
import { toast } from 'sonner';

interface SplitScreenData {
    splitScreen: boolean;
    videoSlideId: string;
    originalVideoData?: {
        url?: string;
        title?: string;
        description?: string;
        source_type?: string;
    };
    [key: string]: unknown;
}

interface SlideWithSplitScreen {
    originalVideoSlide?: {
        id: string;
        video_length_in_millis: number;
        published_video_length_in_millis: number;
        questions: VideoQuestion[];
        [key: string]: unknown;
    };
    [key: string]: unknown;
}

interface ExitSplitScreenDialogProps {
    splitScreenData: SplitScreenData;
    currentSlideId: string;
    isEditable: boolean;
}

export const ExitSplitScreenDialog: React.FC<ExitSplitScreenDialogProps> = ({
    splitScreenData,
    currentSlideId,
    isEditable,
}) => {
    const { setActiveItem, getSlideById } = useContentStore();
    const { chapterId } = Route.useSearch();
    const { addUpdateVideoSlide } = useSlides(chapterId);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isConverting, setIsConverting] = useState(false);

    const handleExitSplitScreen = async () => {
        try {
            setIsConverting(true);

            if (!splitScreenData.originalVideoData) {
                toast.error('Original video data not found');
                return;
            }

            // Get the current slide
            const currentSlide = getSlideById(currentSlideId);
            if (!currentSlide) {
                toast.error('Current slide not found');
                return;
            }

            // Get the original video slide data
            const slideWithSplit = currentSlide as unknown as SlideWithSplitScreen;
            const originalVideoSlide = slideWithSplit.originalVideoSlide;
            if (!originalVideoSlide) {
                toast.error('Original video slide data not found');
                return;
            }

            // Prepare payload to update video slide with undefined embedded data and type to remove them
            const videoSlidePayload = {
                id: currentSlide.id,
                title: splitScreenData.originalVideoData.title || currentSlide.title || '',
                description:
                    splitScreenData.originalVideoData.description || currentSlide.description || '',
                image_file_id: currentSlide.image_file_id || '',
                slide_order: currentSlide.slide_order,
                video_slide: {
                    id: originalVideoSlide.id,
                    description: splitScreenData.originalVideoData.description || '',
                    embedded_data: '',
                    embedded_type: '',
                    title: splitScreenData.originalVideoData.title || '',
                    url: splitScreenData.originalVideoData.url || '',
                    video_length_in_millis: originalVideoSlide.video_length_in_millis || 0,
                    published_url: splitScreenData.originalVideoData.url || '',
                    published_video_length_in_millis:
                        originalVideoSlide.published_video_length_in_millis || 0,
                    source_type: splitScreenData.originalVideoData.source_type || 'VIDEO',
                    // Remove embedded type and data by not including them
                    questions: originalVideoSlide.questions || [],
                },
                status: currentSlide.status,
                new_slide: false,
                notify: false,
            };

            // Call API to update the video slide with null embedded data
            await addUpdateVideoSlide(videoSlidePayload);

            // Convert back to regular video slide locally
            const restoredSlide = {
                ...currentSlide,
                splitScreenMode: false,
                splitScreenData: undefined,
                splitScreenType: undefined,
                isNewSplitScreen: false,
                // Ensure it's marked as a VIDEO slide
                source_type: 'VIDEO',
                // Restore complete original video slide data
                video_slide: {
                    id: originalVideoSlide.id,
                    description: splitScreenData.originalVideoData.description || '',
                    title: splitScreenData.originalVideoData.title || '',
                    url: splitScreenData.originalVideoData.url || '',
                    video_length_in_millis: originalVideoSlide.video_length_in_millis,
                    published_url: splitScreenData.originalVideoData.url || '',
                    published_video_length_in_millis:
                        originalVideoSlide.published_video_length_in_millis,
                    source_type: splitScreenData.originalVideoData.source_type || 'VIDEO',
                    questions: originalVideoSlide.questions,
                },
                // Remove split screen specific properties
                originalVideoSlide: undefined,
            };

            // Update the active item locally
            setActiveItem(restoredSlide);

            toast.success('Converted back to video slide successfully!');
            setIsDialogOpen(false);
        } catch (error) {
            console.error('Error converting back to video:', error);
            toast.error('Failed to convert back to video slide');
        } finally {
            setIsConverting(false);
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
                    scale="small"
                    disabled={isConverting}
                    className="border-orange-300 text-orange-700 hover:bg-orange-50"
                >
                    <ArrowLeft className="mr-1 size-3" />
                    Remove Split Screen
                </MyButton>
            </DialogTrigger>
            <DialogContent className="max-w-md">
                <div className="flex flex-col space-y-6">
                    {/* Header */}
                    <div className="text-center">
                        <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-orange-100">
                            <Video className="size-8 text-orange-600" />
                        </div>
                        <h2 className="text-xl font-semibold text-gray-900">
                            Exit Split Screen Mode
                        </h2>
                        <p className="mt-2 text-sm text-gray-600">
                            Convert back to a regular video slide
                        </p>
                    </div>

                    <Separator />

                    {/* Warning */}
                    <div className="rounded-lg bg-amber-50 p-4">
                        <div className="flex items-start space-x-3">
                            <AlertTriangle className="mt-0.5 size-5 shrink-0 text-amber-600" />
                            <div className="text-sm text-amber-800">
                                <p className="font-medium">Data Loss Warning</p>
                                <p className="mt-1">
                                    Exiting split screen mode will remove the interactive content
                                    and convert this slide back to a regular video slide. The
                                    original video will be restored.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Video Info */}
                    {splitScreenData.originalVideoData && (
                        <div className="rounded-lg bg-blue-50 p-4">
                            <div className="flex items-start space-x-3">
                                <Video className="mt-0.5 size-5 shrink-0 text-blue-600" />
                                <div className="text-sm text-blue-800">
                                    <p className="font-medium">Original Video</p>
                                    <p className="mt-1">
                                        <strong>Title:</strong>{' '}
                                        {splitScreenData.originalVideoData.title || 'Untitled'}
                                    </p>
                                    {splitScreenData.originalVideoData.description && (
                                        <p className="mt-1">
                                            <strong>Description:</strong>{' '}
                                            {splitScreenData.originalVideoData.description}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    <Separator />

                    {/* Actions */}
                    <div className="flex space-x-3">
                        <MyButton
                            buttonType="secondary"
                            scale="medium"
                            className="flex-1"
                            onClick={() => setIsDialogOpen(false)}
                            disabled={isConverting}
                        >
                            Cancel
                        </MyButton>
                        <MyButton
                            buttonType="primary"
                            scale="medium"
                            className="flex-1 bg-orange-600 hover:bg-orange-700"
                            onClick={handleExitSplitScreen}
                            disabled={isConverting}
                        >
                            {isConverting ? (
                                <div className="flex items-center space-x-2">
                                    <div className="size-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                                    <span>Converting...</span>
                                </div>
                            ) : (
                                'Convert to Video'
                            )}
                        </MyButton>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};
