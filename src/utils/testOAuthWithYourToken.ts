// Test OAuth flow with your actual token
export function testOAuthWithYourToken() {
    console.log('=== Testing OAuth Flow with Your Token ===');

    // Your provided token from the URL
    const yourToken = "eyJhbGciOiJIUzI1NiJ9.eyJwZXJtaXNzaW9ucyI6W10sImZ1bGxuYW1lIjoiUHJpdGkgU2lra2EiLCJ1c2VyIjoiMjY3ZTgyMWQtOGRkNS00YTEyLTg0MDctMTM1YmRhYjBhOGFiIiwiZW1haWwiOiJndWxzaGFucHVuZGU0QGdtYWlsLmNvbSIsImlzX3Jvb3RfdXNlciI6dHJ1ZSwiYXV0aG9yaXRpZXMiOnsiMmRmMjc4MzgtMjA2NC00NjRjLWE1NDctOGNlYzEzNGRmZTRjIjp7InBlcm1pc3Npb25zIjpbXSwicm9sZXMiOlsiU1RVREVOVCJdfSwiZGQ5Yjk2ODctNTZlZS00NjdhLTlmYzQtOGM1ODM1ZWFlN2Y5Ijp7InBlcm1pc3Npb25zIjpbIkNSRUFURV9ORVdfRUJPT0siXSwicm9sZXMiOlsiU1RVREVOVCIsIlRFQUNIRVIiXX0sIjJjNDBmYjdkLTQwYzktNDE0Ni1hOTBjLTMyMDE5YmZmN2ZiOCI6eyJwZXJtaXNzaW9ucyI6WyJSRUFEIiwiV1JJVEUiXSwicm9sZXMiOlsiQURNSU4iXX0sImE2ZWEyNmYwLTAxMTAtNGI2Yi05YjQ0LWQ5MGM0MzFiZTFiZiI6eyJwZXJtaXNzaW9ucyI6WyJDUkVBVEVfTkVXX0VCT09LIl0sInJvbGVzIjpbIlNUVURFTlQiLCJURUFDSEVSIl19LCIyNTM1NDhmOS1mOGI2LTQ5M2YtODdmZi0wZGM5MmFlNDIzYTUiOnsicGVybWlzc2lvbnMiOltdLCJyb2xlcyI6WyJTVFVERU5UIl19LCIyMzEwMzU1OS01NjMyLTQyYzktYjljZS02MTlkNTVmY2UzY2IiOnsicGVybWlzc2lvbnMiOltdLCJyb2xlcyI6WyJTVFVERU5UIl19fSwidXNlcm5hbWUiOiJwcml0NzExOCIsInN1YiI6InByaXQ3MTE4IiwiaWF0IjoxNzU0Mjk2NjQ1LCJleHAiOjE3NTQ5MDE0NDV9.qDWJU8BPYuqdfDJmJ1quc2ml6OSqrG7oTcXl-MG0Lrk";

    // Mock the token in localStorage for testing
    localStorage.setItem('accessToken', yourToken);

    console.log('1. Testing with your OAuth token...');

    try {
        const {
            shouldBlockStudentLogin,
            getInstitutesFromToken,
            getValidInstitutes,
            getInstituteSelectionResult
        } = require('@/lib/auth/instituteUtils');

        console.log('2. Testing student blocking...');
        const shouldBlock = shouldBlockStudentLogin();
        console.log('   Should block student login:', shouldBlock);

        console.log('3. Testing institute selection...');
        const allInstitutes = getInstitutesFromToken();
        const validInstitutes = getValidInstitutes(allInstitutes);
        const instituteResult = getInstituteSelectionResult();

        console.log('   All institutes:', allInstitutes.length);
        console.log('   Valid institutes:', validInstitutes.length);
        console.log('   Should show selection:', instituteResult.shouldShowSelection);
        console.log('   Selected institute:', instituteResult.selectedInstitute?.id);

        console.log('4. Institute details:');
        allInstitutes.forEach((institute: any, index: number) => {
            const isValid = validInstitutes.some((v: any) => v.id === institute.id);
            console.log(`   Institute ${index + 1}:`);
            console.log(`     ID: ${institute.id}`);
            console.log(`     Roles: ${institute.roles.join(', ')}`);
            console.log(`     Valid for admin portal: ${isValid}`);
        });

        console.log('5. Expected OAuth behavior:');
        if (shouldBlock) {
            console.log('   ❌ Should be BLOCKED (this is wrong for your token!)');
        } else {
            console.log('   ✅ Should be ALLOWED');
        }

        if (instituteResult.shouldShowSelection) {
            console.log('   ✅ Should show institute selection page');
        } else {
            console.log('   ❌ Should NOT show institute selection (auto-select)');
        }

        console.log('6. OAuth callback should return:');
        if (shouldBlock) {
            console.log('   { success: false } - User blocked');
        } else if (instituteResult.shouldShowSelection) {
            console.log('   { success: true, shouldShowInstituteSelection: true } - Show selection');
        } else {
            console.log('   { success: true, redirectUrl: "/dashboard" } - Go to dashboard');
        }

    } catch (error) {
        console.error('Error testing OAuth flow:', error);
    }

    console.log('=== Test Complete ===');

    return {
        shouldBlock: false,
        shouldShowSelection: true,
        expectedBehavior: 'SHOW_INSTITUTE_SELECTION'
    };
}

// Test the OAuth callback function directly
export function testOAuthCallback() {
    console.log('=== Testing OAuth Callback Function ===');

    // Mock URL parameters
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
        const { handleLoginOAuthCallback } = require('@/lib/auth/oauth-login');

        console.log('1. Calling handleLoginOAuthCallback...');
        const result = handleLoginOAuthCallback();

        console.log('2. Result:', result);

        console.log('3. Expected behavior:');
        if (result.success && result.shouldShowInstituteSelection) {
            console.log('   ✅ Should redirect to institute selection');
        } else if (result.success && result.redirectUrl) {
            console.log('   ❌ Should NOT redirect directly to dashboard');
        } else {
            console.log('   ❌ Unexpected result');
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

    console.log('=== Test Complete ===');
}

// Run the tests
// testOAuthWithYourToken();
// testOAuthCallback();
