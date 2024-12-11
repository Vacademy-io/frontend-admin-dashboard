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
import { useGetSessions, useGetGenders } from "@/hooks/student-list-section/useFilterData";

const formSchema = z.object({
    step2heading: z.string(),
});

type FormData = z.infer<typeof formSchema>;

export const StepTwoForm = () => {
    const [name, setName] = useState<string>("");
    const [branch, setBranch] = useState<string>("");
    const [enrollmentNumber, setEnrollmentNumber] = useState<string>("");
    const [collegeName, setCollegeName] = useState<string>("");

    // Get lists from useFilterData hooks
    const sessionList = useGetSessions();
    const genderList = useGetGenders();

    // Set default values as first items from the lists
    const [session, setSession] = useState<string>(sessionList[0] || "");
    const [gender, setGender] = useState<string>(genderList[0] || "");

    const form = useForm<FormData>({
        defaultValues: {
            step2heading: "step 2",
        },
    });

    const handleChangeName = (event: React.ChangeEvent<HTMLInputElement>) => {
        setName(event.target.value);
    };

    const handleChangeBranch = (event: React.ChangeEvent<HTMLInputElement>) => {
        setBranch(event.target.value);
    };

    const handleChangeEnroll = (event: React.ChangeEvent<HTMLInputElement>) => {
        setEnrollmentNumber(event.target.value);
    };

    const handleChangeCollege = (event: React.ChangeEvent<HTMLInputElement>) => {
        setCollegeName(event.target.value);
    };

    const handleChangeSession = (value: string) => {
        setSession(value);
    };

    const handleChangeGender = (value: string) => {
        setGender(value);
    };

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
                                    onChangeFunction={handleChangeName}
                                    required={true}
                                    size="large"
                                    className="w-full"
                                />

                                <MyInput
                                    inputType="text"
                                    label="Branch"
                                    inputPlaceholder="Select Branch"
                                    input={branch}
                                    onChangeFunction={handleChangeBranch}
                                    required={true}
                                    size="large"
                                    className="w-full"
                                />

                                <MyInput
                                    inputType="text"
                                    label="Enrollment Number"
                                    inputPlaceholder="00000000"
                                    input={enrollmentNumber}
                                    onChangeFunction={handleChangeEnroll}
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
                                            dropdownList={sessionList}
                                            handleChange={handleChangeSession}
                                        />
                                    </div>

                                    <div className="flex w-full flex-col gap-1">
                                        <div>
                                            Gender{" "}
                                            <span className="text-subtitle text-danger-600">*</span>
                                        </div>
                                        <MyDropdown
                                            currentValue={gender}
                                            dropdownList={genderList}
                                            handleChange={handleChangeGender}
                                        />
                                    </div>
                                </div>

                                <MyInput
                                    inputType="text"
                                    label="College/School Name"
                                    inputPlaceholder="Enter Student's College/School Name"
                                    input={collegeName}
                                    onChangeFunction={handleChangeCollege}
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
