import { MyInput } from '@/components/design-system/input';
import { MyButton } from '@/components/design-system/button';
import { Link } from '@tanstack/react-router';
import { loginSchema } from '@/schemas/login/login';
import { useEffect } from 'react';
// Removed split-screen splash layout to center the login component
import { loginUser, loginResponseSchema } from '@/hooks/login/login-button';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAnimationStore } from '@/stores/login/animationStore';
import { toast } from 'sonner';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormField, FormItem } from '@/components/ui/form';
import { useNavigate } from '@tanstack/react-router';
import { handleSSOLogin } from '@/lib/auth/sessionUtility';
import { TokenKey } from '@/constants/auth/tokens';
// import { Link2Icon } from 'lucide-react';
import { handleOAuthLogin } from '@/hooks/login/oauth-login';
import { GitHubLogoIcon } from '@radix-ui/react-icons';
import { FcGoogle } from 'react-icons/fc';
import { EmailLogin } from './EmailOtpForm';
import { useState } from 'react';
import { amplitudeEvents, trackEvent } from '@/lib/amplitude';
import { InstituteSelection } from './InstituteSelection';
import { getInstituteSelectionResult, setSelectedInstitute } from '@/lib/auth/instituteUtils';
import { getTokenFromCookie, getUserRoles } from '@/lib/auth/sessionUtility';
import { handleLoginFlow } from '@/lib/auth/loginFlowHandler';
import { getCachedInstituteBranding } from '@/services/domain-routing';
import useInstituteLogoStore from '@/components/common/layout-container/sidebar/institutelogo-global-zustand';
import { getDisplaySettings } from '@/services/display-settings';
import { ADMIN_DISPLAY_SETTINGS_KEY, TEACHER_DISPLAY_SETTINGS_KEY } from '@/types/display-settings';

type FormValues = z.infer<typeof loginSchema>;

