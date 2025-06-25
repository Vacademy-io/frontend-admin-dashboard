'use client';

import { MyButton } from '@/components/design-system/button';
import { MyInput } from '@/components/design-system/input';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Form, FormControl, FormField, FormItem } from '@/components/ui/form';
import { useSlides } from '@/routes/study-library/courses/levels/subjects/modules/chapters/slides/-hooks/use-slides';
import { toast } from 'sonner';
import { Route } from '@/routes/study-library/courses/levels/subjects/modules/chapters/slides/index';
import { useContentStore } from '@/routes/study-library/courses/levels/subjects/modules/chapters/slides/-stores/chapter-sidebar-store';
import { useEffect, useRef, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { DashboardLoader } from '@/components/core/dashboard-loader';
import { YoutubeLogo, CheckCircle, PlayCircle } from '@phosphor-icons/react';

const formSchema = z.object({
    videoUrl: z
        .string()
        .min(1, 'URL is required')
        .url('Please enter a valid URL')
        .refine((url) => url.includes('youtube.com') || url.includes('youtu.be'), {
            message: 'Please enter a valid YouTube URL',
        }),
    videoName: z.string().min(1, 'Video title is required'),
});

type FormValues = z.infer<typeof formSchema>;

export const AddVideoDialog = ({
    openState,
}: {
    openState?: ((open: boolean) => void) | undefined;
}) => {
    const { chapterId } = Route.useSearch();
    const { addUpdateVideoSlide } = useSlides(chapterId);
    const { setActiveItem, getSlideById } = useContentStore();
    const [isAPIReady, setIsAPIReady] = useState(false);
    const [isValidUrl, setIsValidUrl] = useState(false);
    const [videoPreview, setVideoPreview] = useState<{ title: string; thumbnail: string } | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const queryClient = useQueryClient();
    const [isVideoUploading, setIsVideoUploading] = useState(false);

    const extractVideoId = (url: string): string => {
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
        const match = url.match(regExp);
        return match && match[2]?.length === 11 ? match[2] : '';
    };

    // Function to load YouTube IFrame API
    const loadYouTubeAPI = () => {
        if (window.YT) {
            setIsAPIReady(true);
            return;
        }

        const tag = document.createElement('script');
        tag.src = 'https://www.youtube.com/iframe_api';

        window.onYouTubeIframeAPIReady = () => {
            setIsAPIReady(true);
        };

        const firstScriptTag = document.getElementsByTagName('script')[0];
        firstScriptTag?.parentNode?.insertBefore(tag, firstScriptTag);
    };

    useEffect(() => {
        loadYouTubeAPI();
    }, []);

    // Auto-populate title from URL
    const handleUrlChange = (url: string) => {
        const videoId = extractVideoId(url);
        if (videoId) {
            setIsValidUrl(true);
            // Try to get video title and thumbnail from YouTube
            fetch(`https://www.youtube.com/oembed?url=${url}&format=json`)
                .then(response => response.json())
                .then(data => {
                    form.setValue('videoName', data.title || 'YouTube Video');
                    setVideoPreview({
                        title: data.title,
                        thumbnail: data.thumbnail_url
                    });
                })
                .catch(() => {
                    // Fallback if API fails
                    form.setValue('videoName', 'YouTube Video');
                    setVideoPreview(null);
                });
        } else {
            setIsValidUrl(false);
            setVideoPreview(null);
        }
    };

    const handleSubmit = async (data: FormValues) => {
        console.log("data: ",data);
        try {
            const videoId = extractVideoId(data.videoUrl);
            if (!videoId) {
                toast.error('Invalid YouTube URL');
                return;
            }

            // Create a temporary player to get duration
            if (containerRef.current && isAPIReady) {
                const playerContainer = document.createElement('div');
                containerRef.current.innerHTML = '';
                containerRef.current.appendChild(playerContainer);

                new window.YT.Player(playerContainer, {
                    height: '0',
                    width: '0',
                    videoId: videoId,
                    playerVars: {
                        autoplay: 0,
                        controls: 0,
                    },
                    events: {
                        onReady: (event) => {
                            const duration = event.target.getDuration();

                            // Submit the form with the duration
                            submitFormWithDuration(data, duration * 1000);

                            // Clean up
                            event.target.destroy();
                        },
                    },
                });
            } else {
                // If player creation fails, submit without duration
                submitFormWithDuration(data, 0);
            }
        } catch (error) {
            toast.error('Failed to add video');
        }
    };

    const submitFormWithDuration = async (data: FormValues, duration: number) => {
        setIsVideoUploading(true);
        try {
            const slideId = crypto.randomUUID();
            const response: string = await addUpdateVideoSlide({
                id: slideId,
                title: data.videoName,
                description: null,
                image_file_id: null,
                slide_order: 0,
                video_slide: {
                    id: crypto.randomUUID(),
                    description: '',
                    url: data.videoUrl,
                    title: data.videoName,
                    video_length_in_millis: duration,
                    published_url: null,
                    published_video_length_in_millis: 0,
                    source_type: 'VIDEO',
                },
                status: 'DRAFT',
                new_slide: true,
                notify: false,
            });

            toast.success('Video added successfully!');
            form.reset();
            setVideoPreview(null);
            setIsValidUrl(false);
            openState?.(false);
            setActiveItem(getSlideById(response));
            await queryClient.invalidateQueries({ queryKey: ['slides'] });
            queryClient.getQueryData(['slides']);
        } catch (error) {
            toast.error('Failed to add video');
        } finally {
            setIsVideoUploading(false);
        }
    };

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            videoUrl: '',
            videoName: '',
        },
    });

    return (
        <Form {...form}>
            <form
                onSubmit={form.handleSubmit(handleSubmit)}
                className="flex w-full flex-col gap-6 text-neutral-600 p-6"
            >
                {/* URL Input with enhanced styling */}
                <div className="space-y-4">
                    <FormField
                        control={form.control}
                        name="videoUrl"
                        render={({ field }) => (
                            <FormItem>
                                <FormControl>
                                    <div className="relative">
                                        <MyInput
                                            label="YouTube URL"
                                            required={true}
                                            input={field.value}
                                            inputType="text"
                                            inputPlaceholder="https://www.youtube.com/watch?v=..."
                                            onChangeFunction={(e) => {
                                                field.onChange(e);
                                                handleUrlChange(e.target.value);
                                            }}
                                            className="w-full pr-12"
                                        />
                                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 mt-3">
                                            {isValidUrl ? (
                                                <CheckCircle className="w-5 h-5 text-green-500 animate-in fade-in duration-300" />
                                            ) : (
                                                <YoutubeLogo className="w-5 h-5 text-neutral-400" />
                                            )}
                                        </div>
                                    </div>
                                </FormControl>
                            </FormItem>
                        )}
                    />

                    {/* Video Preview */}
                    {videoPreview && (
                        <div className="p-4 bg-neutral-50 rounded-xl border animate-in fade-in slide-in-from-bottom-2 duration-500">
                            <div className="flex items-center gap-3">
                                <div className="relative flex-shrink-0">
                                    <img 
                                        src={videoPreview.thumbnail}
                                        alt="Video thumbnail"
                                        className="w-16 h-12 object-cover rounded-lg"
                                    />
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <PlayCircle className="w-6 h-6 text-white drop-shadow-lg" />
                                    </div>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-neutral-700 truncate">
                                        {videoPreview.title}
                                    </p>
                                    <p className="text-xs text-neutral-500">YouTube Video</p>
                                </div>
                                <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                            </div>
                        </div>
                    )}
                </div>

                {/* Title Input */}
                <FormField
                    control={form.control}
                    name="videoName"
                    render={({ field }) => (
                        <FormItem>
                            <FormControl>
                                <MyInput
                                    {...field}
                                    label="Video Title"
                                    required={true}
                                    input={field.value}
                                    inputType="text"
                                    inputPlaceholder="Enter a descriptive title"
                                    onChangeFunction={field.onChange}
                                    className="w-full"
                                />
                            </FormControl>
                        </FormItem>
                    )}
                />

                <div ref={containerRef} className="hidden" />

                {/* Enhanced Submit Button */}
                <div className="flex justify-end pt-4 border-t border-neutral-100">
                    {isVideoUploading ? (
                        <MyButton
                            type="button"
                            buttonType="primary"
                            scale="large"
                            layoutVariant="default"
                            className="w-full"
                        >
                            <div className="flex items-center justify-center gap-2">
                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                Adding Video...
                            </div>
                        </MyButton>
                    ) : (
                        <MyButton
                            type="submit"
                            buttonType="primary"
                            scale="large"
                            layoutVariant="default"
                            disabled={!form.getValues('videoName') || !form.getValues('videoUrl') || !isValidUrl}
                            className={`
                                w-full transition-all duration-300 ease-in-out
                                ${!form.getValues('videoName') || !form.getValues('videoUrl') || !isValidUrl
                                    ? 'opacity-50 cursor-not-allowed'
                                    : 'hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl'
                                }
                            `}
                        >
                            <div className="flex items-center justify-center gap-2">
                                <YoutubeLogo className="w-4 h-4" />
                                Add YouTube Video
                            </div>
                        </MyButton>
                    )}
                </div>
            </form>
        </Form>
    );
};
