import { useForm } from "react-hook-form";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form";
import { MyInput } from "@/components/design-system/input";
import { MyButton } from "@/components/design-system/button";
import { useGetBatchNames } from "@/hooks/student-list-section/useFilters";
import { BatchCheckboxGroup } from "./batches";
import { organizeBatchesByClass } from "./utils/organize-batches";
import { ChapterWithSlides } from "@/stores/study-library/use-modules-with-chapters-store";
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
    // studyLibraryVersion: z.string().min(1, "Study library version is required"),
    visibility: z.object({
        tenthClass: z.string().array(),
        ninthClass: z.string().array(),
        eighthClass: z.string().array(),
    }),
});

type FormValues = z.infer<typeof formSchema>;

interface AddChapterFormProps {
    initialValues?: ChapterWithSlides;
    onSubmitSuccess: (chapter: ChapterWithSlides) => void;
}

export const AddChapterForm = ({ initialValues, onSubmitSuccess }: AddChapterFormProps) => {
    const batches = useGetBatchNames();
    const organizedBatches = organizeBatchesByClass(batches);

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            chapterName: initialValues?.chapter.chapter_name || "",
            // studyLibraryVersion: initialValues?.studyLibraryVersion || "Default",
            visibility: {
                tenthClass: [],
                ninthClass: [],
                eighthClass: [],
            },
        },
    });

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
                className="flex w-full flex-col gap-6 text-neutral-600"
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
                                    className="w-[352px]"
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
                    <div className="flex justify-between">
                        {Object.entries(organizedBatches).map(([classLevel, classBatches]) => {
                            const classKey = classLevel.toLowerCase().includes("10th")
                                ? "tenthClass"
                                : classLevel.toLowerCase().includes("9th")
                                  ? "ninthClass"
                                  : "eighthClass";

                            return (
                                <FormField
                                    key={classLevel}
                                    control={form.control}
                                    name={`visibility.${classKey}`}
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormControl>
                                                <BatchCheckboxGroup
                                                    classLevel={classLevel}
                                                    batches={classBatches}
                                                    selectedBatches={field.value}
                                                    onChange={field.onChange}
                                                />
                                            </FormControl>
                                        </FormItem>
                                    )}
                                />
                            );
                        })}
                    </div>
                </div>

                {/* This will be used in case of Vacademy */}

                {/* <FormField
                    control={form.control}
                    name="studyLibraryVersion"
                    render={({ field }) => (
                        <FormItem>
                            <FormControl>
                                <div>
                                    <div className="mb-1">Study Library Version</div>
                                    <MyDropdown
                                        placeholder="Select Version"
                                        currentValue={field.value}
                                        dropdownList={studyLibraryVersions}
                                        onSelect={field.onChange}
                                    />
                                </div>
                            </FormControl>
                        </FormItem>
                    )}
                /> */}

                <div className="flex w-full items-center justify-end px-6 py-4">
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
