import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { MyDropdown } from "@/components/design-system/dropdown";
import { MyButton } from "@/components/design-system/button";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useGetSessions } from "@/hooks/student-list-section/useFilterData";

// Form validation schema
const formSchema = z.object({
    session: z.string().min(1, "Please select a session"),
    year_class: z.string().min(1, "Please select a Year/Class"),
    subject: z.string().min(1, "Please select a Subject"),
    module: z.string().min(1, "Please select a Module"),
    chapter: z.string().min(1, "Please select a Chapter"),
});

export const CreateStudyDocForm = () => {
    const sessionList = useGetSessions();

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            session: "",
            year_class: "",
            subject: "",
            module: "",
            chapter: "",
        },
    });

    const { watch } = form;
    const session = watch("session");
    const yearClass = watch("year_class");
    const subject = watch("subject");
    const module = watch("module");
    const chapter = watch("chapter");

    const formData = [
        {
            fieldName: "session" as const,
            label: "Session",
            placeholder: "Select Session",
            list: sessionList,
        },
        {
            fieldName: "year_class" as const,
            label: "Year/Class",
            placeholder: "Select Year/Class",
            list: ["10th Class", "9th Class", "8th Class"],
        },
        {
            fieldName: "subject" as const,
            label: "Subject",
            placeholder: "Select Subject",
            list: ["Chemistry", "Biology", "Physics", "Olympiad", "Mathematics"],
        },
        {
            fieldName: "module" as const,
            label: "Module",
            placeholder: "Select Module",
            list: ["Live Session", "NCERT"],
        },
        {
            fieldName: "chapter" as const,
            label: "Chapter",
            placeholder: "Select Chapter",
            list: [
                "Chapter 1: Light - Reflection and Refraction",
                "Chapter 2: The Human Eye and The Colourful World",
                "Chapter 3: Extra Numericals For Light and Human Eye",
            ],
        },
    ];

    const isDropdownDisabled = (index: number): boolean => {
        switch (index) {
            case 0:
                return false;
            case 1:
                return !session;
            case 2:
                return !yearClass;
            case 3:
                return !subject;
            case 4:
                return !module;
            case 5:
                return !chapter;
            default:
                return false;
        }
    };

    const onSubmit = (data: z.infer<typeof formSchema>) => {
        console.log(data);
        // Handle form submission
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {formData.map((obj, index) => (
                    <FormField
                        key={obj.fieldName}
                        control={form.control}
                        name={obj.fieldName}
                        render={({ field, fieldState }) => (
                            <FormItem>
                                <FormControl>
                                    <div className="flex flex-col gap-1">
                                        <div>
                                            {obj.label}
                                            <span className="text-primary-500">*</span>
                                        </div>
                                        <MyDropdown
                                            placeholder={obj.placeholder}
                                            currentValue={field.value}
                                            dropdownList={obj.list}
                                            onSelect={field.onChange}
                                            disable={isDropdownDisabled(index)}
                                            error={fieldState.error?.message}
                                        />
                                        <FormMessage className="text-danger-600" />
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
