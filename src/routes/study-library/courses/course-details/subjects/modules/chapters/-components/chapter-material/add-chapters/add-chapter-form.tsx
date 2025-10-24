import { ControllerRenderProps, useForm } from 'react-hook-form';
import * as z from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useCallback, useState, useRef } from 'react';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { MyInput } from '@/components/design-system/input';
import { MyButton } from '@/components/design-system/button';
import { ChapterWithSlides } from '@/stores/study-library/use-modules-with-chapters-store';
import { useAddChapter } from '@/routes/study-library/courses/course-details/subjects/modules/chapters/-services/add-chapter';
import { useRouter } from '@tanstack/react-router';
import { toast } from 'sonner';
import { useUpdateChapter } from '@/routes/study-library/courses/course-details/subjects/modules/chapters/-services/update-chapter';
import { fetchModulesWithChapters } from '@/routes/study-library/courses/-services/getModulesWithChapters';
import { useInstituteDetailsStore } from '@/stores/students/students-list/useInstituteDetailsStore';
import { useGetPackageSessionId } from '@/utils/helpers/study-library-helpers.ts/get-list-from-stores/getPackageSessionId';
import { getTerminology } from '@/components/common/layout-container/sidebar/utils';
import { ContentTerms, SystemTerms } from '@/routes/settings/-components/NamingSettings';
import { Checkbox } from '@/components/ui/checkbox';
import { levelsWithPackageDetails } from '@/schemas/student/student-list/institute-schema';
import { ImageCropperDialog } from '@/components/design-system/image-cropper-dialog';
import { useFileUpload } from '@/hooks/use-file-upload';
import { getUserId } from '@/utils/userDetails';
import { Upload, X } from 'lucide-react';

