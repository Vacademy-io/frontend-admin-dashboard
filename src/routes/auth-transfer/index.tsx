import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useEffect } from 'react';
import Cookies from 'js-cookie';
import { DashboardLoader } from '@/components/core/dashboard-loader';

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
            Cookies.set('accessToken', accessToken, {
                path: '/',
                secure: true,
                sameSite: 'Strict',
            });
            Cookies.set('refreshToken', refreshToken, {
                path: '/',
                secure: true,
                sameSite: 'Strict',
            });

            // Redirect to the actual page
            navigate({ to: '/study-library/courses' });
        } else {
            navigate({ to: '/login' });
        }
    }, []);

    return <DashboardLoader />;
}
