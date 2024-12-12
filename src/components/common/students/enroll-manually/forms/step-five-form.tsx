import { FormStepHeading } from "../form-components/form-step-heading";
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form";
import { FormItemWrapper } from "../form-components/form-item-wrapper";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { FormSubmitButtons } from "../form-components/form-submit-buttons";
import { DialogDescription } from "@radix-ui/react-dialog";
import { MyInput } from "@/components/design-system/input";
import { MyButton } from "@/components/design-system/button";
import { zodResolver } from "@hookform/resolvers/zod";
import { useFormStore } from "@/stores/students/enroll-students-manually/enroll-manually-form-store";
import { getCurrentSession } from "../../students-list/students-list-section";
import { useState, useEffect } from "react";

const formSchema = z.object({
    username: z.string().min(1, "Username is required"),
    password: z
        .string()
        .min(8, "Password must be at least 8 characters")
        .regex(
            /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
            "Password must contain at least one uppercase letter, one lowercase letter, and one number",
        ),
});

export type StepFiveDataType = z.infer<typeof formSchema>;

export const StepFiveForm = () => {
    const [showCredentials, setShowCredentials] = useState(false);
    const { stepFiveData, setStepFiveData, stepTwoData } = useFormStore();

    const form = useForm<StepFiveDataType>({
        resolver: zodResolver(formSchema),
        defaultValues: stepFiveData || {
            username: "",
            password: "",
        },
        mode: "onChange",
    });

    const generateUsername = () => {
        const sessionYear =
            stepTwoData?.session?.split("-")[0] || getCurrentSession().split("-")[0];
        const batchMatch = stepTwoData?.batch?.match(/(\d+)/) || ["", "09"];
        const classNumber = batchMatch[1]?.padStart(2, "0") || "";
        const enrollmentLast3 = (stepTwoData?.enrollmentNumber || "001").slice(-3);

        return `${sessionYear}-${classNumber}-${enrollmentLast3}`;
    };

    const generatePassword = () => {
        const length = 8;
        const lowercase = "abcdefghijklmnopqrstuvwxyz";
        const uppercase = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
        const numbers = "0123456789";

        // Ensure at least one of each required character type
        let password = "";
        password += uppercase[Math.floor(Math.random() * uppercase.length)];
        password += lowercase[Math.floor(Math.random() * lowercase.length)];
        password += numbers[Math.floor(Math.random() * numbers.length)];

        // Fill the rest with random characters
        const allChars = lowercase + uppercase + numbers;
        for (let i = password.length; i < length; i++) {
            password += allChars[Math.floor(Math.random() * allChars.length)];
        }

        // Shuffle the password
        return password
            .split("")
            .sort(() => Math.random() - 0.5)
            .join("");
    };

    const generateCredentials = () => {
        const username = generateUsername();
        const password = generatePassword();

        form.setValue("username", username);
        form.setValue("password", password);
        setShowCredentials(true);
    };

    const onSubmit = (values: StepFiveDataType) => {
        setStepFiveData(values);
        // Handle final submission
    };

    //test
    const { stepOneData, stepThreeData, stepFourData } = useFormStore();

    useEffect(() => {
        console.log("stepOneData: ", stepOneData);
        console.log("stepTwoData: ", stepTwoData);
        console.log("stepThreeData: ", stepThreeData);
        console.log("stepFourData: ", stepFourData);
        console.log("stepFiveData: ", stepFiveData);
    }, []);

    return (
        <div>
            <DialogDescription className="flex flex-col justify-center p-6 text-neutral-600">
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-20">
                        <FormItemWrapper<StepFiveDataType> control={form.control} name="username">
                            <FormStepHeading stepNumber={5} heading="Generate Login Credentials" />
                        </FormItemWrapper>

                        <FormItemWrapper<StepFiveDataType> control={form.control} name="username">
                            <div className="flex flex-col items-center justify-center gap-10">
                                <div className="text-subtitle">
                                    Auto-generate student&apos;s username and password
                                </div>
                                <MyButton
                                    buttonType="primary"
                                    scale="large"
                                    layoutVariant="default"
                                    onClick={generateCredentials}
                                    type="button"
                                >
                                    Generate
                                </MyButton>
                            </div>
                        </FormItemWrapper>

                        {showCredentials && (
                            <div className="flex flex-col gap-8">
                                <FormField
                                    control={form.control}
                                    name="username"
                                    render={({ field: { value, ...field } }) => (
                                        <FormItem>
                                            <FormControl>
                                                <MyInput
                                                    inputType="text"
                                                    label="Username"
                                                    inputPlaceholder="username"
                                                    input={value}
                                                    onChangeFunction={() => {}} // Read-only
                                                    error={form.formState.errors.username?.message}
                                                    required={true}
                                                    size="large"
                                                    className="w-full"
                                                    disabled={true}
                                                    {...field}
                                                />
                                            </FormControl>
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="password"
                                    render={({ field: { onChange, value, ...field } }) => (
                                        <FormItem>
                                            <FormControl>
                                                <MyInput
                                                    inputType="password"
                                                    label="Password"
                                                    inputPlaceholder="....."
                                                    input={value}
                                                    onChangeFunction={onChange}
                                                    error={form.formState.errors.password?.message}
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
                        )}
                    </form>
                </Form>
            </DialogDescription>
            <FormSubmitButtons
                stepNumber={5}
                finishButtonDisable={!showCredentials}
                onNext={form.handleSubmit(onSubmit)}
            />
        </div>
    );
};
