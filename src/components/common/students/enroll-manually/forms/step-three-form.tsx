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
    step3heading: z.string(),
});

type FormData = z.infer<typeof formSchema>;

export const StepThreeForm = () => {
    const [mobileNumber, setMobileNumber] = useState<string>("");
    const [email, setEmail] = useState<string>("");
    // const [state, setState] = useState<string>("Madhya Pradesh");
    // const [city, setCity] = useState<string>("Bhopal");

    const state = "Madhya Pradesh";
    const city = "Bhopal";

    const stateList = ["Madhya Pradesh", "Himachal Pradesh", "Rajasthan"];
    const cityList = ["Bhopal", "Indore", "Delhi"];

    const form = useForm<FormData>({
        defaultValues: {
            step3heading: "step 3",
        },
    });

    const handleChangeNumber = (event: React.ChangeEvent<HTMLInputElement>) => {
        setMobileNumber(event.target.value);
    };
    const handleChangeEmail = (event: React.ChangeEvent<HTMLInputElement>) => {
        setEmail(event.target.value);
    };

    return (
        <div>
            <DialogDescription className="flex flex-col justify-center p-6 text-neutral-600">
                <Form {...form}>
                    <div className="flex flex-col gap-6">
                        <FormItemWrapper<FormData> control={form.control} name="step3heading">
                            <FormStepHeading
                                stepNumber={3}
                                heading="Contact Information and Location Details"
                            />
                        </FormItemWrapper>

                        <FormItemWrapper<FormData> control={form.control} name="step3heading">
                            <div className="flex flex-col gap-8">
                                <MyInput
                                    inputType="text"
                                    label="Mobile Number"
                                    inputPlaceholder="123 456 7890"
                                    input={mobileNumber}
                                    onChangeFunction={handleChangeNumber}
                                    required={true}
                                    size="large"
                                    className="w-full"
                                />

                                <MyInput
                                    inputType="text"
                                    label="Email"
                                    inputPlaceholder="you@email.com"
                                    input={email}
                                    onChangeFunction={handleChangeEmail}
                                    required={true}
                                    size="large"
                                    className="w-full"
                                />

                                <div className="flex flex-col gap-1">
                                    <div>
                                        State{" "}
                                        <span className="text-subtitle text-danger-600">*</span>
                                    </div>
                                    <MyDropdown currentValue={state} dropdownList={stateList} />
                                </div>

                                <div className="flex flex-col gap-1">
                                    <div>
                                        City{" "}
                                        <span className="text-subtitle text-danger-600">*</span>
                                    </div>
                                    <MyDropdown currentValue={city} dropdownList={cityList} />
                                </div>
                            </div>
                        </FormItemWrapper>
                    </div>
                </Form>
            </DialogDescription>
            <FormSubmitButtons stepNumber={3} />
        </div>
    );
};
