import { QueryClient } from '@tanstack/react-query';
import { createRootRouteWithContext, Outlet, redirect } from '@tanstack/react-router';
import React, { Suspense } from 'react';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { usePageTitle } from '@/hooks/use-page-title';
import { setAuthorizationCookie } from '@/lib/auth/sessionUtility';
import { TokenKey } from '@/constants/auth/tokens';

const TanStackRouterDevtools =
    process.env.NODE_ENV === 'production'
        ? () => null
        : React.lazy(() =>
              import('@tanstack/router-devtools')
                  .then((res) => ({
                      default: res.TanStackRouterDevtools,
                  }))
                  .catch(() => ({
                      default: () => null,
                  }))
          );

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
// Helper functions to break down the complex beforeLoad logic
const handleRootPathRedirect = (location: any) => {
    if (location.pathname === '/') {
        throw redirect({ to: '/study-library/ai-copilot' });
    }
};

// Removed: let /auth-transfer route handle token processing and redirect itself

const handleAuthenticationChecks = (location: any) => {
    // Check if this is an AI copilot route
    const isAiCopilotRoute = location.pathname.startsWith('/study-library/ai-copilot');

    // If it's not an AI copilot route, block it by redirecting to AI copilot
    if (!isAiCopilotRoute) {
        throw redirect({ to: '/study-library/ai-copilot' });
    }

    // AI copilot routes are public, so no authentication required
    // All other routes have been blocked above
};

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

        // Handle root path redirect
        handleRootPathRedirect(location);

        // Let the /auth-transfer route component handle token processing and redirects itself

        // Handle authentication checks
        handleAuthenticationChecks(location);
    },

    component: () => {
        // Ensure the global title is maintained across all pages
        usePageTitle();

        return (
            <>
                <Outlet />
                <Suspense>{/*   <TanStackRouterDevtools /> */}</Suspense>
                {/* <ReactQueryDevtools initialIsOpen={false} />i */}
            </>
        );
    },
});
