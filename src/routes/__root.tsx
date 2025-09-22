import { QueryClient } from '@tanstack/react-query';
import { createRootRouteWithContext, Outlet, redirect } from '@tanstack/react-router';
import React, { Suspense } from 'react';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { usePageTitle } from '@/hooks/use-page-title';
import {
    getTokenFromCookie,
    isTokenExpired,
    setAuthorizationCookie,
} from '@/lib/auth/sessionUtility';
import { TokenKey } from '@/constants/auth/tokens';
import { getUserRoles } from '@/lib/auth/sessionUtility';
import { ADMIN_DISPLAY_SETTINGS_KEY, TEACHER_DISPLAY_SETTINGS_KEY } from '@/types/display-settings';
import { getDisplaySettingsFromCache } from '@/services/display-settings';

const TanStackRouterDevtools =
    process.env.NODE_ENV === 'production'
        ? () => null
        : React.lazy(() =>
              import('@tanstack/router-devtools').then((res) => ({
                  default: res.TanStackRouterDevtools,
              }))
          );

const isAuthenticated = () => {
    const accessToken = getTokenFromCookie(TokenKey.accessToken);
    const refreshToken = getTokenFromCookie(TokenKey.refreshToken);
    return accessToken && refreshToken && !isTokenExpired(accessToken);
};

// Function to handle SSO tokens from URL parameters
const handleSSOTokens = (search: string) => {
    const searchParams = new URLSearchParams(search);
    const accessToken = searchParams.get('accessToken');
    const refreshToken = searchParams.get('refreshToken');

    if (accessToken && refreshToken) {
        // Store tokens in cookies
        setAuthorizationCookie(TokenKey.accessToken, accessToken);
        setAuthorizationCookie(TokenKey.refreshToken, refreshToken);
        return true;
    }

    return false;
};

// List of public routes that don't require authentication
const publicRoutes = [
    '/login',
    '/login/forgot-password',
    '/login/oauth/redirect',
    '/signup',
    '/evaluator-ai',
    '/landing',
    '/pricing',
];

export const Route = createRootRouteWithContext<{
    queryClient: QueryClient;
}>()({
    beforeLoad: ({ location }) => {
        // Special handling for OAuth redirect - don't set tokens here, let the OAuth component handle it
        if (location.pathname === '/login/oauth/redirect') {
            return; // Allow the OAuth redirect component to handle the flow
        }

        // Handle SSO tokens from URL parameters for other routes
        handleSSOTokens((location.search as string) || '');

        // Redirect root based on subdomain
        if (location.pathname === '/') {
            const subdomain =
                typeof window !== 'undefined' ? window.location.hostname.split('.')[0] : '';
            const isVoltSubdomain = subdomain === 'volt';
            throw redirect({ to: isVoltSubdomain ? '/landing' : '/login' });
        }

        // Special handling for auth-transfer route
        if (location.pathname === '/auth-transfer') {
            if (isAuthenticated()) {
                // User has valid tokens, redirect to study library
                throw redirect({ to: '/study-library/courses' });
            } else {
                // User doesn't have tokens, redirect to login with redirect parameter
                throw redirect({
                    to: '/login',
                    search: {
                        redirect: '/auth-transfer',
                    },
                });
            }
        }

        // Check if the route requires authentication
        const isPublicRoute = publicRoutes.some((route) => location.pathname.startsWith(route));

        // If it's not a public route and user is not authenticated,
        // redirect to login with the intended destination
        if (!isPublicRoute && !isAuthenticated()) {
            throw redirect({
                to: '/login',
                search: {
                    redirect: location.pathname,
                },
            });
        }

        // If user is authenticated and tries to access login page,
        // check for redirect parameter and handle accordingly (unless showing institute selection)
        if (isAuthenticated() && location.pathname.startsWith('/login')) {
            // Also check if search is an object with the parameter
            if (
                typeof location.search === 'object' &&
                location.search &&
                'showInstituteSelection' in location.search
            ) {
                return;
            }

            const searchParams = new URLSearchParams(location.search);
            const redirectParam = searchParams.get('redirect');

            if (redirectParam === '/auth-transfer') {
                // If redirecting to auth-transfer, go to study library instead
                throw redirect({ to: '/study-library/courses' });
            } else if (redirectParam && redirectParam.startsWith('/')) {
                // If there's a valid redirect parameter, use it
                throw redirect({ to: redirectParam as string });
            } else {
                // Default redirect based on role display settings if available
                const accessToken = getTokenFromCookie(TokenKey.accessToken);
                const roles = getUserRoles(accessToken);
                const isAdminRole = roles.includes('ADMIN');
                const roleKey = isAdminRole
                    ? ADMIN_DISPLAY_SETTINGS_KEY
                    : TEACHER_DISPLAY_SETTINGS_KEY;
                const fromCache = getDisplaySettingsFromCache(roleKey);
                const to = fromCache?.postLoginRedirectRoute || '/dashboard';
                throw redirect({ to });
            }
        }
    },

    component: () => {
        // Ensure the global title is maintained across all pages
        usePageTitle();

        return (
            <>
                <Outlet />
                <Suspense>
                    <TanStackRouterDevtools />
                </Suspense>
                <ReactQueryDevtools initialIsOpen={false} />
            </>
        );
    },
});
