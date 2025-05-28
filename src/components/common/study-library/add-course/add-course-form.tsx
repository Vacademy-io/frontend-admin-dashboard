// add-course-form.tsx
import { useRef, useState } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { MyButton } from '@/components/design-system/button';
import { MyInput } from '@/components/design-system/input';
import { MainViewQuillEditor } from '@/components/quill/MainViewQuillEditor';
import { FileUploadComponent } from '@/components/design-system/file-upload';
import { useFileUpload } from '@/hooks/use-file-upload';
import { TokenKey } from '@/constants/auth/tokens';
import { getTokenDecodedData, getTokenFromCookie } from '@/lib/auth/sessionUtility';
import { DashboardLoader } from '@/components/core/dashboard-loader';
import { ImageSquare, PencilSimpleLine } from 'phosphor-react';

export interface Session {
    id: string;
    session_name: string;
    status: string;
    start_date?: string;
    new_session?: boolean;
    levels: Level[]; // Add levels array to sessions
}

// Update Level interface (remove sessions)
export interface Level {
    id: string;
    level_name: string;
    duration_in_days: number | null;
    thumbnail_id: string | null;
    new_level?: boolean;
}

// Update CourseFormData
export interface CourseFormData {
    course_name: string;
    id?: string;
    thumbnail_file_id?: string;
    contain_levels?: boolean;
    status?: string;
    sessions?: Session[]; // Changed from levels to sessions at top level
}

const formSchema = z.object({
    course: z.string().min(1, 'Course name is required'),
    description: z.string().min(10, 'Description must be at least 10 characters'),
    learningOutcome: z.string().min(10, 'Learning outcome must be at least 10 characters'),
    aboutCourse: z.string().min(10, 'About course must be at least 10 characters'),
    targetAudience: z.string().min(10, 'Target audience must be at least 10 characters'),
    coursePreview: z.object({
        id: z.string().optional(),
        url: z.string().optional(),
    }),
    courseBanner: z.object({
        id: z.string().optional(),
        url: z.string().optional(),
    }),
    courseMedia: z.object({
        id: z.string().optional(),
        url: z.string().optional(),
    }),
});

export type AddCourseData = z.infer<typeof formSchema>;

export const AddCourseForm = () => {
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

    const form = useForm<AddCourseData>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            course: '',
            description: '',
            learningOutcome: '',
            aboutCourse: '',
            targetAudience: '',
            coursePreview: { id: '', url: '' },
            courseBanner: { id: '', url: '' },
            courseMedia: { id: '', url: '' },
        },
    });

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

    const onSubmit = (data: AddCourseData) => {
        console.log('Form submitted:', data);
        // Handle form submission here
    };

    return (
        <Dialog>
            <DialogTrigger>
                <MyButton
                    type="button"
                    buttonType="secondary"
                    layoutVariant="default"
                    scale="large"
                    id="add-course-button"
                    className="w-[140px]"
                >
                    Create Course Manually
                </MyButton>
            </DialogTrigger>
            <DialogContent className="z-[10000] flex !h-[90%] !max-h-[90%] w-[90%] flex-col overflow-hidden p-0">
                <div className="flex h-full flex-col">
                    <h1 className="bg-primary-50 p-4 font-semibold text-primary-500">
                        Create Course
                    </h1>
                    <Form {...form}>
                        <form
                            onSubmit={form.handleSubmit(onSubmit)}
                            className="flex h-[calc(100%-56px)] flex-col"
                        >
                            {/* Scrollable Content */}
                            <div className="flex-1 overflow-y-auto">
                                <div className="p-8">
                                    <h1 className="mb-8">Step 1: Course Overview</h1>
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
                                                                label="Course"
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
                                            <FormField
                                                control={form.control}
                                                name="description"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormControl>
                                                            <MyInput
                                                                id="course-description"
                                                                required={false}
                                                                inputType="text"
                                                                label="Description"
                                                                inputPlaceholder="Enter course description"
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
                                                    name="learningOutcome"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel>
                                                                What learners will gain?
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
                                                    name="aboutCourse"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel>About the course</FormLabel>
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
                                                <FormLabel>Course Preview Image</FormLabel>
                                                <p className="text-sm text-gray-500">
                                                    This is the thumbnail that appears on the course
                                                    card. Recommended size: 2:1 ratio
                                                </p>
                                                <div className="relative">
                                                    {uploadingStates.coursePreview ? (
                                                        <div className="flex h-[200px] items-center justify-center rounded-lg bg-gray-100">
                                                            <DashboardLoader />
                                                        </div>
                                                    ) : form.watch('coursePreview.url') ? (
                                                        <div className="h-[200px] w-full rounded-lg bg-gray-100">
                                                            <img
                                                                src={form.watch(
                                                                    'coursePreview.url'
                                                                )}
                                                                alt="Course Preview"
                                                                className="h-full w-full rounded-lg object-contain"
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
                                                        onClick={() =>
                                                            coursePreviewRef.current?.click()
                                                        }
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
                                                <FormLabel>Course Banner Image</FormLabel>
                                                <p className="text-sm text-gray-500">
                                                    A wide background image displayed on top of the
                                                    course detail page. Recommended size: 2.64:1
                                                    ratio
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
                                                                className="h-full w-full rounded-lg object-contain"
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
                                                        onClick={() =>
                                                            courseBannerRef.current?.click()
                                                        }
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
                                                <FormLabel>Course Media (Image or Video)</FormLabel>
                                                <p className="text-sm text-gray-500">
                                                    A featured media block within the course page;
                                                    this can visually represent the content or offer
                                                    a teaser. Recommended size: 16:1 ratio
                                                </p>
                                                <div className="relative">
                                                    {uploadingStates.courseMedia ? (
                                                        <div className="flex h-[200px] items-center justify-center rounded-lg bg-gray-100">
                                                            <DashboardLoader />
                                                        </div>
                                                    ) : form.watch('courseMedia.url') ? (
                                                        <div className="h-[200px] w-full rounded-lg bg-gray-100">
                                                            <img
                                                                src={form.watch('courseMedia.url')}
                                                                alt="Course Media"
                                                                className="h-full w-full rounded-lg object-contain"
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
                                                        ]}
                                                    />
                                                    <MyButton
                                                        type="button"
                                                        onClick={() =>
                                                            courseMediaRef.current?.click()
                                                        }
                                                        disabled={uploadingStates.courseMedia}
                                                        buttonType="secondary"
                                                        layoutVariant="icon"
                                                        scale="small"
                                                        className="absolute bottom-2 right-2 bg-white"
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
                                    >
                                        Next
                                    </MyButton>
                                </div>
                            </div>
                        </form>
                    </Form>
                </div>
            </DialogContent>
        </Dialog>
    );
};
