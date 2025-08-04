// Debug utility for OAuth flow
export function debugOAuthFlow() {
    console.log('=== OAuth Debug Information ===');

    // Check localStorage for debug info
    const oauthDebug = localStorage.getItem('oauth_debug');
    const oauthError = localStorage.getItem('oauth_error');
    const selectedInstitute = localStorage.getItem('selectedInstituteId');
    const accessToken = localStorage.getItem('accessToken');

    console.log('1. OAuth Debug Info:', oauthDebug ? JSON.parse(oauthDebug) : 'No debug info');
    console.log('2. OAuth Error Info:', oauthError ? JSON.parse(oauthError) : 'No error info');
    console.log('3. Selected Institute:', selectedInstitute);
    console.log('4. Has Access Token:', !!accessToken);

    // Check current URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    console.log('5. URL Parameters:', {
        error: urlParams.get('error'),
        showInstituteSelection: urlParams.get('showInstituteSelection'),
        accessToken: urlParams.get('accessToken') ? 'Present' : 'Not present',
        refreshToken: urlParams.get('refreshToken') ? 'Present' : 'Not present'
    });

    // Test student blocking logic
    if (accessToken) {
        console.log('6. Testing student blocking logic...');

        // Import the functions (you'll need to adjust based on your setup)
        try {
            const { shouldBlockStudentLogin, getInstitutesFromToken, getValidInstitutes } = require('@/lib/auth/instituteUtils');

            const allInstitutes = getInstitutesFromToken();
            const validInstitutes = getValidInstitutes(allInstitutes);
            const shouldBlock = shouldBlockStudentLogin();

            console.log('   - All institutes:', allInstitutes.length);
            console.log('   - Valid institutes:', validInstitutes.length);
            console.log('   - Should block student login:', shouldBlock);

            console.log('   - Institute details:');
            allInstitutes.forEach((institute: any, index: number) => {
                const isValid = validInstitutes.some((v: any) => v.id === institute.id);
                console.log(`     Institute ${index + 1}: ${institute.id} - Roles: ${institute.roles.join(', ')} - Valid: ${isValid}`);
            });
        } catch (error) {
            console.log('   - Error testing student blocking logic:', error);
        }
    }

    console.log('=== Debug Complete ===');

    return {
        oauthDebug: oauthDebug ? JSON.parse(oauthDebug) : null,
        oauthError: oauthError ? JSON.parse(oauthError) : null,
        selectedInstitute,
        hasAccessToken: !!accessToken
    };
}

// Clear debug info
export function clearOAuthDebug() {
    localStorage.removeItem('oauth_debug');
    localStorage.removeItem('oauth_error');
    console.log('OAuth debug info cleared');
}

// Run the debug
// debugOAuthFlow();
