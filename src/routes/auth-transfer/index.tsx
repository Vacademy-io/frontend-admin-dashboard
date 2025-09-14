import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useEffect } from 'react';
import { DashboardLoader } from '@/components/core/dashboard-loader';
import { TokenKey } from '@/constants/auth/tokens';
import {
    setAuthorizationCookie,
    getTokenFromCookie,
    isTokenExpired,
} from '@/lib/auth/sessionUtility';

export const Route = createFileRoute('/auth-transfer/')({
    component: AuthTransferPage,
});

function AuthTransferPage() {
    const navigate = useNavigate();

    useEffect(() => {
        // First, check if user already has valid tokens in cookies
        const existingAccessToken = getTokenFromCookie(TokenKey.accessToken);
        const existingRefreshToken = getTokenFromCookie(TokenKey.refreshToken);

        // If user has valid tokens, redirect to study library
        if (existingAccessToken && existingRefreshToken && !isTokenExpired(existingAccessToken)) {
            navigate({ to: '/study-library/courses' });
            return;
        }

        // If no valid tokens in cookies, check URL parameters for SSO tokens
        const params = new URLSearchParams(window.location.search);
        const accessToken = params.get('accessToken');
        const refreshToken = params.get('refreshToken');

        if (accessToken && refreshToken) {
            setAuthorizationCookie(TokenKey.accessToken, accessToken);
            setAuthorizationCookie(TokenKey.refreshToken, refreshToken);

            // Redirect to the study library
            navigate({ to: '/study-library/courses' });
        } else {
            // No tokens found anywhere, redirect to login
            navigate({ to: '/login' });
        }
    }, [navigate]);

    return <DashboardLoader />;
}
