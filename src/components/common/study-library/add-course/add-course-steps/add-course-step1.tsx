import { TokenKey } from '@/constants/auth/tokens';
import { useFileUpload } from '@/hooks/use-file-upload';
import { getTokenDecodedData, getTokenFromCookie } from '@/lib/auth/sessionUtility';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { MyInput } from '@/components/design-system/input';
import { MainViewQuillEditor } from '@/components/quill/MainViewQuillEditor';
import { DashboardLoader } from '@/components/core/dashboard-loader';
import { ImageSquare, PencilSimpleLine } from 'phosphor-react';
import { FileUploadComponent } from '@/components/design-system/file-upload';
import { MyButton } from '@/components/design-system/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { X } from 'lucide-react';
import { ContentTerms, SystemTerms } from '@/routes/settings/-components/NamingSettings';
import { getTerminology } from '@/components/common/layout-container/sidebar/utils';

type MediaType = 'image' | 'video';

// Step 1 Schema
export const step1Schema = z.object({
    course: z.string().min(1, { message: 'Course name is required' }),
    description: z.string().optional(),
    learningOutcome: z.string().optional(),
    aboutCourse: z.string().optional(),
    targetAudience: z.string().optional(),
    coursePreview: z.any().optional(),
    courseBanner: z.any().optional(),
    courseMedia: z.any().optional(),
    tags: z.array(z.string()).default([]),
});
export type Step1Data = z.infer<typeof step1Schema>;

