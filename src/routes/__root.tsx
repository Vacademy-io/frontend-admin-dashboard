import { QueryClient } from '@tanstack/react-query';
import { createRootRouteWithContext, Outlet, redirect } from '@tanstack/react-router';
import React, { Suspense } from 'react';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import {
    getTokenFromCookie,
    isTokenExpired,
    setAuthorizationCookie,
} from '@/lib/auth/sessionUtility';
import { TokenKey } from '@/constants/auth/tokens';

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
    '/signup',
    '/evaluator-ai',
    '/landing',
    '/pricing',
];

export const Route = createRootRouteWithContext<{
    queryClient: QueryClient;
}>()({
    beforeLoad: ({ location }) => {
        // Handle SSO tokens from URL parameters first
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
        // check for redirect parameter and handle accordingly
        if (isAuthenticated() && location.pathname.startsWith('/login')) {
            const searchParams = new URLSearchParams(location.search);
            const redirectParam = searchParams.get('redirect');

            if (redirectParam === '/auth-transfer') {
                // If redirecting to auth-transfer, go to study library instead
                throw redirect({ to: '/study-library/courses' });
            } else if (redirectParam && redirectParam.startsWith('/')) {
                // If there's a valid redirect parameter, use it
                throw redirect({ to: redirectParam as string });
            } else {
                // Default redirect to dashboard
                throw redirect({ to: '/dashboard' });
            }
        }
    },

    component: () => (
        <>
            <Outlet />
            <Suspense>
                <TanStackRouterDevtools />
            </Suspense>
            <ReactQueryDevtools initialIsOpen={false} />
        </>
    ),
});
