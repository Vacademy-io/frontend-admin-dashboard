import authenticatedAxiosInstance from '@/lib/auth/axiosInstance';
import { getTokenDecodedData, getTokenFromCookie } from '@/lib/auth/sessionUtility';
import { TokenKey } from '@/constants/auth/tokens';

// Simple test function to debug the API endpoint
export const testApiEndpoint = async () => {
    try {
        console.log('=== API DEBUG TEST ===');

        // Get authentication info
        const accessToken = getTokenFromCookie(TokenKey.accessToken);
        const tokenData = getTokenDecodedData(accessToken);
        const instituteId = tokenData && Object.keys(tokenData.authorities)[0];

        console.log('Access Token:', accessToken ? 'Present' : 'Missing');
        console.log('Institute ID:', instituteId);
        console.log('Token Data:', tokenData);

        if (!instituteId) {
            throw new Error('No institute ID found in token');
        }

        // Test URL construction
        const testUrl = `https://backend-stage.vacademy.io/media-service/course/ai/v1/generate?instituteId=${instituteId}&model=google%2Fgemini-2.5-pro`;
        console.log('Test URL:', testUrl);

        // Simple test payload
        const testPayload = {
            prompt: 'Hello, this is a test message',
            attachments: [],
            code_prompt: null,
            conversation_history: [],
        };

        console.log('Test Payload:', testPayload);
        console.log('Making test API call...');

        const response = await authenticatedAxiosInstance.post(testUrl, testPayload, {
            timeout: 30000,
            headers: {
                'Content-Type': 'application/json',
            },
        });

        console.log('✅ API Test Success!');
        console.log('Response Status:', response.status);
        console.log('Response Data:', response.data);

        return { success: true, data: response.data };
    } catch (error: any) {
        console.error('❌ API Test Failed!');
        console.error('Error:', error);
        console.error('Status:', error.response?.status);
        console.error('Status Text:', error.response?.statusText);
        console.error('Response Data:', error.response?.data);
        console.error('Request URL:', error.config?.url);
        console.error('Request Headers:', error.config?.headers);

        // Special handling for backend errors
        if (error.response?.data?.ex || error.response?.data?.responseCode) {
            console.error('🔥 BACKEND ERROR DETECTED:');
            console.error('Exception:', error.response.data.ex);
            console.error('Response Code:', error.response.data.responseCode);
            console.error('Date:', error.response.data.date);
            console.error('');
            console.error('💡 This is a backend server error (Java NullPointerException)');
            console.error('💡 The API endpoint is reachable but has a server-side bug');
            console.error('💡 Contact your backend development team with this error information');
        }

        return {
            success: false,
            error: error.message,
            status: error.response?.status,
            data: error.response?.data,
        };
    }
};

// Call this function in browser console: window.testApi = testApiEndpoint
if (typeof window !== 'undefined') {
    (window as any).testApi = testApiEndpoint;
}
