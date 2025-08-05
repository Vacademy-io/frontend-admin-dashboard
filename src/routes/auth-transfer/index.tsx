import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useEffect } from 'react';
import { DashboardLoader } from '@/components/core/dashboard-loader';
import { TokenKey } from '@/constants/auth/tokens';
import { setAuthorizationCookie } from '@/lib/auth/sessionUtility';

export const Route = createFileRoute('/auth-transfer/')({
    component: AuthTransferPage,
});

function AuthTransferPage() {
    const navigate = useNavigate();

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const accessToken = params.get('accessToken');
        const refreshToken = params.get('refreshToken');

        if (accessToken && refreshToken) {
            setAuthorizationCookie(TokenKey.accessToken, accessToken);
            setAuthorizationCookie(TokenKey.refreshToken, refreshToken);

            // Redirect to the actual page
            navigate({ to: '/study-library/courses' });
        } else {
            navigate({ to: '/login' });
        }
    }, []);

    return <DashboardLoader />;
}
