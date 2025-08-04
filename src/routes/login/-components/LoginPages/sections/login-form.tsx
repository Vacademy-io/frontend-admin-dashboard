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
import {
    setAuthorizationCookie,
    handleSSOLogin,
    getUserRoles,
    removeCookiesAndLogout,
} from '@/lib/auth/sessionUtility';
import { TokenKey } from '@/constants/auth/tokens';
import { Link2Icon } from 'lucide-react';
import { handleOAuthLogin } from '@/hooks/login/oauth-login';
import { GitHubLogoIcon } from '@radix-ui/react-icons';
import { FcGoogle } from 'react-icons/fc';
import { EmailLogin } from './EmailOtpForm';
import { useState } from 'react';
import { amplitudeEvents, trackEvent } from '@/lib/amplitude';
import { InstituteSelection } from './InstituteSelection';
import {
    getInstituteSelectionResult,
    setSelectedInstitute,
    shouldBlockStudentLogin,
} from '@/lib/auth/instituteUtils';
import { getTokenFromCookie } from '@/lib/auth/sessionUtility';

type FormValues = z.infer<typeof loginSchema>;

export function LoginForm() {
    const queryClient = useQueryClient();
    const { hasSeenAnimation, setHasSeenAnimation } = useAnimationStore();
    const navigate = useNavigate();
    const [isEmailLogin, setIsEmailLogin] = useState(false);
    const [showInstituteSelection, setShowInstituteSelection] = useState(false);

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
        // Check for error parameters from OAuth
        const urlParams = new URLSearchParams(window.location.search);
        const error = urlParams.get('error');
        const showInstituteSelection = urlParams.get('showInstituteSelection');

        if (error === 'student_access_denied') {
            toast.error('Access Denied', {
                description:
                    'Students are not allowed to access the admin portal. Please contact your administrator.',
                className: 'error-toast',
                duration: 5000,
            });
            return;
        }

        // Check if we should show institute selection from URL parameter
        if (showInstituteSelection === 'true') {
            setShowInstituteSelection(true);
            return;
        }

        // Handle SSO login from URL parameters
        const ssoLoginSuccess = handleSSOLogin();

        if (ssoLoginSuccess) {
            // Track SSO login success
            amplitudeEvents.signIn('sso');
            trackEvent('Login Success', {
                login_method: 'sso',
                timestamp: new Date().toISOString(),
            });

            // Clear all queries to ensure fresh data fetch
            queryClient.clear();

            // Add a small delay to ensure tokens are properly set before navigation
            setTimeout(() => {
                navigate({ to: '/dashboard' });
            }, 100);
            return;
        }

        const accessToken = urlParams.get('accessToken');
        const refreshToken = urlParams.get('refreshToken');

        if (accessToken && refreshToken) {
            setAuthorizationCookie(TokenKey.accessToken, accessToken);
            setAuthorizationCookie(TokenKey.refreshToken, refreshToken);

            // Clear all queries to ensure fresh data fetch
            queryClient.clear();

            // Track OAuth login success
            amplitudeEvents.signIn('oauth');
            trackEvent('Login Success', {
                login_method: 'oauth',
                timestamp: new Date().toISOString(),
            });

            // Check user roles and redirect accordingly
            const userRoles = getUserRoles(accessToken);

            // Add a small delay to ensure tokens are properly set before navigation
            setTimeout(() => {
                handlePostLoginRedirect(userRoles);
            }, 100);
        } else {
            // Check if we have tokens in cookies and need to show institute selection
            const cookieAccessToken = getTokenFromCookie(TokenKey.accessToken);
            if (cookieAccessToken) {
                // Check if user needs to select an institute
                const instituteResult = getInstituteSelectionResult();

                if (instituteResult.shouldShowSelection) {
                    setShowInstituteSelection(true);
                    return;
                }
            }
        }
    }, [navigate, queryClient]);

    const handlePostLoginRedirect = (userRoles: string[]) => {
        // Check if user should be blocked from logging in (only has STUDENT role)
        if (shouldBlockStudentLogin()) {
            // Track blocked login attempt
            trackEvent('Login Blocked', {
                login_method: 'username_password',
                reason: 'student_only_role',
                user_roles: userRoles,
                timestamp: new Date().toISOString(),
            });

            // Clear tokens and show error
            removeCookiesAndLogout();

            toast.error('Access Denied', {
                description:
                    'Students are not allowed to access the admin portal. Please contact your administrator.',
                className: 'error-toast',
                duration: 5000,
            });

            return;
        }

        // Check if user needs to select an institute
        const instituteResult = getInstituteSelectionResult();

        if (instituteResult.shouldShowSelection) {
            setShowInstituteSelection(true);
            return;
        }

        // User has only one institute or no valid institutes
        if (instituteResult.selectedInstitute) {
            setSelectedInstitute(instituteResult.selectedInstitute.id);
        }

        // Navigate to dashboard
        navigate({ to: '/dashboard' });
    };

    const mutation = useMutation({
        mutationFn: (values: FormValues) => loginUser(values.username, values.password),
        onSuccess: (response) => {
            if (response) {
                // Store tokens in cookies first
                setAuthorizationCookie(TokenKey.accessToken, response.accessToken);
                setAuthorizationCookie(TokenKey.refreshToken, response.refreshToken);

                // Clear all queries to ensure fresh data fetch
                queryClient.clear();

                // Track successful login
                amplitudeEvents.signIn('username_password');

                // Identify user if you have user information
                // You can add more user properties here based on the response
                const userRoles = getUserRoles(response.accessToken);
                trackEvent('Login Success', {
                    login_method: 'username_password',
                    user_roles: userRoles,
                    timestamp: new Date().toISOString(),
                });

                // Add a small delay to ensure tokens are properly set before navigation
                setTimeout(() => {
                    handlePostLoginRedirect(userRoles);
                }, 100);
            } else {
                // Track failed login
                trackEvent('Login Failed', {
                    login_method: 'username_password',
                    error_reason: 'invalid_credentials',
                    timestamp: new Date().toISOString(),
                });

                toast.error('Login Error', {
                    description: 'Invalid credentials',
                    className: 'error-toast',
                    duration: 3000,
                });
            }
        },
        onError: (error) => {
            // Track login error
            trackEvent('Login Failed', {
                login_method: 'username_password',
                error_reason: 'network_error',
                error_message: error?.message || 'Unknown error',
                timestamp: new Date().toISOString(),
            });

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

    const handleSwitchToEmail = () => {
        setIsEmailLogin(true);
    };

    const handleSwitchToUsername = () => {
        setIsEmailLogin(false);
    };

    const handleInstituteSelect = (instituteId: string) => {
        setSelectedInstitute(instituteId);
        setShowInstituteSelection(false);

        // Navigate to dashboard after institute selection
        navigate({ to: '/dashboard' });
    };

    // Show institute selection if needed
    if (showInstituteSelection) {
        return <InstituteSelection onInstituteSelect={handleInstituteSelect} />;
    }

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
                            onClick={() => {
                                trackEvent('OAuth Login Initiated', {
                                    provider: 'google',
                                    action: 'login',
                                    timestamp: new Date().toISOString(),
                                });
                                handleOAuthLogin('google', { isSignup: false });
                            }}
                            type="button"
                        >
                            {FcGoogle({ size: 20 })}
                            Continue with Google
                        </button>
                        <button
                            className="flex w-full items-center justify-center gap-2 rounded-lg border border-neutral-200 bg-white px-4 py-2.5 text-sm font-medium text-neutral-700 shadow-sm transition-colors hover:bg-neutral-50"
                            onClick={() => {
                                trackEvent('OAuth Login Initiated', {
                                    provider: 'github',
                                    action: 'login',
                                    timestamp: new Date().toISOString(),
                                });
                                handleOAuthLogin('github', { isSignup: false });
                            }}
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

                    {isEmailLogin ? (
                        <EmailLogin onSwitchToUsername={handleSwitchToUsername} />
                    ) : (
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
                                                        error={
                                                            form.formState.errors.username?.message
                                                        }
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
                                                                form.formState.errors.password
                                                                    ?.message
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
                                        <div className="flex items-center justify-between pl-1">
                                            <Link to="/login/forgot-password">
                                                <div className="cursor-pointer text-caption font-regular text-primary-500">
                                                    Forgot Password?
                                                </div>
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                                {/* <button
                                    type="button"
                                    onClick={handleSwitchToEmail}
                                    className="hover:text-primary-600 cursor-pointer text-caption font-regular text-primary-500 transition-colors"
                                >
                                    Prefer email login?
                                </button> */}

                                <div className="mt-8 flex flex-col items-center gap-1">
                                    <MyButton
                                        type="submit"
                                        scale="large"
                                        buttonType="primary"
                                        layoutVariant="default"
                                        disabled={mutation.isPending}
                                    >
                                        {mutation.isPending ? 'Logging in...' : 'Login'}
                                    </MyButton>
                                    <div className="flex w-full items-center justify-center p-4">
                                        <button
                                            type="button"
                                            onClick={handleSwitchToEmail}
                                            className="hover:text-primary-600 cursor-pointer text-sm font-regular text-primary-500 transition-colors"
                                        >
                                            Prefer email login?
                                        </button>
                                    </div>

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
                    )}
                </div>
            </div>
        </SplashScreen>
    );
}
