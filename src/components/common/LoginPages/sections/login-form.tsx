import { Heading } from "@/components/common/LoginPages/ui/heading";
import { MyInput } from "@/components/design-system/input";
import { MyButton } from "@/components/design-system/button";
import { Link } from "@tanstack/react-router";
import { loginSchema } from "@/schemas/login/login";
import { useEffect } from "react";
import { SplashScreen } from "@/components/common/LoginPages/layout/splash-container";
import { loginUser } from "@/hooks/login/login-button";
import { useMutation } from "@tanstack/react-query";
import { useAnimationStore } from "@/stores/login/animationStore";
import { toast } from "sonner";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form";

type FormValues = z.infer<typeof loginSchema>;

export function LoginForm() {
    const { hasSeenAnimation, setHasSeenAnimation } = useAnimationStore();

    const form = useForm<FormValues>({
        resolver: zodResolver(loginSchema),
        defaultValues: {
            email: "",
            password: "",
        },
        mode: "onTouched", // This will show errors on blur
    });

    useEffect(() => {
        if (!hasSeenAnimation) {
            setTimeout(() => {
                setHasSeenAnimation();
            }, 8000);
        }
    }, [hasSeenAnimation, setHasSeenAnimation]);

    const mutation = useMutation({
        mutationFn: (values: FormValues) => loginUser(values.email, values.password),
        onSuccess: (response) => {
            if (response.status != "success") {
                toast.error("Login Error", {
                    description: "Your password is incorrect or this account doesn't exist.",
                    className: "error-toast",
                    duration: 2000,
                });
                form.reset();
            }
        },
        onError: () => {
            toast.error("Login Error", {
                description: "Your password is incorrect or this account doesn't exist.",
                className: "error-toast",
                duration: 3000,
            });
            form.reset();
        },
    });

    function onSubmit(values: FormValues) {
        mutation.mutate(values);
    }

    return (
        <SplashScreen isAnimationEnabled={!hasSeenAnimation}>
            <div className="flex w-full flex-col items-center justify-center gap-20">
                <Heading
                    heading="Glad To Have You Back!"
                    subHeading="Login and take the reins - your admin tools are waiting!"
                />

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="w-full">
                        <div className="flex w-full flex-col items-center justify-center gap-8 px-16">
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
                                                onChangeFunction={onChange}
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

                            <div className="flex flex-col gap-2">
                                <FormField
                                    control={form.control}
                                    name="password"
                                    render={({ field: { onChange, value, ...field } }) => (
                                        <FormItem>
                                            <FormControl>
                                                <MyInput
                                                    inputType="password"
                                                    inputPlaceholder="••••••••"
                                                    input={value}
                                                    onChangeFunction={onChange}
                                                    error={form.formState.errors.password?.message}
                                                    required={true}
                                                    size="large"
                                                    label="Password"
                                                    {...field}
                                                />
                                            </FormControl>
                                        </FormItem>
                                    )}
                                />
                                <Link to="/login/forgot-password">
                                    <div className="cursor-pointer pl-1 text-caption font-regular text-primary-500">
                                        Forgot Password?
                                    </div>
                                </Link>
                            </div>
                        </div>

                        <div className="mt-20 flex flex-col items-center gap-1">
                            <MyButton
                                type="submit"
                                scale="large"
                                buttonType="primary"
                                layoutVariant="default"
                            >
                                Login
                            </MyButton>
                        </div>
                    </form>
                </Form>
            </div>
        </SplashScreen>
    );
}
