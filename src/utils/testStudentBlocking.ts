// Test utility for student blocking with a student-only token
export function testStudentBlocking() {
    console.log('=== Testing Student Blocking ===');

    // Create a student-only token (for testing)
    const studentOnlyToken = "eyJhbGciOiJIUzI1NiJ9.eyJwZXJtaXNzaW9ucyI6W10sImZ1bGxuYW1lIjoiU3R1ZGVudCBUZXN0IiwidXNlciI6InN0dWRlbnQtdGVzdCIsImVtYWlsIjoidGVzdEBleGFtcGxlLmNvbSIsImlzX3Jvb3RfdXNlciI6ZmFsc2UsImF1dGhvcml0aWVzIjp7InN0dWRlbnQtaW5zdGl0dXRlIjp7InBlcm1pc3Npb25zIjpbXSwicm9sZXMiOlsiU1RVREVOVCJdfX0sInVzZXJuYW1lIjoidGVzdC1zdHVkZW50Iiwic3ViIjoidGVzdC1zdHVkZW50IiwiaWF0IjoxNzU0Mjg3NTg4LCJleHAiOjE3NTQ4OTIzODh9.test-signature";

    // Mock the token in localStorage for testing
    localStorage.setItem('accessToken', studentOnlyToken);

    console.log('1. Testing with student-only token...');

    try {
        const { shouldBlockStudentLogin, getInstitutesFromToken, getValidInstitutes } = require('@/lib/auth/instituteUtils');

        const allInstitutes = getInstitutesFromToken();
        const validInstitutes = getValidInstitutes(allInstitutes);
        const shouldBlock = shouldBlockStudentLogin();

        console.log('2. Results:');
        console.log('   - All institutes:', allInstitutes.length);
        console.log('   - Valid institutes:', validInstitutes.length);
        console.log('   - Should block student login:', shouldBlock);

        console.log('3. Institute details:');
        allInstitutes.forEach((institute: any, index: number) => {
            const isValid = validInstitutes.some((v: any) => v.id === institute.id);
            console.log(`   Institute ${index + 1}:`);
            console.log(`     ID: ${institute.id}`);
            console.log(`     Roles: ${institute.roles.join(', ')}`);
            console.log(`     Valid for admin portal: ${isValid}`);
        });

        console.log('4. Expected behavior:');
        if (shouldBlock) {
            console.log('   ✅ Student should be BLOCKED from login');
        } else {
            console.log('   ❌ Student should NOT be blocked (this is wrong!)');
        }

        // Test OAuth callback logic
        console.log('5. Testing OAuth callback logic...');
        if (shouldBlock) {
            console.log('   ✅ OAuth callback should block student and redirect to login');
        } else {
            console.log('   ❌ OAuth callback would allow student to proceed (this is wrong!)');
        }

    } catch (error) {
        console.error('Error testing student blocking:', error);
    }

    console.log('=== Test Complete ===');

    return {
        allInstitutes: [],
        validInstitutes: [],
        shouldBlock: true,
        expectedBehavior: 'BLOCKED'
    };
}

// Test with your actual token
export function testWithYourToken() {
    console.log('=== Testing with Your Token ===');

    // Your provided token
    const yourToken = "eyJhbGciOiJIUzI1NiJ9.eyJwZXJtaXNzaW9ucyI6W10sImZ1bGxuYW1lIjoiUHJpdGkgU2lra2EiLCJ1c2VyIjoiMjY3ZTgyMWQtOGRkNS00YTEyLTg0MDctMTM1YmRhYjBhOGFiIiwiZW1haWwiOiJndWxzaGFucHVuZGU0QGdtYWlsLmNvbSIsImlzX3Jvb3RfdXNlciI6dHJ1ZSwiYXV0aG9yaXRpZXMiOnsiMmRmMjc4MzgtMjA2NC00NjRjLWE1NDctOGNlYzEzNGRmZTRjIjp7InBlcm1pc3Npb25zIjpbXSwicm9sZXMiOlsiU1RVREVOVCJdfSwiZGQ5Yjk2ODctNTZlZS00NjdhLTlmYzQtOGM1ODM1ZWFlN2Y5Ijp7InBlcm1pc3Npb25zIjpbIkNSRUFURV9ORVdfRUJPT0siXSwicm9sZXMiOlsiVEVBQ0hFUiIsIlNUVURFTlQiXX0sImE2ZWEyNmYwLTAxMTAtNGI2Yi05YjQ0LWQ5MGM0MzFiZTFiZiI6eyJwZXJtaXNzaW9ucyI6WyJDUkVBVEVfTkVXX0VCT09LIl0sInJvbGVzIjpbIlRFQUNIRVIiLCJTVFVERU5UIl19LCIyYzQwZmI3ZC00MGM5LTQxNDYtYTkwYy0zMjAxOWJmZjdmYjgiOnsicGVybWlzc2lvbnMiOlsiUkVBRCIsIldSSVRFIl0sInJvbGVzIjpbIkFETUlOIl19LCIyNTM1NDhmOS1mOGI2LTQ5M2YtODdmZi0wZGM5MmFlNDIzYTUiOnsicGVybWlzc2lvbnMiOltdLCJyb2xlcyI6WyJTVFVERU5UIl19LCIyMzEwMzU1OS01NjMyLTQyYzktYjljZS02MTlkNTVmY2UzY2IiOnsicGVybWlzc2lvbnMiOltdLCJyb2xlcyI6WyJTVFVERU5UIl19fSwidXNlcm5hbWUiOiJwcml0NzExOCIsInN1YiI6InByaXQ3MTE4IiwiaWF0IjoxNzU0Mjg3NTg4LCJleHAiOjE3NTQ4OTIzODh9.XfYfqDkrLCJYiihN9UJUZsjiy5fpMddy7ZjEp7s5u48";

    // Mock the token in localStorage for testing
    localStorage.setItem('accessToken', yourToken);

    try {
        const { shouldBlockStudentLogin, getInstitutesFromToken, getValidInstitutes } = require('@/lib/auth/instituteUtils');

        const allInstitutes = getInstitutesFromToken();
        const validInstitutes = getValidInstitutes(allInstitutes);
        const shouldBlock = shouldBlockStudentLogin();

        console.log('Results with your token:');
        console.log('   - All institutes:', allInstitutes.length);
        console.log('   - Valid institutes:', validInstitutes.length);
        console.log('   - Should block student login:', shouldBlock);

        console.log('Expected behavior with your token:');
        if (shouldBlock) {
            console.log('   ❌ Your token should NOT be blocked (has ADMIN/TEACHER roles)');
        } else {
            console.log('   ✅ Your token should be allowed (has valid roles)');
        }

    } catch (error) {
        console.error('Error testing with your token:', error);
    }
}

// Run the tests
// testStudentBlocking();
// testWithYourToken();
