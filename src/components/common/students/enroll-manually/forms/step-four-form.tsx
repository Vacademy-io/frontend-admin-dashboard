// step-four-form.tsx
import { FormStepHeading } from "../form-components/form-step-heading";
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form";
import { FormItemWrapper } from "../form-components/form-item-wrapper";
import { useForm } from "react-hook-form";
import { FormSubmitButtons } from "../form-components/form-submit-buttons";
import { MyInput } from "@/components/design-system/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { useFormStore } from "@/stores/students/enroll-students-manually/enroll-manually-form-store";
import { StepFourData, stepFourSchema } from "@/types/students/schema-enroll-students-manually";
import PhoneInputField from "@/components/design-system/phone-input-field";
import { StudentTable } from "@/schemas/student/student-list/table-schema";

export const StepFourForm = ({ initialValues }: { initialValues?: StudentTable }) => {
    const { stepFourData, setStepFourData, nextStep } = useFormStore();

    const form = useForm<StepFourData>({
        resolver: zodResolver(stepFourSchema),
        defaultValues: stepFourData || {
            fatherName: initialValues?.father_name || "",
            motherName: initialValues?.mother_name || "",
            guardianName: "",
            guardianEmail: initialValues?.parents_email || "",
            guardianMobileNumber: initialValues?.parents_mobile_number || "",
        },
        mode: "onChange",
    });

    const onSubmit = (values: StepFourData) => {
        setStepFourData(values);
        nextStep();
    };

    return (
        <div>
            <div className="flex flex-col justify-center p-6 text-neutral-600">
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
            </div>
            <FormSubmitButtons stepNumber={4} onNext={form.handleSubmit(onSubmit)} />
        </div>
    );
};
