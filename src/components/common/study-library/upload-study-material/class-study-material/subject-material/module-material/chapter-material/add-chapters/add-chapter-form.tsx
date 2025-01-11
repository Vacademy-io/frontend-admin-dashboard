import { useForm } from "react-hook-form";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form";
import { MyInput } from "@/components/design-system/input";
import { MyButton } from "@/components/design-system/button";
import { MyDropdown } from "@/components/design-system/dropdown";
import { useGetBatchNames } from "@/hooks/student-list-section/useFilters";

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
    studyLibraryVersion: z.string().min(1, "Study library version is required"),
    visibility: z.object({
        tenthClass: z.string().array(),
        ninthClass: z.string().array(),
        eighthClass: z.string().array(),
    }),
});

type FormValues = z.infer<typeof formSchema>;

export interface ChapterType {
    name: string;
    description: string;
    studyLibraryVersion: string;
    visibility: {
        tenthClass: string[];
        ninthClass: string[];
        eighthClass: string[];
    };
    resourceCount?: {
        ebooks: number;
        videos: number;
    };
}

interface AddChapterFormProps {
    initialValues?: ChapterType;
    onSubmitSuccess: (chapter: ChapterType) => void;
}

// Helper function to organize batches by class
interface OrganizedBatches {
    "10th Year/Class": string[];
    "9th Year/Class": string[];
    "8th Year/Class": string[];
}

const organizeBatchesByClass = (batches: string[]) => {
    const organized: OrganizedBatches = {
        "10th Year/Class": [],
        "9th Year/Class": [],
        "8th Year/Class": [],
    };

    batches.forEach((batch) => {
        if (batch.startsWith("10th")) {
            organized["10th Year/Class"].push(batch);
        } else if (batch.startsWith("9th")) {
            organized["9th Year/Class"].push(batch);
        } else if (batch.startsWith("8th")) {
            organized["8th Year/Class"].push(batch);
        }
    });

    return organized;
};

interface BatchCheckboxGroupProps {
    classLevel: string;
    batches: string[];
    selectedBatches: string[];
    onChange: (batches: string[]) => void;
}

const BatchCheckboxGroup = ({
    classLevel,
    batches,
    selectedBatches,
    onChange,
}: BatchCheckboxGroupProps) => {
    const handleMainCheckboxChange = (checked: boolean) => {
        if (checked) {
            onChange(batches);
        } else {
            onChange([]);
        }
    };

    const handleBatchCheckboxChange = (batch: string, checked: boolean) => {
        if (checked) {
            onChange([...selectedBatches, batch]);
        } else {
            onChange(selectedBatches.filter((b) => b !== batch));
        }
    };

    const isMainChecked =
        batches.length > 0 && batches.every((batch) => selectedBatches.includes(batch));
    const isIndeterminate = selectedBatches.length > 0 && !isMainChecked;

    return (
        <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
                <MyCheckbox
                    checked={isMainChecked}
                    indeterminate={isIndeterminate}
                    onCheckedChange={handleMainCheckboxChange}
                />
                <span className="font-semibold">{classLevel}</span>
            </div>
            <div className="ml-6 flex flex-col gap-2">
                {batches.map((batch, index) => (
                    <div key={index} className="flex items-center gap-2">
                        <MyCheckbox
                            checked={selectedBatches.includes(batch)}
                            onCheckedChange={(checked) => handleBatchCheckboxChange(batch, checked)}
                        />
                        <span>{batch}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

export const AddChapterForm = ({ initialValues, onSubmitSuccess }: AddChapterFormProps) => {
    const batches = useGetBatchNames();
    const organizedBatches = organizeBatchesByClass(batches);

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            chapterName: initialValues?.name || "",
            studyLibraryVersion: initialValues?.studyLibraryVersion || "Default",
            visibility: {
                tenthClass: initialValues?.visibility.tenthClass || [],
                ninthClass: initialValues?.visibility.ninthClass || [],
                eighthClass: initialValues?.visibility.eighthClass || [],
            },
        },
    });

    const onSubmit = (data: FormValues) => {
        const newChapter = {
            name: data.chapterName,
            studyLibraryVersion: data.studyLibraryVersion,
            visibility: data.visibility,
            description: "Click to view and access eBooks and video lectures for this chapter.", // Add default description
        };
        onSubmitSuccess(newChapter);
    };

    const studyLibraryVersions = ["Default", "Version 1", "Version 2"];

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

                <FormField
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
                />

                <div className="w-full px-6 py-4">
                    <MyButton
                        type="submit"
                        buttonType="primary"
                        scale="large"
                        layoutVariant="default"
                        className="w-full"
                    >
                        Save
                    </MyButton>
                </div>
            </form>
        </Form>
    );
};