export const AddCourseStep1 = ({
    onNext,
    initialData,
}: {
    onNext: (data: Step1Data) => void;
    initialData?: Step1Data;
}) => {
    const accessToken = getTokenFromCookie(TokenKey.accessToken);
    const data = getTokenDecodedData(accessToken);
    const INSTITUTE_ID = data && Object.keys(data.authorities)[0];

    const { uploadFile } = useFileUpload();

    const coursePreviewRef = useRef<HTMLInputElement>(null);
    const courseBannerRef = useRef<HTMLInputElement>(null);
    const courseMediaRef = useRef<HTMLInputElement>(null);

    const [uploadingStates, setUploadingStates] = useState({
        coursePreview: false,
        courseBanner: false,
        courseMedia: false,
    });

    const [newTag, setNewTag] = useState('');
    const [tags, setTags] = useState<string[]>(initialData?.tags || []);

    const form = useForm<Step1Data>({
        resolver: zodResolver(step1Schema),
        defaultValues: initialData || {
            course: '',
            description: '',
            learningOutcome: '',
            aboutCourse: '',
            targetAudience: '',
            coursePreview: null,
            courseBanner: null,
            courseMedia: null,
            tags: [],
        },
    });

    // Watch the course field value
    const courseValue = form.watch('course');
    const isNextDisabled =
        !courseValue ||
        courseValue.trim() === '' ||
        Object.values(uploadingStates).some((state) => state);

    const handleFileUpload = async (
        file: File,
        field: 'coursePreview' | 'courseBanner' | 'courseMedia'
    ) => {
        try {
            setUploadingStates((prev) => ({
                ...prev,
                [field]: true,
            }));

            const imageUrl = URL.createObjectURL(file);
            form.setValue(`${field}.url`, imageUrl);

            // Set media type for course media
            if (field === 'courseMedia') {
                const mediaType: MediaType = file.type.startsWith('video/') ? 'video' : 'image';
                form.setValue('courseMedia.mediaType', mediaType);
            }

            const uploadedFileId = await uploadFile({
                file,
                setIsUploading: (state) =>
                    setUploadingStates((prev) => ({
                        ...prev,
                        [field]: state,
                    })),
                userId: 'your-user-id',
                source: INSTITUTE_ID,
                sourceId: 'COURSES',
            });

            if (uploadedFileId) {
                form.setValue(`${field}.id`, uploadedFileId);
            }
        } catch (error) {
            console.error('Upload failed:', error);
        } finally {
            setUploadingStates((prev) => ({
                ...prev,
                [field]: false,
            }));
        }
    };

    const addTag = (e: React.MouseEvent | React.KeyboardEvent) => {
        e.preventDefault();
        if (newTag.trim() && !tags.includes(newTag.trim())) {
            const updatedTags = [...tags, newTag.trim()];
            setTags(updatedTags);
            form.setValue('tags', updatedTags);
            setNewTag('');
        }
    };

    const removeTag = (tagToRemove: string) => {
        const updatedTags = tags.filter((tag) => tag !== tagToRemove);
        setTags(updatedTags);
        form.setValue('tags', updatedTags);
    };

    return (
        <Form {...form}>
            <form
                onSubmit={form.handleSubmit(onNext)}
                className="flex h-[calc(100%-56px)] flex-col"
            >
                {/* Scrollable Content */}
                <div className="flex-1 overflow-y-auto">
                    <div className="p-8">
                        <h1 className="mb-8">
                            Step 1: {getTerminology(ContentTerms.Course, SystemTerms.Course)}{' '}
                            Overview
                        </h1>
                        <div className="grid grid-cols-2 gap-8">
                            {/* Left Column - Form Fields */}
                            <div className="space-y-6">
                                <FormField
                                    control={form.control}
                                    name="course"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormControl>
                                                <MyInput
                                                    id="course-name"
                                                    required={true}
                                                    label={getTerminology(
                                                        ContentTerms.Course,
                                                        SystemTerms.Course
                                                    )}
                                                    inputType="text"
                                                    inputPlaceholder="Enter course name"
                                                    className="w-full"
                                                    input={field.value}
                                                    onChangeFunction={(e) =>
                                                        field.onChange(e.target.value)
                                                    }
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <div className="flex flex-col gap-16">
                                    <FormField
                                        control={form.control}
                                        name="description"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Description</FormLabel>
                                                <FormControl>
                                                    <MainViewQuillEditor
                                                        onChange={field.onChange}
                                                        value={field.value}
                                                        CustomclasssName="h-[120px]"
                                                        placeholder={`Enter ${getTerminology(
                                                            ContentTerms.Course,
                                                            SystemTerms.Course
                                                        )} description`}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                {/* Tags Section */}
                                <div className="space-y-2 pt-10">
                                    <Label className="text-normal font-medium text-gray-900">
                                        {getTerminology(ContentTerms.Course, SystemTerms.Course)}{' '}
                                        Tags
                                    </Label>
                                    <p className="text-sm text-gray-600">
                                        Add tags to help categorize and find your course easily
                                    </p>
                                    <div className="flex gap-2">
                                        <Input
                                            type="text"
                                            placeholder="Enter a tag"
                                            value={newTag}
                                            onChange={(e) => setNewTag(e.target.value)}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter') {
                                                    addTag(e);
                                                }
                                            }}
                                            className="h-9 border-gray-300"
                                        />
                                        <MyButton
                                            type="button"
                                            buttonType="secondary"
                                            scale="medium"
                                            layoutVariant="default"
                                            onClick={addTag}
                                            disable={!newTag.trim()}
                                        >
                                            Add
                                        </MyButton>
                                    </div>

                                    {tags.length > 0 && (
                                        <div className="flex flex-wrap gap-2">
                                            {tags.map((tag, index) => (
                                                <Badge
                                                    key={index}
                                                    variant="secondary"
                                                    className="flex items-center gap-1 px-3 py-1"
                                                >
                                                    {tag}
                                                    <X
                                                        className="size-3 cursor-pointer"
                                                        onClick={() => removeTag(tag)}
                                                    />
                                                </Badge>
                                            ))}
                                        </div>
                                    )}
                                </div>
                                <div className="flex flex-col gap-16 pb-8">
                                    <FormField
                                        control={form.control}
                                        name="learningOutcome"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>What learners will gain?</FormLabel>
                                                <FormControl>
                                                    <MainViewQuillEditor
                                                        onChange={field.onChange}
                                                        value={field.value}
                                                        CustomclasssName="h-[120px]"
                                                        placeholder="Provide a detailed overview of the course. Include learning objectives, topics covered, format (video, quizzes, projects), and who this course is for."
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="aboutCourse"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>
                                                    About the{' '}
                                                    {getTerminology(
                                                        ContentTerms.Course,
                                                        SystemTerms.Course
                                                    )}
                                                </FormLabel>
                                                <FormControl>
                                                    <MainViewQuillEditor
                                                        onChange={field.onChange}
                                                        value={field.value}
                                                        CustomclasssName="h-[120px]"
                                                        placeholder="Provide a detailed overview of the course. Include learning objectives, topics covered, format (video, quizzes, projects), and who this course is for."
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="targetAudience"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Who should join?</FormLabel>
                                                <FormControl>
                                                    <MainViewQuillEditor
                                                        onChange={field.onChange}
                                                        value={field.value}
                                                        CustomclasssName="h-[120px]"
                                                        placeholder="Provide a detailed overview of the course. Include learning objectives, topics covered, format (video, quizzes, projects), and who this course is for."
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                            </div>

                            {/* Right Column - Image Uploads */}
                            <div className="space-y-6">
                                {/* Course Preview */}
                                <div className="flex flex-col gap-1">
                                    <FormLabel>
                                        {getTerminology(ContentTerms.Course, SystemTerms.Course)}{' '}
                                        Preview Image
                                    </FormLabel>
                                    <p className="text-sm text-gray-500">
                                        This is the thumbnail that appears on the course card.
                                        Recommended size: 2:1 ratio
                                    </p>
                                    <div className="relative">
                                        {uploadingStates.coursePreview ? (
                                            <div className="flex h-[200px] items-center justify-center rounded-lg bg-gray-100">
                                                <DashboardLoader />
                                            </div>
                                        ) : form.watch('coursePreview.url') ? (
                                            <div className="h-[200px] w-full rounded-lg bg-gray-100">
                                                <img
                                                    src={form.watch('coursePreview.url')}
                                                    alt="Course Preview"
                                                    className="size-full rounded-lg object-contain"
                                                />
                                            </div>
                                        ) : (
                                            <div className="flex h-[200px] items-center justify-center rounded-lg bg-gray-100">
                                                <p className="text-white">
                                                    <ImageSquare size={100} />
                                                </p>
                                            </div>
                                        )}
                                        <FileUploadComponent
                                            fileInputRef={coursePreviewRef}
                                            onFileSubmit={(file) =>
                                                handleFileUpload(file, 'coursePreview')
                                            }
                                            control={form.control}
                                            name="coursePreview.id"
                                            acceptedFileTypes={[
                                                'image/jpeg',
                                                'image/png',
                                                'image/svg+xml',
                                            ]}
                                        />
                                        <MyButton
                                            type="button"
                                            onClick={() => coursePreviewRef.current?.click()}
                                            disabled={uploadingStates.coursePreview}
                                            buttonType="secondary"
                                            layoutVariant="icon"
                                            scale="small"
                                            className="absolute bottom-2 right-2 bg-white"
                                        >
                                            <PencilSimpleLine />
                                        </MyButton>
                                    </div>
                                </div>

                                {/* Course Banner */}
                                <div className="flex flex-col gap-1">
                                    <FormLabel>
                                        {getTerminology(ContentTerms.Course, SystemTerms.Course)}{' '}
                                        Banner Image
                                    </FormLabel>
                                    <p className="text-sm text-gray-500">
                                        A wide background image displayed on top of the course
                                        detail page. Recommended size: 2.64:1 ratio
                                    </p>
                                    <div className="relative">
                                        {uploadingStates.courseBanner ? (
                                            <div className="flex h-[200px] items-center justify-center rounded-lg bg-gray-100">
                                                <DashboardLoader />
                                            </div>
                                        ) : form.watch('courseBanner.url') ? (
                                            <div className="h-[200px] w-full rounded-lg bg-gray-100">
                                                <img
                                                    src={form.watch('courseBanner.url')}
                                                    alt="Course Banner"
                                                    className="size-full rounded-lg object-contain"
                                                />
                                            </div>
                                        ) : (
                                            <div className="flex h-[200px] items-center justify-center rounded-lg bg-gray-100">
                                                <p className="text-white">
                                                    <ImageSquare size={100} />
                                                </p>
                                            </div>
                                        )}
                                        <FileUploadComponent
                                            fileInputRef={courseBannerRef}
                                            onFileSubmit={(file) =>
                                                handleFileUpload(file, 'courseBanner')
                                            }
                                            control={form.control}
                                            name="courseBanner.id"
                                            acceptedFileTypes={[
                                                'image/jpeg',
                                                'image/png',
                                                'image/svg+xml',
                                            ]}
                                        />
                                        <MyButton
                                            type="button"
                                            onClick={() => courseBannerRef.current?.click()}
                                            disabled={uploadingStates.courseBanner}
                                            buttonType="secondary"
                                            layoutVariant="icon"
                                            scale="small"
                                            className="absolute bottom-2 right-2 bg-white"
                                        >
                                            <PencilSimpleLine />
                                        </MyButton>
                                    </div>
                                </div>

                                {/* Course Media */}
                                <div className="flex flex-col gap-1">
                                    <FormLabel>
                                        {getTerminology(ContentTerms.Course, SystemTerms.Course)}{' '}
                                        Media (Image or Video)
                                    </FormLabel>
                                    <p className="text-sm text-gray-500">
                                        A featured media block within the course page; this can
                                        visually represent the content or offer a teaser. For
                                        videos, recommended format: MP4
                                    </p>
                                    <div className="relative">
                                        {uploadingStates.courseMedia ? (
                                            <div className="flex h-[200px] items-center justify-center rounded-lg bg-gray-100">
                                                <DashboardLoader />
                                            </div>
                                        ) : form.watch('courseMedia.url') ? (
                                            <div className="h-[200px] w-full rounded-lg bg-gray-100">
                                                {form.watch('courseMedia.mediaType') === 'video' ? (
                                                    <video
                                                        src={form.watch('courseMedia.url')}
                                                        controls
                                                        className="size-full rounded-lg object-contain"
                                                    >
                                                        Your browser does not support the video tag.
                                                    </video>
                                                ) : (
                                                    <img
                                                        src={form.watch('courseMedia.url')}
                                                        alt="Course Media"
                                                        className="size-full rounded-lg object-contain"
                                                    />
                                                )}
                                            </div>
                                        ) : (
                                            <div className="flex h-[200px] items-center justify-center rounded-lg bg-gray-100">
                                                <p className="text-white">
                                                    <ImageSquare size={100} />
                                                </p>
                                            </div>
                                        )}
                                        <FileUploadComponent
                                            fileInputRef={courseMediaRef}
                                            onFileSubmit={(file) =>
                                                handleFileUpload(file, 'courseMedia')
                                            }
                                            control={form.control}
                                            name="courseMedia.id"
                                            acceptedFileTypes={[
                                                'image/jpeg',
                                                'image/png',
                                                'image/svg+xml',
                                                'video/mp4',
                                                'video/quicktime',
                                                'video/x-msvideo',
                                                'video/webm',
                                            ]}
                                        />
                                        <MyButton
                                            type="button"
                                            onClick={() => courseMediaRef.current?.click()}
                                            disabled={uploadingStates.courseMedia}
                                            buttonType="secondary"
                                            layoutVariant="icon"
                                            scale="small"
                                            className="absolute bottom-2 right-2 bg-white hover:bg-white"
                                        >
                                            <PencilSimpleLine />
                                        </MyButton>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Fixed Footer */}
                <div className="sticky bottom-0 mt-auto border-t bg-white px-8 py-4">
                    <div className="flex justify-end">
                        <MyButton
                            type="submit"
                            buttonType="primary"
                            layoutVariant="default"
                            scale="large"
                            id="next-button"
                            className="px-8"
                            disable={isNextDisabled}
                        >
                            Next
                        </MyButton>
                    </div>
                </div>
            </form>
        </Form>
    );
};
