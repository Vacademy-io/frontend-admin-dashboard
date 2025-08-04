import { useEffect, useState } from 'react';
import { getInstitutesFromToken, getValidInstitutes, getPrimaryRole, shouldBlockStudentLogin, getInstituteSelectionResult } from '@/lib/auth/instituteUtils';
import { getTokenDecodedData, getTokenFromCookie } from '@/lib/auth/sessionUtility';
import { TokenKey } from '@/constants/auth/tokens';

export function InstituteTest() {
    const [testResults, setTestResults] = useState<any>(null);

    useEffect(() => {
        const runTests = () => {
            const accessToken = getTokenFromCookie(TokenKey.accessToken);
            const tokenData = getTokenDecodedData(accessToken);

            const allInstitutes = getInstitutesFromToken();
            const validInstitutes = getValidInstitutes(allInstitutes);
            const shouldBlock = shouldBlockStudentLogin();
            const selectionResult = getInstituteSelectionResult();

            setTestResults({
                hasToken: !!accessToken,
                tokenData: tokenData ? {
                    fullname: tokenData.fullname,
                    email: tokenData.email,
                    authorities: tokenData.authorities,
                } : null,
                allInstitutes,
                validInstitutes,
                shouldBlock,
                selectionResult,
                // Add institute details for better display
                instituteDetails: Object.fromEntries(
                    allInstitutes.map(institute => [
                        institute.id,
                        {
                            name: institute.name,
                            roles: institute.roles,
                            permissions: institute.permissions
                        }
                    ])
                ),
            });
        };

        runTests();
    }, []);

    if (!testResults) {
        return <div>Loading test results...</div>;
    }

    return (
        <div className="p-6 max-w-4xl mx-auto">
            <h1 className="text-2xl font-bold mb-6">Institute Selection Test Results</h1>

            <div className="space-y-6">
                <div className="bg-gray-50 p-4 rounded-lg">
                    <h2 className="text-lg font-semibold mb-2">Token Status</h2>
                    <p>Has Token: {testResults.hasToken ? 'Yes' : 'No'}</p>
                    {testResults.tokenData && (
                        <div className="mt-2">
                            <p>Name: {testResults.tokenData.fullname}</p>
                            <p>Email: {testResults.tokenData.email}</p>
                        </div>
                    )}
                </div>

                <div className="bg-blue-50 p-4 rounded-lg">
                    <h2 className="text-lg font-semibold mb-2">All Institutes ({testResults.allInstitutes.length})</h2>
                    {testResults.allInstitutes.map((institute: any) => (
                        <div key={institute.id} className="border p-3 rounded mb-2">
                            <p><strong>ID:</strong> {institute.id}</p>
                            <p><strong>Name:</strong> {institute.name}</p>
                            <p><strong>Roles:</strong> {institute.roles.join(', ')}</p>
                            <p><strong>Primary Role:</strong> {getPrimaryRole(institute.roles)}</p>
                            <p><strong>Permissions:</strong> {institute.permissions.join(', ') || 'None'}</p>
                            <p><strong>Valid for Admin Portal:</strong> {testResults.validInstitutes.some((v: any) => v.id === institute.id) ? 'Yes' : 'No'}</p>
                        </div>
                    ))}
                </div>

                <div className="bg-green-50 p-4 rounded-lg">
                    <h2 className="text-lg font-semibold mb-2">Valid Institutes ({testResults.validInstitutes.length})</h2>
                    {testResults.validInstitutes.map((institute: any) => (
                        <div key={institute.id} className="border p-3 rounded mb-2 bg-white">
                            <p><strong>ID:</strong> {institute.id}</p>
                            <p><strong>Name:</strong> {institute.name}</p>
                            <p><strong>Roles:</strong> {institute.roles.join(', ')}</p>
                            <p><strong>Primary Role:</strong> {getPrimaryRole(institute.roles)}</p>
                        </div>
                    ))}
                </div>

                <div className="bg-yellow-50 p-4 rounded-lg">
                    <h2 className="text-lg font-semibold mb-2">Student Access Check</h2>
                    <p>Should Block Student Login: {testResults.shouldBlock ? 'Yes' : 'No'}</p>
                </div>

                <div className="bg-purple-50 p-4 rounded-lg">
                    <h2 className="text-lg font-semibold mb-2">Selection Result</h2>
                    <p>Should Show Selection: {testResults.selectionResult.shouldShowSelection ? 'Yes' : 'No'}</p>
                    {testResults.selectionResult.selectedInstitute && (
                        <div className="mt-2">
                            <p><strong>Auto-Selected Institute:</strong></p>
                            <p>ID: {testResults.selectionResult.selectedInstitute.id}</p>
                            <p>Name: {testResults.selectionResult.selectedInstitute.name}</p>
                            <p>Primary Role: {testResults.selectionResult.primaryRole}</p>
                        </div>
                    )}
                </div>

                <div className="bg-red-50 p-4 rounded-lg">
                    <h2 className="text-lg font-semibold mb-2">Expected Behavior</h2>
                    {testResults.shouldBlock ? (
                        <p className="text-red-700">User should be blocked from logging in (only STUDENT role)</p>
                    ) : testResults.selectionResult.shouldShowSelection ? (
                        <p className="text-blue-700">User should see institute selection page (multiple valid institutes)</p>
                    ) : (
                        <p className="text-green-700">User should be auto-directed to dashboard (single institute)</p>
                    )}
                </div>
            </div>
        </div>
    );
}
