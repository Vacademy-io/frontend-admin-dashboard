import { Form, FormControl, FormField, FormItem } from "@/components/ui/form";
import { MyDropdown } from "@/components/design-system/dropdown";
import { MyButton } from "@/components/design-system/button";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useGetSessions } from "@/hooks/student-list-section/useFilters";

export type AvailableFields =
    | "session"
    | "year_class"
    | "subject"
    | "module"
    | "chapter"
    | "file_type";

export type StudyMaterialDetailsFormProps = {
    fields: AvailableFields[];
    onFormSubmit: (data: unknown) => void;
    submitButtonName: string;
};

type FieldConfig = {
    label: string;
    placeholder: string;
    getList: () => string[];
};

// Later when APIs are integrated, replace the array returns with actual API calls
const FIELD_CONFIG: Record<AvailableFields, FieldConfig> = {
    session: {
        label: "Session",
        placeholder: "Select Session",
        getList: useGetSessions,
    },
    year_class: {
        label: "Year/Class",
        placeholder: "Select Year/Class",
        getList: () => ["10th Class", "9th Class", "8th Class"], // Will be replaced with API call
    },
    subject: {
        label: "Subject",
        placeholder: "Select Subject",
        getList: () => ["Chemistry", "Biology", "Physics", "Olympiad", "Mathematics"], // Will be replaced with API call
    },
    module: {
        label: "Module",
        placeholder: "Select Module",
        getList: () => ["Live Session", "NCERT"], // Will be replaced with API call
    },
    chapter: {
        label: "Chapter",
        placeholder: "Select Chapter",
        getList: () => [
            "Chapter 1: Light - Reflection and Refraction",
            "Chapter 2: The Human Eye and The Colourful World",
            "Chapter 3: Extra Numericals For Light and Human Eye",
        ], // Will be replaced with API call
    },
    file_type: {
        label: "File Type",
        placeholder: "Select File Type",
        getList: () => ["E-Book", "Video"], // Will be replaced with API call
    },
};

export const StudyMaterialDetailsForm = ({
    fields,
    onFormSubmit,
    submitButtonName,
}: StudyMaterialDetailsFormProps) => {
    const createDynamicSchema = () => {
        const schemaObject: Record<string, z.ZodString> = {};
        fields.forEach((field) => {
            schemaObject[field] = z.string().min(1, "This field is required");
        });
        return z.object(schemaObject);
    };

    const formSchema = createDynamicSchema();
    type FormValues = z.infer<typeof formSchema>;

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: fields.reduce(
            (acc, field) => ({
                ...acc,
                [field]: "",
            }),
            {},
        ),
        mode: "onTouched",
    });

    const { watch } = form;
    const formValues = watch();

    const isDropdownDisabled = (fieldName: AvailableFields): boolean => {
        const currentIndex = fields.indexOf(fieldName);
        if (currentIndex === 0) return false;

        const previousField = fields[currentIndex - 1];
        return previousField ? !formValues[previousField] : false;
    };

    const onSubmit = (data: FormValues) => {
        onFormSubmit(data);
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {fields.map((fieldName) => {
                    const config = FIELD_CONFIG[fieldName];
                    const list = config.getList();

                    return (
                        <FormField
                            key={fieldName}
                            control={form.control}
                            name={fieldName}
                            render={({ field: { onChange, value }, fieldState }) => (
                                <FormItem>
                                    <FormControl>
                                        <div className="flex flex-col gap-1">
                                            <div className="flex items-center gap-1">
                                                <span>{config.label}</span>
                                                <span className="text-primary-500">*</span>
                                            </div>
                                            <MyDropdown
                                                placeholder={config.placeholder}
                                                currentValue={value}
                                                dropdownList={list}
                                                onSelect={(selectedValue) => {
                                                    onChange(selectedValue);
                                                    form.trigger(fieldName);
                                                }}
                                                disable={isDropdownDisabled(fieldName)}
                                                error={fieldState.error?.message}
                                            />
                                        </div>
                                    </FormControl>
                                </FormItem>
                            )}
                        />
                    );
                })}
                <div className="w-full px-6 py-4">
                    <MyButton
                        type="submit"
                        buttonType="primary"
                        layoutVariant="default"
                        scale="large"
                        className="w-full"
                    >
                        {submitButtonName}
                    </MyButton>
                </div>
            </form>
        </Form>
    );
};
