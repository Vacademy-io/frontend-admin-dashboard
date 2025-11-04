import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useEffect } from 'react';
import { DashboardLoader } from '@/components/core/dashboard-loader';
import { TokenKey } from '@/constants/auth/tokens';
import {
    setAuthorizationCookie,
    getTokenFromCookie,
    isTokenExpired,
} from '@/lib/auth/sessionUtility';
import { getInstituteSelectionResult, setSelectedInstitute } from '@/lib/auth/instituteUtils';
import { getCourseSettings } from '@/services/course-settings';
import { getDisplaySettings, getDisplaySettingsFromCache } from '@/services/display-settings';
import { ADMIN_DISPLAY_SETTINGS_KEY, TEACHER_DISPLAY_SETTINGS_KEY } from '@/types/display-settings';
import type { DisplaySettingsData } from '@/types/display-settings';

export const Route = createFileRoute('/auth-transfer/')({
    component: AuthTransferPage,
});

function AuthTransferPage() {
    const navigate = useNavigate();

    useEffect(() => {
        const handleAuthTransfer = async () => {
            try {
                // First, check if user already has valid tokens in cookies
                let existingAccessToken = getTokenFromCookie(TokenKey.accessToken);
                let existingRefreshToken = getTokenFromCookie(TokenKey.refreshToken);

                // If no valid tokens in cookies, check URL parameters for SSO tokens
                if (
                    !existingAccessToken ||
                    !existingRefreshToken ||
                    isTokenExpired(existingAccessToken)
                ) {
                    const params = new URLSearchParams(window.location.search);
                    const accessToken = params.get('accessToken');
                    const refreshToken = params.get('refreshToken');

                    if (accessToken && refreshToken) {
                        setAuthorizationCookie(TokenKey.accessToken, accessToken);
                        setAuthorizationCookie(TokenKey.refreshToken, refreshToken);
                        existingAccessToken = accessToken;
                        existingRefreshToken = refreshToken;
                    } else {
                        // No tokens found anywhere, redirect to login
                        navigate({ to: '/login' });
                        return;
                    }
                }

                // Now we have valid tokens, load the institute settings and display settings
                console.log('🔍 AUTH-TRANSFER: Starting settings load...');

                // Get institute selection result
                const instituteResult = getInstituteSelectionResult();

                if (instituteResult.shouldShowSelection) {
                    // User needs to select an institute, redirect to login with institute selection
                    console.log('🔍 AUTH-TRANSFER: Multiple institutes found, showing selection');
                    navigate({
                        to: '/login',
                        search: { showInstituteSelection: true },
                    });
                    return;
                }

                // User has only one institute
                if (!instituteResult.selectedInstitute) {
                    console.error('🔍 AUTH-TRANSFER: No valid institutes found');
                    navigate({ to: '/login' });
                    return;
                }

                const hasAdminRole = instituteResult.selectedInstitute.roles.includes('ADMIN');

                // Set the selected institute
                console.log(
                    '🔍 AUTH-TRANSFER: Setting institute:',
                    instituteResult.selectedInstitute.id
                );
                setSelectedInstitute(instituteResult.selectedInstitute.id);

                // Refresh course settings for this institute (non-blocking)
                console.log('🔍 AUTH-TRANSFER: Loading course settings...');
                void getCourseSettings(true).catch((error) => {
                    console.warn('🔍 AUTH-TRANSFER: Error loading course settings:', error);
                });

                // Determine which role settings to fetch
                const roleKey = hasAdminRole
                    ? ADMIN_DISPLAY_SETTINGS_KEY
                    : TEACHER_DISPLAY_SETTINGS_KEY;

                // Ensure display settings are loaded before getting redirect URL with retry logic
                console.log('🔍 AUTH-TRANSFER: Loading display settings for role:', roleKey);
                let ds: DisplaySettingsData | null = null;
                const maxRetries = 3;
                let retryCount = 0;

                while (retryCount < maxRetries && !ds) {
                    try {
                        console.log(
                            `🔍 AUTH-TRANSFER: Fetching display settings (attempt ${retryCount + 1}/${maxRetries})`
                        );
                        ds = await getDisplaySettings(roleKey, true);
                        console.log('🔍 AUTH-TRANSFER: Display settings loaded successfully:', {
                            roleKey,
                            postLoginRedirectRoute: ds?.postLoginRedirectRoute,
                        });
                        break; // Success, exit retry loop
                    } catch (error) {
                        retryCount++;
                        const errorStatus = (error as { response?: { status?: number } })?.response
                            ?.status;
                        console.warn(
                            `🔍 AUTH-TRANSFER: Failed to fetch display settings (attempt ${retryCount}/${maxRetries}) [Status: ${errorStatus}]:`,
                            error
                        );

                        if (retryCount >= maxRetries) {
                            // Final attempt failed, use cache
                            ds = getDisplaySettingsFromCache(roleKey);
                            console.log(
                                '🔍 AUTH-TRANSFER: Using cached display settings after all retries failed:',
                                {
                                    roleKey,
                                    postLoginRedirectRoute: ds?.postLoginRedirectRoute,
                                    cacheAvailable: !!ds,
                                }
                            );
                            break;
                        } else {
                            // Wait before retry (exponential backoff)
                            const delay = Math.pow(2, retryCount - 1) * 500; // 500ms, 1s, 2s
                            console.log(`🔍 AUTH-TRANSFER: Retrying in ${delay}ms...`);
                            await new Promise((resolve) => setTimeout(resolve, delay));
                        }
                    }
                }

                // Determine redirect URL from display settings
                const redirectUrl = ds?.postLoginRedirectRoute || '/study-library/courses';
                console.log('🔍 AUTH-TRANSFER: Redirecting to:', redirectUrl);

                // Navigate to the determined route
                navigate({ to: redirectUrl });
            } catch (error) {
                console.error('🔍 AUTH-TRANSFER: Error in auth transfer flow:', error);
                navigate({ to: '/login' });
            }
        };

        void handleAuthTransfer();
    }, [navigate]);

    return <DashboardLoader />;
}
