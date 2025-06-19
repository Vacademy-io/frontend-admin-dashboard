import { verifyEmailWithOtp } from '@/components/common/LoginPages/VerifyEmailWithOtp';
import { toast } from 'sonner';

export type OAuthProvider = 'google' | 'github';
interface OAuthLoginOptions {
    isSignup?: boolean;
    assess?: boolean;
    lms?: boolean;
}

export const handleOAuthLogin = (provider: OAuthProvider, options: OAuthLoginOptions = {}) => {
    try {
        const { isSignup = true, assess = false, lms = false } = options;

        const stateObj = {
            from: `${window.location.origin}/signup/oauth/callback?assess=${assess}&lms=${lms}`,
            account_type: isSignup ? (assess ? 'assess' : lms ? 'lms' : '') : '',
        };

        const base64State = btoa(JSON.stringify(stateObj));
        const loginUrl = `https://backend-stage.vacademy.io/auth-service/oauth2/authorization/${provider}?state=${encodeURIComponent(
            base64State
        )}`;

        window.location.href = loginUrl;
    } catch (error) {
        toast.error('Failed to initiate login. Please try again.');
    }
};

export const handleOAuthCallback = async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const error = urlParams.get('error');
    const signupData = urlParams.get('signupData');
    const state = urlParams.get('state');
    const emailVerified = urlParams.get('emailVerified') === 'true';

    if (error) {
        toast.error('Authentication failed', {
            description: error,
            duration: 3000,
        });
        return { success: false };
    }

    if (!emailVerified && signupData) {
        try {
            const decodedData = JSON.parse(atob(decodeURIComponent(signupData)));
            const email = decodedData?.email;
            const isInvalidEmail =
                !email || email === 'null' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

            if (isInvalidEmail) {
                const verified = await verifyEmailWithOtp();

                if (verified) {
                    return {
                        success: true,
                        signupData: {
                            ...decodedData,
                            email: email,
                        },
                        state,
                    };
                } else {
                    toast.warning('Email verification failed');
                    return { success: false, reason: 'unverified_email' };
                }
            }
        } catch (e) {
            console.error('Error decoding signup data:', e);
            return { success: false };
        }
    }

    return { success: false };
};
