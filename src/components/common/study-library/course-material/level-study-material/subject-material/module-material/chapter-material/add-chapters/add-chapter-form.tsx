import { ControllerRenderProps, useForm } from "react-hook-form";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form";
import { MyInput } from "@/components/design-system/input";
import { MyButton } from "@/components/design-system/button";
import { ChapterWithSlides } from "@/stores/study-library/use-modules-with-chapters-store";
import { useAddChapter } from "@/services/study-library/chapter-operations/add-chapter";
import { useRouter } from "@tanstack/react-router";
import { toast } from "sonner";
import { useUpdateChapter } from "@/services/study-library/chapter-operations/update-chapter";
import { useSelectedSessionStore } from "@/stores/study-library/selected-session-store";
import { useInstituteDetailsStore } from "@/stores/students/students-list/useInstituteDetailsStore";
import { LevelSchema } from "@/schemas/student/student-list/institute-schema";
import { useEffect } from "react";

// // Form schema
const formSchema = z.object({
    chapterName: z.string().min(1, "Chapter name is required"),
    visibility: z.record(z.string(), z.array(z.string())),
});

type FormValues = z.infer<typeof formSchema>;

interface AddChapterFormProps {
    initialValues?: ChapterWithSlides;
    onSubmitSuccess: (chapter: ChapterWithSlides) => void;
    mode: "create" | "edit";
}

