'use client';

import type React from 'react';
import { MyButton } from '@/components/design-system/button';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Form, FormControl, FormField, FormItem } from '@/components/ui/form';
import { useSlides } from '@/routes/study-library/courses/levels/subjects/modules/chapters/slides/-hooks/use-slides';
import { toast } from 'sonner';
import { Route } from '@/routes/study-library/courses/levels/subjects/modules/chapters/slides/index';
import { useContentStore } from '@/routes/study-library/courses/levels/subjects/modules/chapters/slides/-stores/chapter-sidebar-store';
import { useState } from 'react';
import { UploadFileInS3 } from '@/services/upload_file';

const formSchema = z.object({
    videoFile: z.instanceof(File, { message: 'Video file is required' }),
});

type FormValues = z.infer<typeof formSchema>;

const INSTITUTE_ID = 'your-institute-id'; // Replace with your actual institute ID

export const AddVideoFileDialog = ({
    openState,
}: {
    openState?: ((open: boolean) => void) | undefined;
}) => {
    const { chapterId } = Route.useSearch();
    const { addUpdateVideoSlide } = useSlides(chapterId);
    const { setActiveItem, getSlideById } = useContentStore();
    const [isUploading, setIsUploading] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            videoFile: undefined as unknown as File,
        },
    });

    const handleSubmit = async (data: FormValues) => {
        try {
            setIsUploading(true);

            const fileId = await UploadFileInS3(
                data.videoFile,
                (progress) => {
                    console.log(`Upload progress: ${progress}%`);
                },
                'your-user-id',
                INSTITUTE_ID,
                'ADMIN',
                true
            );

            const title = data.videoFile.name.replace(/\.[^/.]+$/, '');

            const slideId = crypto.randomUUID();
            const response: string = await addUpdateVideoSlide({
                id: slideId,
                title,
                description: null,
                image_file_id: null,
                slide_order: 0,
                video_slide: {
                    id: crypto.randomUUID(),
                    description: '',
                    url: fileId ?? null,
                    title,
                    video_length_in_millis: 0,
                    published_url: null,
                    published_video_length_in_millis: 0,
                    source_type: 'FILE_ID',
                },
                status: 'DRAFT',
                new_slide: true,
                notify: false,
            });

            toast.success('Video uploaded successfully!');
            form.reset();
            setSelectedFile(null);
            openState?.(false);
            setTimeout(() => {
                setActiveItem(getSlideById(response));
            }, 500);
        } catch (error) {
            console.error('Error uploading video:', error);
            toast.error('Failed to upload video');
        } finally {
            setIsUploading(false);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setSelectedFile(file);
            form.setValue('videoFile', file, { shouldValidate: true });
        }
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        const file = e.dataTransfer.files?.[0];
        if (file) {
            setSelectedFile(file);
            form.setValue('videoFile', file, { shouldValidate: true });
        }
    };

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
    };

    return (
        <Form {...form}>
            <form
                onSubmit={form.handleSubmit(handleSubmit)}
                className="flex w-full flex-col gap-6 text-neutral-600"
            >
                <div
                    className="cursor-pointer rounded-lg border-2 border-dashed border-orange-400 p-8 text-center"
                    onClick={() => document.getElementById('video-file-upload')?.click()}
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                >
                    <div className="flex flex-col items-center justify-center">
                        <div className="mb-4 text-orange-500">
                            <svg
                                width="48"
                                height="48"
                                viewBox="0 0 48 48"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                            >
                                <path
                                    d="M24 12V24M24 24V36M24 24H36M24 24H12"
                                    stroke="currentColor"
                                    strokeWidth="4"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                />
                            </svg>
                        </div>
                        <h3 className="text-xl font-medium text-orange-500">Import your file</h3>
                        <p className="mt-1 text-gray-500">Drag or click to upload</p>
                        {selectedFile && (
                            <p className="mt-2 text-sm font-medium text-gray-700">
                                Selected: {selectedFile.name}
                            </p>
                        )}
                    </div>
                    <input
                        id="video-file-upload"
                        type="file"
                        accept="video/*"
                        className="hidden"
                        onChange={handleFileChange}
                    />
                </div>

                <MyButton
                    type="submit"
                    buttonType="primary"
                    scale="large"
                    layoutVariant="default"
                    disabled={!selectedFile || isUploading}
                >
                    {isUploading ? 'Uploading...' : 'Upload Video'}
                </MyButton>
            </form>
        </Form>
    );
};
