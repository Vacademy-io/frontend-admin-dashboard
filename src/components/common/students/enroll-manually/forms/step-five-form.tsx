// step-five-form.tsx
import { FormStepHeading } from "../form-components/form-step-heading";
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form";
import { FormItemWrapper } from "../form-components/form-item-wrapper";
import { useForm } from "react-hook-form";
import { FormSubmitButtons } from "../form-components/form-submit-buttons";
import { DialogDescription } from "@radix-ui/react-dialog";
import { MyInput } from "@/components/design-system/input";
import { MyButton } from "@/components/design-system/button";
import { zodResolver } from "@hookform/resolvers/zod";
import { useFormStore } from "@/stores/students/enroll-students-manually/enroll-manually-form-store";
import { stepFiveSchema, StepFiveData } from "@/types/students/schema-enroll-students-manually";
import { useEnrollStudent } from "@/hooks/student-list-section/enroll-student-manually/useEnrollStudent";
import { useEffect, useState } from "react";
import { getCurrentSession } from "../../students-list/utills/getCurrentSession";
import { useInstituteDetailsStore } from "@/stores/students/students-list/useInstituteDetailsStore";
import { toast } from "sonner";

export const StepFiveForm = () => {
    const [showCredentials, setShowCredentials] = useState(false);
    const {
        stepOneData,
        stepTwoData,
        stepThreeData,
        stepFourData,
        stepFiveData,
        setStepFiveData,
        resetForm,
    } = useFormStore();

    const { getPackageSessionId } = useInstituteDetailsStore();
    const [packageSessionId, setPackageSessionId] = useState(
        getPackageSessionId({
            courseId: stepTwoData?.course.id || "",
            levelId: stepTwoData?.level.id || "",
            sessionId: stepTwoData?.session.id || "",
        }),
    );

    useEffect(() => {
        setPackageSessionId(
            getPackageSessionId({
                courseId: stepTwoData?.course.id || "",
                levelId: stepTwoData?.level.id || "",
                sessionId: stepTwoData?.session.id || "",
            }),
        );
    }, [stepTwoData?.course, stepTwoData?.level, stepTwoData?.session]);

    const form = useForm<StepFiveData>({
        resolver: zodResolver(stepFiveSchema),
        defaultValues: stepFiveData || {
            username: "",
            password: "",
        },
        mode: "onChange",
    });

    const generateUsername = () => {
        const sessionYear =
            stepTwoData?.session?.name.split("-")[1] || getCurrentSession().split("-")[1];
        const classNumber = stepTwoData?.level.name;
        const enrollmentLast3 = (stepTwoData?.enrollmentNumber || "001").slice(-3);

        const username = `${sessionYear}-${classNumber}-${enrollmentLast3}`;
        return username.replace(/\s+/g, "");
    };

    const generatePassword = () => {
        const length = 8;
        const lowercase = "abcdefghijklmnopqrstuvwxyz";
        const uppercase = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
        const numbers = "0123456789";

        let password = "";
        password += uppercase[Math.floor(Math.random() * uppercase.length)];
        password += lowercase[Math.floor(Math.random() * lowercase.length)];
        password += numbers[Math.floor(Math.random() * numbers.length)];

        const allChars = lowercase + uppercase + numbers;
        for (let i = password.length; i < length; i++) {
            password += allChars[Math.floor(Math.random() * allChars.length)];
        }

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

    const enrollStudentMutation = useEnrollStudent();

    const onSubmit = async (values: StepFiveData) => {
        setStepFiveData(values);
        try {
            const result = await enrollStudentMutation.mutateAsync({
                formData: {
                    stepOneData,
                    stepTwoData,
                    stepThreeData,
                    stepFourData,
                    stepFiveData: values,
                },
                packageSessionId: packageSessionId || "",
            });
            toast.success("Student enrolled successfully");
            console.log(result);
            resetForm();
            // Handle success
        } catch (error) {
            // Handle error
            console.error("Failed to enroll student:", error);
            toast.error("Failed to enroll the student");
        }
    };

    return (
        <div>
            <DialogDescription className="flex flex-col justify-center p-6 text-neutral-600">
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-20">
                        <FormItemWrapper<StepFiveData> control={form.control} name="username">
                            <FormStepHeading stepNumber={5} heading="Generate Login Credentials" />
                        </FormItemWrapper>

                        <FormItemWrapper<StepFiveData> control={form.control} name="username">
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
                                                    onChangeFunction={() => {}}
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
