// step-two-form.tsx
import { FormStepHeading } from "../form-components/form-step-heading";
import { Form } from "@/components/ui/form";
import { FormItemWrapper } from "../form-components/form-item-wrapper";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { FormSubmitButtons } from "../form-components/form-submit-buttons";
import { DialogDescription } from "@radix-ui/react-dialog";
import { MyInput } from "@/components/design-system/input";
import { MyDropdown } from "@/components/design-system/dropdown";
import { useState } from "react";

const formSchema = z.object({
    step2heading: z.string(),
});

type FormData = z.infer<typeof formSchema>;

export const StepTwoForm = () => {
    const [name, setName] = useState<string>("");
    const [branch, setBranch] = useState<string>("");
    const [enrollmentNumber, setEnrollmentNumber] = useState<string>("");
    const [session, setSession] = useState<string>("2024-2025");
    const [gender, setGender] = useState<string>("Male");
    const [collegeName, setCollegeName] = useState<string>("");

    const sessionList = ["2024-2025", "2023-2024", "2022-2023"];
    const genderList = ["Male", "Female", "Others"];

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

                        <FormItemWrapper<FormData> control={form.control} name="step2heading">
                            <div className="flex flex-col gap-8">
                                <MyInput
                                    inputType="text"
                                    label="Full Name"
                                    inputPlaceholder="Full name (First and Last)"
                                    input={name}
                                    setInput={setName}
                                    required={true}
                                    size="large"
                                    className="w-full"
                                />

                                <MyInput
                                    inputType="text"
                                    label="Branch"
                                    inputPlaceholder="Select Branch"
                                    input={branch}
                                    setInput={setBranch}
                                    required={true}
                                    size="large"
                                    className="w-full"
                                />

                                <MyInput
                                    inputType="text"
                                    label="Enrollment Number"
                                    inputPlaceholder="00000000"
                                    input={enrollmentNumber}
                                    setInput={setEnrollmentNumber}
                                    required={true}
                                    size="large"
                                    className="w-full"
                                />

                                <div className="flex items-center justify-between gap-8">
                                    <div className="flex w-full flex-col gap-1">
                                        <div>
                                            Session{" "}
                                            <span className="text-subtitle text-danger-600">*</span>
                                        </div>
                                        <MyDropdown
                                            currentValue={session}
                                            setCurrentValue={setSession}
                                            dropdownList={sessionList}
                                        />
                                    </div>

                                    <div className="flex w-full flex-col gap-1">
                                        <div>
                                            Gender{" "}
                                            <span className="text-subtitle text-danger-600">*</span>
                                        </div>
                                        <MyDropdown
                                            currentValue={gender}
                                            setCurrentValue={setGender}
                                            dropdownList={genderList}
                                        />
                                    </div>
                                </div>

                                <MyInput
                                    inputType="text"
                                    label="College/School Name"
                                    inputPlaceholder="Enter Student's College/School Name"
                                    input={collegeName}
                                    setInput={setCollegeName}
                                    required={true}
                                    size="large"
                                    className="w-full"
                                />
                            </div>
                        </FormItemWrapper>
                    </div>
                </Form>
            </DialogDescription>
            <FormSubmitButtons stepNumber={2} />
        </div>
    );
};
