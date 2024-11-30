// step-two-form.tsx
import { FormStepHeading } from "../form-components/form-step-heading";
import { Form } from "@/components/ui/form";
import { FormItemWrapper } from "../form-components/form-item-wrapper";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { FormSubmitButtons } from "../form-components/form-submit-buttons";
import { DialogDescription } from "@radix-ui/react-dialog";
import { MyInput } from "@/components/design-system/input";
import { useState } from "react";

const formSchema = z.object({
    step2heading: z.string(),
});

type FormData = z.infer<typeof formSchema>;

export const StepTwoForm = () => {
    const [name, setName] = useState<string>("");
    const [branch, setBranch] = useState<string>("");
    const [enrollmentNumber, setEnrollmentNumber] = useState<string>("");

    const form = useForm<FormData>({
        defaultValues: {
            step2heading: "step 2",
        },
    });

    return (
        <div>
            <DialogDescription className="flex flex-col justify-center p-6 text-neutral-600">
                <Form {...form}>
                    <div className="flex flex-col gap-6">
                        <FormItemWrapper<FormData> control={form.control} name="step2heading">
                            <FormStepHeading stepNumber={2} heading="General Details" />
                        </FormItemWrapper>

                        <div className="flex flex-col gap-8">
                            <FormItemWrapper<FormData> control={form.control} name="step2heading">
                                <MyInput
                                    inputType="text"
                                    label="Full Name"
                                    inputPlaceholder="Full name (First and Last)"
                                    input={name}
                                    setInput={setName}
                                    required={true}
                                    size="large"
                                />
                            </FormItemWrapper>
                            <FormItemWrapper<FormData> control={form.control} name="step2heading">
                                <MyInput
                                    inputType="text"
                                    label="Branch"
                                    inputPlaceholder="Select Branch"
                                    input={branch}
                                    setInput={setBranch}
                                    required={true}
                                    size="large"
                                />
                            </FormItemWrapper>
                            <FormItemWrapper<FormData> control={form.control} name="step2heading">
                                <MyInput
                                    inputType="text"
                                    label="Enrollment Number"
                                    inputPlaceholder="00000000"
                                    input={enrollmentNumber}
                                    setInput={setEnrollmentNumber}
                                    required={true}
                                    size="large"
                                />
                            </FormItemWrapper>
                            <div className="flex items-center justify-between">
                                <FormItemWrapper<FormData>
                                    control={form.control}
                                    name="step2heading"
                                >
                                    <MyInput
                                        inputType="text"
                                        label="Enrollment Number"
                                        inputPlaceholder="00000000"
                                        input={enrollmentNumber}
                                        setInput={setEnrollmentNumber}
                                        required={true}
                                        size="large"
                                    />
                                </FormItemWrapper>
                            </div>
                        </div>
                    </div>
                </Form>
            </DialogDescription>
            <FormSubmitButtons stepNumber={1} />
        </div>
    );
};
