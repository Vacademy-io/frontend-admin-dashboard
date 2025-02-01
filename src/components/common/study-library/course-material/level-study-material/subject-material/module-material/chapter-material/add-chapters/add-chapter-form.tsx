import { ControllerRenderProps, useForm } from "react-hook-form";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form";
import { MyInput } from "@/components/design-system/input";
import { MyButton } from "@/components/design-system/button";
import { ChapterWithSlides } from "@/stores/study-library/use-modules-with-chapters-store";
import {
    GetLevelsWithPackages,
    PackageSession,
} from "@/utils/helpers/study-library-helpers.ts/get-list-from-stores/getLevelsWithPackages";

interface CheckboxProps {
    checked?: boolean;
    indeterminate?: boolean;
    onCheckedChange?: (checked: boolean) => void;
}

export const MyCheckbox = ({ checked, indeterminate, onCheckedChange }: CheckboxProps) => {
    return (
        <input
            type="checkbox"
            checked={checked}
            ref={(input) => {
                if (input) {
                    input.indeterminate = indeterminate || false;
                }
            }}
            onChange={(e) => onCheckedChange?.(e.target.checked)}
            className="text-primary-600 h-4 w-4 rounded border-neutral-300 bg-primary-500"
        />
    );
};

// Form schema
const formSchema = z.object({
    chapterName: z.string().min(1, "Chapter name is required"),
    visibility: z.record(z.string(), z.array(z.string())), // Dynamic fields for each level's packages
});

type FormValues = z.infer<typeof formSchema>;

interface AddChapterFormProps {
    initialValues?: ChapterWithSlides;
    onSubmitSuccess: (chapter: ChapterWithSlides) => void;
}

export const AddChapterForm = ({ initialValues, onSubmitSuccess }: AddChapterFormProps) => {
    const levelsWithPackages = GetLevelsWithPackages();

    const defaultVisibility = levelsWithPackages.reduce(
        (acc, level) => {
            acc[level.level.id] = [];
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

    const handleSelectAllForLevel = (
        levelId: string,
        packages: PackageSession[],
        field: ControllerRenderProps<FormValues, `visibility.${string}`>,
    ) => {
        const allPackageIds = packages.map((pkg) => pkg.package_session_id);
        const areAllSelected = packages.every(
            (pkg) => field.value?.includes(pkg.package_session_id),
        );

        // If all are selected, unselect all. Otherwise, select all
        field.onChange(areAllSelected ? [] : allPackageIds);
    };

    const onSubmit = (data: FormValues) => {
        const newChapter: ChapterWithSlides = {
            chapter: {
                id: crypto.randomUUID(),
                chapter_name: data.chapterName,
                status: "true",
                file_id: "",
                description: "",
                chapter_order: 0,
            },
            slides_count: {
                video_count: 0,
                pdf_count: 0,
                doc_count: 0,
                unknown_count: 0,
            },
        };
        onSubmitSuccess(newChapter);
    };

    // const studyLibraryVersions = ["Default", "Version 1", "Version 2"];

    return (
        <Form {...form}>
            <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="flex max-h-[80vh] w-full flex-col gap-6 overflow-y-auto p-6 text-neutral-600"
            >
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
                        Select the batches you want to grant access to this chapter. Only the chosen
                        batches will be able to view the content. You can update visibility at any
                        time.
                    </div>

                    <div className="grid grid-cols-3 gap-6">
                        {levelsWithPackages.map((levelData) => (
                            <FormField
                                key={levelData.level.id}
                                control={form.control}
                                name={`visibility.${levelData.level.id}`}
                                render={({ field }) => (
                                    <FormItem className="flex flex-col gap-2 rounded-lg border border-neutral-200 p-4">
                                        <div className="flex items-center gap-2">
                                            <input
                                                type="checkbox"
                                                checked={levelData.package_sessions.every(
                                                    (pkg) =>
                                                        field.value?.includes(
                                                            pkg.package_session_id,
                                                        ),
                                                )}
                                                onChange={() =>
                                                    handleSelectAllForLevel(
                                                        levelData.level.id,
                                                        levelData.package_sessions,
                                                        field,
                                                    )
                                                }
                                                className="h-4 w-4 rounded border-neutral-300"
                                            />
                                            <span className="font-semibold">
                                                {levelData.level.level_name}
                                            </span>
                                        </div>
                                        <FormControl>
                                            <div className="flex flex-col gap-2 pl-6">
                                                {levelData.package_sessions.map((pkg) => (
                                                    <label
                                                        key={pkg.package_session_id}
                                                        className="flex items-center gap-2"
                                                    >
                                                        <input
                                                            type="checkbox"
                                                            checked={field.value?.includes(
                                                                pkg.package_session_id,
                                                            )}
                                                            onChange={(e) => {
                                                                const newValue = e.target.checked
                                                                    ? [
                                                                          ...(field.value || []),
                                                                          pkg.package_session_id,
                                                                      ]
                                                                    : field.value?.filter(
                                                                          (id) =>
                                                                              id !==
                                                                              pkg.package_session_id,
                                                                      );
                                                                field.onChange(newValue);
                                                            }}
                                                            className="h-4 w-4 rounded border-neutral-300"
                                                        />
                                                        <span className="text-sm">
                                                            {pkg.package_dto.package_name}
                                                        </span>
                                                    </label>
                                                ))}
                                            </div>
                                        </FormControl>
                                    </FormItem>
                                )}
                            />
                        ))}
                    </div>
                </div>

                <div className="sticky bottom-0 flex w-full items-center justify-end bg-white py-4">
                    <MyButton
                        type="submit"
                        buttonType="primary"
                        scale="large"
                        layoutVariant="default"
                        className="w-fit"
                    >
                        Save
                    </MyButton>
                </div>
            </form>
        </Form>
    );
};
