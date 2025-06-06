import { Heading } from '@/routes/login/-components/LoginPages/ui/heading';
import { MyInput } from '@/components/design-system/input';
import { MyButton } from '@/components/design-system/button';
import { Link } from '@tanstack/react-router';
import { loginSchema } from '@/schemas/login/login';
import { useEffect } from 'react';
import { SplashScreen } from '@/routes/login/-components/LoginPages/layout/splash-container';
import { loginUser } from '@/hooks/login/login-button';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAnimationStore } from '@/stores/login/animationStore';
import { toast } from 'sonner';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormField, FormItem } from '@/components/ui/form';
import { useNavigate } from '@tanstack/react-router';
import { setAuthorizationCookie } from '@/lib/auth/sessionUtility';
import { TokenKey } from '@/constants/auth/tokens';
import { Link2Icon } from 'lucide-react';
import { handleOAuthLogin } from '@/hooks/login/oauth-login';
import { GitHubLogoIcon } from '@radix-ui/react-icons';
import { FcGoogle } from 'react-icons/fc';


type FormValues = z.infer<typeof loginSchema>;

export function LoginForm() {
    const queryClient = useQueryClient();
    const { hasSeenAnimation, setHasSeenAnimation } = useAnimationStore();
    const navigate = useNavigate();

    const form = useForm<FormValues>({
        resolver: zodResolver(loginSchema),
        defaultValues: {
            username: '',
            password: '',
        },
        mode: 'onTouched',
    });

    useEffect(() => {
        if (!hasSeenAnimation) {
            setTimeout(() => {
                setHasSeenAnimation();
            }, 8000);
        }
    }, [hasSeenAnimation, setHasSeenAnimation]);

    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const accessToken = urlParams.get('accessToken');
        const refreshToken = urlParams.get('refreshToken');

        if (accessToken && refreshToken) {
            setAuthorizationCookie(TokenKey.accessToken, accessToken);
            setAuthorizationCookie(TokenKey.refreshToken, refreshToken);
            queryClient.invalidateQueries({ queryKey: ['GET_INIT_INSTITUTE'] });
            navigate({ to: '/dashboard' });
        }
    }, [navigate, queryClient]);

    const mutation = useMutation({
        mutationFn: (values: FormValues) => loginUser(values.username, values.password),
        onSuccess: (response) => {
            if (response) {
                queryClient.invalidateQueries({ queryKey: ['GET_INIT_INSTITUTE'] });
                setAuthorizationCookie(TokenKey.accessToken, response.accessToken);
                setAuthorizationCookie(TokenKey.refreshToken, response.refreshToken);
                navigate({ to: '/dashboard' });
            } else {
                toast.error('Login Error', {
                    description: 'Invalid credentials',
                    className: 'error-toast',
                    duration: 3000,
                });
            }
        },
        onError: () => {
            toast.error('Login Error', {
                description: 'Invalid username or password',
                className: 'error-toast',
                duration: 3000,
            });
        },
    });

    function onSubmit(values: FormValues) {
        mutation.mutate(values);
    }

    const handleNavigateSignup = () => {
        navigate({ to: '/signup' });
    };

    const handleNavigateAiEvaluator = () => {
        navigate({ to: '/evaluator-ai' });
    };

    return (
        <SplashScreen isAnimationEnabled={!hasSeenAnimation}>
            <div className="flex w-full flex-col items-center justify-center gap-20">
                <Heading
                    heading="Glad To Have You Back!"
                    subHeading="Login and take the reins - your admin tools are waiting!"
                />

                <div className="flex w-full flex-col items-center gap-8">
                    <div className="flex w-full max-w-[348px] flex-col gap-4">
                        <button
                            className="flex w-full items-center justify-center gap-2 rounded-lg border border-neutral-200 bg-white px-4 py-2.5 text-sm font-medium text-neutral-700 shadow-sm transition-colors hover:bg-neutral-50"
                            onClick={() => handleOAuthLogin('google', { isSignup: false })}
                            type="button"
                        >
                            {FcGoogle({ size: 20 })}

                            Continue with Google
                        </button>
                        <button
                            className="flex w-full items-center justify-center gap-2 rounded-lg border border-neutral-200 bg-white px-4 py-2.5 text-sm font-medium text-neutral-700 shadow-sm transition-colors hover:bg-neutral-50"
                            onClick={() => handleOAuthLogin('github', { isSignup: false })}
                            type="button"
                        >
                            <GitHubLogoIcon className="size-5" />
                            Continue with GitHub
                        </button>

                        <div className="relative flex items-center justify-center">
                            <div className="absolute inset-0 flex items-center">
                                <span className="w-full border-t" />
                            </div>
                            <div className="relative bg-white px-4 text-sm text-neutral-500">
                                or continue with
                            </div>
                        </div>
                    </div>

                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="w-full">
                            <div className="flex w-full flex-col items-center justify-center gap-8 px-16">
                                <FormField
                                    control={form.control}
                                    name="username"
                                    render={({ field: { onChange, value, ...field } }) => (
                                        <FormItem>
                                            <FormControl>
                                                <MyInput
                                                    inputType="text"
                                                    inputPlaceholder="Enter your username"
                                                    input={value}
                                                    onChangeFunction={onChange}
                                                    error={form.formState.errors.username?.message}
                                                    required={true}
                                                    size="large"
                                                    label="Username"
                                                    {...field}
                                                    className="w-[348px]"
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
                                                        error={
                                                            form.formState.errors.password?.message
                                                        }
                                                        required={true}
                                                        size="large"
                                                        label="Password"
                                                        {...field}
                                                        className="w-[348px]"
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
                                <p className="text-sm">
                                    Don&apos;t have an account?&nbsp;&nbsp;
                                    <span
                                        className="cursor-pointer text-primary-500"
                                        onClick={handleNavigateSignup}
                                    >
                                        Create One
                                    </span>
                                </p>
                                <p className="text-caption font-regular text-primary-500">
                                    <span
                                        className="cursor-pointer text-primary-500"
                                        onClick={handleNavigateAiEvaluator}
                                    >
                                        <Link2Icon className="mr-1 inline size-4" />
                                        Try Our AI Evaluator Tool
                                    </span>
                                </p>
                            </div>
                        </form>
                    </Form>
                </div>
            </div>
        </SplashScreen>
    );
}
