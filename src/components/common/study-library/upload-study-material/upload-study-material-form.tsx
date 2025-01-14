import { Form, FormControl, FormField, FormItem } from "@/components/ui/form";
import { MyDropdown } from "@/components/design-system/dropdown";
import { MyButton } from "@/components/design-system/button";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useGetSessions } from "@/hooks/student-list-section/useFilters";

const formSchema = z.object({
    session: z.string().min(1, "This field is required"),
    year_class: z.string().min(1, "This field is required"),
    subject: z.string().min(1, "This field is required"),
    module: z.string().min(1, "This field is required"),
    chapter: z.string().min(1, "This field is required"),
    file_type: z.string().min(1, "This field is required"),
});

type FormValues = z.infer<typeof formSchema>;

export const UploadStudyMaterialForm = () => {
    const sessionList = useGetSessions();

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            session: "",
            year_class: "",
            subject: "",
            module: "",
            chapter: "",
            file_type: "",
        },
        mode: "onTouched",
    });

    const { watch } = form;
    const formValues = watch();

    // Define the form data with explicit string arrays instead of readonly tuples
    const formData: Array<{
        fieldName: keyof FormValues;
        label: string;
        placeholder: string;
        list: string[];
    }> = [
        {
            fieldName: "session",
            label: "Session",
            placeholder: "Select Session",
            list: sessionList,
        },
        {
            fieldName: "year_class",
            label: "Year/Class",
            placeholder: "Select Year/Class",
            list: ["10th Class", "9th Class", "8th Class"],
        },
        {
            fieldName: "subject",
            label: "Subject",
            placeholder: "Select Subject",
            list: ["Chemistry", "Biology", "Physics", "Olympiad", "Mathematics"],
        },
        {
            fieldName: "module",
            label: "Module",
            placeholder: "Select Module",
            list: ["Live Session", "NCERT"],
        },
        {
            fieldName: "chapter",
            label: "Chapter",
            placeholder: "Select Chapter",
            list: [
                "Chapter 1: Light - Reflection and Refraction",
                "Chapter 2: The Human Eye and The Colourful World",
                "Chapter 3: Extra Numericals For Light and Human Eye",
            ],
        },
        {
            fieldName: "file_type",
            label: "File Type",
            placeholder: "Select File Type",
            list: ["E-Book", "Video"],
        },
    ];

    const isDropdownDisabled = (fieldName: keyof FormValues): boolean => {
        const fields: Array<keyof FormValues> = [
            "session",
            "year_class",
            "subject",
            "module",
            "chapter",
            "file_type",
        ];
        const currentIndex = fields.indexOf(fieldName);
        if (currentIndex === 0) return false;

        // Get the previous field and ensure it exists
        const previousField = fields[currentIndex - 1];
        return previousField ? !formValues[previousField] : false;
    };

    const onSubmit = (data: FormValues) => {
        console.log(data);
        // Handle form submission
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {formData.map((field) => (
                    <FormField
                        key={field.fieldName}
                        control={form.control}
                        name={field.fieldName}
                        render={({ field: { onChange, value }, fieldState }) => (
                            <FormItem>
                                <FormControl>
                                    <div className="flex flex-col gap-1">
                                        <div className="flex items-center gap-1">
                                            <span>{field.label}</span>
                                            <span className="text-primary-500">*</span>
                                        </div>
                                        <MyDropdown
                                            placeholder={field.placeholder}
                                            currentValue={value}
                                            dropdownList={field.list}
                                            onSelect={(selectedValue) => {
                                                onChange(selectedValue);
                                                form.trigger(field.fieldName);
                                            }}
                                            disable={isDropdownDisabled(field.fieldName)}
                                            error={fieldState.error?.message}
                                        />
                                    </div>
                                </FormControl>
                            </FormItem>
                        )}
                    />
                ))}
                <div className="w-full px-6 py-4">
                    <MyButton
                        type="submit"
                        buttonType="primary"
                        layoutVariant="default"
                        scale="large"
                        className="w-full"
                    >
                        Submit
                    </MyButton>
                </div>
            </form>
        </Form>
    );
};
