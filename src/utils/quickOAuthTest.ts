// Quick OAuth test to check current state
export function quickOAuthTest() {
    console.log('=== Quick OAuth Test ===');

    try {
        // Check current URL
        console.log('1. Current URL:', window.location.href);
        console.log('2. Current search params:', window.location.search);

        // Check if tokens exist in cookies
        const { getTokenFromCookie } = require('@/lib/auth/sessionUtility');
        const { TokenKey } = require('@/constants/auth/tokens');

        const accessToken = getTokenFromCookie(TokenKey.accessToken);
        const refreshToken = getTokenFromCookie(TokenKey.refreshToken);

        console.log('3. Access token exists:', !!accessToken);
        console.log('4. Refresh token exists:', !!refreshToken);

        // Check if institute selection is needed
        const { getInstituteSelectionResult } = require('@/lib/auth/instituteUtils');
        const instituteResult = getInstituteSelectionResult();

        console.log('5. Institute selection result:', instituteResult);
        console.log('6. Should show selection:', instituteResult.shouldShowSelection);

        // Check localStorage
        const selectedInstitute = localStorage.getItem('selectedInstituteId');
        console.log('7. Selected institute in localStorage:', selectedInstitute);

        // Check if we're on the right page
        const isOnLoginPage = window.location.pathname === '/login';
        const hasShowInstituteParam = window.location.search.includes('showInstituteSelection=true');

        console.log('8. On login page:', isOnLoginPage);
        console.log('9. Has showInstituteSelection param:', hasShowInstituteParam);

        // Expected behavior
        console.log('\n=== Expected Behavior ===');
        if (accessToken && instituteResult.shouldShowSelection) {
            console.log('✅ Should show institute selection page');
            console.log('❌ Currently on dashboard (if true)');
        } else if (accessToken && !instituteResult.shouldShowSelection) {
            console.log('✅ Should go directly to dashboard');
        } else {
            console.log('❌ No access token or no valid institutes');
        }

    } catch (error) {
        console.error('Error in quick test:', error);
        console.error('Error stack:', error.stack);
    }

    console.log('=== Test Complete ===');
}

// Test the OAuth callback function
export function testOAuthCallbackFunction() {
    console.log('=== Testing OAuth Callback Function ===');

    try {
        const { handleLoginOAuthCallback } = require('@/hooks/login/oauth-login');

        // Mock the URL parameters
        const originalSearch = window.location.search;
        const mockSearch = '?assess=false&lms=false&accessToken=test&refreshToken=test';

        Object.defineProperty(window, 'location', {
            value: {
                ...window.location,
                search: mockSearch
            },
            writable: true
        });

        console.log('Calling handleLoginOAuthCallback...');
        const result = handleLoginOAuthCallback();
        console.log('Result:', result);

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
        console.error('Error stack:', error.stack);
    }
}

// Check for any console errors
export function checkForErrors() {
    console.log('=== Checking for Errors ===');

    // Check if all required functions exist
    try {
        require('@/lib/auth/sessionUtility');
        console.log('✅ sessionUtility loaded');
    } catch (error) {
        console.error('❌ Error loading sessionUtility:', error);
    }

    try {
        require('@/lib/auth/instituteUtils');
        console.log('✅ instituteUtils loaded');
    } catch (error) {
        console.error('❌ Error loading instituteUtils:', error);
    }

    try {
        require('@/hooks/login/oauth-login');
        console.log('✅ oauth-login loaded');
    } catch (error) {
        console.error('❌ Error loading oauth-login:', error);
    }

    try {
        require('@/constants/auth/tokens');
        console.log('✅ tokens loaded');
    } catch (error) {
        console.error('❌ Error loading tokens:', error);
    }
}

// Run the tests
// quickOAuthTest();
// testOAuthCallbackFunction();
// checkForErrors();
