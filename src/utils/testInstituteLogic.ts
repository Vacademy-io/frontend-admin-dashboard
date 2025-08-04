// Test script to verify institute selection logic
// Run this in browser console with the provided token

export function testInstituteLogic() {
    // Your provided token
    const testToken = "eyJhbGciOiJIUzI1NiJ9.eyJwZXJtaXNzaW9ucyI6W10sImZ1bGxuYW1lIjoiUHJpdGkgU2lra2EiLCJ1c2VyIjoiMjY3ZTgyMWQtOGRkNS00YTEyLTg0MDctMTM1YmRhYjBhOGFiIiwiZW1haWwiOiJndWxzaGFucHVuZGU0QGdtYWlsLmNvbSIsImlzX3Jvb3RfdXNlciI6dHJ1ZSwiYXV0aG9yaXRpZXMiOnsiMmRmMjc4MzgtMjA2NC00NjRjLWE1NDctOGNlYzEzNGRmZTRjIjp7InBlcm1pc3Npb25zIjpbXSwicm9sZXMiOlsiU1RVREVOVCJdfSwiZGQ5Yjk2ODctNTZlZS00NjdhLTlmYzQtOGM1ODM1ZWFlN2Y5Ijp7InBlcm1pc3Npb25zIjpbIkNSRUFURV9ORVdfRUJPT0siXSwicm9sZXMiOlsiVEVBQ0hFUiIsIlNUVURFTlQiXX0sImE2ZWEyNmYwLTAxMTAtNGI2Yi05YjQ0LWQ5MGM0MzFiZTFiZiI6eyJwZXJtaXNzaW9ucyI6WyJDUkVBVEVfTkVXX0VCT09LIl0sInJvbGVzIjpbIlRFQUNIRVIiLCJTVFVERU5UIl19LCIyYzQwZmI3ZC00MGM5LTQxNDYtYTkwYy0zMjAxOWJmZjdmYjgiOnsicGVybWlzc2lvbnMiOlsiUkVBRCIsIldSSVRFIl0sInJvbGVzIjpbIkFETUlOIl19LCIyNTM1NDhmOS1mOGI2LTQ5M2YtODdmZi0wZGM5MmFlNDIzYTUiOnsicGVybWlzc2lvbnMiOltdLCJyb2xlcyI6WyJTVFVERU5UIl19LCIyMzEwMzU1OS01NjMyLTQyYzktYjljZS02MTlkNTVmY2UzY2IiOnsicGVybWlzc2lvbnMiOltdLCJyb2xlcyI6WyJTVFVERU5UIl19fSwidXNlcm5hbWUiOiJwcml0NzExOCIsInN1YiI6InByaXQ3MTE4IiwiaWF0IjoxNzU0Mjg3NTg4LCJleHAiOjE3NTQ4OTIzODh9.XfYfqDkrLCJYiihN9UJUZsjiy5fpMddy7ZjEp7s5u48";

    // Mock the token in localStorage for testing
    localStorage.setItem('accessToken', testToken);

    // Import the functions (you'll need to adjust the import path based on your setup)
    const { getInstitutesFromToken, getValidInstitutes, getPrimaryRole, shouldBlockStudentLogin, getInstituteSelectionResult } = require('@/lib/auth/instituteUtils');

    console.log('=== Institute Selection Logic Test ===');

    // Test 1: Extract all institutes
    const allInstitutes = getInstitutesFromToken();
    console.log('1. All Institutes:', allInstitutes);

    // Test 2: Get valid institutes
    const validInstitutes = getValidInstitutes(allInstitutes);
    console.log('2. Valid Institutes:', validInstitutes);

    // Test 3: Check if should block student login
    const shouldBlock = shouldBlockStudentLogin();
    console.log('3. Should Block Student Login:', shouldBlock);

    // Test 4: Get selection result
    const selectionResult = getInstituteSelectionResult();
    console.log('4. Selection Result:', selectionResult);

    // Test 5: Analyze each institute
    console.log('5. Institute Analysis:');
    allInstitutes.forEach((institute: any, index: number) => {
        const primaryRole = getPrimaryRole(institute.roles);
        const isValid = validInstitutes.some((v: any) => v.id === institute.id);
        console.log(`   Institute ${index + 1}:`);
        console.log(`     ID: ${institute.id}`);
        console.log(`     Roles: ${institute.roles.join(', ')}`);
        console.log(`     Primary Role: ${primaryRole}`);
        console.log(`     Valid: ${isValid}`);
        console.log(`     Permissions: ${institute.permissions.join(', ') || 'None'}`);
    });

    // Test 6: Expected behavior
    console.log('6. Expected Behavior:');
    if (shouldBlock) {
        console.log('   → User should be blocked from logging in (only STUDENT role)');
    } else if (selectionResult.shouldShowSelection) {
        console.log('   → User should see institute selection page (multiple valid institutes)');
        console.log(`   → Valid institutes: ${validInstitutes.length}`);
    } else {
        console.log('   → User should be auto-directed to dashboard (single institute)');
        if (selectionResult.selectedInstitute) {
            console.log(`   → Auto-selected institute: ${selectionResult.selectedInstitute.id}`);
            console.log(`   → Primary role: ${selectionResult.primaryRole}`);
        }
    }

    console.log('=== Test Complete ===');

    return {
        allInstitutes,
        validInstitutes,
        shouldBlock,
        selectionResult
    };
}

// Run the test
// testInstituteLogic();
