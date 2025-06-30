'use client';

import type React from 'react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

import { MyButton } from '@/components/design-system/button';
import { Form } from '@/components/ui/form';
import { toast } from 'sonner';

import { UploadFileInS3 } from '@/services/upload_file';
import { useSlides } from '@/routes/study-library/courses/levels/subjects/modules/chapters/slides/-hooks/use-slides';
import { useContentStore } from '@/routes/study-library/courses/levels/subjects/modules/chapters/slides/-stores/chapter-sidebar-store';
import { Route } from '@/routes/study-library/courses/levels/subjects/modules/chapters/slides/index';
import { useInstituteDetailsStore } from '@/stores/students/students-list/useInstituteDetailsStore';

const formSchema = z.object({
  videoFile: z.instanceof(File, { message: 'Video file is required' }),
});

type FormValues = z.infer<typeof formSchema>;

const INSTITUTE_ID = 'your-institute-id'; // Replace with actual ID
const USER_ID = 'your-user-id'; // Replace with actual ID

export const AddVideoFileDialog = ({
  openState,
}: {
  openState?: (open: boolean) => void;
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
  const [isUploading, setIsUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {},
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      form.setValue('videoFile', file);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) {
      setSelectedFile(file);
      form.setValue('videoFile', file);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleSubmit = async (data: FormValues) => {
    try {
      setIsUploading(true);

      const fileId = await UploadFileInS3(
        data.videoFile,
        (progress) => {
          console.log(`Upload progress: ${progress}%`);
        },
        USER_ID,
        INSTITUTE_ID,
        'ADMIN',
        true
      );

      const titleFromFile = data.videoFile.name.replace(/\.[^/.]+$/, '');

      const slideId = crypto.randomUUID();
      const response = await addUpdateVideoSlide({
        id: slideId,
        title: titleFromFile,
        description: null,
        image_file_id: null,
        slide_order: 0,
        video_slide: {
          id: crypto.randomUUID(),
          description: '',
          url: fileId ?? null,
          title: titleFromFile,
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
          disabled={isUploading}
        >
          {isUploading ? 'Uploading...' : 'Upload Video'}
        </MyButton>
      </form>
    </Form>
  );
};
