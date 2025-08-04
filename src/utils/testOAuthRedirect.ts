// Test OAuth redirect route
export function testOAuthRedirect() {
    console.log('=== Testing OAuth Redirect Route ===');

    // Test 1: Navigate to OAuth redirect route
    console.log('1. Navigating to OAuth redirect route...');
    window.location.href = '/login/oauth/redirect?accessToken=test&refreshToken=test';
}

// Test OAuth callback with mock data
export function testOAuthCallbackWithMockData() {
    console.log('=== Testing OAuth Callback with Mock Data ===');

    // Mock the OAuth callback with your token
    const mockToken = "eyJhbGciOiJIUzI1NiJ9.eyJwZXJtaXNzaW9ucyI6W10sImZ1bGxuYW1lIjoiUHJpdGkgU2lra2EiLCJ1c2VyIjoiMjY3ZTgyMWQtOGRkNS00YTEyLTg0MDctMTM1YmRhYjBhOGFiIiwiZW1haWwiOiJndWxzaGFucHVuZGU0QGdtYWlsLmNvbSIsImlzX3Jvb3RfdXNlciI6dHJ1ZSwiYXV0aG9yaXRpZXMiOnsiMmRmMjc4MzgtMjA2NC00NjRjLWE1NDctOGNlYzEzNGRmZTRjIjp7InBlcm1pc3Npb25zIjpbXSwicm9sZXMiOlsiU1RVREVOVCJdfSwiZGQ5Yjk2ODctNTZlZS00NjdhLTlmYzQtOGM1ODM1ZWFlN2Y5Ijp7InBlcm1pc3Npb25zIjpbIkNSRUFURV9ORVdfRUJPT0siXSwicm9sZXMiOlsiU1RVREVOVCIsIlRFQUNIRVIiXX0sIjJjNDBmYjdkLTQwYzktNDE0Ni1hOTBjLTMyMDE5YmZmN2ZiOCI6eyJwZXJtaXNzaW9ucyI6WyJSRUFEIiwiV1JJVEUiXSwicm9sZXMiOlsiQURNSU4iXX0sImE2ZWEyNmYwLTAxMTAtNGI2Yi05YjQ0LWQ5MGM0MzFiZTFiZiI6eyJwZXJtaXNzaW9ucyI6WyJDUkVBVEVfTkVXX0VCT09LIl0sInJvbGVzIjpbIlNUVURFTlQiLCJURUFDSEVSIl19LCIyNTM1NDhmOS1mOGI2LTQ5M2YtODdmZi0wZGM5MmFlNDIzYTUiOnsicGVybWlzc2lvbnMiOltdLCJyb2xlcyI6WyJTVFVERU5UIl19LCIyMzEwMzU1OS01NjMyLTQyYzktYjljZS02MTlkNTVmY2UzY2IiOnsicGVybWlzc2lvbnMiOltdLCJyb2xlcyI6WyJTVFVERU5UIl19fSwidXNlcm5hbWUiOiJwcml0NzExOCIsInN1YiI6InByaXQ3MTE4IiwiaWF0IjoxNzU0Mjk2NjQ1LCJleHAiOjE3NTQ5MDE0NDV9.qDWJU8BPYuqdfDJmJ1quc2ml6OSqrG7oTcXl-MG0Lrk";

    try {
        // Set tokens in cookies
        const { setAuthorizationCookie } = require('@/lib/auth/sessionUtility');
        const { TokenKey } = require('@/constants/auth/tokens');

        setAuthorizationCookie(TokenKey.accessToken, mockToken);
        setAuthorizationCookie(TokenKey.refreshToken, 'mock-refresh-token');

        console.log('2. Tokens set in cookies');

        // Test institute selection logic
        const { getInstituteSelectionResult } = require('@/lib/auth/instituteUtils');
        const result = getInstituteSelectionResult();

        console.log('3. Institute selection result:', result);

        if (result.shouldShowSelection) {
            console.log('4. Should show institute selection - redirecting...');
            window.location.href = '/login?showInstituteSelection=true';
        } else {
            console.log('4. Should not show institute selection - going to dashboard');
            window.location.href = '/dashboard';
        }

    } catch (error) {
        console.error('Error in test:', error);
    }
}

// Check if OAuth redirect route exists
export function checkOAuthRedirectRoute() {
    console.log('=== Checking OAuth Redirect Route ===');

    // Try to navigate to the route
    const currentPath = window.location.pathname;
    console.log('1. Current path:', currentPath);

    // Check if we can access the OAuth redirect route
    if (currentPath === '/login/oauth/redirect') {
        console.log('2. ✅ Currently on OAuth redirect route');
    } else {
        console.log('2. ❌ Not on OAuth redirect route');
        console.log('3. Try navigating to OAuth redirect route...');
        window.location.href = '/login/oauth/redirect?test=true';
    }
}

// Run the tests
// testOAuthRedirect();
// testOAuthCallbackWithMockData();
// checkOAuthRedirectRoute();
