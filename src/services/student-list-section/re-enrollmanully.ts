import authenticatedAxiosInstance from '@/lib/auth/axiosInstance';
import { RE_ENROLL_STUDENT_MANUALLY } from '@/constants/urls';
import { EnrollStudentRequest } from '@/types/students/type-enroll-student-manually';
import { getTokenDecodedData, getTokenFromCookie } from '@/lib/auth/sessionUtility';
import { TokenKey } from '@/constants/auth/tokens';

export const reEnrollStudent = async ({ formData }: EnrollStudentRequest): Promise<string> => {
    try {
        const accessToken = getTokenFromCookie(TokenKey.accessToken);
        const tokenData = getTokenDecodedData(accessToken);
        const instituteIds = Object.keys(tokenData?.authorities || {});
        if (instituteIds.length === 0) throw new Error('No institute ID found in token');

        const INSTITUTE_ID = instituteIds[0];

        // Build payment_initiation_request
        const paymentInitiationRequest = {
            amount: parseFloat(formData.stepFourData?.amount || '0'),
            currency: formData.stepFourData?.currency || 'INR',
            manual_request: {
                file_id: formData.stepFourData?.file_id || undefined,
                transaction_id: formData.stepFourData?.transaction_id || undefined,
            },
        };

        // Build learner_extra_details object with parent/guardian fields
        const learnerExtraDetails = {
            fathers_name: formData.stepTwoData?.father_name || undefined,
            mothers_name: formData.stepTwoData?.mother_name || undefined,
            parents_mobile_number: formData.stepTwoData?.parents_mobile_number || undefined,
            parents_email: formData.stepTwoData?.parents_email || undefined,
            parents_to_mother_mobile_number:
                formData.stepTwoData?.parents_to_mother_mobile_number || undefined,
            parents_to_mother_email: formData.stepTwoData?.parents_to_mother_email || undefined,
            linked_institute_name: formData.stepTwoData?.linked_institute_name || undefined,
        };

        const requestBody = {
            user: {
                full_name: formData.stepTwoData?.full_name || '',
                email: formData.stepTwoData?.email || '',
                mobile_number: formData.stepTwoData?.mobile_number || '',
                username: formData.stepFiveData?.username || '',
                password: formData.stepFiveData?.password || '',
                gender: formData.stepTwoData?.gender || undefined,
                date_of_birth: formData.stepTwoData?.date_of_birth || undefined,
            },
            institute_id: INSTITUTE_ID,
            learner_package_session_enroll: {
                package_session_ids: formData.stepThreeData?.invite?.package_session_ids || [],
                enroll_invite_id: formData.stepThreeData?.invite?.id || '',
                payment_option_id: formData.stepThreeData?.invite?.payment_option_id || '',
                plan_id: formData.stepFourData?.plan_id || undefined,
                payment_initiation_request: paymentInitiationRequest,
                learner_extra_details: learnerExtraDetails,
            },
        };

        const response = await authenticatedAxiosInstance.post(
            RE_ENROLL_STUDENT_MANUALLY,
            requestBody
        );

        return response.data;
    } catch (error: unknown) {
        const err = error as { message?: string; response?: { data?: { message?: string } } };
        console.error('[ReEnrollStudent Error]', err?.message || error);
        throw new Error(err?.response?.data?.message || 'Failed to re-enroll student.');
    }
};
