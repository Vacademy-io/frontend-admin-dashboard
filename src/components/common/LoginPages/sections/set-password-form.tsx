import { FormContainer } from "@/components/common/LoginPages/layout/form-container";
import { Heading } from "@/components/common/LoginPages/ui/heading";
import { MyInput } from "@/components/design-system/input";
import { MyButton } from "@/components/design-system/button";
import { Link } from "@tanstack/react-router";
import { setPasswordSchema } from "@/schemas/login/login";
import { z } from "zod";
import { setPassword } from "@/hooks/login/reset-password-button";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form";
import { toast } from "sonner";

type FormValues = z.infer<typeof setPasswordSchema>;

export function SetPassword() {
    const form = useForm<FormValues>({
        resolver: zodResolver(setPasswordSchema),
        defaultValues: {
            password: "",
            confirmPassword: "",
        },
        mode: "onTouched",
    });

    const mutation = useMutation({
        mutationFn: (values: FormValues) => setPassword(values.password),
        onSuccess: (response) => {
            if (response.status === "success") {
                // Handle successful password set (e.g., redirect or show success message)
                toast.error("Login Error", {
                    description: "Your password is incorrect or this account doesn't exist.",
                    className: "error-toast",
                    duration: 3000,
                });
            } else {
                // Handle failed password set
                toast.error("Login Error", {
                    description: "Your password is incorrect or this account doesn't exist.",
                    className: "error-toast",
                    duration: 3000,
                });
            }
        },
        onError: () => {
            toast.error("Login Error", {
                description: "Your password is incorrect or this account doesn't exist.",
                className: "error-toast",
                duration: 3000,
            });
        },
    });

    function onSubmit(values: FormValues) {
        mutation.mutate(values);
    }

    return (
        <FormContainer>
            <div className="flex w-full flex-col items-center gap-16">
                <Heading
                    heading="Set New Password"
                    subHeading="Secure your account with a new password"
                />

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="w-full">
                        <div className="flex w-full flex-col gap-8 px-20">
                            <FormField
                                control={form.control}
                                name="password"
                                render={({ field: { onChange, value, ...field } }) => (
                                    <FormItem>
                                        <FormControl>
                                            <MyInput
                                                inputType="password"
                                                label="New password"
                                                inputPlaceholder="••••••••"
                                                input={value}
                                                setInput={onChange}
                                                error={form.formState.errors.password?.message}
                                                required={true}
                                                size="large"
                                                {...field}
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
                                                label="Confirm new password"
                                                inputPlaceholder="••••••••"
                                                input={value}
                                                setInput={onChange}
                                                error={
                                                    form.formState.errors.confirmPassword?.message
                                                }
                                                required={true}
                                                size="large"
                                                {...field}
                                            />
                                        </FormControl>
                                    </FormItem>
                                )}
                            />
                        </div>

                        <div className="mt-16 flex flex-col items-center gap-4">
                            <MyButton
                                type="submit"
                                scale="large"
                                buttonType="primary"
                                layoutVariant="default"
                            >
                                Reset Password
                            </MyButton>
                            <div className="flex gap-1 text-body font-regular">
                                <div className="cursor-pointer text-neutral-600">
                                    Back to Login?
                                </div>
                                <Link to="/login" className="cursor-pointer text-primary-500">
                                    Login
                                </Link>
                            </div>
                        </div>
                    </form>
                </Form>
            </div>
        </FormContainer>
    );
}
