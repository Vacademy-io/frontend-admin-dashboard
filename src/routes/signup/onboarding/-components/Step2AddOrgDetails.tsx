import React from "react";
import { OrganizationOnboardingProps } from "..";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { FormProvider, useForm } from "react-hook-form";
import { FormControl, FormField, FormItem } from "@/components/ui/form";
import { MyInput } from "@/components/design-system/input";
import SelectField from "@/components/design-system/select-field";
import { MyButton } from "@/components/design-system/button";
import { RoleType } from "@/constants/dummy-data";
import { useNavigate } from "@tanstack/react-router";

const organizationDetails = z
    .object({
        name: z.string().min(1, "Name is required"),
        email: z.string().min(1, "Email is required").email("Invalid email format"),
        password: z.string().min(6, "Password must be at least 6 characters"),
        confirmPassword: z.string().min(1, "Confirm password is required"),
        roleType: z.string().min(1, "Role type is required"),
    })
    .refine((data) => data.password === data.confirmPassword, {
        message: "Passwords do not match",
        path: ["confirmPassword"],
    });
type FormValues = z.infer<typeof organizationDetails>;

const Step2AddOrgDetails: React.FC<OrganizationOnboardingProps> = ({
    currentStep,
    handleCompleteCurrentStep,
    completedSteps,
}) => {
    console.log(currentStep, completedSteps);
    const navigate = useNavigate();
    const form = useForm<FormValues>({
        resolver: zodResolver(organizationDetails),
        defaultValues: {
            name: "",
            email: "",
            password: "",
            confirmPassword: "",
            roleType: "",
        },
        mode: "onChange",
    });
    function onSubmit(values: FormValues) {
        console.log(values);
        handleCompleteCurrentStep();
        navigate({
            to: "/dashboard",
        });
    }

    return (
        <FormProvider {...form}>
            <form>
                <div className="flex flex-col items-center justify-center gap-8">
                    <h1 className="text-[1.6rem]">Create your profile in the organization</h1>
                    <FormField
                        control={form.control}
                        name="name"
                        render={({ field: { onChange, value, ...field } }) => (
                            <FormItem>
                                <FormControl>
                                    <MyInput
                                        inputType="text"
                                        inputPlaceholder="Full name (First and Last)"
                                        input={value}
                                        onChangeFunction={onChange}
                                        required={true}
                                        error={form.formState.errors.name?.message}
                                        size="large"
                                        label="Full Name"
                                        {...field}
                                        className="w-96"
                                    />
                                </FormControl>
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="email"
                        render={({ field: { onChange, value, ...field } }) => (
                            <FormItem>
                                <FormControl>
                                    <MyInput
                                        inputType="email"
                                        inputPlaceholder="Enter Email"
                                        input={value}
                                        onChangeFunction={onChange}
                                        required={true}
                                        error={form.formState.errors.email?.message}
                                        size="large"
                                        label="Email"
                                        {...field}
                                        className="w-96"
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
                                        inputPlaceholder="******"
                                        input={value}
                                        onChangeFunction={onChange}
                                        required={true}
                                        error={form.formState.errors.password?.message}
                                        size="large"
                                        label="Password"
                                        {...field}
                                        className="w-96"
                                    />
                                </FormControl>
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="confirmPassword"
                        render={({ field: { onChange, value, ...field } }) => (
                            <FormItem>
                                <FormControl>
                                    <MyInput
                                        inputType="password"
                                        inputPlaceholder="******"
                                        input={value}
                                        onChangeFunction={onChange}
                                        required={true}
                                        error={form.formState.errors.confirmPassword?.message}
                                        size="large"
                                        label="Confirm Password"
                                        {...field}
                                        className="w-96"
                                    />
                                </FormControl>
                            </FormItem>
                        )}
                    />
                    <SelectField
                        label="Role Type"
                        name="roleType"
                        options={RoleType.map((option, index) => ({
                            value: option,
                            label: option,
                            _id: index,
                        }))}
                        control={form.control}
                        className="w-96"
                        required
                    />
                    <MyButton
                        type="button"
                        scale="large"
                        buttonType="primary"
                        layoutVariant="default"
                        onClick={form.handleSubmit(onSubmit)}
                        className="mt-4"
                    >
                        Finish
                    </MyButton>
                </div>
            </form>
        </FormProvider>
    );
};

export default Step2AddOrgDetails;
