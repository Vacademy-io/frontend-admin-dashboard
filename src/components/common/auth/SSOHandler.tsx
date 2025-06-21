import { useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';
import {
    getTokenFromCookie,
    getUserRoles,
    canAccessAdminDashboard,
    SSO_CONFIG,
} from '@/lib/auth/sessionUtility';
import { TokenKey } from '@/constants/auth/tokens';

interface SSOHandlerProps {
    children: React.ReactNode;
    requireAuth?: boolean;
    allowedRoles?: string[];
}

export const SSOHandler: React.FC<SSOHandlerProps> = ({
    children,
    requireAuth = true,
    allowedRoles = ['ADMIN', 'TEACHER'],
}) => {
    const navigate = useNavigate();

    useEffect(() => {
        const accessToken = getTokenFromCookie(TokenKey.accessToken);

        if (!accessToken && requireAuth) {
            // No token and auth is required - redirect to login
            navigate({ to: '/login' });
            return;
        }

        if (accessToken) {
            const userRoles = getUserRoles(accessToken);

            // Check if user can access admin dashboard
            if (requireAuth && !canAccessAdminDashboard(accessToken)) {
                // User doesn't have required roles for admin dashboard
                const hasStudentRole = userRoles.includes('STUDENT');

                if (hasStudentRole) {
                    // Redirect to learner platform
                    console.log('User only has STUDENT role, redirecting to learner platform');
                    window.location.href = `https://${SSO_CONFIG.LEARNER_DOMAIN}`;
                } else {
                    // No valid roles at all - redirect to login
                    navigate({ to: '/login' });
                }
                return;
            }
        }
    }, [navigate, requireAuth, allowedRoles]);

    return <>{children}</>;
};

export default SSOHandler;