export const AddChapterForm = ({ initialValues, onSubmitSuccess, mode }: AddChapterFormProps) => {
    const router = useRouter();
    // const courseId: string = router.state.location.search.courseId || "";
    // const levelId: string = router.state.location.search.levelId || "";
    const { selectedSession } = useSelectedSessionStore();
    const sessionId: string = selectedSession?.id || "";
    const moduleId: string = router.state.location.search.moduleId || "";
    const addChapterMutation = useAddChapter();
    const updateChapterMutation = useUpdateChapter();
    // const package_session_id = useGetPackageSessionId(courseId, sessionId, levelId) || "";
    const { getPackageWiseLevels, getPackageSessionId } = useInstituteDetailsStore();
    const coursesWithLevels = getPackageWiseLevels({
        sessionId: sessionId,
    });

    useEffect(() => {
        console.log("session id: ", sessionId);
    }, []);

    // Create default visibility object
    const defaultVisibility = coursesWithLevels.reduce(
        (acc, course) => {
            acc[course.package_dto.id] = [];
            return acc;
        },
        {} as Record<string, string[]>,
    );

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            chapterName: initialValues?.chapter.chapter_name || "",
            visibility: defaultVisibility,
        },
    });

    const handleSelectAllForCourse = (
        courseId: string,
        levels: (typeof LevelSchema._type)[],
        field: ControllerRenderProps<FormValues, `visibility.${string}`>,
    ) => {
        const allPackageSessionIds = levels
            .map((level) => {
                const psId = getPackageSessionId({
                    courseId: courseId,
                    sessionId: sessionId,
                    levelId: level.id,
                });
                console.log(`Getting PSId for level ${level.id}:`, psId);
                return psId;
            })
            .filter((id): id is string => id !== null);

        console.log("All Package Session IDs:", allPackageSessionIds);

        const areAllSelected = allPackageSessionIds.every((psId) => field.value?.includes(psId));

        field.onChange(areAllSelected ? [] : allPackageSessionIds);
    };

    const onSubmit = async (data: FormValues) => {
        try {
            const selectedPackageSessionIds = Object.values(data.visibility).flat().join(",");
            console.log(selectedPackageSessionIds);
            if (!selectedPackageSessionIds) {
                toast.error("Please select at least one package for visibility");
                return;
            }

            let resultChapter: ChapterWithSlides;

            if (mode === "create") {
                const newChapter = {
                    id: crypto.randomUUID(),
                    chapter_name: data.chapterName,
                    status: "true",
                    file_id: "",
                    description:
                        "Click to view and access eBooks and video lectures for this chapter.",
                    chapter_order: 0,
                };

                await addChapterMutation.mutateAsync({
                    moduleId,
                    commaSeparatedPackageSessionIds: selectedPackageSessionIds,
                    chapter: newChapter,
                });

                resultChapter = {
                    chapter: newChapter,
                    slides_count: {
                        video_count: 0,
                        pdf_count: 0,
                        doc_count: 0,
                        unknown_count: 0,
                    },
                };

                toast.success("Chapter added successfully");
            } else {
                if (!initialValues) {
                    toast.error("No chapter to update");
                    return;
                }

                const updatedChapter = {
                    ...initialValues.chapter,
                    chapter_name: data.chapterName,
                };

                await updateChapterMutation.mutateAsync({
                    chapterId: initialValues.chapter.id,
                    commaSeparatedPackageSessionIds: selectedPackageSessionIds,
                    chapter: updatedChapter,
                });

                resultChapter = {
                    ...initialValues,
                    chapter: updatedChapter,
                };

                toast.success("Chapter updated successfully");
            }

            onSubmitSuccess(resultChapter);
        } catch (error) {
            console.error("Error handling chapter:", error);
            toast.error(`Failed to ${mode} chapter. Please try again.`);
        }
    };

    const isPending =
        mode === "create" ? addChapterMutation.isPending : updateChapterMutation.isPending;

    return (
        <Form {...form}>
            <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="flex max-h-[80vh] w-full flex-col gap-6 overflow-y-auto p-6 text-neutral-600"
            >
                {/* Chapter Name field remains the same */}
                <FormField
                    control={form.control}
                    name="chapterName"
                    render={({ field }) => (
                        <FormItem>
                            <FormControl>
                                <MyInput
                                    label="Chapter Name"
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

                <div className="flex flex-col gap-4">
                    <div className="text-subtitle font-semibold">Chapter Visibility</div>
                    <div className="text-body text-neutral-500">
                        Select the levels you want to grant access to this chapter.
                    </div>

                    <div className="grid grid-cols-3 gap-6">
                        {coursesWithLevels.map((course) => (
                            <FormField
                                key={course.package_dto.id}
                                control={form.control}
                                name={`visibility.${course.package_dto.id}`}
                                render={({ field }) => {
                                    const levelPackageSessionIds = course.levels
                                        .map((level) =>
                                            getPackageSessionId({
                                                courseId: course.package_dto.id,
                                                sessionId: sessionId,
                                                levelId: level.id,
                                            }),
                                        )
                                        .filter((id): id is string => id !== null);

                                    const allSelected = levelPackageSessionIds.every(
                                        (psId) => field.value?.includes(psId),
                                    );

                                    return (
                                        <FormItem
                                            key={course.package_dto.id}
                                            className="flex flex-col gap-2 rounded-lg p-4"
                                        >
                                            <div className="flex items-center gap-2">
                                                <input
                                                    type="checkbox"
                                                    checked={allSelected}
                                                    onChange={() =>
                                                        handleSelectAllForCourse(
                                                            course.package_dto.id,
                                                            course.levels,
                                                            field,
                                                        )
                                                    }
                                                    className="h-4 w-4 rounded"
                                                />
                                                <span className="font-semibold">
                                                    {course.package_dto.package_name}
                                                </span>
                                            </div>
                                            <FormControl>
                                                <div className="flex flex-col gap-2 pl-6">
                                                    {course.levels.map((level) => {
                                                        const packageSessionId =
                                                            getPackageSessionId({
                                                                courseId: course.package_dto.id,
                                                                sessionId: sessionId,
                                                                levelId: level.id,
                                                            });

                                                        return (
                                                            <label
                                                                key={level.id}
                                                                className={`flex items-center gap-2 ${
                                                                    level.id === "DEFAULT"
                                                                        ? "visible"
                                                                        : "visible"
                                                                }`}
                                                            >
                                                                <input
                                                                    type="checkbox"
                                                                    checked={
                                                                        packageSessionId
                                                                            ? (
                                                                                  field.value || []
                                                                              ).includes(
                                                                                  packageSessionId,
                                                                              )
                                                                            : false
                                                                    }
                                                                    onChange={(e) => {
                                                                        if (!packageSessionId)
                                                                            return;

                                                                        const newValue = e.target
                                                                            .checked
                                                                            ? [
                                                                                  ...(field.value ||
                                                                                      []),
                                                                                  packageSessionId,
                                                                              ]
                                                                            : (
                                                                                  field.value || []
                                                                              ).filter(
                                                                                  (id) =>
                                                                                      id !==
                                                                                      packageSessionId,
                                                                              );
                                                                        field.onChange(newValue);
                                                                    }}
                                                                    className="h-4 w-4 rounded"
                                                                />
                                                                <span className="text-sm">
                                                                    {level.level_name}
                                                                </span>
                                                            </label>
                                                        );
                                                    })}
                                                </div>
                                            </FormControl>
                                        </FormItem>
                                    );
                                }}
                            />
                        ))}
                    </div>
                </div>

                {/* Submit button remains the same */}
                <div className="sticky bottom-0 flex w-full items-center justify-end bg-white py-4">
                    <MyButton
                        type="submit"
                        buttonType="primary"
                        scale="large"
                        layoutVariant="default"
                        className="w-fit"
                        disabled={isPending}
                    >
                        {isPending
                            ? `${mode === "create" ? "Adding" : "Updating"}...`
                            : mode === "create"
                              ? "Add Chapter"
                              : "Update Chapter"}
                    </MyButton>
                </div>
            </form>
        </Form>
    );
};
