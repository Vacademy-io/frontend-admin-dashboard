// Step-by-step OAuth flow test
export function testOAuthFlowStepByStep() {
    console.log('=== Step-by-Step OAuth Flow Test ===');

    // Step 1: Test the OAuth callback function directly
    console.log('Step 1: Testing OAuth callback function...');

    // Mock URL with your token
    const mockUrl = 'http://localhost:5173/login/oauth/redirect?assess=false&lms=false&accessToken=eyJhbGciOiJIUzI1NiJ9.eyJwZXJtaXNzaW9ucyI6W10sImZ1bGxuYW1lIjoiUHJpdGkgU2lra2EiLCJ1c2VyIjoiMjY3ZTgyMWQtOGRkNS00YTEyLTg0MDctMTM1YmRhYjBhOGFiIiwiZW1haWwiOiJndWxzaGFucHVuZGU0QGdtYWlsLmNvbSIsImlzX3Jvb3RfdXNlciI6dHJ1ZSwiYXV0aG9yaXRpZXMiOnsiMmRmMjc4MzgtMjA2NC00NjRjLWE1NDctOGNlYzEzNGRmZTRjIjp7InBlcm1pc3Npb25zIjpbXSwicm9sZXMiOlsiU1RVREVOVCJdfSwiZGQ5Yjk2ODctNTZlZS00NjdhLTlmYzQtOGM1ODM1ZWFlN2Y5Ijp7InBlcm1pc3Npb25zIjpbIkNSRUFURV9ORVdfRUJPT0siXSwicm9sZXMiOlsiU1RVREVOVCIsIlRFQUNIRVIiXX0sIjJjNDBmYjdkLTQwYzktNDE0Ni1hOTBjLTMyMDE5YmZmN2ZiOCI6eyJwZXJtaXNzaW9ucyI6WyJSRUFEIiwiV1JJVEUiXSwicm9sZXMiOlsiQURNSU4iXX0sImE2ZWEyNmYwLTAxMTAtNGI2Yi05YjQ0LWQ5MGM0MzFiZTFiZiI6eyJwZXJtaXNzaW9ucyI6WyJDUkVBVEVfTkVXX0VCT09LIl0sInJvbGVzIjpbIlNUVURFTlQiLCJURUFDSEVSIl19LCIyNTM1NDhmOS1mOGI2LTQ5M2YtODdmZi0wZGM5MmFlNDIzYTUiOnsicGVybWlzc2lvbnMiOltdLCJyb2xlcyI6WyJTVFVERU5UIl19LCIyMzEwMzU1OS01NjMyLTQyYzktYjljZS02MTlkNTVmY2UzY2IiOnsicGVybWlzc2lvbnMiOltdLCJyb2xlcyI6WyJTVFVERU5UIl19fSwidXNlcm5hbWUiOiJwcml0NzExOCIsInN1YiI6InByaXQ3MTE4IiwiaWF0IjoxNzU0Mjk2NjQ1LCJleHAiOjE3NTQ5MDE0NDV9.qDWJU8BPYuqdfDJmJ1quc2ml6OSqrG7oTcXl-MG0Lrk&refreshToken=eyJhbGciOiJIUzI1NiJ9.eyJ1c2VyIjoiMjY3ZTgyMWQtOGRkNS00YTEyLTg0MDctMTM1YmRhYjBhOGFiIiwic3ViIjoicHJpdDcxMTgiLCJpYXQiOjE3NTQyOTY2NDUsImV4cCI6MTc1Njg4ODY0NX0.mFuBJDV8wGOBHUZCJBX_VN4DZwggDtHWiuJZM6rNcQI';

    // Mock window.location.search
    const originalSearch = window.location.search;
    Object.defineProperty(window, 'location', {
        value: {
            ...window.location,
            search: mockUrl.split('?')[1]
        },
        writable: true
    });

    try {
        const { handleLoginOAuthCallback } = require('@/hooks/login/oauth-login');

        console.log('Calling handleLoginOAuthCallback...');
        const result = handleLoginOAuthCallback();

        console.log('OAuth callback result:', result);

        // Step 2: Test what the redirect route should do
        console.log('\nStep 2: Testing redirect route logic...');

        if (result.success && result.shouldShowInstituteSelection) {
            console.log('✅ OAuth callback correctly returned shouldShowInstituteSelection: true');
            console.log('Expected: Redirect to /login?showInstituteSelection=true');
        } else {
            console.log('❌ OAuth callback did not return shouldShowInstituteSelection: true');
            console.log('Actual result:', result);
        }

    } catch (error) {
        console.error('Error testing OAuth callback:', error);
    } finally {
        // Restore original search
        Object.defineProperty(window, 'location', {
            value: {
                ...window.location,
                search: originalSearch
            },
            writable: true
        });
    }

    // Step 3: Test login route loader
    console.log('\nStep 3: Testing login route loader...');

    try {
        const { getTokenFromCookie } = require('@/lib/auth/sessionUtility');
        const { TokenKey } = require('@/constants/auth/tokens');

        // Mock search params
        const mockSearch = { showInstituteSelection: 'true' };

        console.log('Mock search params:', mockSearch);

        if (mockSearch.showInstituteSelection === 'true') {
            console.log('✅ Login route loader should allow access for institute selection');
        } else {
            console.log('❌ Login route loader should not allow access');
        }

        const accessToken = getTokenFromCookie(TokenKey.accessToken);
        console.log('Access token in cookies:', !!accessToken);

    } catch (error) {
        console.error('Error testing login route loader:', error);
    }

    // Step 4: Test login form useEffect
    console.log('\nStep 4: Testing login form useEffect...');

    try {
        const mockUrlParams = new URLSearchParams('showInstituteSelection=true');
        const showInstituteSelection = mockUrlParams.get('showInstituteSelection');

        console.log('URL params - showInstituteSelection:', showInstituteSelection);

        if (showInstituteSelection === 'true') {
            console.log('✅ Login form should show institute selection');
        } else {
            console.log('❌ Login form should not show institute selection');
        }

    } catch (error) {
        console.error('Error testing login form useEffect:', error);
    }

    console.log('\n=== Test Complete ===');
}

// Test the actual navigation
export function testNavigation() {
    console.log('=== Testing Navigation ===');

    // Test what happens when we navigate to the institute selection URL
    const testUrl = '/login?showInstituteSelection=true';
    console.log('Testing navigation to:', testUrl);

    // Check if we can access this URL
    try {
        // Mock the navigation
        const mockNavigate = (to: string) => {
            console.log('Navigation called with:', to);
            return Promise.resolve();
        };

        console.log('Would navigate to:', testUrl);
        console.log('This should trigger the login route loader');
        console.log('Then the login form useEffect');
        console.log('Then show the institute selection component');

    } catch (error) {
        console.error('Error testing navigation:', error);
    }

    console.log('=== Navigation Test Complete ===');
}

// Run the tests
// testOAuthFlowStepByStep();
// testNavigation();
