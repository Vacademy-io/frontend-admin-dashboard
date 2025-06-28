'use client';

import { MyButton } from '@/components/design-system/button';
import { MyInput } from '@/components/design-system/input';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Form, FormControl, FormField, FormItem } from '@/components/ui/form';
import { useSlides } from '@/routes/study-library/courses/course-details/subjects/modules/chapters/slides/-hooks/use-slides';
import { toast } from 'sonner';
import { Route } from '@/routes/study-library/courses/course-details/subjects/modules/chapters/slides/index';
import { useContentStore } from '@/routes/study-library/courses/course-details/subjects/modules/chapters/slides/-stores/chapter-sidebar-store';
import { useEffect, useRef, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { DashboardLoader } from '@/components/core/dashboard-loader';
import { useInstituteDetailsStore } from '@/stores/students/students-list/useInstituteDetailsStore';

const formSchema = z.object({
    videoUrl: z
        .string()
        .min(1, 'URL is required')
        .url('Please enter a valid URL')
        .refine((url) => url.includes('youtube.com') || url.includes('youtu.be'), {
            message: 'Please enter a valid YouTube URL',
        }),
    videoName: z.string().min(1, 'File name is required'),
});

type FormValues = z.infer<typeof formSchema>;

export const AddVideoDialog = ({
    openState,
}: {
    openState?: ((open: boolean) => void) | undefined;
}) => {
    const { getPackageSessionId } = useInstituteDetailsStore();
    const { courseId, levelId, chapterId, moduleId, subjectId, sessionId } = Route.useSearch();
    const { addUpdateVideoSlide } = useSlides(
        chapterId || '',
        moduleId || '',
        subjectId || '',
        getPackageSessionId({
            courseId: courseId || '',
            levelId: levelId || '',
            sessionId: sessionId || '',
        }) || ''
    );
    const { setActiveItem, getSlideById } = useContentStore();
    const [isAPIReady, setIsAPIReady] = useState(false);
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

    const handleSubmit = async (data: FormValues) => {
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
                slide_order: null,
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
                className="flex w-full flex-col gap-6 text-neutral-600"
            >
                <FormField
                    control={form.control}
                    name="videoUrl"
                    render={({ field }) => (
                        <FormItem>
                            <FormControl>
                                <MyInput
                                    label="Video URL"
                                    required={true}
                                    input={field.value}
                                    inputType="text"
                                    inputPlaceholder="Enter YouTube video URL here"
                                    onChangeFunction={field.onChange}
                                    className="w-full"
                                />
                            </FormControl>
                        </FormItem>
                    )}
                />
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
                                    inputPlaceholder="File name"
                                    onChangeFunction={field.onChange}
                                    className="w-full"
                                />
                            </FormControl>
                        </FormItem>
                    )}
                />
                <div ref={containerRef} className="hidden" />

                {isVideoUploading ? (
                    <MyButton
                        type="button"
                        buttonType="primary"
                        scale="large"
                        layoutVariant="default"
                    >
                        <DashboardLoader size={18} />
                    </MyButton>
                ) : (
                    <MyButton
                        type="submit"
                        buttonType="primary"
                        scale="large"
                        layoutVariant="default"
                        disable={!form.getValues('videoName') || !form.getValues('videoUrl')}
                    >
                        Add Video
                    </MyButton>
                )}
            </form>
        </Form>
    );
};
