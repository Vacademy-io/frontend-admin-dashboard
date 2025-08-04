import { toast } from 'sonner';
import { setAuthorizationCookie } from '@/lib/auth/sessionUtility';
import { TokenKey } from '@/constants/auth/tokens';

export type OAuthProvider = 'google' | 'github';

interface OAuthLoginOptions {
    isSignup?: boolean;
    assess?: boolean;
    lms?: boolean;
}

export const handleOAuthLogin = (provider: OAuthProvider, options: OAuthLoginOptions = {}) => {
    try {
        const { isSignup = false, assess = false, lms = false } = options;

        const redirectPath = isSignup ? '/signup/oauth/callback' : '/login/oauth/redirect';

        const stateObj = {
            from: `${window.location.origin}/login/oauth/redirect?assess=${assess}&lms=${lms}`,
            account_type: isSignup ? (assess ? 'assess' : lms ? 'lms' : '') : '',
        };

        const base64State = btoa(JSON.stringify(stateObj));

        const loginUrl = `${import.meta.env.VITE_BACKEND_URL || 'https://backend-stage.vacademy.io'}/auth-service/oauth2/authorization/${provider}?state=${encodeURIComponent(
            base64State
        )}`;

        window.location.href = loginUrl;
    } catch (error) {
        toast.error('Failed to initiate login. Please try again.');
    }
};
import { shouldBlockStudentLogin, getInstituteSelectionResult, setSelectedInstitute } from '@/lib/auth/instituteUtils';
import { removeCookiesAndLogout } from '@/lib/auth/sessionUtility';

export const handleLoginOAuthCallback = async () => {
    try {
        const urlParams = new URLSearchParams(window.location.search);

        const error = urlParams.get('error');
        const message = urlParams.get('message');
        const stateEncoded = urlParams.get('state');
        const accessToken = urlParams.get('accessToken');
        const refreshToken = urlParams.get('refreshToken');

    if (error === 'true' || message) {
        const errorMsg = message || 'OAuth Authentication failed.';
        toast.error('OAuth Login Failed', {
            description: decodeURIComponent(errorMsg),
            duration: 5000,
        });

        return { success: false };
    }

    if (accessToken && refreshToken) {
        // Set tokens in cookies (same as username/password flow)
        setAuthorizationCookie(TokenKey.accessToken, accessToken);
        setAuthorizationCookie(TokenKey.refreshToken, refreshToken);

        const shouldBlock = shouldBlockStudentLogin();

        if (shouldBlock) {
            // Clear tokens
            removeCookiesAndLogout();

            toast.error('Access Denied', {
                description: 'Students are not allowed to access the admin portal. Please contact your administrator.',
                duration: 5000,
            });

            setTimeout(() => {
                window.location.href = '/login?error=student_access_denied';
            }, 2000);
            return { success: false };
        }

        // Check if user needs to select an institute (same logic as username/password)
        const instituteResult = getInstituteSelectionResult();

        if (instituteResult.shouldShowSelection) {
            // Tokens are already set in cookies, just redirect to institute selection
            return { success: true, shouldShowInstituteSelection: true };
        }

        // User has only one institute - auto-select and redirect to dashboard
        if (instituteResult.selectedInstitute) {
            setSelectedInstitute(instituteResult.selectedInstitute.id);
        }

        // Determine redirect URL
        let redirectUrl = '/dashboard';

        if (stateEncoded) {
            try {
                const decodedState = JSON.parse(atob(decodeURIComponent(stateEncoded)));

                if (decodedState?.from) {
                    redirectUrl = decodedState.from;
                }
            } catch (err) {
                // Failed to decode state, using fallback redirect
            }
        }

        return { success: true, redirectUrl };
    }

        toast.error('Login failed. Missing tokens.');
        return { success: false };
    } catch (error) {
        return { success: false, error: error.message };
    }
};
