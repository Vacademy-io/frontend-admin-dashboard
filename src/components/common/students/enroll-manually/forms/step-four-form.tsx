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
    step4heading: z.string(),
});

type FormData = z.infer<typeof formSchema>;

export const StepFourForm = () => {
    const [fatherName, setFatherName] = useState<string>("");
    const [motherName, setMotherName] = useState<string>("");
    const [guardianName, setGuardianName] = useState<string>("");
    const [guardianEmail, setGuardianEmail] = useState<string>("");
    const [guardianMobileNumber, setGuardianMobileNumber] = useState<string>("");

    const form = useForm<FormData>({
        defaultValues: {
            step4heading: "step 4",
        },
    });

    const handleChangeFatherName = (event: React.ChangeEvent<HTMLInputElement>) => {
        setFatherName(event.target.value);
    };
    const handleChangeMotherName = (event: React.ChangeEvent<HTMLInputElement>) => {
        setMotherName(event.target.value);
    };
    const handleChangeGuardianName = (event: React.ChangeEvent<HTMLInputElement>) => {
        setGuardianName(event.target.value);
    };
    const handleChangeGuardianNumber = (event: React.ChangeEvent<HTMLInputElement>) => {
        setGuardianMobileNumber(event.target.value);
    };
    const handleChangeGuardianEmail = (event: React.ChangeEvent<HTMLInputElement>) => {
        setGuardianEmail(event.target.value);
    };

    return (
        <div>
            <DialogDescription className="flex flex-col justify-center p-6 text-neutral-600">
                <Form {...form}>
                    <div className="flex flex-col gap-6">
                        <FormItemWrapper<FormData> control={form.control} name="step4heading">
                            <FormStepHeading stepNumber={4} heading="Parent's/Guardians Details" />
                        </FormItemWrapper>

                        <FormItemWrapper<FormData> control={form.control} name="step4heading">
                            <div className="flex flex-col gap-8">
                                <MyInput
                                    inputType="text"
                                    label="Father's Name"
                                    inputPlaceholder="Full Name (First and Last)"
                                    input={fatherName}
                                    onChangeFunction={handleChangeFatherName}
                                    required={true}
                                    size="large"
                                    className="w-full"
                                />

                                <MyInput
                                    inputType="text"
                                    label="Mother's Name"
                                    inputPlaceholder="Full Name (First and Last)"
                                    input={motherName}
                                    onChangeFunction={handleChangeMotherName}
                                    required={true}
                                    size="large"
                                    className="w-full"
                                />

                                <MyInput
                                    inputType="text"
                                    label="Guardian's Name(if applicable)"
                                    inputPlaceholder="Full Name (First and Last)"
                                    input={guardianName}
                                    onChangeFunction={handleChangeGuardianName}
                                    required={true}
                                    size="large"
                                    className="w-full"
                                />

                                <MyInput
                                    inputType="text"
                                    label="Parent/Guardian's Email"
                                    inputPlaceholder="you@email.com"
                                    input={guardianEmail}
                                    onChangeFunction={handleChangeGuardianEmail}
                                    required={true}
                                    size="large"
                                    className="w-full"
                                />

                                <MyInput
                                    inputType="text"
                                    label="Parent/Guardian's Mobile Number"
                                    inputPlaceholder="123 456 7890"
                                    input={guardianMobileNumber}
                                    onChangeFunction={handleChangeGuardianNumber}
                                    required={true}
                                    size="large"
                                    className="w-full"
                                />
                            </div>
                        </FormItemWrapper>
                    </div>
                </Form>
            </DialogDescription>
            <FormSubmitButtons stepNumber={4} />
        </div>
    );
};
