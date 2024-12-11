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
import { MyButton } from "@/components/design-system/button";

const formSchema = z.object({
    step5heading: z.string(),
});

type FormData = z.infer<typeof formSchema>;

export const StepFiveForm = () => {
    const [username, setUserName] = useState<string>("2024-09-001");
    const [password, setPassword] = useState<string>("Es485HKj");

    const form = useForm<FormData>({
        defaultValues: {
            step5heading: "step 5",
        },
    });

    const handleChangeUserName = (event: React.ChangeEvent<HTMLInputElement>) => {
        setUserName(event.target.value);
    };
    const handleChangePassword = (event: React.ChangeEvent<HTMLInputElement>) => {
        setPassword(event.target.value);
    };

    return (
        <div>
            <DialogDescription className="flex flex-col justify-center p-6 text-neutral-600">
                <Form {...form}>
                    <div className="flex flex-col gap-20">
                        <FormItemWrapper<FormData> control={form.control} name="step5heading">
                            <FormStepHeading
                                stepNumber={5}
                                heading="Contact Information and Location Details"
                            />
                        </FormItemWrapper>

                        <FormItemWrapper<FormData> control={form.control} name="step5heading">
                            <div className="flex flex-col items-center justify-center gap-10">
                                <div className="text-subtitle">
                                    Auto-generate student&apos;s username and password
                                </div>
                                <MyButton
                                    buttonType="primary"
                                    scale="large"
                                    layoutVariant="default"
                                >
                                    Generate
                                </MyButton>
                            </div>
                        </FormItemWrapper>

                        <FormItemWrapper<FormData> control={form.control} name="step5heading">
                            <div className="flex flex-col gap-8">
                                <MyInput
                                    inputType="text"
                                    label="Username"
                                    inputPlaceholder="username"
                                    input={username}
                                    onChangeFunction={handleChangeUserName}
                                    required={true}
                                    size="large"
                                    className="w-full"
                                />
                                <MyInput
                                    inputType="text"
                                    label="Password"
                                    inputPlaceholder="....."
                                    input={password}
                                    onChangeFunction={handleChangePassword}
                                    required={true}
                                    size="large"
                                    className="w-full"
                                />
                            </div>
                        </FormItemWrapper>
                    </div>
                </Form>
            </DialogDescription>
            <FormSubmitButtons stepNumber={5} />
        </div>
    );
};
