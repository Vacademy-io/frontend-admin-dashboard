// Test utility for OAuth flow and student blocking
import { shouldBlockStudentLogin, getInstitutesFromToken, getValidInstitutes } from '@/lib/auth/instituteUtils';
import { getTokenDecodedData, getTokenFromCookie } from '@/lib/auth/sessionUtility';
import { TokenKey } from '@/constants/auth/tokens';

export function testOAuthFlow() {
    console.log('=== Testing OAuth Flow ===');

    // Test with your provided token
    const testToken = "eyJhbGciOiJIUzI1NiJ9.eyJwZXJtaXNzaW9ucyI6W10sImZ1bGxuYW1lIjoiUHJpdGkgU2lra2EiLCJ1c2VyIjoiMjY3ZTgyMWQtOGRkNS00YTEyLTg0MDctMTM1YmRhYjBhOGFiIiwiZW1haWwiOiJndWxzaGFucHVuZGU0QGdtYWlsLmNvbSIsImlzX3Jvb3RfdXNlciI6dHJ1ZSwiYXV0aG9yaXRpZXMiOnsiMmRmMjc4MzgtMjA2NC00NjRjLWE1NDctOGNlYzEzNGRmZTRjIjp7InBlcm1pc3Npb25zIjpbXSwicm9sZXMiOlsiU1RVREVOVCJdfSwiZGQ5Yjk2ODctNTZlZS00NjdhLTlmYzQtOGM1ODM1ZWFlN2Y5Ijp7InBlcm1pc3Npb25zIjpbIkNSRUFURV9ORVdfRUJPT0siXSwicm9sZXMiOlsiVEVBQ0hFUiIsIlNUVURFTlQiXX0sImE2ZWEyNmYwLTAxMTAtNGI2Yi05YjQ0LWQ5MGM0MzFiZTFiZiI6eyJwZXJtaXNzaW9ucyI6WyJDUkVBVEVfTkVXX0VCT09LIl0sInJvbGVzIjpbIlRFQUNIRVIiLCJTVFVERU5UIl19LCIyYzQwZmI3ZC00MGM5LTQxNDYtYTkwYy0zMjAxOWJmZjdmYjgiOnsicGVybWlzc2lvbnMiOlsiUkVBRCIsIldSSVRFIl0sInJvbGVzIjpbIkFETUlOIl19LCIyNTM1NDhmOS1mOGI2LTQ5M2YtODdmZi0wZGM5MmFlNDIzYTUiOnsicGVybWlzc2lvbnMiOltdLCJyb2xlcyI6WyJTVFVERU5UIl19LCIyMzEwMzU1OS01NjMyLTQyYzktYjljZS02MTlkNTVmY2UzY2IiOnsicGVybWlzc2lvbnMiOltdLCJyb2xlcyI6WyJTVFVERU5UIl19fSwidXNlcm5hbWUiOiJwcml0NzExOCIsInN1YiI6InByaXQ3MTE4IiwiaWF0IjoxNzU0Mjg3NTg4LCJleHAiOjE3NTQ4OTIzODh9.XfYfqDkrLCJYiihN9UJUZsjiy5fpMddy7ZjEp7s5u48";

    // Mock the token in localStorage for testing
    localStorage.setItem('accessToken', testToken);

    console.log('1. Testing with provided token...');

    const allInstitutes = getInstitutesFromToken();
    const validInstitutes = getValidInstitutes(allInstitutes);
    const shouldBlock = shouldBlockStudentLogin();

    console.log('2. Results:');
    console.log('   - All institutes:', allInstitutes.length);
    console.log('   - Valid institutes:', validInstitutes.length);
    console.log('   - Should block student login:', shouldBlock);

    console.log('3. Institute details:');
    allInstitutes.forEach((institute, index) => {
        const isValid = validInstitutes.some(v => v.id === institute.id);
        console.log(`   Institute ${index + 1}:`);
        console.log(`     ID: ${institute.id}`);
        console.log(`     Roles: ${institute.roles.join(', ')}`);
        console.log(`     Valid for admin portal: ${isValid}`);
    });

    console.log('4. Expected OAuth behavior:');
    if (shouldBlock) {
        console.log('   → User should be BLOCKED from OAuth login');
    } else {
        console.log('   → User should be ALLOWED to proceed with OAuth login');
        if (validInstitutes.length > 1) {
            console.log('   → User should see institute selection page');
        } else {
            console.log('   → User should be auto-directed to dashboard');
        }
    }

    console.log('=== Test Complete ===');

    return {
        allInstitutes,
        validInstitutes,
        shouldBlock,
        expectedBehavior: shouldBlock ? 'BLOCKED' : 'ALLOWED'
    };
}

// Run the test
// testOAuthFlow();
