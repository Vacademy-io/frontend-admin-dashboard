import { toast } from 'sonner';
import {
    setAuthorizationCookie,
    getUserRoles,
    removeCookiesAndLogout,
} from '@/lib/auth/sessionUtility';
import { TokenKey } from '@/constants/auth/tokens';
import {
    shouldBlockStudentLogin,
    getInstituteSelectionResult,
    setSelectedInstitute,
    getPrimaryRole,
    getInstitutesFromToken,
} from '@/lib/auth/instituteUtils';
import { getTokenFromCookie } from '@/lib/auth/sessionUtility';
import { trackEvent, identifyUser } from '@/lib/amplitude';
import { getDisplaySettingsFromCache } from '@/services/display-settings';
import { ADMIN_DISPLAY_SETTINGS_KEY, TEACHER_DISPLAY_SETTINGS_KEY } from '@/types/display-settings';
import type { QueryClient } from '@tanstack/react-query';

export interface LoginFlowResult {
    success: boolean;
    shouldShowInstituteSelection?: boolean;
    redirectUrl?: string;
    error?: string;
    userRoles?: string[];
    primaryRole?: string;
    hasStudentRole?: boolean;
    hasAdminRole?: boolean;
}

export interface LoginFlowOptions {
    loginMethod:
        | 'username_password'
        | 'oauth'
        | 'email_otp'
        | 'sso'
        | 'demo_account'
        | 'signup'
        | 'cookie_token';
    accessToken: string;
    refreshToken: string;
    queryClient?: Pick<QueryClient, 'clear'>;
}

/**
 * Centralized login flow handler for all authentication methods
 * Handles role checking, institute selection, and redirection logic
 */
export const handleLoginFlow = async (options: LoginFlowOptions): Promise<LoginFlowResult> => {
    const { loginMethod, accessToken, refreshToken, queryClient } = options;

    try {
        // Set tokens in cookies
        setAuthorizationCookie(TokenKey.accessToken, accessToken);
        setAuthorizationCookie(TokenKey.refreshToken, refreshToken);

        // Clear queries if queryClient is provided
        if (queryClient) {
            queryClient.clear();
        }

        // Identify user to Amplitude (post token set so cookie is available)
        try {
            const { getTokenDecodedData } = await import('@/lib/auth/sessionUtility');
            const tokenData = getTokenDecodedData(accessToken);
            const userId = tokenData?.user as string | undefined;
            if (userId) {
                identifyUser(userId, {
                    login_method: loginMethod,
                    email: tokenData?.email ?? null,
                    username: tokenData?.username ?? null,
                });
            }
        } catch {
            // noop: analytics should not block login flow
        }

        // Get user roles from token
        const userRoles = getUserRoles(accessToken);

        // Check if user should be blocked (only has STUDENT role)
        if (shouldBlockStudentLogin()) {
            // Track blocked login attempt
            trackEvent('Login Blocked', {
                login_method: loginMethod,
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

            return {
                success: false,
                error: 'student_access_denied',
                userRoles,
            };
        }

        // Check institute selection requirements
        const instituteResult = getInstituteSelectionResult();

        if (instituteResult.shouldShowSelection) {
            // User needs to select an institute
            return {
                success: true,
                shouldShowInstituteSelection: true,
                userRoles,
            };
        }

        // User has only one institute or no valid institutes
        if (instituteResult.selectedInstitute) {
            const primaryRole = getPrimaryRole(instituteResult.selectedInstitute.roles);
            const hasStudentRole = instituteResult.selectedInstitute.roles.includes('STUDENT');
            const hasAdminRole = instituteResult.selectedInstitute.roles.includes('ADMIN');

            // Set the selected institute
            setSelectedInstitute(instituteResult.selectedInstitute.id);

            // Determine redirect URL from Display Settings (cached), fallback to dashboard
            const roleKey = hasAdminRole
                ? ADMIN_DISPLAY_SETTINGS_KEY
                : TEACHER_DISPLAY_SETTINGS_KEY;
            const ds = getDisplaySettingsFromCache(roleKey);

            let redirectUrl = ds?.postLoginRedirectRoute || '/dashboard';

            // Preserve learner tab hint if user also has STUDENT role and route points to dashboard
            if (
                hasStudentRole &&
                instituteResult.selectedInstitute.roles.length > 1 &&
                (redirectUrl === '/dashboard' || redirectUrl.startsWith('/dashboard?'))
            ) {
                redirectUrl = '/dashboard?showLearnerTab=true';
            }

            return {
                success: true,
                redirectUrl,
                userRoles,
                primaryRole,
                hasStudentRole,
                hasAdminRole,
            };
        }

        // Fallback - navigate to dashboard
        return {
            success: true,
            redirectUrl: '/dashboard',
            userRoles,
        };
    } catch (error) {
        trackEvent('Login Failed', {
            login_method: loginMethod,
            error_reason: 'login_flow_error',
            error_message: error instanceof Error ? error.message : 'Unknown error',
            timestamp: new Date().toISOString(),
        });

        return {
            success: false,
            error: error instanceof Error ? error.message : 'Login flow failed',
        };
    }
};

/**
 * Handle institute selection and redirect accordingly
 */
export const handleInstituteSelection = (instituteId: string): LoginFlowResult => {
    try {
        const institutes = getInstitutesFromToken();
        const selectedInstitute = institutes.find((inst) => inst.id === instituteId);

        if (!selectedInstitute) {
            return {
                success: false,
                error: 'Institute not found',
            };
        }

        const primaryRole = getPrimaryRole(selectedInstitute.roles);
        const hasStudentRole = selectedInstitute.roles.includes('STUDENT');
        const hasAdminRole = selectedInstitute.roles.includes('ADMIN');
        const userRoles = getUserRoles(getTokenFromCookie(TokenKey.accessToken));

        // Set the selected institute
        setSelectedInstitute(instituteId);

        // Determine redirect URL from Display Settings (cached), fallback to dashboard
        const roleKey = hasAdminRole ? ADMIN_DISPLAY_SETTINGS_KEY : TEACHER_DISPLAY_SETTINGS_KEY;
        const ds = getDisplaySettingsFromCache(roleKey);
        let redirectUrl = ds?.postLoginRedirectRoute || '/dashboard';

        // Preserve learner tab hint if user also has STUDENT role and route points to dashboard
        if (
            hasStudentRole &&
            selectedInstitute.roles.length > 1 &&
            (redirectUrl === '/dashboard' || redirectUrl.startsWith('/dashboard?'))
        ) {
            redirectUrl = '/dashboard?showLearnerTab=true';
        }

        return {
            success: true,
            redirectUrl,
            userRoles,
            primaryRole,
            hasStudentRole,
            hasAdminRole,
        };
    } catch (error) {
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Institute selection failed',
        };
    }
};

/**
 * Navigate to the appropriate URL based on login flow result
 */
export const navigateFromLoginFlow = (result: LoginFlowResult): void => {
    if (!result.success) {
        return;
    }

    if (result.shouldShowInstituteSelection) {
        // Redirect to institute selection page
        window.location.href = '/login?showInstituteSelection=true';
        return;
    }

    if (result.redirectUrl) {
        // Navigate to the determined URL
        window.location.href = result.redirectUrl;
        return;
    }

    // Fallback to dashboard
    window.location.href = '/dashboard';
};
