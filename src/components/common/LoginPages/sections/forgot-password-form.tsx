import { FormContainer } from "@/components/common/LoginPages/layout/form-container";
import { Heading } from "@/components/common/LoginPages/ui/heading";
import { MyInput } from "@/components/design-system/input";
import { Link } from "@tanstack/react-router";
import { forgotPasswordSchema } from "@/schemas/login";
import { z } from "zod";
import { forgotPassword } from "@/hooks/dummy/login/send-link-button";
import { sendResetLink } from "@/hooks/dummy/login/reset-link-click";
import { useMutation } from "@tanstack/react-query";
import { MyButton } from "@/components/design-system/button";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form";

type FormValues = z.infer<typeof forgotPasswordSchema>;

export function ForgotPassword() {
    const form = useForm<FormValues>({
        resolver: zodResolver(forgotPasswordSchema),
        defaultValues: {
            email: "",
        },
        mode: "onTouched",
    });

    const forgotPasswordMutation = useMutation({
        mutationFn: (email: string) => forgotPassword(email),
        onSuccess: async (response) => {
            if (response.status === "success") {
                toast.success("Password Sent Successfully", {
                    className: "success-toast",
                    duration: 2000,
                });

                sendResetLinkMutation.mutate();
            } else {
                toast.error("Login Error", {
                    description: "This account doesn't exist",
                    className: "error-toast",
                    duration: 2000,
                });
                form.reset(); // Clear email field if request fails
            }
        },
        onError: () => {
            toast.error("Login Error", {
                description: "This account doesn't exist",
                className: "error-toast",
                duration: 2000,
            });
        },
    });

    const sendResetLinkMutation = useMutation({
        mutationFn: sendResetLink,
        onSuccess: (response) => {
            if (response.status != "success") {
                toast.error("Failed to reset the password", {
                    className: "error-toast",
                    duration: 3000,
                });
            }
        },
        onError: () => {
            toast.error("Failed to reset the password", {
                className: "error-toast",
                duration: 3000,
            });
        },
    });

    function onSubmit(values: FormValues) {
        forgotPasswordMutation.mutate(values.email);
    }

    return (
        <div>
            <FormContainer>
                <div className="flex w-full flex-col items-center justify-center gap-20">
                    <Heading
                        heading="Forgot Password"
                        subHeading="Enter your email, and we'll send your password to your inbox"
                    />
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="w-full">
                            <div className="flex w-full flex-col items-center justify-center gap-20">
                                <FormField
                                    control={form.control}
                                    name="email"
                                    render={({ field: { onChange, value, ...field } }) => (
                                        <FormItem>
                                            <FormControl>
                                                <MyInput
                                                    inputType="email"
                                                    inputPlaceholder="you@email.com"
                                                    input={value}
                                                    setInput={onChange}
                                                    error={form.formState.errors.email?.message}
                                                    required={true}
                                                    size="large"
                                                    label="Email"
                                                    {...field}
                                                />
                                            </FormControl>
                                        </FormItem>
                                    )}
                                />

                                <div className="flex flex-col items-center gap-4">
                                    <MyButton
                                        type="submit"
                                        scale="large"
                                        buttonType="primary"
                                        layoutVariant="default"
                                    >
                                        Get Password
                                    </MyButton>
                                    <div className="flex gap-1 text-body font-regular">
                                        <div className="text-neutral-500">
                                            Remember your password?
                                        </div>
                                        <Link
                                            to="/login"
                                            className="cursor-pointer text-primary-500"
                                        >
                                            Back to Login
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </form>
                    </Form>
                </div>
            </FormContainer>
        </div>
    );
}