export function LoginForm() {
    const queryClient = useQueryClient();
    const { hasSeenAnimation, setHasSeenAnimation } = useAnimationStore();
    const navigate = useNavigate();
    const { instituteLogo } = useInstituteLogoStore();
    const cachedBranding = getCachedInstituteBranding();
    const instituteName = cachedBranding?.instituteName;
    const portalRoleLabel = cachedBranding?.role === 'TEACHER' ? 'Teacher' : 'Admin';
    const portalInstitute = instituteName || 'Vacademy';
    const [isEmailLogin, setIsEmailLogin] = useState(false);
    const [providerFlags, setProviderFlags] = useState({
        allowGoogleAuth: true,
        allowGithubAuth: true,
        allowEmailOtpAuth: true,
        allowUsernamePasswordAuth: true,
    });
    const [allowSignup, setAllowSignup] = useState(false);
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
        // Initialize auth provider toggles and signup visibility from cached branding
        try {
            const cached = getCachedInstituteBranding();
            if (cached) {
                setProviderFlags({
                    allowGoogleAuth: cached.allowGoogleAuth !== false,
                    allowGithubAuth: cached.allowGithubAuth !== false,
                    allowEmailOtpAuth: cached.allowEmailOtpAuth !== false,
                    allowUsernamePasswordAuth: cached.allowUsernamePasswordAuth !== false,
                });
                setAllowSignup(cached.allowSignup !== false);

                // Prefer email login if username/password is disabled
                if (
                    cached.allowUsernamePasswordAuth === false &&
                    cached.allowEmailOtpAuth !== false
                ) {
                    setIsEmailLogin(true);
                }
            }
        } catch (_e) {
            // ignore
        }

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

        if (error === 'admin_role_required') {
            toast.error('Access Denied', {
                description:
                    'This portal requires ADMIN privileges. Please contact your administrator.',
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

            // Use centralized login flow for SSO
            const cookieAccessToken = getTokenFromCookie(TokenKey.accessToken);
            const cookieRefreshToken = getTokenFromCookie(TokenKey.refreshToken);

            if (cookieAccessToken && cookieRefreshToken) {
                setTimeout(async () => {
                    try {
                        const result = await handleLoginFlow({
                            loginMethod: 'sso',
                            accessToken: cookieAccessToken,
                            refreshToken: cookieRefreshToken,
                            queryClient,
                        });

                        if (!result.success) {
                            const errorMessage =
                                result.error === 'admin_role_required'
                                    ? 'This portal requires ADMIN privileges. Please contact your administrator.'
                                    : 'Students are not allowed to access the admin portal. Please contact your administrator.';

                            toast.error('Access Denied', {
                                description: errorMessage,
                                className: 'error-toast',
                                duration: 5000,
                            });
                            return;
                        }

                        if (result.shouldShowInstituteSelection) {
                            setShowInstituteSelection(true);
                            return;
                        }

                        const redirectUrl = result.redirectUrl || '/dashboard';
                        navigate({ to: redirectUrl });
                    } catch (error) {
                        console.error('SSO login flow error:', error);
                        toast.error('Login failed. Please try again.');
                    }
                }, 100);
            }
            return;
        }

        const accessToken = urlParams.get('accessToken');
        const refreshToken = urlParams.get('refreshToken');

        if (accessToken && refreshToken) {
            // Use centralized login flow for OAuth
            setTimeout(async () => {
                try {
                    const result = await handleLoginFlow({
                        loginMethod: 'oauth',
                        accessToken,
                        refreshToken,
                        queryClient,
                    });

                    if (!result.success) {
                        const errorMessage =
                            result.error === 'admin_role_required'
                                ? 'This portal requires ADMIN privileges. Please contact your administrator.'
                                : 'Students are not allowed to access the admin portal. Please contact your administrator.';

                        toast.error('Access Denied', {
                            description: errorMessage,
                            className: 'error-toast',
                            duration: 5000,
                        });
                        return;
                    }

                    if (result.shouldShowInstituteSelection) {
                        setShowInstituteSelection(true);
                        return;
                    }

                    const redirectUrl = result.redirectUrl || '/dashboard';
                    navigate({ to: redirectUrl });
                } catch (error) {
                    console.error('OAuth login flow error:', error);
                    toast.error('Login failed. Please try again.');
                }
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

    const handlePostLoginRedirect = async (accessToken: string, refreshToken: string) => {
        try {
            // Use centralized login flow
            const result = await handleLoginFlow({
                loginMethod: 'username_password',
                accessToken,
                refreshToken,
                queryClient,
            });

            if (!result.success) {
                // User was blocked or error occurred
                const errorMessage =
                    result.error === 'admin_role_required'
                        ? 'This portal requires ADMIN privileges. Please contact your administrator.'
                        : 'Students are not allowed to access the admin portal. Please contact your administrator.';

                toast.error('Access Denied', {
                    description: errorMessage,
                    className: 'error-toast',
                    duration: 5000,
                });
                return;
            }

            if (result.shouldShowInstituteSelection) {
                setShowInstituteSelection(true);
                return;
            }

            // Navigate to the appropriate URL
            const redirectUrl = result.redirectUrl || '/dashboard';
            navigate({ to: redirectUrl });
        } catch (error) {
            console.error('Login flow error:', error);
            toast.error('Login failed. Please try again.');
        }
    };

    const mutation = useMutation({
        mutationFn: (values: FormValues) => loginUser(values.username, values.password),
        onSuccess: (response: z.infer<typeof loginResponseSchema>) => {
            if (response) {
                // Track successful login
                amplitudeEvents.signIn('username_password');

                // Add a small delay to ensure tokens are properly set before navigation
                setTimeout(() => {
                    handlePostLoginRedirect(response.accessToken, response.refreshToken);
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
        onError: (error: Error) => {
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

    // const handleNavigateAiEvaluator = () => {
    //     navigate({ to: '/evaluator-ai' });
    // };

    const handleSwitchToEmail = () => {
        setIsEmailLogin(true);
    };

    const handleSwitchToUsername = () => {
        setIsEmailLogin(false);
    };

    const handleInstituteSelect = async (instituteId: string) => {
        setSelectedInstitute(instituteId);
        setShowInstituteSelection(false);

        // Navigate to the appropriate route based on display settings
        try {
            // Get user roles to determine which display settings to use
            const accessToken = getTokenFromCookie(TokenKey.accessToken);
            const roles = getUserRoles(accessToken);
            const isAdminRole = roles.includes('ADMIN');
            const roleKey = isAdminRole ? ADMIN_DISPLAY_SETTINGS_KEY : TEACHER_DISPLAY_SETTINGS_KEY;

            // Fetch display settings to get the correct redirect route with retry logic
            let ds: { postLoginRedirectRoute?: string } | null = null;
            const maxRetries = 3;
            let retryCount = 0;

            while (retryCount < maxRetries && !ds) {
                try {
                    console.log(
                        `🔍 LOGIN FORM DEBUG: Fetching display settings for role: ${roleKey} (attempt ${retryCount + 1}/${maxRetries})`
                    );
                    ds = await getDisplaySettings(roleKey, true);
                    console.log('🔍 LOGIN FORM DEBUG: Display settings fetched successfully:', {
                        roleKey,
                        postLoginRedirectRoute: ds?.postLoginRedirectRoute,
                        attempt: retryCount + 1,
                    });
                    break; // Success, exit retry loop
                } catch (fetchError) {
                    retryCount++;
                    console.warn(
                        `🔍 LOGIN FORM DEBUG: Failed to fetch display settings (attempt ${retryCount}/${maxRetries}):`,
                        fetchError
                    );

                    if (retryCount >= maxRetries) {
                        // Final attempt failed, fallback to dashboard
                        console.log(
                            '🔍 LOGIN FORM DEBUG: All retries failed, using dashboard fallback'
                        );
                        ds = { postLoginRedirectRoute: '/dashboard' };
                        break;
                    } else {
                        // Wait before retry (exponential backoff)
                        const delay = Math.pow(2, retryCount - 1) * 500; // 500ms, 1s, 2s
                        console.log(`🔍 LOGIN FORM DEBUG: Retrying in ${delay}ms...`);
                        await new Promise((resolve) => setTimeout(resolve, delay));
                    }
                }
            }

            const redirectUrl = ds?.postLoginRedirectRoute || '/dashboard';
            console.log('🔍 LOGIN FORM DEBUG: Final redirect URL:', redirectUrl);
            navigate({ to: redirectUrl });
        } catch (error) {
            console.warn('Unexpected error in institute selection handler:', error);
            navigate({ to: '/dashboard' });
        }
    };

    // Show institute selection if needed
    if (showInstituteSelection) {
        return <InstituteSelection onInstituteSelect={handleInstituteSelect} />;
    }

    return (
        <div className="flex min-h-screen w-full items-center justify-center bg-gradient-to-b from-neutral-50 to-white">
            <div className="w-full max-w-screen-sm px-4 py-6 md:max-w-[720px]">
                <div className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm md:p-6">
                    <div className="mb-4 text-center md:mb-5">
                        {instituteLogo ? (
                            <img
                                src={instituteLogo}
                                alt="institute logo"
                                className="mx-auto mb-3 size-14 rounded-full"
                            />
                        ) : null}
                        {instituteName ? (
                            <div className="mb-2 text-base font-medium text-neutral-800">
                                {instituteName}
                            </div>
                        ) : null}
                        <div className="text-primary-700 mx-auto inline-block rounded-full border border-primary-200 bg-primary-50 px-3 py-0.5 text-xs">
                            Welcome to the{' '}
                            <span className="font-semibold">{portalRoleLabel} Portal</span> of{' '}
                            <span className="font-semibold">{portalInstitute}</span>
                        </div>
                    </div>

                    <div className="flex w-full flex-col items-center gap-5">
                        <div className="flex w-full max-w-screen-sm flex-col gap-3 md:max-w-[720px]">
                            {providerFlags.allowGoogleAuth && (
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
                            )}
                            {providerFlags.allowGithubAuth && (
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
                            )}

                            {(providerFlags.allowGoogleAuth || providerFlags.allowGithubAuth) && (
                                <div className="relative my-1.5 flex items-center justify-center">
                                    <div className="absolute inset-0 flex items-center">
                                        <span className="w-full border-t" />
                                    </div>
                                    <div className="relative rounded-full border border-neutral-200 bg-white px-3 py-0.5 text-xs text-neutral-500">
                                        or continue with
                                    </div>
                                </div>
                            )}
                        </div>

                        {isEmailLogin ? (
                            <EmailLogin onSwitchToUsername={handleSwitchToUsername} />
                        ) : (
                            <Form {...form}>
                                <form onSubmit={form.handleSubmit(onSubmit)} className="w-full">
                                    <div className="flex w-full max-w-screen-sm flex-col items-center justify-center gap-4 px-6 md:max-w-[720px] md:px-8">
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
                                                                form.formState.errors.username
                                                                    ?.message
                                                            }
                                                            required={true}
                                                            size="large"
                                                            label="Username"
                                                            {...field}
                                                            className="w-full"
                                                        />
                                                    </FormControl>
                                                </FormItem>
                                            )}
                                        />
                                        <div className="flex flex-col gap-2">
                                            <FormField
                                                control={form.control}
                                                name="password"
                                                render={({
                                                    field: { onChange, value, ...field },
                                                }) => (
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
                                                                className="w-full"
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
                                    {providerFlags.allowEmailOtpAuth &&
                                        providerFlags.allowUsernamePasswordAuth && (
                                            <div className="flex w-full items-center justify-center p-2">
                                                <button
                                                    type="button"
                                                    onClick={handleSwitchToEmail}
                                                    className="hover:text-primary-600 cursor-pointer text-sm font-regular text-primary-500 transition-colors"
                                                >
                                                    Prefer email login?
                                                </button>
                                            </div>
                                        )}

                                    <div className="mt-4 flex flex-col items-center gap-1">
                                        <MyButton
                                            type="submit"
                                            scale="large"
                                            buttonType="primary"
                                            layoutVariant="default"
                                            disabled={mutation.isPending}
                                        >
                                            {mutation.isPending ? 'Logging in...' : 'Login'}
                                        </MyButton>
                                        {allowSignup && (
                                            <p className="text-sm">
                                                Don&apos;t have an account?&nbsp;&nbsp;
                                                <span
                                                    className="cursor-pointer text-primary-500"
                                                    onClick={handleNavigateSignup}
                                                >
                                                    Create One
                                                </span>
                                            </p>
                                        )}
                                    </div>
                                </form>
                            </Form>
                        )}
                    </div>
                </div>
                {Boolean(cachedBranding?.termsAndConditionUrl) ||
                Boolean(cachedBranding?.privacyPolicyUrl) ? (
                    <div className="mt-4 text-center text-xs text-neutral-500">
                        {cachedBranding?.termsAndConditionUrl ? (
                            <a
                                href={cachedBranding.termsAndConditionUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="underline hover:text-primary-500"
                            >
                                Terms & Conditions
                            </a>
                        ) : null}
                        {cachedBranding?.termsAndConditionUrl &&
                        cachedBranding?.privacyPolicyUrl ? (
                            <span className="mx-2 text-neutral-400">•</span>
                        ) : null}
                        {cachedBranding?.privacyPolicyUrl ? (
                            <a
                                href={cachedBranding.privacyPolicyUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="underline hover:text-primary-500"
                            >
                                Privacy Policy
                            </a>
                        ) : null}
                    </div>
                ) : null}
            </div>
        </div>
    );
}
