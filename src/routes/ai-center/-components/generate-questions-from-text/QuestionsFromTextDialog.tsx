import { MyDialog } from "@/components/design-system/dialog";
import { MyInput } from "@/components/design-system/input";
import { FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useRef } from "react";
import { FormProvider, useForm } from "react-hook-form";
import * as z from "zod";

const formSchema = z.object({
    text: z.string().min(1),
    num: z.number().min(1),
    class_level: z.string().min(1),
    topics: z.string().min(1),
    question_type: z.string().min(1),
    question_language: z.string().min(1),
});

export type QuestionsFromTextData = z.infer<typeof formSchema>;

export const QuestionsFromTextDialog = ({
    open,
    onOpenChange,
    onSubmitSuccess,
    submitButton,
    handleDisableSubmitBtn,
    submitForm,
    trigger,
}: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSubmitSuccess: (data: QuestionsFromTextData) => void;
    submitButton: JSX.Element;
    handleDisableSubmitBtn: (value: boolean) => void;
    submitForm: (submitFn: () => void) => void;
    trigger?: JSX.Element;
}) => {
    const form = useForm<QuestionsFromTextData>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            text: "",
            num: undefined,
            class_level: "",
            topics: "",
            question_type: "",
            question_language: "",
        },
    });
    const { watch, getValues } = form;
    useEffect(() => {
        const values = getValues();
        const isValid = !(
            values.text === "" ||
            values.num === 0 ||
            values.class_level === "" ||
            values.topics === "" ||
            values.question_type === "" ||
            values.question_language === ""
        );
        handleDisableSubmitBtn(!isValid);
    }, [
        watch("text"),
        watch("num"),
        watch("class_level"),
        watch("topics"),
        watch("question_type"),
        watch("question_language"),
    ]);

    const formRef = useRef<HTMLFormElement>(null);

    useEffect(() => {
        if (submitForm) {
            submitForm(requestSubmitFn);
        }
    }, [submitForm]);

    const requestSubmitFn = () => {
        if (formRef.current) {
            formRef.current.requestSubmit();
        }
    };

    return (
        <MyDialog
            heading="Generate Questions From Text"
            open={open}
            onOpenChange={onOpenChange}
            footer={submitButton}
            trigger={trigger || undefined}
            dialogWidth="min-w-[500px]"
        >
            <FormProvider {...form}>
                <form
                    onSubmit={form.handleSubmit(onSubmitSuccess)}
                    className="flex flex-col gap-4"
                    ref={formRef}
                >
                    <FormField
                        control={form.control}
                        name="text"
                        render={({ field }) => (
                            <FormItem>
                                <FormControl>
                                    <div className="flex flex-col gap-2">
                                        <FormLabel>
                                            Text <span className="text-red-500">*</span>
                                        </FormLabel>
                                        <Textarea
                                            placeholder="Enter text"
                                            className="h-[100px] w-full"
                                            value={field.value}
                                            onChange={(e) => field.onChange(e.target.value)}
                                        />
                                    </div>
                                </FormControl>
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="num"
                        render={({ field }) => (
                            <FormItem>
                                <FormControl>
                                    <MyInput
                                        input={field.value?.toString() || ""}
                                        onChangeFunction={(e) => {
                                            // Convert to number for validation, floor it
                                            const numValue = Math.floor(Number(e.target.value));
                                            // Only update if it's a valid number
                                            if (!isNaN(numValue)) {
                                                field.onChange(numValue); // Store as number in form
                                            }
                                        }}
                                        label="Number of Questions"
                                        required={true}
                                        inputType="number"
                                        inputPlaceholder="Enter number of questions"
                                        className="w-full"
                                    />
                                </FormControl>
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="class_level"
                        render={({ field }) => (
                            <FormItem>
                                <FormControl>
                                    <MyInput
                                        input={field.value?.toString() || ""}
                                        onChangeFunction={(e) => field.onChange(e.target.value)}
                                        label="Class Level"
                                        required={true}
                                        inputType="text"
                                        inputPlaceholder="Enter class level"
                                        className="w-full"
                                    />
                                </FormControl>
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="topics"
                        render={({ field }) => (
                            <FormItem>
                                <FormControl>
                                    <MyInput
                                        input={field.value?.toString() || ""}
                                        onChangeFunction={(e) => field.onChange(e.target.value)}
                                        label="Topics"
                                        required={true}
                                        inputType="text"
                                        inputPlaceholder="Enter topics"
                                        className="w-full"
                                    />
                                </FormControl>
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="question_type"
                        render={({ field }) => (
                            <FormItem>
                                <FormControl>
                                    <MyInput
                                        input={field.value?.toString() || ""}
                                        onChangeFunction={(e) => field.onChange(e.target.value)}
                                        label="Question Type"
                                        required={true}
                                        inputType="text"
                                        inputPlaceholder="Enter question type"
                                        className="w-full"
                                    />
                                </FormControl>
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="question_language"
                        render={({ field }) => (
                            <FormItem>
                                <FormControl>
                                    <MyInput
                                        input={field.value?.toString() || ""}
                                        onChangeFunction={(e) => field.onChange(e.target.value)}
                                        label="Question Language"
                                        required={true}
                                        inputType="text"
                                        inputPlaceholder="Enter question language"
                                        className="w-full"
                                    />
                                </FormControl>
                            </FormItem>
                        )}
                    />
                </form>
            </FormProvider>
        </MyDialog>
    );
};
