import { toast } from 'sonner';
import { TokenKey } from '@/constants/auth/tokens';
import { setAuthorizationCookie } from '@/lib/auth/sessionUtility';

export type OAuthProvider = 'google' | 'github';

interface OAuthLoginOptions {
    isSignup?: boolean;
    assess?: boolean;
    lms?: boolean;
}

export const handleOAuthLogin = (provider: OAuthProvider, options: OAuthLoginOptions = {}) => {
    try {
        const { isSignup = false, assess = false, lms = false } = options;

        // Create state object with redirect information
        const stateObj = {
            from: `http://localhost:5173/${isSignup ? 'signup/onboarding?assess=true&lms=false&' : 'login'}`,
            account_type: isSignup ? (assess ? 'assess' : lms ? 'lms' : '') : '',
        };

        // Encode state as base64
        const base64State = btoa(JSON.stringify(stateObj));

        // Construct OAuth URL
        const loginUrl = `https://backend-stage.vacademy.io/auth-service/oauth2/authorization/${provider}?state=${encodeURIComponent(base64State)}`;

        // Redirect to OAuth provider
        window.location.href = loginUrl;
    } catch (error) {
        console.error('Error initiating OAuth login:', error);
        toast.error('Failed to initiate login. Please try again.');
    }
};

export const handleOAuthCallback = () => {
    const urlParams = new URLSearchParams(window.location.search);
    const accessToken = urlParams.get('accessToken');
    const refreshToken = urlParams.get('refreshToken');
    const error = urlParams.get('error');
    const signupData = urlParams.get('signupData');
    const state = urlParams.get('state');

    if (error) {
        toast.error('Authentication failed', {
            description: error,
            duration: 3000,
        });
        return { success: false };
    }

    if (accessToken && refreshToken) {
        setAuthorizationCookie(TokenKey.accessToken, accessToken);
        setAuthorizationCookie(TokenKey.refreshToken, refreshToken);

        if (signupData) {
            try {
                const decodedData = JSON.parse(atob(signupData));
                return { success: true, signupData: decodedData, state };
            } catch (e) {
                console.error('Error decoding signup data:', e);
            }
        } else {
            // If not signup, redirect to dashboard
            window.location.href = '/dashboard';
        }

        return { success: true };
    }

    return { success: false };
};
