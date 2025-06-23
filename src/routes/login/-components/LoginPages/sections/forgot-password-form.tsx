import { useEffect, useState } from 'react';
import { FormContainer } from '@/routes/login/-components/LoginPages/layout/form-container';
import { Heading } from '@/routes/login/-components/LoginPages/ui/heading';
import { MyInput } from '@/components/design-system/input';
import { Link } from '@tanstack/react-router';
import { forgotPasswordSchema } from '@/schemas/login/login';
import { z } from 'zod';
import { forgotPassword } from '@/hooks/login/send-link-button';
import { useMutation } from '@tanstack/react-query';
import { MyButton } from '@/components/design-system/button';
import { toast } from 'sonner';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormField, FormItem } from '@/components/ui/form';
import { EnvelopeSimple, WhatsappLogo } from 'phosphor-react';
import { goToMailSupport, goToWhatsappSupport } from '@/lib/utils';

type FormValues = z.infer<typeof forgotPasswordSchema>;

export function ForgotPassword() {
    const [cooldown, setCooldown] = useState(0);

    const form = useForm<FormValues>({
        resolver: zodResolver(forgotPasswordSchema),
        defaultValues: {
            email: '',
        },
        mode: 'onTouched',
    });

    // Countdown logic
   useEffect(() => {
    let timer: NodeJS.Timeout | undefined;

    if (cooldown > 0) {
        timer = setInterval(() => {
            setCooldown((prev) => prev - 1);
        }, 1000);
    }

    return () => {
        if (timer) clearInterval(timer);
    };
}, [cooldown]);


    const forgotPasswordMutation = useMutation({
        mutationFn: async (email: string) => {
            console.log('[Mutation] Calling forgotPassword with:', email);
            const res = await forgotPassword(email);
            console.log('[Mutation] Response from forgotPassword:', res);
            return res;
        },
        onSuccess: (response) => {
            if (response.status === 'success') {
                console.log('[Mutation] Success: Reset link sent.');
                toast.success('Reset link sent to your email.', {
                    className: 'success-toast',
                    duration: 3000,
                });
                setCooldown(60); // Start cooldown
                form.reset();
            } else {
                console.warn('[Mutation] Error:', response.message);
                toast.error('Login Error', {
                    description: response.message || "This account doesn't exist",
                    className: 'error-toast',
                    duration: 3000,
                });
            }
        },
        onError: (error: any) => {
            console.error('[Mutation] Unexpected error:', error);
            toast.error('Something went wrong', {
                description: error?.message || 'Unable to process your request',
                className: 'error-toast',
                duration: 3000,
            });
        },
    });

    function onSubmit(values: FormValues) {
        console.log('[Form Submit] Values:', values);
        forgotPasswordMutation.mutate(values.email);
    }

    const isDisabled = forgotPasswordMutation.isPending || cooldown > 0;
    const buttonText = forgotPasswordMutation.isPending
        ? 'Sending...'
        : cooldown > 0
        ? `Resend in ${cooldown}s`
        : 'Send Reset Link';

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
                            <div className="flex w-full flex-col items-center justify-center gap-8">
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

                                <div className="flex flex-col items-center gap-4">
                                    <MyButton
                                        type="submit"
                                        scale="large"
                                        buttonType="primary"
                                        layoutVariant="default"
                                        disabled={isDisabled}
                                    >
                                        {buttonText}
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

                                <div className="space-y-2">
                                    <div className="relative">
                                        <div className="absolute inset-0 flex items-center">
                                            <span className="w-full border-t border-black" />
                                        </div>
                                        <div className="relative flex justify-center text-xs uppercase">
                                            <span className="bg-background px-2 text-muted-foreground">
                                                Or connect with us
                                            </span>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <MyButton
                                            buttonType="secondary"
                                            type="button"
                                            className="w-full"
                                            onClick={goToWhatsappSupport}
                                        >
                                            <WhatsappLogo className="size-6" />
                                            WhatsApp
                                        </MyButton>
                                        <MyButton
                                            buttonType="secondary"
                                            type="button"
                                            className="w-full"
                                            onClick={goToMailSupport}
                                        >
                                            <EnvelopeSimple className="size-6" />
                                            Email
                                        </MyButton>
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
