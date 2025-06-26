import { toast } from 'sonner';
import {
    setAuthorizationCookie,
} from '@/lib/auth/sessionUtility';
import { TokenKey } from '@/constants/auth/tokens';

export type OAuthProvider = 'google' | 'github';

interface OAuthLoginOptions {
    isSignup?: boolean;
    assess?: boolean;
    lms?: boolean;
}

export const handleOAuthLogin = (
    
  provider: OAuthProvider,
  options: OAuthLoginOptions = {}
) => {
    console.log("handle Outh Login");
  try {
    const { isSignup = false, assess = false, lms = false } = options;

    const redirectPath = isSignup
      ? '/signup/oauth/callback'
      : '/login/oauth/redirect';

    const stateObj = {
      from: `${window.location.origin}${redirectPath}?assess=${assess}&lms=${lms}`,
      account_type: isSignup
        ? assess
          ? 'assess'
          : lms
          ? 'lms'
          : ''
        : '',
    };

    const base64State = btoa(JSON.stringify(stateObj));

    const loginUrl = `https://backend-stage.vacademy.io/auth-service/oauth2/authorization/${provider}?state=${encodeURIComponent(
      base64State
    )}`;

    console.log('[OAuthLogin] Redirecting to:', loginUrl);
    console.log('[OAuthLogin] Encoded State:', stateObj);

    window.location.href = loginUrl;
  } catch (error) {
    console.error('[OAuthLogin] Error during OAuth login initiation:', error);
    toast.error('Failed to initiate login. Please try again.');
  }
};

export const handleLoginOAuthCallback = async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const error = urlParams.get('error');
    const stateEncoded = urlParams.get('state');
    const accessToken = urlParams.get('accessToken');
    const refreshToken = urlParams.get('refreshToken');

    console.log('[OAuthCallback] URL Params:', {
        error,
        stateEncoded,
        accessToken,
        refreshToken,
    });

    if (error) {
        toast.error('Authentication failed due to error ', {
            description: error,
            duration: 3000,
        });
        console.error('[OAuthCallback] Error parameter found:', error);
        return { success: false };
    }

    let redirectUrl = '/dashboard';

    if (stateEncoded) {
        try {
            const decodedState = JSON.parse(atob(decodeURIComponent(stateEncoded)));
            console.log('[OAuthCallback] Decoded state:', decodedState);

            if (decodedState?.from) {
                redirectUrl = decodedState.from;
            }
        } catch (err) {
            console.warn('[OAuthCallback] Failed to decode state. Falling back to /dashboard:', err);
        }
    }

    if (accessToken && refreshToken) {
        console.log('[OAuthCallback] Setting tokens and redirecting...');
        setAuthorizationCookie(TokenKey.accessToken, accessToken);
        setAuthorizationCookie(TokenKey.refreshToken, refreshToken);

        console.log('[OAuthCallback] Redirecting to:', redirectUrl);
        window.location.href = redirectUrl;

        return { success: true };
    }

    toast.error('Missing access or refresh token. Please login again.');
    console.warn('[OAuthCallback] Tokens missing in URL.');
    return { success: false };
};
