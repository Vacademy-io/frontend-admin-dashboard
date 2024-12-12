import { FormStepHeading } from "../form-components/form-step-heading";
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form";
import { FormItemWrapper } from "../form-components/form-item-wrapper";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { FormSubmitButtons } from "../form-components/form-submit-buttons";
import { DialogDescription } from "@radix-ui/react-dialog";
import { MyInput } from "@/components/design-system/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { useFormStore } from "@/stores/students/enroll-students-manually/enroll-manually-form-store";

const formSchema = z.object({
    fatherName: z.string().min(1, "Father's name is required"),
    motherName: z.string().min(1, "Mother's name is required"),
    guardianName: z.string().optional(),
    guardianEmail: z.string().email("Invalid email format").min(1, "Guardian's email is required"),
    guardianMobileNumber: z
        .string()
        .min(1, "Guardian's mobile number is required")
        .regex(/^\d{10}$/, "Mobile number must be 10 digits"),
});

export type StepFourDataType = z.infer<typeof formSchema>;

export const StepFourForm = () => {
    const { stepFourData, setStepFourData, nextStep } = useFormStore();

    const form = useForm<StepFourDataType>({
        resolver: zodResolver(formSchema),
        defaultValues: stepFourData || {
            fatherName: "",
            motherName: "",
            guardianName: "",
            guardianEmail: "",
            guardianMobileNumber: "",
        },
        mode: "onChange",
    });

    const onSubmit = (values: StepFourDataType) => {
        setStepFourData(values);
        nextStep();
    };

    return (
        <div>
            <DialogDescription className="flex flex-col justify-center p-6 text-neutral-600">
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-6">
                        <FormItemWrapper<StepFourDataType> control={form.control} name="fatherName">
                            <FormStepHeading stepNumber={4} heading="Parent's/Guardians Details" />
                        </FormItemWrapper>

                        <div className="flex flex-col gap-8">
                            <FormField
                                control={form.control}
                                name="fatherName"
                                render={({ field: { onChange, value, ...field } }) => (
                                    <FormItem>
                                        <FormControl>
                                            <MyInput
                                                inputType="text"
                                                label="Father's Name"
                                                inputPlaceholder="Full Name (First and Last)"
                                                input={value}
                                                onChangeFunction={onChange}
                                                error={form.formState.errors.fatherName?.message}
                                                required={true}
                                                size="large"
                                                className="w-full"
                                                {...field}
                                            />
                                        </FormControl>
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="motherName"
                                render={({ field: { onChange, value, ...field } }) => (
                                    <FormItem>
                                        <FormControl>
                                            <MyInput
                                                inputType="text"
                                                label="Mother's Name"
                                                inputPlaceholder="Full Name (First and Last)"
                                                input={value}
                                                onChangeFunction={onChange}
                                                error={form.formState.errors.motherName?.message}
                                                required={true}
                                                size="large"
                                                className="w-full"
                                                {...field}
                                            />
                                        </FormControl>
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="guardianName"
                                render={({ field: { onChange, value, ...field } }) => (
                                    <FormItem>
                                        <FormControl>
                                            <MyInput
                                                inputType="text"
                                                label="Guardian's Name(if applicable)"
                                                inputPlaceholder="Full Name (First and Last)"
                                                input={value || ""}
                                                onChangeFunction={onChange}
                                                error={form.formState.errors.guardianName?.message}
                                                required={false}
                                                size="large"
                                                className="w-full"
                                                {...field}
                                            />
                                        </FormControl>
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="guardianEmail"
                                render={({ field: { onChange, value, ...field } }) => (
                                    <FormItem>
                                        <FormControl>
                                            <MyInput
                                                inputType="email"
                                                label="Parent/Guardian's Email"
                                                inputPlaceholder="you@email.com"
                                                input={value}
                                                onChangeFunction={onChange}
                                                error={form.formState.errors.guardianEmail?.message}
                                                required={true}
                                                size="large"
                                                className="w-full"
                                                {...field}
                                            />
                                        </FormControl>
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="guardianMobileNumber"
                                render={({ field: { onChange, value, ...field } }) => (
                                    <FormItem>
                                        <FormControl>
                                            <MyInput
                                                inputType="tel"
                                                label="Parent/Guardian's Mobile Number"
                                                inputPlaceholder="123 456 7890"
                                                input={value}
                                                onChangeFunction={onChange}
                                                error={
                                                    form.formState.errors.guardianMobileNumber
                                                        ?.message
                                                }
                                                required={true}
                                                size="large"
                                                className="w-full"
                                                {...field}
                                            />
                                        </FormControl>
                                    </FormItem>
                                )}
                            />
                        </div>
                    </form>
                </Form>
            </DialogDescription>
            <FormSubmitButtons stepNumber={4} onNext={form.handleSubmit(onSubmit)} />
        </div>
    );
};
