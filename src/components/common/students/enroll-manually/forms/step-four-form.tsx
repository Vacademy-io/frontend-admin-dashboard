// step-four-form.tsx
import { FormStepHeading } from "../form-components/form-step-heading";
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form";
import { FormItemWrapper } from "../form-components/form-item-wrapper";
import { useForm } from "react-hook-form";
import { FormSubmitButtons } from "../form-components/form-submit-buttons";
import { DialogDescription } from "@radix-ui/react-dialog";
import { MyInput } from "@/components/design-system/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { useFormStore } from "@/stores/students/enroll-students-manually/enroll-manually-form-store";
import { StepFourData, stepFourSchema } from "@/types/students/schema-enroll-students-manually";
import PhoneInputField from "@/components/design-system/phone-input-field";

export const StepFourForm = () => {
    const { stepFourData, setStepFourData, nextStep } = useFormStore();

    const form = useForm<StepFourData>({
        resolver: zodResolver(stepFourSchema),
        defaultValues: stepFourData || {
            fatherName: "",
            motherName: "",
            guardianName: "",
            guardianEmail: "",
            guardianMobileNumber: "",
        },
        mode: "onChange",
    });

    const onSubmit = (values: StepFourData) => {
        setStepFourData(values);
        nextStep();
    };

    return (
        <div>
            <DialogDescription className="flex flex-col justify-center p-6 text-neutral-600">
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-6">
                        <FormItemWrapper<StepFourData> control={form.control} name="fatherName">
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
                                                label="Guardian's Name (if applicable)"
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
                                render={() => (
                                    <FormItem>
                                        <FormControl>
                                            <PhoneInputField
                                                label="Parent/Guardian's Mobile Number"
                                                placeholder="123 456 7890"
                                                name="guardianMobileNumber"
                                                control={form.control}
                                                country="in"
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
