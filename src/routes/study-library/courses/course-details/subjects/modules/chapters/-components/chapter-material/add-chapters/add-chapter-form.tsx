import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormField, FormItem } from '@/components/ui/form';
import { MyInput } from '@/components/design-system/input';
import { MyButton } from '@/components/design-system/button';
import { ChapterWithSlides } from '@/stores/study-library/use-modules-with-chapters-store';
import { useAddChapter } from '@/routes/study-library/courses/course-details/subjects/modules/chapters/-services/add-chapter';
import { useRouter } from '@tanstack/react-router';
import { toast } from 'sonner';
import { useUpdateChapter } from '@/routes/study-library/courses/course-details/subjects/modules/chapters/-services/update-chapter';
import { useInstituteDetailsStore } from '@/stores/students/students-list/useInstituteDetailsStore';
import { useGetPackageSessionId } from '@/utils/helpers/study-library-helpers.ts/get-list-from-stores/getPackageSessionId';
import { getTerminology } from '@/components/common/layout-container/sidebar/utils';
import { ContentTerms, SystemTerms } from '@/routes/settings/-components/NamingSettings';

const formSchema = z.object({
    chapterName: z.string().min(1, 'Chapter name is required'),
    visibility: z.record(z.string(), z.array(z.string())),
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
}

export const AddChapterForm = ({
    initialValues,
    onSubmitSuccess,
    mode,
    module_id,
    session_id,
    level_id,
    subject_id,
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
            visibility: initialValues?.chapter_in_package_sessions
                ? initialValues.chapter_in_package_sessions.reduce(
                      (acc, psId) => {
                          // Find which course this packageSessionId belongs to
                          for (const course of coursesWithLevels) {
                              const isDefaultSessionCourse = defaultSessionCourses.some(
                                  (defaultCourse) =>
                                      defaultCourse.package_dto.id === course.package_dto.id
                              );
                              const courseSessionId = isDefaultSessionCourse
                                  ? 'DEFAULT'
                                  : sessionId;

                              for (const level of course.level) {
                                  const coursePackageSessionId = getPackageSessionId({
                                      courseId: course.package_dto.id,
                                      sessionId: courseSessionId,
                                      levelId: level.level_dto.id,
                                  });

                                  if (coursePackageSessionId === psId) {
                                      // Add to that course's array
                                      acc[course.package_dto.id] = [
                                          ...(acc[course.package_dto.id] || []),
                                          psId,
                                      ];
                                      break;
                                  }
                              }
                          }
                          return acc;
                      },
                      { ...defaultVisibility }
                  )
                : {
                      ...defaultVisibility,
                      [courseId]: package_session_id ? [package_session_id] : [],
                  },
        },
    });

    const onSubmit = async (data: FormValues) => {
        try {
            if (mode === 'create') {
                const newChapter = {
                    id: crypto.randomUUID(),
                    chapter_name: data.chapterName,
                    status: 'true',
                    file_id: '',
                    description:
                        'Click to view and access eBooks and video lectures for this chapter.',
                    chapter_order: 0,
                };

                await addChapterMutation.mutateAsync({
                    subjectId,
                    moduleId,
                    commaSeparatedPackageSessionIds:
                        getPackageSessionId({
                            courseId,
                            levelId,
                            sessionId,
                        }) || '',
                    chapter: newChapter,
                });

                toast.success(
                    `${getTerminology(ContentTerms.Chapters, SystemTerms.Chapters)} added successfully`
                );
            } else {
                if (!initialValues) {
                    toast.error(
                        `No ${getTerminology(ContentTerms.Chapters, SystemTerms.Chapters)} to update`
                    );
                    return;
                }

                const updatedChapter = {
                    ...initialValues.chapter,
                    chapter_name: data.chapterName,
                };

                await updateChapterMutation.mutateAsync({
                    chapterId: initialValues.chapter.id,
                    moduleId: moduleId,
                    commaSeparatedPackageSessionIds:
                        getPackageSessionId({
                            courseId,
                            levelId,
                            sessionId,
                        }) || '',
                    chapter: updatedChapter,
                });

                toast.success(
                    `${getTerminology(ContentTerms.Chapters, SystemTerms.Chapters)} updated successfully`
                );
            }

            onSubmitSuccess();
        } catch (error) {
            console.error('Error handling chapter:', error);
            toast.error(
                `Failed to ${mode} ${getTerminology(ContentTerms.Chapters, SystemTerms.Chapters)}. Please try again.`
            );
        }
    };

    const isPending =
        mode === 'create' ? addChapterMutation.isPending : updateChapterMutation.isPending;

    return (
        <Form {...form}>
            <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="flex max-h-[80vh] w-full flex-col gap-6 p-3 text-neutral-600"
            >
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
                                />
                            </FormControl>
                        </FormItem>
                    )}
                />

                {/* Submit button */}
                <div className="flex w-full items-center justify-start bg-white">
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
                </div>
            </form>
        </Form>
    );
};
