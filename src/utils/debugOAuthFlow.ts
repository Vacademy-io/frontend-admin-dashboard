// Comprehensive OAuth flow debug tool
export function debugOAuthFlow() {
    console.log('=== OAuth Flow Debug ===');

    // Step 1: Check current URL and tokens
    console.log('1. Current URL:', window.location.href);
    console.log('2. Current pathname:', window.location.pathname);
    console.log('3. Current search:', window.location.search);

    // Step 2: Check tokens in cookies
    try {
        const { getTokenFromCookie } = require('@/lib/auth/sessionUtility');
        const { TokenKey } = require('@/constants/auth/tokens');

        const accessToken = getTokenFromCookie(TokenKey.accessToken);
        const refreshToken = getTokenFromCookie(TokenKey.refreshToken);

        console.log('4. Access token exists:', !!accessToken);
        console.log('5. Refresh token exists:', !!refreshToken);

        if (accessToken) {
            // Step 3: Decode token and check institutes
            const { getTokenDecodedData } = require('@/lib/auth/sessionUtility');
            const tokenData = getTokenDecodedData(accessToken);

            console.log('6. Token data exists:', !!tokenData);
            console.log('7. Authorities exist:', !!(tokenData && tokenData.authorities));

            if (tokenData && tokenData.authorities) {
                const institutes = Object.entries(tokenData.authorities);
                console.log('8. Total institutes in token:', institutes.length);

                // Step 4: Check valid institutes
                const { getValidInstitutes, getInstitutesFromToken } = require('@/lib/auth/instituteUtils');
                const allInstitutes = getInstitutesFromToken();
                const validInstitutes = getValidInstitutes(allInstitutes);

                console.log('9. All institutes:', allInstitutes.length);
                console.log('10. Valid institutes:', validInstitutes.length);

                // Step 5: Check institute selection logic
                const { getInstituteSelectionResult } = require('@/lib/auth/instituteUtils');
                const instituteResult = getInstituteSelectionResult();

                console.log('11. Institute selection result:', instituteResult);
                console.log('12. Should show selection:', instituteResult.shouldShowSelection);

                // Step 6: Check each institute
                console.log('13. Institute details:');
                allInstitutes.forEach((institute: any, index: number) => {
                    const isValid = validInstitutes.some((v: any) => v.id === institute.id);
                    console.log(`   Institute ${index + 1}:`);
                    console.log(`     ID: ${institute.id}`);
                    console.log(`     Roles: ${institute.roles.join(', ')}`);
                    console.log(`     Valid for admin portal: ${isValid}`);
                });
            }
        }

    } catch (error) {
        console.error('Error in debug:', error);
    }

    // Step 7: Check localStorage
    const selectedInstitute = localStorage.getItem('selectedInstituteId');
    console.log('14. Selected institute in localStorage:', selectedInstitute);

    // Step 8: Check OAuth debug info
    const oauthDebug = localStorage.getItem('oauth_debug');
    const oauthError = localStorage.getItem('oauth_error');
    console.log('15. OAuth debug info:', oauthDebug ? JSON.parse(oauthDebug) : 'None');
    console.log('16. OAuth error info:', oauthError ? JSON.parse(oauthError) : 'None');

    console.log('=== Debug Complete ===');
}

// Test the OAuth callback function
export function testOAuthCallback() {
    console.log('=== Testing OAuth Callback ===');

    // Your token from the logs
    const testToken = "eyJhbGciOiJIUzI1NiJ9.eyJwZXJtaXNzaW9ucyI6W10sImZ1bGxuYW1lIjoiUHJpdGkgU2lra2EiLCJ1c2VyIjoiMjY3ZTgyMWQtOGRkNS00YTEyLTg0MDctMTM1YmRhYjBhOGFiIiwiZW1haWwiOiJndWxzaGFucHVuZGU0QGdtYWlsLmNvbSIsImlzX3Jvb3RfdXNlciI6dHJ1ZSwiYXV0aG9yaXRpZXMiOnsiMmRmMjc4MzgtMjA2NC00NjRjLWE1NDctOGNlYzEzNGRmZTRjIjp7InBlcm1pc3Npb25zIjpbXSwicm9sZXMiOlsiU1RVREVOVCJdfSwiZGQ5Yjk2ODctNTZlZS00NjdhLTlmYzQtOGM1ODM1ZWFlN2Y5Ijp7InBlcm1pc3Npb25zIjpbIkNSRUFURV9ORVdfRUJPT0siXSwicm9sZXMiOlsiU1RVREVOVCIsIlRFQUNIRVIiXX0sIjJjNDBmYjdkLTQwYzktNDE0Ni1hOTBjLTMyMDE5YmZmN2ZiOCI6eyJwZXJtaXNzaW9ucyI6WyJSRUFEIiwiV1JJVEUiXSwicm9sZXMiOlsiQURNSU4iXX0sImE2ZWEyNmYwLTAxMTAtNGI2Yi05YjQ0LWQ5MGM0MzFiZTFiZiI6eyJwZXJtaXNzaW9ucyI6WyJDUkVBVEVfTkVXX0VCT09LIl0sInJvbGVzIjpbIlNUVURFTlQiLCJURUFDSEVSIl19LCIyNTM1NDhmOS1mOGI2LTQ5M2YtODdmZi0wZGM5MmFlNDIzYTUiOnsicGVybWlzc2lvbnMiOltdLCJyb2xlcyI6WyJTVFVERU5UIl19LCIyMzEwMzU1OS01NjMyLTQyYzktYjljZS02MTlkNTVmY2UzY2IiOnsicGVybWlzc2lvbnMiOltdLCJyb2xlcyI6WyJTVFVERU5UIl19fSwidXNlcm5hbWUiOiJwcml0NzExOCIsInN1YiI6InByaXQ3MTE4IiwiaWF0IjoxNzU0Mjk2NjQ1LCJleHAiOjE3NTQ5MDE0NDV9.qDWJU8BPYuqdfDJmJ1quc2ml6OSqrG7oTcXl-MG0Lrk";

    try {
        // Mock the OAuth callback
        const { handleLoginOAuthCallback } = require('@/hooks/login/oauth-login');

        // Set the token in cookies first
        const { setAuthorizationCookie } = require('@/lib/auth/sessionUtility');
        const { TokenKey } = require('@/constants/auth/tokens');

        setAuthorizationCookie(TokenKey.accessToken, testToken);
        setAuthorizationCookie(TokenKey.refreshToken, 'test-refresh-token');

        // Mock URL parameters
        const originalSearch = window.location.search;
        Object.defineProperty(window, 'location', {
            value: {
                ...window.location,
                search: `?accessToken=${testToken}&refreshToken=test-refresh-token`
            },
            writable: true
        });

        console.log('Calling handleLoginOAuthCallback...');
        const result = handleLoginOAuthCallback();

        console.log('OAuth callback result:', result);

        // Restore original search
        Object.defineProperty(window, 'location', {
            value: {
                ...window.location,
                search: originalSearch
            },
            writable: true
        });

    } catch (error) {
        console.error('Error testing OAuth callback:', error);
    }
}

// Force show institute selection
export function forceShowInstituteSelection() {
    console.log('=== Force Show Institute Selection ===');

    // Navigate to the institute selection URL
    window.location.href = '/login?showInstituteSelection=true';
}

// Run the debug
// debugOAuthFlow();
// testOAuthCallback();
// forceShowInstituteSelection();