const formSchema = z.object({
    chapterName: z.string().min(1, 'Chapter name is required'),
    visibility: z.record(z.string(), z.array(z.string())),
    thumbnailFileId: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface AddChapterFormProps {
    initialValues?: ChapterWithSlides;
    onSubmitSuccess: () => void;
    mode: 'create' | 'edit';
    module_id?: string;
    session_id?: string;
    level_id?: string;
    subject_id?: string;
    hideSubmitButton?: boolean;
    onFormReady?: (submitFn: () => void, isPending: boolean) => void;
}

export const AddChapterForm = ({
    initialValues,
    onSubmitSuccess,
    mode,
    module_id,
    session_id,
    level_id,
    subject_id,
    hideSubmitButton = false,
    onFormReady,
}: AddChapterFormProps) => {
    const router = useRouter();
    const courseId: string = router.state.location.search.courseId || '';
    const subjectId: string = router.state.location.search.subjectId || subject_id || '';
    const levelId: string = router.state.location.search.levelId || level_id || '';
    const sessionId: string = router.state.location.search.sessionId || session_id || '';
    const moduleId: string = router.state.location.search.moduleId || module_id || '';
    const addChapterMutation = useAddChapter();
    const updateChapterMutation = useUpdateChapter();
    const package_session_id = useGetPackageSessionId(courseId, sessionId, levelId) || '';
    const { getPackageWiseLevels, getPackageSessionId } = useInstituteDetailsStore();

    // Image upload states
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [cropperOpen, setCropperOpen] = useState(false);
    const [isUploadingImage, setIsUploadingImage] = useState(false);
    const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { uploadFile, getPublicUrl } = useFileUpload();
    const userId = getUserId();

    // State for complete chapter visibility data
    const [completeChapterData, setCompleteChapterData] = useState<ChapterWithSlides | null>(null);
    const [isLoadingCompleteData, setIsLoadingCompleteData] = useState(false);

    // Get courses from current sessionId
    const currentSessionCourses = getPackageWiseLevels({
        sessionId: sessionId,
    });

    // Get courses from DEFAULT sessionId
    const defaultSessionCourses =
        sessionId !== 'DEFAULT'
            ? getPackageWiseLevels({
                  sessionId: 'DEFAULT',
              })
            : [];

    // Combine both sets of courses while avoiding duplicates by package ID
    const combinedCourses = [...currentSessionCourses];

    // Add default courses only if they don't already exist in current session
    defaultSessionCourses.forEach((defaultCourse) => {
        if (
            !combinedCourses.some(
                (course) => course.package_dto.id === defaultCourse.package_dto.id
            )
        ) {
            combinedCourses.push(defaultCourse);
        }
    });

    // Use the combined courses list for everything
    const coursesWithLevels = combinedCourses;

    // Create default visibility object
    const defaultVisibility = coursesWithLevels.reduce(
        (acc, course) => {
            acc[course.package_dto.id] = [];
            return acc;
        },
        {} as Record<string, string[]>
    );

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            chapterName: initialValues?.chapter.chapter_name || '',
            thumbnailFileId: initialValues?.chapter.file_id || '',
            visibility:
                initialValues?.chapter_in_package_sessions && mode === 'edit'
                    ? (() => {
                          // Create a fresh visibility object starting with defaults
                          const visibilityMap = { ...defaultVisibility };

                          // Debug: Log the existing package session IDs
                          console.log('=== CHAPTER EDIT DEBUG ===');
                          console.log('Mode:', mode);
                          console.log('initialValues:', initialValues);
                          console.log(
                              'Existing chapter_in_package_sessions:',
                              initialValues.chapter_in_package_sessions
                          );
                          console.log('coursesWithLevels:', coursesWithLevels);
                          console.log('defaultSessionCourses:', defaultSessionCourses);
                          console.log('sessionId:', sessionId);
                          console.log('defaultVisibility:', defaultVisibility);

                          // Debug: Log all available batches_for_sessions to understand the data structure
                          const { instituteDetails } = useInstituteDetailsStore.getState();
                          console.log(
                              'All batches_for_sessions:',
                              instituteDetails?.batches_for_sessions
                          );

                          // Debug: Check which batch IDs match our target package session IDs
                          const targetPackageSessionIds = initialValues.chapter_in_package_sessions;
                          const matchingBatches = instituteDetails?.batches_for_sessions.filter(
                              (batch) => targetPackageSessionIds.includes(batch.id)
                          );
                          console.log(
                              'Matching batches for target package session IDs:',
                              matchingBatches
                          );

                          // WORKAROUND: If chapter_in_package_sessions is empty but we're in edit mode,
                          // try to fetch the complete chapter data from the API
                          if (targetPackageSessionIds.length === 0) {
                              console.log(
                                  '⚠️ chapter_in_package_sessions is empty, attempting to fetch complete data'
                              );

                              // For now, we'll use a fallback approach:
                              // Since the API filtering is causing the issue, we'll populate the current
                              // package session as selected so at least the current visibility is shown
                              if (package_session_id) {
                                  console.log(
                                      'Using current package_session_id as fallback:',
                                      package_session_id
                                  );

                                  // Find which course this package_session_id belongs to
                                  const currentBatch = instituteDetails?.batches_for_sessions.find(
                                      (batch) => batch.id === package_session_id
                                  );

                                  if (currentBatch) {
                                      const courseId = currentBatch.package_dto.id;
                                      console.log(
                                          'Found current batch, adding to course:',
                                          courseId
                                      );

                                      (visibilityMap[courseId] ??= []).push(
                                          package_session_id
                                      );
                                  }
                              }
                          }

                          // NEW APPROACH: Use the batch data directly instead of trying to reverse-engineer
                          // For each existing package session ID, find it directly in batches_for_sessions
                          initialValues.chapter_in_package_sessions.forEach((psId) => {
                              console.log(`\n--- Processing psId: ${psId} ---`);

                              // Find the batch that matches this package session ID
                              const matchingBatch = instituteDetails?.batches_for_sessions.find(
                                  (batch) => batch.id === psId
                              );

                              if (matchingBatch) {
                                  console.log(`✅ Found matching batch:`, matchingBatch);

                                  const courseId = matchingBatch.package_dto.id;

                                  // Add this package session ID to the correct course in visibility map
                                  (visibilityMap[courseId] ??= []).push(psId);

                                  console.log(`Added psId ${psId} to course ${courseId}`);
                              } else {
                                  console.log(`❌ NO MATCHING BATCH FOUND for psId: ${psId}`);
                              }
                          });

                          // OLD APPROACH (keeping for comparison):
                          // For each existing package session ID, find which course it belongs to
                          // initialValues.chapter_in_package_sessions.forEach((psId) => {
                          //     console.log(`\n--- Processing psId: ${psId} ---`);
                          //     let foundMatch = false;

                          //     // Check all courses to find where this package session ID belongs
                          //     for (const course of coursesWithLevels) {
                          //         const isDefaultSessionCourse = defaultSessionCourses.some(
                          //             (defaultCourse) =>
                          //                 defaultCourse.package_dto.id === course.package_dto.id
                          //         );
                          //         const courseSessionId = isDefaultSessionCourse
                          //             ? 'DEFAULT'
                          //             : sessionId;

                          //         console.log(
                          //             `Checking course: ${course.package_dto.package_name} (${course.package_dto.id})`
                          //         );
                          //         console.log(
                          //             `isDefaultSessionCourse: ${isDefaultSessionCourse}, courseSessionId: ${courseSessionId}`
                          //         );

                          //         // Check all levels in this course
                          //         for (const level of course.level) {
                          //             const coursePackageSessionId = getPackageSessionId({
                          //                 courseId: course.package_dto.id,
                          //                 sessionId: courseSessionId,
                          //                 levelId: level.level_dto.id,
                          //             });

                          //             console.log(
                          //                 `  Level: ${level.level_dto.level_name} (${level.level_dto.id})`
                          //             );
                          //             console.log(
                          //                 `  Generated coursePackageSessionId: ${coursePackageSessionId}`
                          //             );
                          //             console.log(`  Comparing with psId: ${psId}`);
                          //             console.log(`  Match: ${coursePackageSessionId === psId}`);

                          //             // If this package session ID matches, add it to the course's visibility array
                          //             if (coursePackageSessionId === psId) {
                          //                 console.log(
                          //                     `  ✅ MATCH FOUND! Adding to course ${course.package_dto.id}`
                          //                 );
                          //                 if (!visibilityMap[course.package_dto.id]) {
                          //                     visibilityMap[course.package_dto.id] = [];
                          //                 }
                          //                 visibilityMap[course.package_dto.id]?.push(psId);
                          //                 foundMatch = true;
                          //                 return; // Found the match, move to next psId
                          //             }
                          //         }
                          //     }

                          //     if (!foundMatch) {
                          //         console.log(`❌ NO MATCH FOUND for psId: ${psId}`);
                          //     }
                          // });

                          // Debug: Log the final visibility map
                          console.log('Final visibility map for edit mode:', visibilityMap);
                          console.log('=== END CHAPTER EDIT DEBUG ===\n');

                          return visibilityMap;
                      })()
                    : {
                          ...defaultVisibility,
                          [courseId]: package_session_id ? [package_session_id] : [],
                      },
        },
    });

    // Fetch complete chapter data when in edit mode
    useEffect(() => {
        const fetchCompleteChapterData = async () => {
            if (
                mode === 'edit' &&
                initialValues &&
                !completeChapterData &&
                !isLoadingCompleteData
            ) {
                setIsLoadingCompleteData(true);
                console.log('🔄 Fetching complete chapter data for edit mode...');

                try {
                    // Get all available package sessions to search through
                    const { instituteDetails } = useInstituteDetailsStore.getState();
                    const allPackageSessions = instituteDetails?.batches_for_sessions || [];

                    console.log('Available package sessions:', allPackageSessions.length);

                    // Try to find the chapter in different package sessions
                    let foundCompleteData: ChapterWithSlides | null = null;

                    for (const batch of allPackageSessions) {
                        try {
                            console.log(
                                `Checking package session: ${batch.id} for subject: ${subjectId}`
                            );

                            const modulesData = await fetchModulesWithChapters(subjectId, batch.id);

                            // Look for our chapter in this data
                            for (const moduleData of modulesData) {
                                const foundChapter = moduleData.chapters.find(
                                    (chapter: ChapterWithSlides) =>
                                        chapter.chapter.id === initialValues.chapter.id
                                );

                                if (
                                    foundChapter &&
                                    foundChapter.chapter_in_package_sessions.length > 0
                                ) {
                                    console.log(
                                        '🎯 Found chapter with visibility data:',
                                        foundChapter
                                    );
                                    foundCompleteData = foundChapter;
                                    break;
                                }
                            }

                            if (foundCompleteData) break;
                        } catch (error) {
                            console.warn(
                                `Failed to fetch data for package session ${batch.id}:`,
                                error
                            );
                            // Continue with next package session
                        }
                    }

                    if (foundCompleteData) {
                        setCompleteChapterData(foundCompleteData);
                        console.log('✅ Successfully loaded complete chapter data');
                    } else {
                        console.log('⚠️ Could not find complete chapter data, using fallback');
                    }
                } catch (error) {
                    console.error('❌ Error fetching complete chapter data:', error);
                } finally {
                    setIsLoadingCompleteData(false);
                }
            }
        };

        fetchCompleteChapterData();
    }, [mode, initialValues, subjectId, completeChapterData, isLoadingCompleteData]);

    // Debug: Watch form values changes
    useEffect(() => {
        if (mode === 'edit') {
            const subscription = form.watch((value) => {
                console.log('Form values changed:', value);
            });
            return () => subscription.unsubscribe();
        }
        return undefined;
    }, [form, mode]);

    // Update form when complete chapter data is loaded
    useEffect(() => {
        if (completeChapterData && mode === 'edit') {
            console.log('🔄 Updating form with complete chapter data:', completeChapterData);

            // Create visibility map using complete data
            const updatedVisibilityMap = { ...defaultVisibility };

            // Process the complete chapter_in_package_sessions data
            completeChapterData.chapter_in_package_sessions.forEach((psId) => {
                // Find which course this package session belongs to
                const { instituteDetails } = useInstituteDetailsStore.getState();
                const matchingBatch = instituteDetails?.batches_for_sessions.find(
                    (batch) => batch.id === psId
                );

                if (matchingBatch) {
                    const courseId = matchingBatch.package_dto.id;
                    (updatedVisibilityMap[courseId] ??= []).push(psId);
                    console.log(`✅ Added psId ${psId} to course ${courseId}`);
                }
            });

            // Update form with new visibility data
            form.setValue('visibility', updatedVisibilityMap);
            console.log('📝 Form updated with complete visibility data:', updatedVisibilityMap);
        }
    }, [completeChapterData, mode, defaultVisibility, form]);

    // Load existing thumbnail preview
    useEffect(() => {
        if (initialValues?.chapter.file_id && mode === 'edit') {
            getPublicUrl(initialValues.chapter.file_id)
                .then((url) => {
                    if (url) {
                        setThumbnailPreview(url);
                    }
                })
                .catch((error) => {
                    console.error('Failed to load thumbnail:', error);
                });
        }
    }, [initialValues?.chapter.file_id, mode, getPublicUrl]);

    const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file && file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = (e) => {
                setSelectedImage(e.target?.result as string);
                setCropperOpen(true);
            };
            reader.readAsDataURL(file);
        } else {
            toast.error('Please select a valid image file');
        }
        // Reset input
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleImageCropped = async (croppedFile: File) => {
        setIsUploadingImage(true);
        try {
            const fileId = await uploadFile({
                file: croppedFile,
                setIsUploading: () => {},
                userId,
                source: 'CHAPTERS',
                sourceId: 'THUMBNAILS',
                publicUrl: true,
            });

            if (fileId) {
                form.setValue('thumbnailFileId', fileId);
                const publicUrl = await getPublicUrl(fileId);
                setThumbnailPreview(publicUrl);
                toast.success('Thumbnail uploaded successfully');
            }
        } catch (error) {
            console.error('Failed to upload thumbnail:', error);
            toast.error('Failed to upload thumbnail');
        } finally {
            setIsUploadingImage(false);
        }
    };

    const handleRemoveThumbnail = () => {
        form.setValue('thumbnailFileId', '');
        setThumbnailPreview(null);
    };

    const handleSelectAllForCourse = (
        courseId: string,
        levels: levelsWithPackageDetails,
        field: ControllerRenderProps<FormValues, `visibility.${string}`>,
        isDefaultSessionCourse: boolean
    ) => {
        const courseSessionId = isDefaultSessionCourse ? 'DEFAULT' : sessionId;

        const allPackageSessionIds = levels
            .map((level) => {
                const psId = getPackageSessionId({
                    courseId: courseId,
                    sessionId: courseSessionId,
                    levelId: level.level_dto.id,
                });
                return psId;
            })
            .filter((id): id is string => id !== null);

        const areAllSelected = allPackageSessionIds.every((psId) => field.value?.includes(psId));

        field.onChange(areAllSelected ? [] : allPackageSessionIds);
    };

    const onSubmit = useCallback(
        async (data: FormValues) => {
            try {
                const selectedPackageSessionIds = Object.values(data.visibility).flat().join(',');
                if (!selectedPackageSessionIds) {
                    toast.error('Please select at least one package for visibility');
                    return;
                }

                if (mode === 'create') {
                    const newChapter = {
                        id: crypto.randomUUID(),
                        chapter_name: data.chapterName,
                        status: 'true',
                        file_id: data.thumbnailFileId || '',
                        description:
                            'Click to view and access eBooks and video lectures for this chapter.',
                        chapter_order: 0,
                    };

                    await addChapterMutation.mutateAsync({
                        subjectId,
                        moduleId,
                        commaSeparatedPackageSessionIds: selectedPackageSessionIds,
                        chapter: newChapter,
                    });

                    toast.success('Chapter added successfully');
                } else {
                    if (!initialValues) {
                        toast.error('No chapter to update');
                        return;
                    }

                    const updatedChapter = {
                        ...initialValues.chapter,
                        chapter_name: data.chapterName,
                        file_id: data.thumbnailFileId || '',
                    };

                    await updateChapterMutation.mutateAsync({
                        chapterId: initialValues.chapter.id,
                        moduleId: moduleId,
                        commaSeparatedPackageSessionIds: selectedPackageSessionIds,
                        chapter: updatedChapter,
                    });

                    toast.success('Chapter updated successfully');
                }

                onSubmitSuccess();
            } catch (error) {
                console.error('Error handling chapter:', error);
                toast.error(`Failed to ${mode} chapter. Please try again.`);
            }
        },
        [
            mode,
            addChapterMutation,
            updateChapterMutation,
            initialValues,
            subjectId,
            moduleId,
            onSubmitSuccess,
        ]
    );

    const isPending =
        mode === 'create' ? addChapterMutation.isPending : updateChapterMutation.isPending;

    // Check if we should disable the form (when loading complete data in edit mode)
    const isFormDisabled = mode === 'edit' && isLoadingCompleteData;

    // Provide submit function and pending state to parent component
    useEffect(() => {
        if (onFormReady) {
            // Disable the external submit button when loading complete data
            const effectiveIsPending = isPending || isFormDisabled;
            onFormReady(() => form.handleSubmit(onSubmit)(), effectiveIsPending);
        }
    }, [onFormReady, form, onSubmit, isPending, isFormDisabled]);

    return (
        <Form {...form}>
            <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="flex max-h-[80vh] w-full flex-col gap-6 p-3 text-neutral-600"
            >
                {/* Loading indicator for complete data fetch */}
                {isLoadingCompleteData && mode === 'edit' && (
                    <div className="flex items-center gap-2 rounded-lg bg-blue-50 p-3 text-blue-700">
                        <div className="size-4 animate-spin rounded-full border-2 border-blue-300 border-t-blue-700"></div>
                        <span className="text-sm">Loading complete visibility data...</span>
                    </div>
                )}
                {/* Chapter Name field */}
                <FormField
                    control={form.control}
                    name="chapterName"
                    render={({ field }) => (
                        <FormItem>
                            <FormControl>
                                <MyInput
                                    label={`${getTerminology(
                                        ContentTerms.Chapters,
                                        SystemTerms.Chapters
                                    )} Name`}
                                    required={true}
                                    inputType="text"
                                    className="w-full"
                                    input={field.value}
                                    onChangeFunction={(e) => field.onChange(e.target.value)}
                                    disabled={isFormDisabled}
                                />
                            </FormControl>
                        </FormItem>
                    )}
                />

                {/* Thumbnail Upload field */}
                <FormField
                    control={form.control}
                    name="thumbnailFileId"
                    render={() => (
                        <FormItem>
                            <div className="flex flex-col gap-2">
                                <label className="text-subtitle font-semibold text-neutral-700">
                                    {getTerminology(ContentTerms.Chapters, SystemTerms.Chapters)}{' '}
                                    Thumbnail
                                    <span className="ml-1 font-normal text-neutral-500">
                                        (Optional)
                                    </span>
                                </label>
                                <div className="text-body text-neutral-500">
                                    Upload a thumbnail image for this chapter. The image will be
                                    cropped to maintain consistency.
                                </div>
                                {thumbnailPreview ? (
                                    <div className="relative h-20 w-32 overflow-hidden rounded-lg border border-neutral-200 bg-neutral-50">
                                        <img
                                            src={thumbnailPreview}
                                            alt="Thumbnail preview"
                                            className="size-full object-cover"
                                        />
                                        <button
                                            type="button"
                                            onClick={handleRemoveThumbnail}
                                            className="absolute right-1 top-1 rounded-full bg-red-500 p-1 text-white transition-colors hover:bg-red-600"
                                            disabled={isUploadingImage || isFormDisabled}
                                        >
                                            <X size={12} />
                                        </button>
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-2">
                                        <input
                                            ref={fileInputRef}
                                            type="file"
                                            accept="image/*"
                                            onChange={handleImageSelect}
                                            className="hidden"
                                            disabled={isUploadingImage}
                                        />
                                        <MyButton
                                            type="button"
                                            buttonType="secondary"
                                            layoutVariant="default"
                                            scale="medium"
                                            onClick={() => fileInputRef.current?.click()}
                                            disabled={isUploadingImage || isFormDisabled}
                                            className="w-fit"
                                        >
                                            {isUploadingImage ? (
                                                <>Uploading...</>
                                            ) : (
                                                <>
                                                    <Upload size={16} className="mr-2" />
                                                    Select Thumbnail
                                                </>
                                            )}
                                        </MyButton>
                                    </div>
                                )}
                            </div>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <div className="flex flex-col gap-2 overflow-y-auto">
                    <div className="text-subtitle font-semibold">
                        {getTerminology(ContentTerms.Chapters, SystemTerms.Chapters)} Visibility
                    </div>
                    <div className="text-body text-neutral-500">
                        Select the levels you want to grant access to this chapter. Only the chosen
                        levels will be able to view the content. You can update visibility at any
                        time.
                    </div>

                    <div className="grid grid-cols-3 gap-6">
                        {coursesWithLevels
                            .sort((a, b) => {
                                // Get current form values for visibility
                                const formValues = form.getValues();

                                // Check if course A has any selected levels
                                const courseASelected =
                                    (formValues.visibility[a.package_dto.id] || []).length > 0;

                                // Check if course B has any selected levels
                                const courseBSelected =
                                    (formValues.visibility[b.package_dto.id] || []).length > 0;

                                // Sort: selected courses first, then unselected
                                if (courseASelected && !courseBSelected) return -1;
                                if (!courseASelected && courseBSelected) return 1;
                                return 0; // Keep original order for courses with same selection status
                            })
                            .map((course) => {
                                // Determine if this course is from DEFAULT session
                                const isDefaultSessionCourse = defaultSessionCourses.some(
                                    (defaultCourse) =>
                                        defaultCourse.package_dto.id === course.package_dto.id
                                );

                                return (
                                    <FormField
                                        key={course.package_dto.id}
                                        control={form.control}
                                        name={`visibility.${course.package_dto.id}`}
                                        render={({ field }) => {
                                            // Use the appropriate sessionId based on course source
                                            const courseSessionId = isDefaultSessionCourse
                                                ? 'DEFAULT'
                                                : sessionId;

                                            const levelPackageSessionIds = course.level
                                                .map((level) =>
                                                    getPackageSessionId({
                                                        courseId: course.package_dto.id,
                                                        sessionId: courseSessionId,
                                                        levelId: level.level_dto.id,
                                                    })
                                                )
                                                .filter((id): id is string => id !== null);

                                            const allSelected = levelPackageSessionIds.every(
                                                (psId) => field.value?.includes(psId)
                                            );

                                            return (
                                                <FormItem
                                                    key={course.package_dto.id}
                                                    className="flex flex-col gap-2 rounded-lg border border-neutral-200 p-4"
                                                >
                                                    <div className="flex items-center gap-2">
                                                        <Checkbox
                                                            className="bg-white"
                                                            checked={allSelected}
                                                            onCheckedChange={() => {
                                                                handleSelectAllForCourse(
                                                                    course.package_dto.id,
                                                                    course.level,
                                                                    field,
                                                                    isDefaultSessionCourse
                                                                );
                                                            }}
                                                            disabled={isFormDisabled}
                                                            aria-label="Select all"
                                                        />
                                                        <span className="font-semibold">
                                                            {course.package_dto.package_name}
                                                            {isDefaultSessionCourse && ' (Default)'}
                                                        </span>
                                                    </div>

                                                    {/* Only show level checkboxes for non-DEFAULT session courses */}
                                                    {!isDefaultSessionCourse && (
                                                        <FormControl>
                                                            <div className="flex flex-col gap-2 pl-6">
                                                                {course.level.map((level) => {
                                                                    const packageSessionId =
                                                                        getPackageSessionId({
                                                                            courseId:
                                                                                course.package_dto
                                                                                    .id,
                                                                            sessionId:
                                                                                courseSessionId,
                                                                            levelId:
                                                                                level.level_dto.id,
                                                                        });

                                                                    return (
                                                                        <label
                                                                            key={level.level_dto.id}
                                                                            className="flex items-center gap-2"
                                                                        >
                                                                            <Checkbox
                                                                                checked={
                                                                                    packageSessionId
                                                                                        ? (
                                                                                              field.value ||
                                                                                              []
                                                                                          ).includes(
                                                                                              packageSessionId
                                                                                          )
                                                                                        : false
                                                                                }
                                                                                disabled={
                                                                                    isFormDisabled
                                                                                }
                                                                                onCheckedChange={(
                                                                                    checked: boolean
                                                                                ) => {
                                                                                    if (
                                                                                        !packageSessionId
                                                                                    )
                                                                                        return;

                                                                                    const newValue =
                                                                                        checked
                                                                                            ? [
                                                                                                  ...(field.value ||
                                                                                                      []),
                                                                                                  packageSessionId,
                                                                                              ]
                                                                                            : (
                                                                                                  field.value ||
                                                                                                  []
                                                                                              ).filter(
                                                                                                  (
                                                                                                      id
                                                                                                  ) =>
                                                                                                      id !==
                                                                                                      packageSessionId
                                                                                              );

                                                                                    field.onChange(
                                                                                        newValue
                                                                                    );
                                                                                }}
                                                                            />
                                                                            <span className="text-sm">
                                                                                {
                                                                                    level.level_dto
                                                                                        .level_name
                                                                                }
                                                                            </span>
                                                                        </label>
                                                                    );
                                                                })}
                                                            </div>
                                                        </FormControl>
                                                    )}
                                                </FormItem>
                                            );
                                        }}
                                    />
                                );
                            })}
                    </div>
                </div>
                {/* Submit button - conditionally hidden and only shown after data is loaded */}
                {!hideSubmitButton && (
                    <div className="flex w-full items-center justify-start bg-white">
                        {/* Show loading message instead of button when fetching data */}
                        {isLoadingCompleteData && mode === 'edit' ? (
                            <div className="flex items-center gap-2 text-neutral-500">
                                <div className="size-4 animate-spin rounded-full border-2 border-neutral-300 border-t-neutral-500"></div>
                                <span className="text-sm">
                                    Please wait while we load complete data...
                                </span>
                            </div>
                        ) : (
                            <MyButton
                                type="submit"
                                buttonType="primary"
                                scale="large"
                                layoutVariant="default"
                                className="w-fit"
                                disabled={isPending}
                            >
                                {isPending
                                    ? `${mode === 'create' ? 'Adding' : 'Updating'}...`
                                    : mode === 'create'
                                      ? `Add ${getTerminology(ContentTerms.Chapters, SystemTerms.Chapters)}`
                                      : `Edit ${getTerminology(ContentTerms.Chapters, SystemTerms.Chapters)}`}
                            </MyButton>
                        )}
                    </div>
                )}

                {/* Image Cropper Dialog */}
                <ImageCropperDialog
                    open={cropperOpen}
                    onOpenChange={setCropperOpen}
                    src={selectedImage || ''}
                    aspectRatio={2.64} // 2.64:1 aspect ratio for chapter thumbnails
                    title="Crop Chapter Thumbnail"
                    outputMimeType="image/jpeg"
                    outputQuality={0.9}
                    confirmLabel="Save Thumbnail"
                    onCropped={handleImageCropped}
                />
            </form>
        </Form>
    );
};
